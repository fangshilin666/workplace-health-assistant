/**
 * HealthRecordService - AI健康记录服务
 * 
 * 负责生成每日健康记录、AI分析、成就徽章等。
 * 所有分析均在浏览器本地完成。
 */
class HealthRecordService {
  constructor(storageService, healthService, workSenseService) {
    this.storageService = storageService;
    this.healthService = healthService;
    this.workSenseService = workSenseService;

    this.todayEvents = [];
    this.records = [];
    this.badges = [];

    this.init();
  }

  init() {
    this.loadRecords();
    this.loadBadges();
    this.initTodayEvents();
  }

  loadRecords() {
    try {
      const saved = this.storageService.get('workease_health_records');
      if (saved) {
        this.records = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[HealthRecord] 加载记录失败:', e);
    }
  }

  loadBadges() {
    try {
      const saved = this.storageService.get('workease_badges');
      if (saved) {
        this.badges = JSON.parse(saved);
      } else {
        this.initBadges();
      }
    } catch (e) {
      console.error('[HealthRecord] 加载徽章失败:', e);
      this.initBadges();
    }
  }

  initBadges() {
    this.badges = [
      { id: 'first_stretch', icon: 'leaf', name: '第一次坚持', unlocked: false, unlockedDate: null },
      { id: 'streak_3', icon: 'flame', name: '连续3天打卡', unlocked: false, unlockedDate: null },
      { id: 'streak_5', icon: 'award', name: '连续5天打卡', unlocked: false, unlockedDate: null },
      { id: 'streak_7', icon: 'trophy', name: '连续7天打卡', unlocked: false, unlockedDate: null },
      { id: 'stretch_5', icon: 'activity', name: '完成5次拉伸', unlocked: false, unlockedDate: null },
      { id: 'stretch_10', icon: 'dumbbell', name: '完成10次拉伸', unlocked: false, unlockedDate: null },
      { id: 'stretch_20', icon: 'heart', name: '完成20次拉伸', unlocked: false, unlockedDate: null },
      { id: 'eye_master', icon: 'eye', name: '护眼达人', unlocked: false, unlockedDate: null },
      { id: 'focus_60', icon: 'zap', name: '专注一小时', unlocked: false, unlockedDate: null },
      { id: 'focus_90', icon: 'clock', name: '超长专注', unlocked: false, unlockedDate: null },
      { id: 'score_80', icon: 'star', name: '健康评分80+', unlocked: false, unlockedDate: null },
      { id: 'score_90', icon: 'crown', name: '健康评分90+', unlocked: false, unlockedDate: null },
      { id: 'sedentary_killer', icon: 'armchair', name: '久坐终结者', unlocked: false, unlockedDate: null },
      { id: 'perfect_day', icon: 'sun', name: '完美一天', unlocked: false, unlockedDate: null }
    ];
    this.saveBadges();
  }

  initTodayEvents() {
    const today = new Date().toDateString();
    const saved = this.storageService.get(`workease_today_events_${today}`);
    if (saved) {
      this.todayEvents = JSON.parse(saved);
    }
  }

  saveRecords() {
    try {
      if (this.records.length > 30) {
        this.records = this.records.slice(-30);
      }
      this.storageService.set('workease_health_records', this.records);
    } catch (e) {
      console.error('[HealthRecord] 保存记录失败:', e);
    }
  }

  saveBadges() {
    try {
      this.storageService.set('workease_badges', this.badges);
    } catch (e) {
      console.error('[HealthRecord] 保存徽章失败:', e);
    }
  }

  saveTodayEvents() {
    const today = new Date().toDateString();
    try {
      this.storageService.set(`workease_today_events_${today}`, this.todayEvents);
    } catch (e) {
      console.error('[HealthRecord] 保存今日事件失败:', e);
    }
  }

  recordEvent(type, title, data = {}) {
    const now = new Date();
    const event = {
      id: Date.now(),
      type,
      title,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      timestamp: now.getTime(),
      data
    };

    this.todayEvents.push(event);
    this.todayEvents.sort((a, b) => a.timestamp - b.timestamp);
    
    if (this.todayEvents.length > 50) {
      this.todayEvents = this.todayEvents.slice(-50);
    }

    this.saveTodayEvents();
    this.checkBadges();

    return event;
  }

  checkBadges() {
    const stats = this.getTodayStats();
    const yesterdayRecord = this.getYesterdayRecord();

    let changed = false;

    if (stats.stretchCount >= 1 && !this.isBadgeUnlocked('first_stretch')) {
      this.unlockBadge('first_stretch');
      changed = true;
    }

    if (stats.stretchCount >= 5 && !this.isBadgeUnlocked('stretch_5')) {
      this.unlockBadge('stretch_5');
      changed = true;
    }

    if (stats.stretchCount >= 10 && !this.isBadgeUnlocked('stretch_10')) {
      this.unlockBadge('stretch_10');
      changed = true;
    }

    if (stats.stretchCount >= 20 && !this.isBadgeUnlocked('stretch_20')) {
      this.unlockBadge('stretch_20');
      changed = true;
    }

    if (stats.longestFocus >= 60 && !this.isBadgeUnlocked('focus_60')) {
      this.unlockBadge('focus_60');
      changed = true;
    }

    if (stats.longestFocus >= 90 && !this.isBadgeUnlocked('focus_90')) {
      this.unlockBadge('focus_90');
      changed = true;
    }

    if (stats.healthScore >= 80 && !this.isBadgeUnlocked('score_80')) {
      this.unlockBadge('score_80');
      changed = true;
    }

    if (stats.healthScore >= 90 && !this.isBadgeUnlocked('score_90')) {
      this.unlockBadge('score_90');
      changed = true;
    }

    if (stats.eyeReminderCount >= 3 && !this.isBadgeUnlocked('eye_master')) {
      this.unlockBadge('eye_master');
      changed = true;
    }

    const streak = this.calculateStreak();
    if (streak >= 3 && !this.isBadgeUnlocked('streak_3')) {
      this.unlockBadge('streak_3');
      changed = true;
    }
    if (streak >= 5 && !this.isBadgeUnlocked('streak_5')) {
      this.unlockBadge('streak_5');
      changed = true;
    }
    if (streak >= 7 && !this.isBadgeUnlocked('streak_7')) {
      this.unlockBadge('streak_7');
      changed = true;
    }

    if (stats.stretchCount >= 4 && stats.eyeReminderCount >= 2 && 
        stats.healthScore >= 80 && !this.isBadgeUnlocked('perfect_day')) {
      this.unlockBadge('perfect_day');
      changed = true;
    }

    if (stats.adoptionRate >= 80 && stats.stretchCount >= 3 && 
        !this.isBadgeUnlocked('sedentary_killer')) {
      this.unlockBadge('sedentary_killer');
      changed = true;
    }

    if (changed) {
      this.saveBadges();
    }
  }

  isBadgeUnlocked(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    return badge ? badge.unlocked : false;
  }

  unlockBadge(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      badge.unlockedDate = new Date().toISOString();
      
      if (typeof toast !== 'undefined') {
        toast.success(`🎉 获得新徽章：${badge.name}`);
      }
    }
  }

  calculateStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const record = this.records.find(r => new Date(r.date).toDateString() === dateStr);
      if (record && record.statistics.stretchCount >= 1) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }

  getTodayStats() {
    const healthScore = this.healthService ? this.healthService.calculateScore().total : 75;
    const focusStats = this.workSenseService ? this.workSenseService.getFocusStatistics() : {
      totalFocusTime: { hours: 0, minutes: 0 },
      longestFocus: 0,
      avgFocus: 0,
      focusCount: 0,
      adoptionRate: 0
    };

    const stretchEvents = this.todayEvents.filter(e => e.type === 'stretch_complete');
    const eyeEvents = this.todayEvents.filter(e => e.type === 'eye_reminder');

    return {
      healthScore,
      totalFocusTime: focusStats.totalFocusTime.formatted,
      longestFocus: focusStats.longestFocus,
      stretchCount: stretchEvents.length,
      eyeReminderCount: eyeEvents.length,
      adoptionRate: focusStats.adoptionRate,
      focusCount: focusStats.focusCount
    };
  }

  getYesterdayRecord() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toDateString();
    return this.records.find(r => new Date(r.date).toDateString() === dateStr);
  }

  generateDailyRecord() {
    const now = new Date();
    const dateStr = now.toDateString();
    const stats = this.getTodayStats();
    const yesterdayRecord = this.getYesterdayRecord();

    const healthLevel = this.getHealthLevel(stats.healthScore);
    const scoreChange = yesterdayRecord ? stats.healthScore - yesterdayRecord.statistics.healthScore : 0;

    const record = {
      date: now.toISOString(),
      dateStr,
      healthScore: stats.healthScore,
      healthLevel,
      scoreChange,
      summary: this.generateSummary(stats, scoreChange),
      timeline: this.generateTimeline(),
      analysis: this.generateAnalysis(stats, yesterdayRecord, scoreChange),
      highlights: this.generateHighlights(stats),
      improvements: this.generateImprovement(stats),
      tomorrowGoals: this.generateTomorrowGoal(stats),
      badges: this.generateBadges(),
      statistics: stats,
      streak: this.calculateStreak()
    };

    this.records.push(record);
    this.saveRecords();

    return record;
  }

  getHealthLevel(score) {
    if (score >= 90) return '卓越';
    if (score >= 80) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 60) return '一般';
    return '需要关注';
  }

  generateSummary(stats, scoreChange) {
    const summaries = [];

    if (stats.stretchCount >= 4) {
      summaries.push(`今天完成了${stats.stretchCount}次舒缓运动，你正在养成一个更健康的工作习惯。`);
    } else if (stats.stretchCount >= 2) {
      summaries.push(`今天完成了${stats.stretchCount}次拉伸，继续保持！`);
    } else if (stats.stretchCount === 1) {
      summaries.push(`今天完成了1次拉伸，迈出了健康的第一步。`);
    } else {
      summaries.push(`今天工作比较忙，没关系，明天完成一次拉伸也是一种进步。`);
    }

    if (scoreChange > 0) {
      summaries.push(`相比昨天，健康评分提升了${scoreChange}分！`);
    } else if (scoreChange < 0) {
      summaries.push(`今天的健康评分有所下降，明天再接再厉。`);
    }

    return summaries[0];
  }

  generateTimeline() {
    if (this.todayEvents.length === 0) {
      const now = new Date();
      const hour = now.getHours();
      
      const events = [];
      
      if (hour >= 8) {
        events.push({
          time: '08:00',
          type: 'work_start',
          title: '开始工作',
          icon: 'briefcase'
        });
      }
      
      const stretchCount = this.getTodayStats().stretchCount;
      const times = ['10:00', '11:30', '14:00', '15:30', '17:00'];
      
      for (let i = 0; i < Math.min(stretchCount, times.length); i++) {
        events.push({
          time: times[i],
          type: 'stretch_complete',
          title: '完成肩颈放松',
          icon: 'activity'
        });
      }

      if (hour >= 12) {
        events.push({
          time: '12:00',
          type: 'eye_reminder',
          title: '完成护眼提醒',
          icon: 'eye'
        });
      }

      if (hour >= 14) {
        events.push({
          time: '14:00',
          type: 'focus_enter',
          title: '进入深度专注',
          icon: 'zap'
        });
      }

      if (hour >= 18) {
        events.push({
          time: '18:00',
          type: 'work_end',
          title: '完成今日工作',
          icon: 'check-circle'
        });
      }

      return events;
    }

    return this.todayEvents.map(e => ({
      time: e.time,
      type: e.type,
      title: e.title,
      icon: this.getEventIcon(e.type)
    }));
  }

  getEventIcon(type) {
    const icons = {
      work_start: 'briefcase',
      work_end: 'check-circle',
      stretch_start: 'activity',
      stretch_complete: 'activity',
      eye_reminder: 'eye',
      focus_enter: 'zap',
      focus_exit: 'clock',
      ai_recommend: 'sparkles',
      reminder_shown: 'bell',
      reminder_accepted: 'check',
      reminder_skipped: 'x'
    };
    return icons[type] || 'circle';
  }

  generateAnalysis(stats, yesterdayRecord, scoreChange) {
    const analysis = [];

    const totalMinutes = stats.longestFocus + stats.focusCount * 10;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      analysis.push(`今天累计专注工作${hours}小时${minutes}分钟。`);
    }

    if (stats.longestFocus >= 60) {
      analysis.push(`下午${this.getPeakTime()}是工作效率最高的时间段。`);
    }

    if (yesterdayRecord) {
      if (scoreChange > 0) {
        analysis.push(`相比昨天，健康评分提升${scoreChange}分。`);
      } else if (scoreChange < 0) {
        analysis.push(`相比昨天，健康评分下降${Math.abs(scoreChange)}分。`);
      }
    }

    if (stats.stretchCount >= 3) {
      analysis.push('建议继续保持下午的放松节奏。');
    } else {
      analysis.push('建议明天多安排几次拉伸，保持身体健康。');
    }

    return analysis;
  }

  getPeakTime() {
    const hour = new Date().getHours();
    if (hour >= 14 && hour < 16) return '14:00~16:00';
    if (hour >= 10 && hour < 12) return '10:00~12:00';
    return '14:00~16:00';
  }

  generateHighlights(stats) {
    const highlights = [];

    if (stats.longestFocus >= 60) {
      highlights.push({
        icon: 'trophy',
        text: `今天最长连续专注${stats.longestFocus}分钟`,
        color: '#f59e0b'
      });
    } else if (stats.longestFocus >= 30) {
      highlights.push({
        icon: 'clock',
        text: `最长专注${stats.longestFocus}分钟`,
        color: '#3b82f6'
      });
    }

    if (stats.stretchCount >= 4) {
      highlights.push({
        icon: 'leaf',
        text: `完成${stats.stretchCount}次拉伸`,
        color: '#22c55e'
      });
    } else if (stats.stretchCount >= 2) {
      highlights.push({
        icon: 'activity',
        text: `完成${stats.stretchCount}次拉伸`,
        color: '#10b981'
      });
    }

    if (stats.eyeReminderCount >= 3) {
      highlights.push({
        icon: 'eye',
        text: '护眼完成率优秀',
        color: '#8b5cf6'
      });
    }

    if (stats.healthScore >= 80) {
      highlights.push({
        icon: 'star',
        text: `健康评分${stats.healthScore}分`,
        color: '#fbbf24'
      });
    }

    if (highlights.length === 0) {
      highlights.push({
        icon: 'heart',
        text: '今天也在努力保持健康',
        color: '#ec4899'
      });
    }

    return highlights.slice(0, 3);
  }

  generateImprovement(stats) {
    const improvements = [];

    if (stats.stretchCount < 2) {
      improvements.push({
        text: '放松次数偏少',
        suggestion: '建议每工作45分钟起身活动一次'
      });
    }

    if (stats.longestFocus >= 90) {
      improvements.push({
        text: '连续专注时间较长',
        suggestion: '建议适当休息，保持高效工作状态'
      });
    }

    if (stats.adoptionRate < 50 && stats.adoptionRate > 0) {
      improvements.push({
        text: '提醒采纳率偏低',
        suggestion: '及时休息有助于提升工作效率'
      });
    }

    return improvements.slice(0, 2);
  }

  generateTomorrowGoal(stats) {
    const goals = [];
    const difficulty = [];

    if (stats.stretchCount < 3) {
      goals.push({
        text: '完成3次肩颈拉伸',
        difficulty: stats.stretchCount >= 2 ? 'easy' : 'normal'
      });
    } else {
      goals.push({
        text: '完成4次拉伸运动',
        difficulty: 'normal'
      });
    }

    if (stats.longestFocus >= 75) {
      goals.push({
        text: '连续久坐控制在60分钟以内',
        difficulty: 'normal'
      });
    }

    if (stats.healthScore < 80) {
      goals.push({
        text: '健康评分达到80分',
        difficulty: 'challenge'
      });
    } else if (stats.healthScore < 90) {
      goals.push({
        text: '健康评分达到90分',
        difficulty: 'challenge'
      });
    }

    if (stats.eyeReminderCount < 3) {
      goals.push({
        text: '完成3次护眼提醒',
        difficulty: 'easy'
      });
    }

    if (goals.length === 0) {
      goals.push({
        text: '保持今天的健康节奏',
        difficulty: 'easy'
      });
      goals.push({
        text: '尝试一次新的拉伸动作',
        difficulty: 'normal'
      });
    }

    const overallDifficulty = goals.some(g => g.difficulty === 'challenge') 
      ? 'challenge' 
      : goals.some(g => g.difficulty === 'normal') 
        ? 'normal' 
        : 'easy';

    return {
      goals: goals.slice(0, 3),
      overallDifficulty
    };
  }

  generateBadges() {
    return this.badges.filter(b => b.unlocked);
  }

  getHistoryRecords(days = 7) {
    return this.records.slice(-days).reverse();
  }

  getTodayRecord() {
    const today = new Date().toDateString();
    return this.records.find(r => new Date(r.date).toDateString() === today);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthRecordService;
}