/**
 * HealthService - 健康评分服务
 * 
 * 负责计算健康评分、生成AI建议、获取健康等级和趋势。
 * 所有数据通过 StorageService 获取，不直接访问 localStorage。
 */
class HealthService {
  constructor(storageService, healthRule) {
    /**
     * 存储服务实例
     * @type {StorageService}
     */
    this.storageService = storageService;

    /**
     * 健康规则配置
     * @type {Object}
     */
    this.healthRule = healthRule || window.HealthRule;

    /**
     * 评分模块注册表（插件式扩展）
     * @type {Object}
     */
    this.scoreModules = {
      sit: { calculate: this.calculateSitScore.bind(this), weight: 0.35 },
      stretch: { calculate: this.calculateStretchScore.bind(this), weight: 0.25 },
      pose: { calculate: this.calculatePoseScore.bind(this), weight: 0.25 },
      eye: { calculate: this.calculateEyeScore.bind(this), weight: 0.15 }
    };
  }

  /**
   * 获取今日健康数据（从存储中读取或生成模拟数据）
   * @returns {Object} - 今日健康数据
   */
  getTodayHealthData() {
    const today = new Date().toISOString().split('T')[0];
    const savedData = this.storageService.load(`health_${today}`);

    if (savedData) {
      return savedData;
    }

    // 生成模拟数据（首次使用或数据缺失时）
    return this.generateMockData();
  }

  /**
   * 生成模拟健康数据（用于演示）
   * @returns {Object} - 模拟数据
   */
  generateMockData() {
    const settings = this.storageService.loadSettings();
    
    // 根据设置生成合理的模拟数据
    const sitMinutes = Math.floor(Math.random() * 200) + 180; // 180-380分钟
    const stretchCount = Math.floor(Math.random() * 5) + 2;     // 2-7次
    const eyeBreakCount = Math.floor(Math.random() * 5) + 3;    // 3-8次
    const poseGoodRate = (Math.random() * 0.3) + 0.65;          // 0.65-0.95
    
    return {
      date: new Date().toISOString().split('T')[0],
      sitMinutes: sitMinutes,
      sitRemindersCompleted: Math.floor(sitMinutes / settings.sitReminder),
      stretchCount: stretchCount,
      stretchTarget: settings.restTime > 0 ? 5 : 3,
      stretchCompleteRate: Math.min(1, stretchCount / 5),
      eyeBreakCount: eyeBreakCount,
      eyeTarget: Math.floor((sitMinutes / settings.eyeReminder)),
      eyeCompleteRate: Math.min(1, eyeBreakCount / 6),
      poseGoodRate: poseGoodRate,
      poseWarnings: {
        headForward: Math.floor(Math.random() * 8),
        shoulderShrug: Math.floor(Math.random() * 5),
        hunchback: Math.floor(Math.random() * 6)
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * 保存健康数据到存储
   * @param {Object} data - 健康数据
   * @returns {boolean} - 是否保存成功
   */
  saveHealthData(data) {
    const date = data.date || new Date().toISOString().split('T')[0];
    data.updatedAt = Date.now();
    return this.storageService.save(`health_${date}`, data);
  }

  /**
   * 更新健康数据（增量更新）
   * @param {Object} updates - 更新的数据
   * @returns {boolean} - 是否更新成功
   */
  updateHealthData(updates) {
    const data = this.getTodayHealthData();
    Object.assign(data, updates);
    return this.saveHealthData(data);
  }

  /**
   * 计算久坐健康评分
   * @param {Object} data - 健康数据
   * @returns {Object} - 评分结果
   */
  calculateSitScore(data) {
    const rules = this.healthRule.sitRules;
    
    // 时长得分：理想时长内满分，超过后递减
    const durationScore = data.sitMinutes <= rules.idealMinutes 
      ? 100 
      : Math.max(0, 100 - ((data.sitMinutes - rules.idealMinutes) / (rules.maxMinutes - rules.idealMinutes)) * 100);
    
    // 休息完成率得分
    const settings = this.storageService.loadSettings();
    const expectedBreaks = Math.floor(data.sitMinutes / settings.sitReminder);
    const breakRate = expectedBreaks > 0 ? data.sitRemindersCompleted / expectedBreaks : 1;
    const breakRateScore = Math.min(100, breakRate * 100);
    
    // 综合得分
    const score = Math.round(
      durationScore * rules.durationWeight + 
      breakRateScore * rules.breakRateWeight
    );
    
    const level = this.healthRule.getLevel(score);
    
    let reason;
    if (score >= 90) {
      reason = '今日久坐时间控制良好';
    } else if (score >= 70) {
      reason = '久坐时长适中，建议适当增加休息次数';
    } else if (score >= 50) {
      reason = '久坐时间偏长，请定时起身活动';
    } else {
      reason = '久坐时间过长，请立即休息';
    }
    
    return {
      score: score,
      status: level.level,
      reason: reason,
      weight: this.healthRule.getWeight('sit'),
      components: {
        durationScore: Math.round(durationScore),
        breakRateScore: Math.round(breakRateScore)
      }
    };
  }

  /**
   * 计算拉伸完成评分
   * @param {Object} data - 健康数据
   * @returns {Object} - 评分结果
   */
  calculateStretchScore(data) {
    const rules = this.healthRule.stretchRules;
    
    // 次数得分
    const countScore = data.stretchCount >= rules.idealCount 
      ? 100 
      : Math.round((data.stretchCount / rules.idealCount) * 100);
    
    // 完成率得分
    const completeRateScore = Math.round(Math.min(100, data.stretchCompleteRate * 100));
    
    // 综合得分
    const score = Math.round(
      countScore * rules.countWeight + 
      completeRateScore * rules.completeRateWeight
    );
    
    const level = this.healthRule.getLevel(score);
    
    let reason;
    if (score >= 90) {
      reason = `完成了${data.stretchCount}次拉伸，身体得到充分放松`;
    } else if (score >= 70) {
      reason = `完成了${data.stretchCount}次拉伸，建议继续保持`;
    } else if (score >= 50) {
      reason = `拉伸次数不足，完成了${data.stretchCount}次`;
    } else {
      reason = '拉伸次数严重不足，请重视身体放松';
    }
    
    return {
      score: score,
      status: level.level,
      reason: reason,
      weight: this.healthRule.getWeight('stretch'),
      components: {
        countScore: countScore,
        completeRateScore: completeRateScore
      }
    };
  }

  /**
   * 计算姿态表现评分
   * @param {Object} data - 健康数据
   * @returns {Object} - 评分结果
   */
  calculatePoseScore(data) {
    const rules = this.healthRule.poseRules;
    
    // 基础得分：良好姿态占比
    let score = Math.round(data.poseGoodRate * 100);
    
    // 根据警告次数扣分
    const warnings = data.poseWarnings || {};
    Object.keys(rules.warningPenalty).forEach(key => {
      const penalty = rules.warningPenalty[key] * (warnings[key] || 0);
      score = Math.max(0, score - penalty);
    });
    
    const level = this.healthRule.getLevel(score);
    
    let reason;
    if (score >= 90) {
      reason = '姿态保持非常好，继续保持！';
    } else if (score >= 70) {
      reason = '姿态表现良好，注意偶尔的不良姿势';
    } else if (score >= 50) {
      reason = '姿态检测显示需要改善坐姿';
    } else {
      reason = '不良姿态较多，请使用姿态识别功能纠正';
    }
    
    return {
      score: score,
      status: level.level,
      reason: reason,
      weight: this.healthRule.getWeight('pose'),
      components: {
        goodRateScore: Math.round(data.poseGoodRate * 100),
        penalty: Math.round(data.poseGoodRate * 100 - score)
      }
    };
  }

  /**
   * 计算护眼完成评分
   * @param {Object} data - 健康数据
   * @returns {Object} - 评分结果
   */
  calculateEyeScore(data) {
    const rules = this.healthRule.eyeRules;
    
    // 次数得分
    const countScore = data.eyeBreakCount >= rules.idealCount 
      ? 100 
      : Math.round((data.eyeBreakCount / rules.idealCount) * 100);
    
    // 完成率得分
    const completeRateScore = Math.round(Math.min(100, data.eyeCompleteRate * 100));
    
    // 综合得分
    const score = Math.round(
      countScore * rules.countWeight + 
      completeRateScore * rules.completeRateWeight
    );
    
    const level = this.healthRule.getLevel(score);
    
    let reason;
    if (score >= 90) {
      reason = `完成了${data.eyeBreakCount}次护眼休息，眼睛得到很好的保护`;
    } else if (score >= 70) {
      reason = `完成了${data.eyeBreakCount}次护眼休息，继续保持`;
    } else if (score >= 50) {
      reason = `护眼次数不足，完成了${data.eyeBreakCount}次`;
    } else {
      reason = '护眼提醒完成率较低，请重视眼部健康';
    }
    
    return {
      score: score,
      status: level.level,
      reason: reason,
      weight: this.healthRule.getWeight('eye'),
      components: {
        countScore: countScore,
        completeRateScore: completeRateScore
      }
    };
  }

  /**
   * 计算综合健康评分
   * @param {Object} data - 健康数据（可选，不传则自动获取）
   * @returns {Object} - 完整评分结果
   */
  calculateScore(data = null) {
    const healthData = data || this.getTodayHealthData();
    
    // 计算各维度得分
    const breakdown = {};
    let totalScore = 0;
    
    Object.keys(this.scoreModules).forEach(key => {
      const module = this.scoreModules[key];
      const result = module.calculate(healthData);
      breakdown[`${key}Score`] = result;
      totalScore += result.score * module.weight;
    });
    
    // 计算总分
    const overallScore = Math.round(totalScore);
    const level = this.healthRule.getLevel(overallScore);
    
    // 生成 AI 建议
    const advice = this.generateAdvice(breakdown, overallScore);
    
    // 获取趋势数据
    const trend = this.calculateTrend(overallScore);
    
    // 获取当前时间
    const now = new Date();
    const updateTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return {
      overallScore: overallScore,
      level: level.level,
      levelLabel: level.label,
      levelColor: level.color,
      breakdown: breakdown,
      advice: advice,
      updateTime: updateTime,
      trend: trend,
      date: healthData.date
    };
  }

  /**
   * 生成 AI 建议
   * @param {Object} breakdown - 各维度得分
   * @param {number} overallScore - 总分
   * @returns {Array} - 建议列表（2-3条）
   */
  generateAdvice(breakdown, overallScore) {
    const templates = this.healthRule.adviceTemplates;
    const advice = [];
    
    // 根据总分获取主建议
    const overallLevel = this.healthRule.getLevel(overallScore);
    const mainAdvice = templates[overallLevel.level.toLowerCase()];
    if (mainAdvice && mainAdvice.length > 0) {
      advice.push(mainAdvice[Math.floor(Math.random() * mainAdvice.length)]);
    }
    
    // 根据各维度得分获取分项建议
    const dimensions = ['sit', 'stretch', 'pose', 'eye'];
    const lowScoreDimensions = [];
    
    dimensions.forEach(dim => {
      const scoreKey = `${dim}Score`;
      if (breakdown[scoreKey] && breakdown[scoreKey].score < 70) {
        lowScoreDimensions.push(dim);
      }
    });
    
    // 随机选择1-2个低分维度生成建议
    const selectedDims = lowScoreDimensions.sort(() => Math.random() - 0.5).slice(0, 2);
    selectedDims.forEach(dim => {
      const dimTemplates = templates[dim];
      if (dimTemplates && dimTemplates.low && dimTemplates.low.length > 0) {
        advice.push(dimTemplates.low[Math.floor(Math.random() * dimTemplates.low.length)]);
      }
    });
    
    // 如果没有低分维度，随机选择一个高分维度生成表扬建议
    if (selectedDims.length === 0) {
      const highDim = dimensions[Math.floor(Math.random() * dimensions.length)];
      const dimTemplates = templates[highDim];
      if (dimTemplates && dimTemplates.high && dimTemplates.high.length > 0) {
        advice.push(dimTemplates.high[Math.floor(Math.random() * dimTemplates.high.length)]);
      }
    }
    
    // 确保至少有2条建议
    while (advice.length < 2) {
      advice.push(templates.good[Math.floor(Math.random() * templates.good.length)]);
    }
    
    return advice.slice(0, 3);
  }

  /**
   * 获取健康等级
   * @param {number} score - 分数
   * @returns {Object} - 等级信息
   */
  getHealthLevel(score) {
    return this.healthRule.getLevel(score);
  }

  /**
   * 计算评分趋势
   * @param {number} todayScore - 今日分数
   * @returns {Object} - 趋势数据
   */
  calculateTrend(todayScore) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayData = this.storageService.load(`health_${yesterdayStr}`);
    
    let yesterdayScore = 0;
    if (yesterdayData) {
      // 如果有昨天的数据，计算昨天的分数
      yesterdayScore = this.calculateScore(yesterdayData).overallScore;
    } else {
      // 没有数据时，生成一个随机的基准分数
      yesterdayScore = todayScore + Math.floor(Math.random() * 10) - 5;
      yesterdayScore = Math.max(0, Math.min(100, yesterdayScore));
    }
    
    const change = todayScore - yesterdayScore;
    
    return {
      today: todayScore,
      yesterday: yesterdayScore,
      change: change,
      changePercent: yesterdayScore > 0 ? Math.round((change / yesterdayScore) * 100) : 0,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  }

  /**
   * 获取历史评分数据
   * @param {number} days - 天数
   * @returns {Array} - 历史评分数组
   */
  getHistoryScores(days = 7) {
    const scores = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const data = this.storageService.load(`health_${dateStr}`);
      if (data) {
        const score = this.calculateScore(data);
        scores.push({
          date: dateStr,
          score: score.overallScore,
          level: score.level
        });
      } else {
        // 如果没有数据，生成模拟数据
        scores.push({
          date: dateStr,
          score: Math.floor(Math.random() * 30) + 60,
          level: 'Fair'
        });
      }
    }
    
    return scores;
  }

  /**
   * 注册新的评分模块（插件式扩展）
   * @param {string} id - 模块ID
   * @param {Object} module - 模块配置
   */
  registerScoreModule(id, module) {
    this.scoreModules[id] = module;
  }

  /**
   * 获取所有评分模块
   * @returns {Object} - 评分模块注册表
   */
  getScoreModules() {
    return { ...this.scoreModules };
  }
}

// 创建单例实例
let healthService = null;

if (typeof storageService !== 'undefined') {
  healthService = new HealthService(storageService, window.HealthRule);
}

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { healthService, HealthService };
}