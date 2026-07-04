/**
 * HealthRule - 健康评分规则配置
 * 
 * 统一管理评分权重、阈值、等级、颜色等规则。
 * 所有规则集中管理，方便后续修改和扩展。
 */
const HealthRule = {
  /**
   * 评分维度权重配置
   * 总和必须为 1（100%）
   */
  weights: {
    sit: 0.35,      // 久坐健康：35%
    stretch: 0.25,  // 拉伸完成：25%
    pose: 0.25,     // 姿态表现：25%
    eye: 0.15       // 护眼完成：15%
  },

  /**
   * 等级划分规则
   */
  levels: [
    { min: 95, max: 100, level: 'Excellent', color: '#22c55e', label: '优秀' },
    { min: 85, max: 94, level: 'Good', color: '#3b82f6', label: '良好' },
    { min: 70, max: 84, level: 'Fair', color: '#f59e0b', label: '一般' },
    { min: 50, max: 69, level: 'Poor', color: '#f97316', label: '较差' },
    { min: 0, max: 49, level: 'Bad', color: '#ef4444', label: '危险' }
  ],

  /**
   * 久坐健康评分规则
   */
  sitRules: {
    idealMinutes: 240,        // 理想久坐时长（分钟）
    maxMinutes: 480,          // 最大允许时长（分钟）
    breakRateWeight: 0.4,     // 休息完成率权重
    durationWeight: 0.6       // 时长权重
  },

  /**
   * 拉伸评分规则
   */
  stretchRules: {
    idealCount: 5,            // 理想拉伸次数
    maxCount: 10,             // 最大次数
    completeRateWeight: 0.5,  // 完成率权重
    countWeight: 0.5          // 次数权重
  },

  /**
   * 姿态评分规则
   */
  poseRules: {
    goodRateThreshold: 0.7,   // 良好姿态阈值
    warningPenalty: {         // 警告扣分
      headForward: 5,
      shoulderShrug: 3,
      hunchback: 5
    }
  },

  /**
   * 护眼评分规则
   */
  eyeRules: {
    idealCount: 6,            // 理想护眼次数
    maxCount: 12,             // 最大次数
    completeRateWeight: 0.6,  // 完成率权重
    countWeight: 0.4          // 次数权重
  },

  /**
   * AI建议模板池
   */
  adviceTemplates: {
    excellent: [
      '今天状态极佳，继续保持！',
      '身体状态非常好，请继续保持这种节奏。',
      '完美的一天，明天也要加油！',
      '各项指标都很优秀，您的健康管理做得很棒！',
      '继续保持这种健康的工作生活节奏。'
    ],
    good: [
      '今天表现不错，继续努力！',
      '状态良好，可以适当增加一些运动。',
      '保持当前节奏，争取更好的成绩。',
      '整体表现良好，注意细节可以做得更好。',
      '再接再厉，争取达到优秀水平！'
    ],
    fair: [
      '今天表现一般，需要注意休息。',
      '建议增加拉伸次数，放松身体。',
      '久坐时间有点长，记得定时活动。',
      '还有提升空间，调整一下节奏会更好。',
      '注意劳逸结合，不要过度劳累。'
    ],
    poor: [
      '今天身体状态不佳，需要好好休息。',
      '建议减少久坐时间，多做拉伸运动。',
      '注意保护眼睛，增加远眺次数。',
      '身体发出警告，请重视休息。',
      '建议立即停止工作，进行一次全面的放松。'
    ],
    bad: [
      '今天需要好好休息，不要过度劳累。',
      '建议立即停止工作，进行一次全面的放松。',
      '身体发出警告信号，请重视健康。',
      '健康第一，请立即休息！',
      '您的身体已经超负荷，请停止工作并休息。'
    ],
    sit: {
      high: [
        '久坐时间控制良好，继续保持。',
        '工作节奏适中，注意适当休息。',
        '久坐时长在健康范围内，做得很好。',
        '定时休息做得不错，有效保护了身体。'
      ],
      low: [
        '久坐时间过长，请定时起身活动。',
        '建议减少连续工作时间，增加休息次数。',
        '久坐时长超标，请立即休息。',
        '注意劳逸结合，不要长时间连续工作。'
      ]
    },
    stretch: {
      high: [
        '拉伸完成率很高，身体得到了很好的放松。',
        '坚持拉伸，效果显著。',
        '拉伸次数达标，身体灵活性得到了锻炼。',
        '定期拉伸有助于预防肌肉劳损，继续保持！'
      ],
      low: [
        '拉伸次数不足，建议增加拉伸频率。',
        '记得每天完成规定的拉伸次数。',
        '拉伸完成率较低，请重视身体放松。',
        '建议每天至少完成3次拉伸运动。'
      ]
    },
    pose: {
      high: [
        '姿态保持非常好，继续保持！',
        '坐姿规范，有效保护了身体。',
        '良好的姿态习惯有助于预防颈椎问题。',
        '保持正确坐姿，为您的健康加分！'
      ],
      low: [
        '姿态检测显示需要改善坐姿。',
        '注意保持正确的坐姿，避免含胸驼背。',
        '姿态警告较多，请调整坐姿。',
        '建议使用姿态识别功能帮助纠正坐姿。'
      ]
    },
    eye: {
      high: [
        '护眼提醒完成率很高，眼睛得到了保护。',
        '坚持每20分钟远眺，效果很好。',
        '眼部健康保护做得很好，继续保持！',
        '定时远眺有助于缓解眼疲劳。'
      ],
      low: [
        '护眼提醒完成率较低，请重视眼部健康。',
        '建议增加远眺次数，保护视力。',
        '眼睛是心灵的窗户，请多加爱护。',
        '建议每20分钟休息20秒，远眺放松。'
      ]
    }
  },

  /**
   * 根据分数获取等级信息
   * @param {number} score - 分数（0-100）
   * @returns {Object} - 等级信息
   */
  getLevel(score) {
    score = Math.max(0, Math.min(100, score));
    const level = this.levels.find(l => score >= l.min && score <= l.max);
    return level || this.levels[this.levels.length - 1];
  },

  /**
   * 根据等级获取颜色
   * @param {number} score - 分数（0-100）
   * @returns {string} - 颜色代码
   */
  getLevelColor(score) {
    return this.getLevel(score).color;
  },

  /**
   * 根据等级获取标签
   * @param {number} score - 分数（0-100）
   * @returns {string} - 等级标签
   */
  getLevelLabel(score) {
    return this.getLevel(score).label;
  },

  /**
   * 获取所有评分维度
   * @returns {Array} - 维度列表
   */
  getDimensions() {
    return Object.keys(this.weights);
  },

  /**
   * 获取维度权重
   * @param {string} dimension - 维度名称
   * @returns {number} - 权重值
   */
  getWeight(dimension) {
    return this.weights[dimension] || 0;
  },

  /**
   * 获取总权重和（用于验证配置）
   * @returns {number} - 总权重
   */
  getTotalWeight() {
    return Object.values(this.weights).reduce((sum, w) => sum + w, 0);
  },

  /**
   * 添加新的评分维度（插件式扩展）
   * @param {string} dimension - 维度名称
   * @param {number} weight - 权重（0-1）
   * @param {Object} rules - 评分规则
   */
  addDimension(dimension, weight, rules) {
    // 调整现有权重，确保总和为1
    const currentTotal = this.getTotalWeight();
    const availableWeight = 1 - currentTotal;
    
    if (weight > availableWeight) {
      console.warn(`[HealthRule] 权重不足，当前可用权重: ${availableWeight}`);
      return false;
    }
    
    this.weights[dimension] = weight;
    
    // 添加规则配置
    if (rules) {
      const ruleKey = `${dimension}Rules`;
      this[ruleKey] = rules;
    }
    
    return true;
  }
};

// 导出规则
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthRule;
}