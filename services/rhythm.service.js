/**
 * SmartRhythmService - 智能工作节奏引擎
 * 
 * 负责分析用户工作节奏，动态调整提醒策略。
 * 所有分析均在浏览器本地完成，不记录键盘输入内容，不上传鼠标轨迹。
 */
class SmartRhythmService {
  constructor(storageService) {
    /**
     * 存储服务实例
     * @type {StorageService}
     */
    this.storageService = storageService;

    /**
     * 当前工作状态
     * @type {string} - 'focus' | 'normal' | 'relax'
     */
    this.currentState = 'normal';

    /**
     * 状态进入时间戳
     * @type {number}
     */
    this.stateEntryTime = Date.now();

    /**
     * 行为计数器
     * @type {Object}
     */
    this.actionCounter = {
      keys: 0,
      moves: 0,
      lastKeyTime: 0,
      lastMoveTime: 0,
      currentMinuteKeys: 0,
      currentMinuteMoves: 0,
      history: []
    };

    /**
     * 页面可见性状态
     * @type {boolean}
     */
    this.pageVisible = true;

    /**
     * 提醒统计数据
     * @type {Object}
     */
    this.reminderStats = {
      totalReminders: 0,
      acceptedReminders: 0,
      delayedReminders: 0,
      skippedReminders: 0,
      focusExtensions: 0
    };

    /**
     * 专注时间记录
     * @type {Array}
     */
    this.focusRecords = [];

    /**
     * 状态转换滞后计时器
     * @type {number}
     */
    this.hysteresisTimer = null;

    /**
     * 目标状态（等待滞后确认）
     * @type {string}
     */
    this.pendingState = null;

    /**
     * 节流计时器
     * @type {number}
     */
    this.throttleTimer = null;

    /**
     * 事件监听器引用（用于清理）
     * @type {Array}
     */
    this.eventListeners = [];

    /**
     * 配置参数
     * @type {Object}
     */
    this.config = {
      hysteresisDuration: 5 * 60 * 1000,
      focusKeyThreshold: 30,
      focusMoveThreshold: 60,
      relaxKeyThreshold: 5,
      relaxMoveThreshold: 10,
      maxFocusExtension: 20,
      consecutiveSkipPenalty: 3,
      consecutiveCompleteReward: 3,
      actionSampleInterval: 60 * 1000,
      historySize: 30
    };

    // 初始化
    this.init();
  }

  /**
   * 初始化服务
   */
  init() {
    this.loadData();
    this.startActionSampling();
    this.setupEventListeners();
    this.startStateMonitoring();
  }

  /**
   * 加载存储的数据
   */
  loadData() {
    try {
      const saved = this.storageService.get('workease_rhythm_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.reminderStats = { ...this.reminderStats, ...data.reminderStats };
        this.focusRecords = data.focusRecords || [];
      }
    } catch (e) {
      console.error('[SmartRhythm] 加载数据失败:', e);
    }
  }

  /**
   * 保存数据
   */
  saveData() {
    try {
      const data = {
        reminderStats: this.reminderStats,
        focusRecords: this.focusRecords
      };
      this.storageService.set('workease_rhythm_data', data);
    } catch (e) {
      console.error('[SmartRhythm] 保存数据失败:', e);
    }
  }

  /**
   * 设置事件监听器（键盘、鼠标、页面可见性）
   */
  setupEventListeners() {
    // 键盘事件（节流处理）
    const handleKeydown = this.throttle(() => {
      this.actionCounter.keys++;
      this.actionCounter.currentMinuteKeys++;
      this.actionCounter.lastKeyTime = Date.now();
    }, 500);

    // 鼠标移动事件（节流处理）
    const handleMousemove = this.throttle(() => {
      this.actionCounter.moves++;
      this.actionCounter.currentMinuteMoves++;
      this.actionCounter.lastMoveTime = Date.now();
    }, 500);

    // 页面可见性变化
    const handleVisibilityChange = () => {
      this.pageVisible = !document.hidden;
    };

    // 注册事件
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 保存引用用于清理
    this.eventListeners.push(
      { target: document, type: 'keydown', handler: handleKeydown },
      { target: document, type: 'mousemove', handler: handleMousemove },
      { target: document, type: 'visibilitychange', handler: handleVisibilityChange }
    );
  }

  /**
   * 节流函数
   */
  throttle(func, limit) {
    let inThrottle = false;
    return function() {
      if (!inThrottle) {
        func.apply(this, arguments);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 开始行为采样（每分钟记录一次）
   */
  startActionSampling() {
    setInterval(() => {
      this.recordActionSample();
    }, this.config.actionSampleInterval);
  }

  /**
   * 记录行为采样数据
   */
  recordActionSample() {
    const sample = {
      time: Date.now(),
      keys: this.actionCounter.currentMinuteKeys,
      moves: this.actionCounter.currentMinuteMoves,
      visible: this.pageVisible
    };

    this.actionCounter.history.push(sample);
    
    // 保持历史记录数量
    if (this.actionCounter.history.length > this.config.historySize) {
      this.actionCounter.history.shift();
    }

    // 重置分钟计数器
    this.actionCounter.currentMinuteKeys = 0;
    this.actionCounter.currentMinuteMoves = 0;

    // 分析当前节奏
    this.analyseWorkRhythm();
  }

  /**
   * 开始状态监控
   */
  startStateMonitoring() {
    setInterval(() => {
      this.checkStateTransition();
    }, 30 * 1000);
  }

  /**
   * 分析工作节奏（核心算法）
   * @returns {Object} - 分析结果
   */
  analyseWorkRhythm() {
    const history = this.actionCounter.history;
    if (history.length < 3) {
      return { state: this.currentState, confidence: 0.3 };
    }

    // 计算最近5分钟的平均操作频率
    const recentHistory = history.slice(-5);
    const avgKeys = recentHistory.reduce((sum, h) => sum + h.keys, 0) / recentHistory.length;
    const avgMoves = recentHistory.reduce((sum, h) => sum + h.moves, 0) / recentHistory.length;
    const visibilityRate = recentHistory.filter(h => h.visible).length / recentHistory.length;

    // 判断目标状态
    let targetState = 'normal';

    if (visibilityRate >= 0.8) {
      if (avgKeys >= this.config.focusKeyThreshold || avgMoves >= this.config.focusMoveThreshold) {
        targetState = 'focus';
      } else if (avgKeys <= this.config.relaxKeyThreshold && avgMoves <= this.config.relaxMoveThreshold) {
        targetState = 'relax';
      }
    } else {
      targetState = 'relax';
    }

    const confidence = this.calculateConfidence(targetState, avgKeys, avgMoves, visibilityRate);

    return { state: targetState, confidence, avgKeys, avgMoves, visibilityRate };
  }

  /**
   * 计算状态置信度
   */
  calculateConfidence(state, avgKeys, avgMoves, visibilityRate) {
    let confidence = 0.5;

    switch (state) {
      case 'focus':
        confidence = Math.min(0.95, 0.5 + (avgKeys / 100) + (avgMoves / 200) + (visibilityRate - 0.5) * 0.3);
        break;
      case 'relax':
        confidence = Math.min(0.95, 0.5 + (1 - avgKeys / 50) + (1 - avgMoves / 100) * 0.3);
        break;
      case 'normal':
        confidence = 0.6 + Math.abs(avgKeys - 15) / 50 * 0.2;
        break;
    }

    return Math.round(confidence * 100) / 100;
  }

  /**
   * 检查状态转换（带滞后机制）
   */
  checkStateTransition() {
    const analysis = this.analyseWorkRhythm();
    const targetState = analysis.state;

    if (targetState === this.currentState) {
      // 状态未变化，重置滞后计时器
      if (this.hysteresisTimer) {
        clearTimeout(this.hysteresisTimer);
        this.hysteresisTimer = null;
      }
      this.pendingState = null;
      return;
    }

    if (targetState === this.pendingState) {
      // 目标状态与待确认状态一致，等待滞后时间
      return;
    }

    // 设置新的待确认状态
    this.pendingState = targetState;

    // 清除之前的滞后计时器
    if (this.hysteresisTimer) {
      clearTimeout(this.hysteresisTimer);
    }

    // 启动滞后计时器
    this.hysteresisTimer = setTimeout(() => {
      this.confirmStateTransition(targetState);
    }, this.config.hysteresisDuration);
  }

  /**
   * 确认状态转换
   */
  confirmStateTransition(newState) {
    if (newState !== this.pendingState) return;

    const oldState = this.currentState;
    this.currentState = newState;
    this.stateEntryTime = Date.now();
    this.pendingState = null;
    this.hysteresisTimer = null;

    // 如果从非focus进入focus，记录专注开始
    if (oldState !== 'focus' && newState === 'focus') {
      this.focusRecords.push({
        startTime: Date.now(),
        endTime: null
      });
    }

    // 如果从focus退出，记录专注结束
    if (oldState === 'focus' && newState !== 'focus') {
      const lastFocus = this.focusRecords[this.focusRecords.length - 1];
      if (lastFocus && !lastFocus.endTime) {
        lastFocus.endTime = Date.now();
        lastFocus.duration = Math.floor((lastFocus.endTime - lastFocus.startTime) / 1000 / 60);
      }
    }

    // 保存数据
    this.saveData();

    // 触发状态变化事件
    this.emitStateChange(oldState, newState);
  }

  /**
   * 触发状态变化事件
   */
  emitStateChange(oldState, newState) {
    const event = new CustomEvent('rhythm-state-change', {
      detail: {
        oldState,
        newState,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * 获取当前状态
   * @returns {Object}
   */
  getCurrentState() {
    const analysis = this.analyseWorkRhythm();
    const stateDuration = Math.floor((Date.now() - this.stateEntryTime) / 1000 / 60);

    return {
      state: this.currentState,
      stateLabel: this.getStateLabel(this.currentState),
      stateDuration,
      confidence: analysis.confidence,
      avgKeys: analysis.avgKeys,
      avgMoves: analysis.avgMoves,
      pageVisible: this.pageVisible
    };
  }

  /**
   * 获取状态标签
   */
  getStateLabel(state) {
    const labels = {
      focus: '深度专注',
      normal: '普通办公',
      relax: '休息状态'
    };
    return labels[state] || '未知';
  }

  /**
   * 获取状态颜色
   */
  getStateColor(state) {
    const colors = {
      focus: '#22c55e',
      normal: '#f59e0b',
      relax: '#3b82f6'
    };
    return colors[state] || '#6b7280';
  }

  /**
   * 计算下次提醒时间（核心策略）
   * @param {number} baseTime - 基础提醒时间（分钟）
   * @returns {Object} - 提醒决策
   */
  calculateNextReminder(baseTime = 45) {
    const state = this.currentState;
    let adjustedTime = baseTime;
    let reasonCode = '';

    // 根据状态调整
    switch (state) {
      case 'focus':
        adjustedTime = baseTime + this.config.maxFocusExtension;
        reasonCode = 'focus_extension';
        this.reminderStats.focusExtensions++;
        break;
      case 'relax':
        adjustedTime = 0;
        reasonCode = 'relax_immediate';
        break;
      case 'normal':
      default:
        adjustedTime = baseTime;
        reasonCode = 'normal_schedule';
        break;
    }

    // 检查连续跳过惩罚
    if (this.reminderStats.skippedReminders > 0 && 
        this.reminderStats.skippedReminders % this.config.consecutiveSkipPenalty === 0) {
      adjustedTime += 15;
      reasonCode += '_skip_penalty';
    }

    // 检查连续完成奖励
    if (this.reminderStats.acceptedReminders > 0 && 
        this.reminderStats.acceptedReminders % this.config.consecutiveCompleteReward === 0) {
      adjustedTime -= 5;
      reasonCode += '_complete_reward';
    }

    // 确保时间在合理范围内
    adjustedTime = Math.max(5, Math.min(adjustedTime, 90));

    this.reminderStats.totalReminders++;
    this.saveData();

    return {
      adjustedTime,
      baseTime,
      state,
      reasonCode,
      shouldDelay: adjustedTime > baseTime,
      shouldImmediate: adjustedTime === 0
    };
  }

  /**
   * 延迟提醒
   * @returns {Object}
   */
  delayReminder() {
    this.reminderStats.delayedReminders++;
    this.saveData();

    return {
      success: true,
      nextCheckTime: Date.now() + 10 * 60 * 1000
    };
  }

  /**
   * 记录提醒被跳过
   */
  recordSkip() {
    this.reminderStats.skippedReminders++;
    this.saveData();
  }

  /**
   * 记录提醒被采纳
   */
  recordAccept() {
    this.reminderStats.acceptedReminders++;
    this.saveData();
  }

  /**
   * 生成提醒理由（AI解释）
   * @param {Object} reminderDecision - 提醒决策
   * @returns {Object} - 解释信息
   */
  generateReminderReason(reminderDecision) {
    const state = this.getCurrentState();
    const stateDuration = state.stateDuration;

    let reason = '';
    let suggestion = '';
    let estimatedGain = 0;

    switch (reminderDecision.reasonCode) {
      case 'focus_extension':
        reason = `检测到您已经连续专注工作${stateDuration}分钟`;
        suggestion = '现在是放松的最佳时机，建议利用5分钟拉伸肩颈';
        estimatedGain = Math.min(8, Math.floor(stateDuration / 10) + 3);
        break;
      case 'relax_immediate':
        reason = '检测到您处于休息状态';
        suggestion = '建议完成一次快速拉伸，保持身体活力';
        estimatedGain = 3;
        break;
      case 'normal_schedule':
        reason = '已到建议休息时间';
        suggestion = '建议起身活动5分钟';
        estimatedGain = 5;
        break;
      case 'normal_schedule_skip_penalty':
        reason = '检测到最近两次提醒均被忽略，已自动降低提醒频率';
        suggestion = '现在是更好的休息时机';
        estimatedGain = 6;
        break;
      case 'focus_extension_complete_reward':
        reason = '检测到您最近完成了多次拉伸，奖励额外专注时间';
        suggestion = '现在可以适当休息一下';
        estimatedGain = 7;
        break;
      default:
        reason = '工作一段时间了，建议休息一下';
        suggestion = '建议利用5分钟放松身心';
        estimatedGain = 5;
        break;
    }

    return {
      reason,
      suggestion,
      estimatedGain,
      state: state.state,
      stateLabel: state.stateLabel,
      stateDuration
    };
  }

  /**
   * 估算健康评分提升
   * @param {Object} action - 动作对象
   * @returns {number}
   */
  estimateHealthGain(action) {
    let baseGain = 3;

    // 根据动作类型调整
    if (action.category === 'stretch') baseGain += 2;
    if (action.category === 'eye') baseGain += 1;

    // 根据当前状态调整
    if (this.currentState === 'focus') baseGain += 2;

    return baseGain;
  }

  /**
   * 获取今日统计数据
   * @returns {Object}
   */
  getTodayStats() {
    const today = new Date().toDateString();
    const todayFocusRecords = this.focusRecords.filter(r => {
      return r.startTime && new Date(r.startTime).toDateString() === today;
    });

    const focusDurations = todayFocusRecords
      .filter(r => r.duration)
      .map(r => r.duration);

    const longestFocus = focusDurations.length > 0 ? Math.max(...focusDurations) : 0;
    const avgFocus = focusDurations.length > 0 
      ? Math.round(focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length) 
      : 0;

    const adoptionRate = this.reminderStats.totalReminders > 0
      ? Math.round((this.reminderStats.acceptedReminders / this.reminderStats.totalReminders) * 100)
      : 0;

    return {
      longestFocus,
      avgFocus,
      focusCount: todayFocusRecords.length,
      smartDelayCount: this.reminderStats.focusExtensions,
      smartReminderCount: this.reminderStats.totalReminders,
      adoptionRate,
      acceptedReminders: this.reminderStats.acceptedReminders,
      skippedReminders: this.reminderStats.skippedReminders
    };
  }

  /**
   * 销毁服务（清理资源）
   */
  destroy() {
    // 移除事件监听器
    this.eventListeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.eventListeners = [];

    // 清除计时器
    if (this.hysteresisTimer) {
      clearTimeout(this.hysteresisTimer);
      this.hysteresisTimer = null;
    }
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }

    // 保存数据
    this.saveData();
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartRhythmService;
}