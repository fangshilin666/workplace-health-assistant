/**
 * SmartCoachService - 智能健康教练服务
 * 
 * 根据用户当前健康状态，智能推荐最合适的5分钟舒缓动作。
 * 综合分析多个因素动态决策，推荐结果具有解释性。
 */
class SmartCoachService {
  constructor(storageService, healthService) {
    /**
     * 存储服务实例
     * @type {StorageService}
     */
    this.storageService = storageService;

    /**
     * 健康服务实例
     * @type {HealthService}
     */
    this.healthService = healthService;

    /**
     * 动作库
     * @type {Object}
     */
    this.actionLibrary = this.initActionLibrary();

    /**
     * 推荐历史存储键前缀
     * @type {string}
     */
    this.historyKey = 'coach_history';

    /**
     * 当前推荐索引（用于"换一个"功能）
     * @type {number}
     */
    this.currentRecommendationIndex = 0;

    /**
     * 当前推荐列表
     * @type {Array}
     */
    this.currentRecommendations = [];
  }

  /**
   * 初始化动作库
   * @returns {Object} - 动作库配置
   */
  initActionLibrary() {
    return {
      neckRelax: {
        id: 'neckRelax',
        name: '肩颈放松',
        icon: 'activity',
        duration: 5,
        category: 'neck',
        description: '缓解肩颈压力，改善颈部血液循环',
        benefits: ['肩颈压力', '颈部僵硬', '血液循环'],
        scoreImpact: { sit: 3, stretch: 5, pose: 2 },
        recommendedWhen: ['longSit', 'headForward', 'shoulderShrug']
      },
      shoulderCircle: {
        id: 'shoulderCircle',
        name: '肩部环绕',
        icon: 'rotate-cw',
        duration: 4,
        category: 'shoulder',
        description: '放松肩部肌肉，改善耸肩问题',
        benefits: ['肩部紧张', '耸肩', '手臂麻木'],
        scoreImpact: { sit: 2, stretch: 4, pose: 4 },
        recommendedWhen: ['shoulderShrug', 'longSit', 'hunchback']
      },
      eyeExercise: {
        id: 'eyeExercise',
        name: '20秒远眺训练',
        icon: 'eye',
        duration: 1,
        category: 'eye',
        description: '放松眼部肌肉，缓解视疲劳',
        benefits: ['眼疲劳', '视力保护', '眼部干涩'],
        scoreImpact: { eye: 6 },
        recommendedWhen: ['lowEyeRate', 'longSit']
      },
      backStretch: {
        id: 'backStretch',
        name: '腰背拉伸',
        icon: 'arrow-up-right',
        duration: 5,
        category: 'back',
        description: '拉伸背部肌肉，改善含胸驼背',
        benefits: ['腰背酸痛', '含胸驼背', '脊柱压力'],
        scoreImpact: { sit: 4, stretch: 5, pose: 3 },
        recommendedWhen: ['hunchback', 'longSit']
      },
      wristStretch: {
        id: 'wristStretch',
        name: '手腕放松',
        icon: 'hand',
        duration: 3,
        category: 'wrist',
        description: '放松手腕肌肉，预防腕管综合征',
        benefits: ['手腕酸痛', '鼠标手', '手指僵硬'],
        scoreImpact: { stretch: 3 },
        recommendedWhen: ['longSit', 'afterWork']
      },
      deepBreath: {
        id: 'deepBreath',
        name: '深呼吸放松',
        icon: 'wind',
        duration: 3,
        category: 'breath',
        description: '通过深呼吸缓解压力和焦虑',
        benefits: ['压力缓解', '焦虑情绪', '心肺功能'],
        scoreImpact: { sit: 2 },
        recommendedWhen: ['afternoon', 'evening', 'highScore']
      },
      standingStretch: {
        id: 'standingStretch',
        name: '站立伸展',
        icon: 'arrow-up',
        duration: 4,
        category: 'fullbody',
        description: '全身伸展运动，促进血液循环',
        benefits: ['全身疲劳', '血液循环', '久坐僵硬'],
        scoreImpact: { sit: 5, stretch: 4 },
        recommendedWhen: ['longSit', 'veryLongSit']
      },
      headTilt: {
        id: 'headTilt',
        name: '头部倾斜',
        icon: 'move',
        duration: 3,
        category: 'neck',
        description: '缓解颈部肌肉紧张',
        benefits: ['颈部紧张', '头痛', '颈椎压力'],
        scoreImpact: { pose: 3, stretch: 2 },
        recommendedWhen: ['headForward', 'longSit']
      }
    };
  }

  /**
   * 获取用户当前状态
   * @returns {Object} - 用户状态
   */
  getUserState() {
    const settings = this.storageService.loadSettings();
    const healthData = this.healthService.getTodayHealthData();
    const score = this.healthService.calculateScore();
    const timerState = this.getTimerState();
    const poseState = this.getPoseState();

    return {
      settings,
      healthData,
      score,
      timerState,
      poseState,
      currentTime: this.getCurrentTimeOfDay(),
      todayCompletedActions: this.getTodayCompletedActions()
    };
  }

  /**
   * 获取计时器状态
   * @returns {Object} - 计时器状态
   */
  getTimerState() {
    const today = new Date().toISOString().split('T')[0];
    const timerData = this.storageService.load(`timer_${today}`);
    
    if (timerData) {
      return timerData;
    }

    return {
      elapsedMinutes: 45,
      isRunning: true,
      lastBreakTime: Date.now() - 30 * 60 * 1000
    };
  }

  /**
   * 获取姿态检测状态
   * @returns {Object} - 姿态状态
   */
  getPoseState() {
    if (window.PoseDetector && window.PoseDetector.getCurrentPosture) {
      return window.PoseDetector.getCurrentPosture();
    }

    return {
      headForward: 'normal',
      shoulderShrug: 'normal',
      hunchback: 'normal'
    };
  }

  /**
   * 获取当前时间段
   * @returns {string} - morning/afternoon/evening
   */
  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * 获取今日已完成动作
   * @returns {Array} - 已完成动作ID列表
   */
  getTodayCompletedActions() {
    const today = new Date().toISOString().split('T')[0];
    const history = this.getHistory();
    return history
      .filter(item => item.date === today && item.completed)
      .map(item => item.actionId);
  }

  /**
   * 智能推荐动作
   * @returns {Object} - 推荐结果
   */
  recommend() {
    const state = this.getUserState();
    const candidates = this.generateCandidates(state);
    const filtered = this.filterCandidates(candidates, state);
    const ranked = this.rankCandidates(filtered, state);

    this.currentRecommendations = ranked;
    this.currentRecommendationIndex = 0;

    return ranked.length > 0 ? ranked[0] : null;
  }

  /**
   * 生成候选动作列表
   * @param {Object} state - 用户状态
   * @returns {Array} - 候选动作
   */
  generateCandidates(state) {
    const candidates = [];
    const triggers = this.detectTriggers(state);

    Object.values(this.actionLibrary).forEach(action => {
      action.recommendedWhen.forEach(trigger => {
        if (triggers.includes(trigger) && !candidates.find(c => c.id === action.id)) {
          candidates.push({ ...action });
        }
      });
    });

    return candidates;
  }

  /**
   * 检测触发条件
   * @param {Object} state - 用户状态
   * @returns {Array} - 触发条件列表
   */
  detectTriggers(state) {
    const triggers = [];
    const { settings, healthData, score, timerState, poseState, currentTime } = state;

    // 久坐检测
    const sitMinutes = timerState.elapsedMinutes || 45;
    if (sitMinutes >= settings.sitReminder) {
      triggers.push('longSit');
    }
    if (sitMinutes >= settings.sitReminder * 1.5) {
      triggers.push('veryLongSit');
    }

    // 姿态检测
    if (poseState.headForward === 'warning') {
      triggers.push('headForward');
    }
    if (poseState.shoulderShrug === 'warning') {
      triggers.push('shoulderShrug');
    }
    if (poseState.hunchback === 'warning') {
      triggers.push('hunchback');
    }

    // 护眼检测
    if (healthData.eyeCompleteRate < 0.5) {
      triggers.push('lowEyeRate');
    }

    // 时间段检测
    if (currentTime === 'afternoon') {
      triggers.push('afternoon');
    }
    if (currentTime === 'evening') {
      triggers.push('evening');
    }

    // 高评分检测
    if (score.overallScore >= 90) {
      triggers.push('highScore');
    }

    return triggers;
  }

  /**
   * 过滤候选动作（排除已完成、不合适的）
   * @param {Array} candidates - 候选动作
   * @param {Object} state - 用户状态
   * @returns {Array} - 过滤后动作
   */
  filterCandidates(candidates, state) {
    const completedActions = state.todayCompletedActions;
    const settings = state.settings;

    return candidates.filter(action => {
      // 排除今日已完成的动作
      if (completedActions.includes(action.id)) {
        return false;
      }

      return true;
    });
  }

  /**
   * 排序候选动作
   * @param {Array} candidates - 候选动作
   * @param {Object} state - 用户状态
   * @returns {Array} - 排序后动作
   */
  rankCandidates(candidates, state) {
    if (candidates.length === 0) {
      return this.getDefaultRecommendations(state);
    }

    const triggers = this.detectTriggers(state);

    return candidates.map(action => {
      let score = 0;

      // 根据触发条件匹配度评分
      action.recommendedWhen.forEach(trigger => {
        if (triggers.includes(trigger)) {
          score += 10;
        }
      });

      // 特殊权重
      if (triggers.includes('veryLongSit') && action.category === 'fullbody') {
        score += 15;
      }
      if (triggers.includes('lowEyeRate') && action.category === 'eye') {
        score += 20;
      }
      if (triggers.includes('headForward') && action.category === 'neck') {
        score += 10;
      }
      if (triggers.includes('shoulderShrug') && action.category === 'shoulder') {
        score += 10;
      }
      if (triggers.includes('hunchback') && action.category === 'back') {
        score += 10;
      }

      return { ...action, priorityScore: score };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * 获取默认推荐（当没有触发条件时）
   * @param {Object} state - 用户状态
   * @returns {Array} - 默认推荐动作
   */
  getDefaultRecommendations(state) {
    const completedActions = state.todayCompletedActions;

    const defaults = Object.values(this.actionLibrary)
      .filter(action => !completedActions.includes(action.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return defaults.map(action => ({ ...action, priorityScore: 0 }));
  }

  /**
   * 生成推荐理由（数据驱动版）
   * @param {Object} action - 动作对象
   * @param {Object} state - 用户状态
   * @returns {string} - 推荐理由
   */
  recommendReason(action, state = null) {
    if (!state) {
      state = this.getUserState();
    }

    const triggers = this.detectTriggers(state);
    const reasons = [];
    const { timerState, healthData, poseState, score } = state;

    const sitMinutes = timerState.elapsedMinutes || 0;
    const stretchCount = healthData.stretchCount || 0;
    const eyeCompleteRate = healthData.eyeCompleteRate || 0;

    if (triggers.includes('longSit')) {
      reasons.push(`已连续久坐${sitMinutes}分钟`);
    }
    if (triggers.includes('veryLongSit')) {
      reasons.push(`已连续久坐${sitMinutes}分钟，远超建议时长`);
    }
    if (triggers.includes('headForward')) {
      const warnings = poseState.headForward === 'warning' ? '近期' : '';
      reasons.push(`${warnings}检测到头部前倾姿态问题`);
    }
    if (triggers.includes('shoulderShrug')) {
      reasons.push('检测到肩部紧张/耸肩');
    }
    if (triggers.includes('hunchback')) {
      reasons.push('检测到含胸驼背姿态');
    }
    if (triggers.includes('lowEyeRate')) {
      reasons.push(`今日护眼完成率${Math.round(eyeCompleteRate * 100)}%，建议加强眼部放松`);
    }

    if (score.overallScore < 70) {
      reasons.push(`当前健康评分${score.overallScore}分，建议通过拉伸提升`);
    }

    if (stretchCount === 0) {
      reasons.push('今日尚未完成拉伸训练');
    }

    if (reasons.length === 0) {
      reasons.push(`当前健康评分${score.overallScore}分，保持良好状态`);
    }

    return reasons.join('，');
  }

  /**
   * 预估评分提升
   * @param {Object} action - 动作对象
   * @returns {number} - 预估提升分数
   */
  estimateScore(action) {
    const impact = action.scoreImpact;
    let total = 0;

    Object.values(impact).forEach(value => {
      total += value;
    });

    return total;
  }

  /**
   * 获取下一个推荐
   * @returns {Object} - 下一个推荐结果
   */
  recommendNext() {
    if (this.currentRecommendations.length === 0) {
      return this.recommend();
    }

    this.currentRecommendationIndex = (this.currentRecommendationIndex + 1) % this.currentRecommendations.length;
    return this.currentRecommendations[this.currentRecommendationIndex];
  }

  /**
   * 获取推荐历史
   * @param {number} limit - 返回数量限制
   * @returns {Array} - 历史记录
   */
  getHistory(limit = 10) {
    const history = this.storageService.load(this.historyKey) || [];
    return history.slice(-limit);
  }

  /**
   * 保存推荐记录
   * @param {Object} record - 记录对象
   * @returns {boolean} - 是否保存成功
   */
  saveHistory(record) {
    const history = this.getHistory(50);
    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      ...record
    };
    history.push(newRecord);
    return this.storageService.save(this.historyKey, history);
  }

  /**
   * 记录动作完成
   * @param {string} actionId - 动作ID
   * @param {number} duration - 完成耗时（秒）
   * @returns {boolean} - 是否保存成功
   */
  recordCompletion(actionId, duration) {
    return this.saveHistory({
      actionId,
      completed: true,
      duration
    });
  }

  /**
   * 记录动作跳过
   * @param {string} actionId - 动作ID
   * @returns {boolean} - 是否保存成功
   */
  recordSkip(actionId) {
    return this.saveHistory({
      actionId,
      completed: false,
      duration: 0
    });
  }

  /**
   * 获取今日完成率
   * @returns {number} - 完成率（0-1）
   */
  getTodayCompletionRate() {
    const today = new Date().toISOString().split('T')[0];
    const history = this.getHistory();
    const todayRecords = history.filter(item => item.date === today);

    if (todayRecords.length === 0) return 0;

    const completed = todayRecords.filter(item => item.completed).length;
    return completed / todayRecords.length;
  }

  /**
   * 获取动作详情
   * @param {string} actionId - 动作ID
   * @returns {Object|null} - 动作详情
   */
  getAction(actionId) {
    return this.actionLibrary[actionId] || null;
  }

  /**
   * 获取所有动作
   * @returns {Array} - 所有动作列表
   */
  getAllActions() {
    return Object.values(this.actionLibrary);
  }

  /**
   * 获取推荐结果（包含完整信息）
   * @returns {Object} - 完整推荐结果
   */
  getRecommendation() {
    const action = this.recommend();
    if (!action) return null;

    const state = this.getUserState();
    const reason = this.recommendReason(action, state);
    const expectedScore = this.estimateScore(action);
    const expectedImprovement = action.benefits.slice(0, 2).join('、');

    return {
      action,
      reason,
      expectedScore,
      expectedImprovement,
      currentScore: state.score.overallScore,
      todayCompleted: state.todayCompletedActions.length
    };
  }
}

// 创建单例实例
let smartCoachService = null;

if (typeof storageService !== 'undefined' && typeof healthService !== 'undefined') {
  smartCoachService = new SmartCoachService(storageService, healthService);
}

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { smartCoachService, SmartCoachService };
}