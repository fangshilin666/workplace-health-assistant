/**
 * SmartRhythmCard - 智能工作节奏状态卡片
 * 
 * 显示当前工作状态（Focus/Normal/Relax），状态变化时有动画效果。
 * 显示今日统计数据：最长专注时间、平均专注时间、智能延迟次数等。
 */
class SmartRhythmCard {
  constructor(containerId, rhythmService) {
    /**
     * 容器元素ID
     * @type {string}
     */
    this.containerId = containerId;

    /**
     * 节奏服务实例
     * @type {SmartRhythmService}
     */
    this.rhythmService = rhythmService;

    /**
     * 当前显示的状态
     * @type {string}
     */
    this.currentDisplayState = 'normal';

    /**
     * 状态更新计时器
     * @type {number}
     */
    this.updateTimer = null;

    /**
     * 状态动画是否正在进行
     * @type {boolean}
     */
    this.isAnimating = false;
  }

  /**
   * 渲染卡片
   * @returns {void}
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('[SmartRhythmCard] 容器不存在:', this.containerId);
      return;
    }

    container.innerHTML = this.generateHTML();
    this.bindEvents();
    this.initIcons();
    this.startMonitoring();
  }

  /**
   * 生成HTML结构
   * @returns {string}
   */
  generateHTML() {
    const state = this.rhythmService.getCurrentState();
    const stats = this.rhythmService.getTodayStats();
    const colors = this.getStateColors(state.state);

    return `
      <div class="smart-rhythm-card" data-state="${state.state}">
        <div class="smart-rhythm-bg" style="background: ${colors.gradient}"></div>
        
        <!-- 头部 -->
        <div class="smart-rhythm-header">
          <div class="smart-rhythm-title-area">
            <div class="smart-rhythm-title">智能工作节奏</div>
            <div class="smart-rhythm-subtitle">Smart Rhythm</div>
          </div>
          <div class="smart-rhythm-state-indicator" style="background-color: ${colors.dot}">
            <div class="smart-rhythm-state-pulse" style="background-color: ${colors.dot}"></div>
          </div>
        </div>

        <!-- 状态展示区 -->
        <div class="smart-rhythm-state-section">
          <div class="smart-rhythm-state-main">
            <div class="smart-rhythm-state-icon" style="color: ${colors.icon}">
              <i data-lucide="${this.getStateIcon(state.state)}" class="w-12 h-12"></i>
            </div>
            <div class="smart-rhythm-state-info">
              <div class="smart-rhythm-state-label" style="color: ${colors.text}">${state.stateLabel}</div>
              <div class="smart-rhythm-state-duration">
                已持续 <span class="smart-rhythm-duration-value">${state.stateDuration}</span> 分钟
              </div>
            </div>
          </div>

          <!-- 状态切换提示 -->
          <div class="smart-rhythm-transition-tip" id="rhythm-transition-tip"></div>
        </div>

        <!-- 状态进度条 -->
        <div class="smart-rhythm-progress">
          <div class="smart-rhythm-progress-bar" style="width: ${this.calculateProgress(state)}%"></div>
        </div>

        <!-- 今日统计 -->
        <div class="smart-rhythm-stats">
          <div class="smart-rhythm-stat-item">
            <div class="smart-rhythm-stat-icon" style="background-color: ${colors.statBg}">
              <i data-lucide="clock" class="w-4 h-4" style="color: ${colors.icon}"></i>
            </div>
            <div>
              <div class="smart-rhythm-stat-value">${stats.longestFocus}</div>
              <div class="smart-rhythm-stat-label">最长专注(分)</div>
            </div>
          </div>
          <div class="smart-rhythm-stat-item">
            <div class="smart-rhythm-stat-icon" style="background-color: ${colors.statBg}">
              <i data-lucide="bar-chart" class="w-4 h-4" style="color: ${colors.icon}"></i>
            </div>
            <div>
              <div class="smart-rhythm-stat-value">${stats.avgFocus}</div>
              <div class="smart-rhythm-stat-label">平均专注(分)</div>
            </div>
          </div>
          <div class="smart-rhythm-stat-item">
            <div class="smart-rhythm-stat-icon" style="background-color: ${colors.statBg}">
              <i data-lucide="zap" class="w-4 h-4" style="color: ${colors.icon}"></i>
            </div>
            <div>
              <div class="smart-rhythm-stat-value">${stats.smartDelayCount}</div>
              <div class="smart-rhythm-stat-label">智能延迟</div>
            </div>
          </div>
          <div class="smart-rhythm-stat-item">
            <div class="smart-rhythm-stat-icon" style="background-color: ${colors.statBg}">
              <i data-lucide="target" class="w-4 h-4" style="color: ${colors.icon}"></i>
            </div>
            <div>
              <div class="smart-rhythm-stat-value">${stats.adoptionRate}%</div>
              <div class="smart-rhythm-stat-label">采纳率</div>
            </div>
          </div>
        </div>

        <!-- 隐私提示 -->
        <div class="smart-rhythm-privacy">
          <i data-lucide="shield-check" class="w-3 h-3"></i>
          <span>所有分析均在本地完成，不上传网络</span>
        </div>
      </div>
    `;
  }

  /**
   * 获取状态颜色配置
   * @param {string} state - 状态名称
   * @returns {Object} - 颜色配置
   */
  getStateColors(state) {
    const colors = {
      focus: {
        dot: '#22c55e',
        icon: '#22c55e',
        text: '#166534',
        gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
        statBg: 'rgba(34, 197, 94, 0.1)'
      },
      normal: {
        dot: '#f59e0b',
        icon: '#f59e0b',
        text: '#92400e',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
        statBg: 'rgba(245, 158, 11, 0.1)'
      },
      relax: {
        dot: '#3b82f6',
        icon: '#3b82f6',
        text: '#1e40af',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
        statBg: 'rgba(59, 130, 246, 0.1)'
      }
    };
    return colors[state] || colors.normal;
  }

  /**
   * 获取状态图标
   * @param {string} state - 状态名称
   * @returns {string} - Lucide图标名称
   */
  getStateIcon(state) {
    const icons = {
      focus: 'zap',
      normal: 'clock',
      relax: 'coffee'
    };
    return icons[state] || 'clock';
  }

  /**
   * 计算状态进度（用于进度条）
   * @param {Object} state - 状态对象
   * @returns {number} - 进度百分比
   */
  calculateProgress(state) {
    const maxDuration = 60;
    return Math.min(100, (state.stateDuration / maxDuration) * 100);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 监听状态变化事件
    window.addEventListener('rhythm-state-change', (e) => {
      this.handleStateChange(e.detail);
    });
  }

  /**
   * 处理状态变化
   * @param {Object} detail - 状态变化详情
   */
  handleStateChange(detail) {
    const { oldState, newState } = detail;
    
    if (oldState === newState) return;

    this.currentDisplayState = newState;
    this.animateStateChange(oldState, newState);
    this.updateStats();
  }

  /**
   * 状态变化动画
   * @param {string} oldState - 旧状态
   * @param {string} newState - 新状态
   */
  animateStateChange(oldState, newState) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const container = document.getElementById(this.containerId);
    if (!container) return;

    const card = container.querySelector('.smart-rhythm-card');
    const tipEl = container.querySelector('#rhythm-transition-tip');
    const colors = this.getStateColors(newState);

    // 添加淡出动画
    card.classList.add('smart-rhythm-fade-out');

    setTimeout(() => {
      // 更新状态数据属性
      card.setAttribute('data-state', newState);
      
      // 更新背景渐变
      const bgEl = card.querySelector('.smart-rhythm-bg');
      if (bgEl) {
        bgEl.style.background = colors.gradient;
      }

      // 更新状态指示点
      const indicator = card.querySelector('.smart-rhythm-state-indicator');
      const pulse = card.querySelector('.smart-rhythm-state-pulse');
      if (indicator && pulse) {
        indicator.style.backgroundColor = colors.dot;
        pulse.style.backgroundColor = colors.dot;
      }

      // 更新状态图标和文字
      const iconEl = card.querySelector('.smart-rhythm-state-icon');
      const labelEl = card.querySelector('.smart-rhythm-state-label');
      const durationEl = card.querySelector('.smart-rhythm-duration-value');
      
      if (iconEl) {
        iconEl.style.color = colors.icon;
        const icon = iconEl.querySelector('svg');
        if (icon) {
          icon.setAttribute('data-lucide', this.getStateIcon(newState));
        }
      }
      
      if (labelEl) {
        labelEl.style.color = colors.text;
        labelEl.textContent = this.rhythmService.getStateLabel(newState);
      }
      
      if (durationEl) {
        durationEl.textContent = '0';
      }

      // 更新统计图标颜色
      const statIcons = card.querySelectorAll('.smart-rhythm-stat-icon');
      statIcons.forEach(el => {
        el.style.backgroundColor = colors.statBg;
        const innerIcon = el.querySelector('svg');
        if (innerIcon) {
          innerIcon.style.color = colors.icon;
        }
      });

      // 更新进度条颜色
      const progressBar = card.querySelector('.smart-rhythm-progress-bar');
      if (progressBar) {
        progressBar.style.backgroundColor = colors.dot;
      }

      // 重新初始化图标
      if (typeof lucide !== 'undefined') {
        lucide.createIcons({ root: card });
      }

      // 显示状态切换提示
      this.showTransitionTip(tipEl, oldState, newState);

      // 添加淡入动画
      card.classList.remove('smart-rhythm-fade-out');
      card.classList.add('smart-rhythm-fade-in');

      setTimeout(() => {
        card.classList.remove('smart-rhythm-fade-in');
        this.isAnimating = false;
      }, 300);

    }, 200);
  }

  /**
   * 显示状态切换提示
   * @param {HTMLElement} tipEl - 提示元素
   * @param {string} oldState - 旧状态
   * @param {string} newState - 新状态
   */
  showTransitionTip(tipEl, oldState, newState) {
    if (!tipEl) return;

    const tips = {
      'normal-focus': '进入深度专注模式，提醒将自动延迟',
      'focus-normal': '退出专注模式，恢复正常提醒',
      'normal-relax': '检测到休息状态，建议完成拉伸',
      'relax-normal': '恢复正常办公状态',
      'focus-relax': '已从专注切换到休息',
      'relax-focus': '从休息进入专注模式'
    };

    const key = `${oldState}-${newState}`;
    const tipText = tips[key] || '状态已更新';

    tipEl.textContent = tipText;
    tipEl.classList.add('smart-rhythm-tip-show');

    setTimeout(() => {
      tipEl.classList.remove('smart-rhythm-tip-show');
    }, 3000);
  }

  /**
   * 开始监控状态变化
   */
  startMonitoring() {
    this.updateTimer = setInterval(() => {
      this.updateDuration();
      this.updateStats();
    }, 60000);
  }

  /**
   * 更新状态持续时间显示
   */
  updateDuration() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const state = this.rhythmService.getCurrentState();
    const durationEl = container.querySelector('.smart-rhythm-duration-value');
    const progressBar = container.querySelector('.smart-rhythm-progress-bar');

    if (durationEl) {
      durationEl.textContent = state.stateDuration;
    }

    if (progressBar) {
      progressBar.style.width = `${this.calculateProgress(state)}%`;
    }
  }

  /**
   * 更新统计数据
   */
  updateStats() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const stats = this.rhythmService.getTodayStats();
    const state = this.rhythmService.getCurrentState();
    const colors = this.getStateColors(state.state);

    // 更新统计数值
    const statValues = container.querySelectorAll('.smart-rhythm-stat-value');
    if (statValues[0]) statValues[0].textContent = stats.longestFocus;
    if (statValues[1]) statValues[1].textContent = stats.avgFocus;
    if (statValues[2]) statValues[2].textContent = stats.smartDelayCount;
    if (statValues[3]) statValues[3].textContent = `${stats.adoptionRate}%`;

    // 更新统计图标颜色
    const statIcons = container.querySelectorAll('.smart-rhythm-stat-icon');
    statIcons.forEach(el => {
      el.style.backgroundColor = colors.statBg;
      const innerIcon = el.querySelector('svg');
      if (innerIcon) {
        innerIcon.style.color = colors.icon;
      }
    });
  }

  /**
   * 初始化图标
   */
  initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartRhythmCard;
}