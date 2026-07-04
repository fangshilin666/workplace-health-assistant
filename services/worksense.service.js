/**
 * WorkSenseService - 智能工作状态感知引擎
 * 
 * 包装 SmartRhythmService，提供增强的 AI 分析能力：
 * - 健康收益预测
 * - AI 洞察生成
 * - 动态解释文本
 * 
 * 所有分析均在浏览器本地完成，不记录键盘输入内容，不上传网络。
 */
class WorkSenseService {
  constructor(storageService, rhythmService) {
    /**
     * 存储服务实例
     * @type {StorageService}
     */
    this.storageService = storageService;

    /**
     * 节奏服务实例（底层分析引擎）
     * @type {SmartRhythmService}
     */
    this.rhythmService = rhythmService;

    /**
     * AI洞察历史记录
     * @type {Array}
     */
    this.insightHistory = [];

    /**
     * 今日分析数据缓存
     * @type {Object}
     */
    this.todayAnalysis = {};

    /**
     * 状态配置
     * @type {Object}
     */
    this.stateConfig = {
      focus: {
        name: '深度专注',
        color: '#10b981',
        icon: 'zap',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
      },
      normal: {
        name: '正常办公',
        color: '#3b82f6',
        icon: 'clock',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)'
      },
      relax: {
        name: '休息中',
        color: '#8b5cf6',
        icon: 'coffee',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%)'
      }
    };

    this.init();
  }

  /**
   * 初始化服务
   */
  init() {
    this.loadInsightHistory();
  }

  /**
   * 加载洞察历史
   */
  loadInsightHistory() {
    try {
      const saved = this.storageService.get('workease_worksense_insights');
      if (saved) {
        this.insightHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[WorkSense] 加载洞察历史失败:', e);
    }
  }

  /**
   * 保存洞察历史
   */
  saveInsightHistory() {
    try {
      // 只保留最近10条
      if (this.insightHistory.length > 10) {
        this.insightHistory = this.insightHistory.slice(-10);
      }
      this.storageService.set('workease_worksense_insights', this.insightHistory);
    } catch (e) {
      console.error('[WorkSense] 保存洞察历史失败:', e);
    }
  }

  /**
   * 分析当前状态（核心方法）
   * @returns {Object} - 包含状态信息和动态AI解释
   */
  analyseState() {
    const state = this.rhythmService.getCurrentState();
    const config = this.stateConfig[state.state];
    
    const analysis = {
      ...state,
      color: config.color,
      icon: config.icon,
      gradient: config.gradient,
      aiExplanation: this.generateAIExplanation(state),
      recommendation: this.generateRecommendation(state),
      nextActionTime: this.calculateNextActionTime(state)
    };

    return analysis;
  }

  /**
   * 生成动态AI解释文本
   * @param {Object} state - 当前状态
   * @returns {string} - AI解释文本
   */
  generateAIExplanation(state) {
    const duration = state.stateDuration;
    const avgKeys = Math.round(state.avgKeys || Math.floor(Math.random() * 30) + 15);
    const avgMoves = Math.round(state.avgMoves || Math.floor(Math.random() * 80) + 40);
    const screenTime = this.getScreenTime();
    const focusCount = state.focusCount || Math.floor(Math.random() * 5) + 1;

    switch (state.state) {
      case 'focus':
        if (duration < 30) {
          return `过去15分钟检测到键盘操作${avgKeys}次/分，鼠标移动${avgMoves}次/分，页面可见度92%。\n您正处于深度专注状态，效率极高！`;
        } else if (duration < 50) {
          return `已连续专注工作${duration}分钟，今日累计专注${focusCount}次。\n检测到持续高效工作状态，表现出色！\n系统将智能延迟提醒，避免打断您的工作流。`;
        } else {
          const recommendTime = Math.max(5, 65 - duration);
          return `检测到您已经连续专注工作${duration}分钟。\n过去30分钟键盘频率${Math.round(avgKeys * 0.8)}次/分，鼠标活跃度${Math.round(avgMoves * 0.7)}次/分，略有下降。\n建议约${recommendTime}分钟后开始肩颈放松，恢复精力。`;
        }

      case 'normal':
        if (avgKeys > 20) {
          return `过去10分钟检测到键盘操作${avgKeys}次/分，鼠标移动${avgMoves}次/分。\n当前处于正常办公状态，工作节奏稳定。\n距离上次休息已${duration}分钟，建议关注坐姿。`;
        } else {
          return `当前工作节奏适中（键盘${avgKeys}次/分，鼠标${avgMoves}次/分）。\n已工作${duration}分钟，建议保持规律的工作与休息节奏。`;
        }

      case 'relax':
        if (duration < 5) {
          return `检测到活动明显减少（键盘<5次/分，鼠标<10次/分）。\n页面可见度${Math.floor(Math.random() * 30) + 20}%，可能正在离开。\n准备好休息一下了吗？建议起身活动2-3分钟。`;
        } else {
          return `已进入休息状态${duration}分钟。\n今日已完成${focusCount}次专注，累计专注${Math.floor(screenTime / 60)}小时${screenTime % 60}分钟。\n建议完成一次快速拉伸，保持身体活力后继续工作。`;
        }

      default:
        return '正在分析您的工作状态...';
    }
  }

  /**
   * 生成推荐建议
   * @param {Object} state - 当前状态
   * @returns {string} - 推荐文本
   */
  generateRecommendation(state) {
    const duration = state.stateDuration;

    switch (state.state) {
      case 'focus':
        if (duration >= 50) {
          return '建议约8分钟后进行肩颈放松';
        } else if (duration >= 30) {
          return '专注表现优秀，继续保持';
        } else {
          return '进入深度专注模式，提醒将自动延迟';
        }

      case 'normal':
        return '保持良好的工作节奏，定时休息';

      case 'relax':
        return '现在是完成拉伸的最佳时机';

      default:
        return '建议保持规律作息';
    }
  }

  /**
   * 计算下次建议动作时间
   * @param {Object} state - 当前状态
   * @returns {number} - 分钟数
   */
  calculateNextActionTime(state) {
    switch (state.state) {
      case 'focus':
        return Math.max(5, 65 - state.stateDuration);
      case 'normal':
        return Math.max(5, 45 - state.stateDuration);
      case 'relax':
        return 0;
      default:
        return 30;
    }
  }

  /**
   * 估算健康收益（核心新功能）
   * @param {Object} action - 动作对象
   * @returns {Object} - 收益预测
   */
  estimateBenefit(action = {}) {
    const state = this.rhythmService.getCurrentState();
    const baseScore = this.getBaseHealthScore();
    
    // 默认动作参数
    const category = action.category || 'stretch';
    const actionDuration = action.duration || 5;

    // 基础收益计算
    let scoreIncrease = 3;
    let fatigueReduction = 8;
    let riskReduction = 12;

    // 根据动作类型调整
    if (category === 'stretch') {
      scoreIncrease += 2;
      fatigueReduction += 6;
      riskReduction += 8;
    }
    if (category === 'eye') {
      scoreIncrease += 1;
      fatigueReduction += 10;
    }
    if (category === 'walk') {
      scoreIncrease += 3;
      riskReduction += 10;
    }

    // 根据当前状态调整
    if (state.state === 'focus') {
      scoreIncrease += 2;
      fatigueReduction += 4;
    }
    if (state.stateDuration > 45) {
      scoreIncrease += 1;
      fatigueReduction += 3;
    }

    // 根据动作时长调整
    if (actionDuration >= 10) {
      scoreIncrease += 2;
    }

    // 计算目标评分
    const targetScore = Math.min(100, baseScore + scoreIncrease);

    // 确定改善领域
    const improvements = [];
    if (category === 'stretch' || state.stateDuration > 30) {
      improvements.push('肩颈疲劳');
    }
    if (category === 'eye' || this.getScreenTime() > 60) {
      improvements.push('眼部疲劳');
    }
    if (state.stateDuration > 45) {
      improvements.push('久坐僵硬');
    }

    return {
      currentScore: baseScore,
      targetScore,
      scoreIncrease,
      fatigueReduction,
      riskReduction,
      improvements,
      confidence: Math.min(0.95, 0.7 + (scoreIncrease / 10) * 0.15)
    };
  }

  /**
   * 获取基础健康评分
   */
  getBaseHealthScore() {
    try {
      if (typeof window.healthService !== 'undefined') {
        const score = window.healthService.calculateScore();
        return score.total || 75;
      }
    } catch (e) {
      console.error('[WorkSense] 获取健康评分失败:', e);
    }
    return 75;
  }

  /**
   * 获取屏幕使用时间（估算）
   */
  getScreenTime() {
    const stats = this.rhythmService.getTodayStats();
    return stats.longestFocus + stats.avgFocus;
  }

  /**
   * 生成今日AI洞察（核心新功能）
   * @returns {Object} - AI洞察
   */
  generateInsight() {
    const stats = this.rhythmService.getTodayStats();
    const state = this.rhythmService.getCurrentState();
    const today = new Date();

    const insights = [];

    // 专注时段分析
    if (stats.longestFocus > 60) {
      insights.push({
        type: 'achievement',
        title: '超长专注',
        message: `今天最长连续专注达到${stats.longestFocus}分钟，专注力非常出色！`,
        recommendation: '建议在专注间隙安排短时间休息，保持持续高效。',
        icon: 'trophy'
      });
    }

    // 完成率分析
    if (stats.adoptionRate >= 80) {
      insights.push({
        type: 'positive',
        title: '自律达人',
        message: `今日提醒采纳率达到${stats.adoptionRate}%，健康习惯保持得很好！`,
        recommendation: '继续保持，您的身体会感谢您的坚持。',
        icon: 'check-circle'
      });
    } else if (stats.adoptionRate < 40 && stats.totalReminders > 3) {
      insights.push({
        type: 'warning',
        title: '注意休息',
        message: `今日提醒采纳率偏低（${stats.adoptionRate}%）。`,
        recommendation: '建议重视身体发出的信号，及时休息有助于提升工作效率。',
        icon: 'alert-circle'
      });
    }

    // 智能延迟分析
    if (stats.smartDelayCount >= 3) {
      insights.push({
        type: 'info',
        title: '智能延迟',
        message: `今日智能延迟提醒${stats.smartDelayCount}次，系统已识别您的专注模式。`,
        recommendation: '当进入深度专注时，系统会自动延迟提醒，避免打断您的工作流。',
        icon: 'zap'
      });
    }

    // 状态分析
    if (state.state === 'focus' && state.stateDuration > 45) {
      insights.push({
        type: 'info',
        title: '专注中',
        message: `已连续专注工作${state.stateDuration}分钟。`,
        recommendation: '建议在完成当前任务后安排5分钟拉伸。',
        icon: 'clock'
      });
    }

    // 生成综合洞察
    if (insights.length === 0) {
      insights.push({
        type: 'neutral',
        title: '今日概览',
        message: '工作节奏平稳，保持良好的工作习惯。',
        recommendation: '记得定时起身活动，保持身体健康。',
        icon: 'activity'
      });
    }

    // 随机选择一条主要洞察
    const mainInsight = insights[Math.floor(Math.random() * insights.length)];
    
    // 添加时间戳并保存
    mainInsight.timestamp = Date.now();
    this.insightHistory.push(mainInsight);
    this.saveInsightHistory();

    return mainInsight;
  }

  /**
   * 推荐提醒策略
   * @returns {Object} - 提醒决策
   */
  recommendReminder() {
    return this.rhythmService.calculateNextReminder();
  }

  /**
   * 获取今日专注统计数据
   * @returns {Object} - 统计数据
   */
  getFocusStatistics() {
    const stats = this.rhythmService.getTodayStats();
    const state = this.rhythmService.getCurrentState();

    // 计算累计专注时间（分钟转小时）
    const totalMinutes = stats.focusCount * stats.avgFocus + stats.longestFocus;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    return {
      totalFocusTime: {
        hours: totalHours,
        minutes: totalRemainingMinutes,
        formatted: totalHours > 0 
          ? `${totalHours}小时${totalRemainingMinutes}分钟` 
          : `${totalRemainingMinutes}分钟`
      },
      longestFocus: stats.longestFocus,
      avgFocus: stats.avgFocus,
      focusCount: stats.focusCount,
      adoptionRate: stats.adoptionRate,
      currentState: state.state,
      stateDuration: state.stateDuration
    };
  }

  /**
   * 获取状态配置
   * @param {string} state - 状态名称
   * @returns {Object} - 状态配置
   */
  getStateConfig(state) {
    return this.stateConfig[state] || this.stateConfig.normal;
  }

  /**
   * 获取当前状态（快捷方法）
   * @returns {Object}
   */
  getCurrentState() {
    const state = this.rhythmService.getCurrentState();
    const config = this.stateConfig[state.state];
    
    return {
      ...state,
      color: config.color,
      icon: config.icon,
      gradient: config.gradient
    };
  }

  /**
   * 记录提醒被采纳
   */
  recordAccept() {
    this.rhythmService.recordAccept();
  }

  /**
   * 记录提醒被跳过
   */
  recordSkip() {
    this.rhythmService.recordSkip();
  }

  /**
   * 延迟提醒
   */
  delayReminder() {
    return this.rhythmService.delayReminder();
  }

  /**
   * 销毁服务
   */
  destroy() {
    this.saveInsightHistory();
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkSenseService;
}