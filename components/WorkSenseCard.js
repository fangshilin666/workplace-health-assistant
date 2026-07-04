/**
 * WorkSenseCard - AI工作状态卡片
 * 
 * 采用 Apple Human Interface 风格设计，包含毛玻璃效果、数字滚动动画、状态切换动画。
 * 展示：当前状态、连续工作时间、AI分析、今日专注统计、健康收益预测。
 */
class WorkSenseCard {
  constructor(containerId, senseService) {
    this.containerId = containerId;
    this.senseService = senseService;
    this.currentState = 'normal';
    this.updateTimer = null;
    this.isAnimating = false;
    this.displayDuration = 0;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('[WorkSenseCard] 容器不存在:', this.containerId);
      return;
    }

    container.innerHTML = this.generateHTML();
    this.initIcons();
    this.bindEvents();
    this.startMonitoring();
    this.animateNumbers();
  }

  generateHTML() {
    const analysis = this.senseService.analyseState();
    const stats = this.senseService.getFocusStatistics();
    const benefit = this.senseService.estimateBenefit();
    const insight = this.senseService.generateInsight();

    return `
      <div class="worksense-card" data-state="${analysis.state}" style="background: ${analysis.gradient}">
        <div class="worksense-glass"></div>
        
        <!-- 头部 -->
        <div class="worksense-header">
          <div class="worksense-title-area">
            <div class="worksense-title">AI 工作状态感知</div>
            <div class="worksense-subtitle">WorkSense™ 智能引擎</div>
          </div>
          <div class="worksense-state-badge" style="background-color: ${analysis.color}">
            <i data-lucide="${analysis.icon}" class="w-4 h-4"></i>
          </div>
        </div>

        <!-- 当前状态 -->
        <div class="worksense-state-section">
          <div class="worksense-state-main">
            <div class="worksense-state-circle" style="background-color: ${analysis.color}">
              <div class="worksense-state-pulse" style="background-color: ${analysis.color}"></div>
              <i data-lucide="${analysis.icon}" class="w-8 h-8"></i>
            </div>
            <div class="worksense-state-info">
              <div class="worksense-state-label" style="color: ${analysis.color}">${analysis.stateLabel}</div>
              <div class="worksense-state-sub">实时感知您的工作节奏</div>
            </div>
          </div>
        </div>

        <!-- 连续工作时间 -->
        <div class="worksense-duration-section">
          <div class="worksense-duration-label">连续工作时间</div>
          <div class="worksense-duration-value" id="worksense-duration">
            <span class="worksense-duration-number">${analysis.stateDuration}</span>
            <span class="worksense-duration-unit">分钟</span>
          </div>
        </div>

        <!-- AI分析 -->
        <div class="worksense-ai-section">
          <div class="worksense-ai-header">
            <i data-lucide="sparkles" class="w-4 h-4" style="color: ${analysis.color}"></i>
            <span>AI分析</span>
          </div>
          <div class="worksense-ai-content">
            <p>${analysis.aiExplanation}</p>
          </div>
          <div class="worksense-ai-recommendation" style="border-left-color: ${analysis.color}">
            ${analysis.recommendation}
          </div>
        </div>

        <!-- 今日专注统计 -->
        <div class="worksense-stats-section">
          <div class="worksense-stats-header">
            <i data-lucide="clock" class="w-4 h-4" style="color: ${analysis.color}"></i>
            <span>今日专注统计</span>
          </div>
          <div class="worksense-stats-grid">
            <div class="worksense-stat-item">
              <div class="worksense-stat-value" id="worksense-total-hours">${stats.totalFocusTime.hours}</div>
              <div class="worksense-stat-label">累计(小时)</div>
            </div>
            <div class="worksense-stat-divider"></div>
            <div class="worksense-stat-item">
              <div class="worksense-stat-value" id="worksense-total-minutes">${stats.totalFocusTime.minutes}</div>
              <div class="worksense-stat-label">累计(分钟)</div>
            </div>
            <div class="worksense-stat-divider"></div>
            <div class="worksense-stat-item">
              <div class="worksense-stat-value" id="worksense-longest">${stats.longestFocus}</div>
              <div class="worksense-stat-label">最长(分钟)</div>
            </div>
          </div>
        </div>

        <!-- 健康收益预测 -->
        <div class="worksense-benefit-section">
          <div class="worksense-benefit-header">
            <i data-lucide="trending-up" class="w-4 h-4" style="color: ${analysis.color}"></i>
            <span>健康收益预测</span>
          </div>
          <div class="worksense-benefit-content">
            <div class="worksense-benefit-score">
              <div class="worksense-benefit-score-current">${benefit.currentScore}</div>
              <div class="worksense-benefit-score-arrow">→</div>
              <div class="worksense-benefit-score-target">${benefit.targetScore}</div>
            </div>
            <div class="worksense-benefit-details">
              <div class="worksense-benefit-item">
                <span class="worksense-benefit-label">健康评分</span>
                <span class="worksense-benefit-value" style="color: ${analysis.color}">+${benefit.scoreIncrease}</span>
              </div>
              <div class="worksense-benefit-item">
                <span class="worksense-benefit-label">疲劳指数</span>
                <span class="worksense-benefit-value">-${benefit.fatigueReduction}%</span>
              </div>
              <div class="worksense-benefit-item">
                <span class="worksense-benefit-label">久坐风险</span>
                <span class="worksense-benefit-value">-${benefit.riskReduction}%</span>
              </div>
            </div>
            <div class="worksense-benefit-improvements">
              预计改善：
              ${benefit.improvements.map((imp, i) => 
                `<span class="worksense-benefit-improvement" style="background-color: ${analysis.color}20; color: ${analysis.color}">${imp}</span>`
              ).join('')}
            </div>
          </div>
        </div>

        <!-- AI洞察 -->
        <div class="worksense-insight-section">
          <div class="worksense-insight-header">
            <i data-lucide="lightbulb" class="w-4 h-4" style="color: ${analysis.color}"></i>
            <span>今日洞察</span>
          </div>
          <div class="worksense-insight-content">
            <div class="worksense-insight-title" style="color: ${analysis.color}">${insight.title}</div>
            <p>${insight.message}</p>
          </div>
        </div>

        <!-- 隐私提示 -->
        <div class="worksense-privacy">
          <i data-lucide="shield-check" class="w-3 h-3"></i>
          <span>所有分析均在本地完成，不上传网络</span>
        </div>
      </div>
    `;
  }

  initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  bindEvents() {
    window.addEventListener('rhythm-state-change', (e) => {
      this.handleStateChange(e.detail);
    });
  }

  handleStateChange(detail) {
    const { oldState, newState } = detail;
    if (oldState === newState) return;

    this.currentState = newState;
    this.animateStateChange(oldState, newState);
  }

  animateStateChange(oldState, newState) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const container = document.getElementById(this.containerId);
    if (!container) return;

    const card = container.querySelector('.worksense-card');
    
    card.classList.add('worksense-fade-out');
    
    setTimeout(() => {
      container.innerHTML = this.generateHTML();
      this.initIcons();
      card.classList.remove('worksense-fade-out');
      card.classList.add('worksense-fade-in');
      
      setTimeout(() => {
        card.classList.remove('worksense-fade-in');
        this.isAnimating = false;
      }, 400);
    }, 250);
  }

  startMonitoring() {
    this.updateTimer = setInterval(() => {
      this.updateDuration();
      this.updateStats();
    }, 60000);
  }

  updateDuration() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const state = this.senseService.getCurrentState();
    const durationEl = container.querySelector('#worksense-duration .worksense-duration-number');
    
    if (durationEl) {
      this.animateNumber(durationEl, parseInt(durationEl.textContent), state.stateDuration);
    }
  }

  updateStats() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const stats = this.senseService.getFocusStatistics();
    const benefit = this.senseService.estimateBenefit();

    const hoursEl = container.querySelector('#worksense-total-hours');
    const minutesEl = container.querySelector('#worksense-total-minutes');
    const longestEl = container.querySelector('#worksense-longest');

    if (hoursEl) this.animateNumber(hoursEl, parseInt(hoursEl.textContent), stats.totalFocusTime.hours);
    if (minutesEl) this.animateNumber(minutesEl, parseInt(minutesEl.textContent), stats.totalFocusTime.minutes);
    if (longestEl) this.animateNumber(longestEl, parseInt(longestEl.textContent), stats.longestFocus);

    const scoreCurrent = container.querySelector('.worksense-benefit-score-current');
    const scoreTarget = container.querySelector('.worksense-benefit-score-target');
    if (scoreCurrent) scoreCurrent.textContent = benefit.currentScore;
    if (scoreTarget) scoreTarget.textContent = benefit.targetScore;
  }

  animateNumbers() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const numbers = container.querySelectorAll('.worksense-duration-number, .worksense-stat-value');
    numbers.forEach(el => {
      const target = parseInt(el.textContent);
      el.textContent = '0';
      this.animateNumber(el, 0, target);
    });
  }

  animateNumber(element, start, end) {
    if (start === end) return;
    
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkSenseCard;
}