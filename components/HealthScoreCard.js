/**
 * HealthScoreCard - 健康评分卡片组件
 * 
 * 负责展示健康评分，包含圆形进度环、数字滚动动画、等级标签、四项得分和AI建议。
 */
class HealthScoreCard {
  constructor(containerId, healthService) {
    this.containerId = containerId;
    this.healthService = healthService || window.healthService;
    this.scoreData = null;
    this.animationFrameId = null;
    this.elementRefs = {};

    this.dimensionConfig = {
      sit: {
        name: '久坐健康',
        icon: 'clock',
        key: 'sitScore'
      },
      stretch: {
        name: '拉伸完成',
        icon: 'activity',
        key: 'stretchScore'
      },
      pose: {
        name: '姿态表现',
        icon: 'scan-eye',
        key: 'poseScore'
      },
      eye: {
        name: '护眼完成',
        icon: 'eye',
        key: 'eyeScore'
      }
    };
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('[HealthScoreCard] 容器不存在:', this.containerId);
      return;
    }

    this.showSkeleton(container);

    setTimeout(() => {
      this.scoreData = this.healthService.calculateScore();
      container.innerHTML = this.generateHTML();
      this.initElementRefs();
      this.initAnimations();
      this.initIcons();
      this.initInteractions();
    }, 800);
  }

  showSkeleton(container) {
    if (typeof skeleton !== 'undefined') {
      skeleton.show('healthScore', container);
    } else {
      container.innerHTML = `
        <div class="health-score-skeleton animate-pulse">
          <div class="flex justify-between mb-6">
            <div class="w-32 h-6 bg-gray-200 rounded"></div>
            <div class="w-20 h-7 bg-gray-200 rounded-full"></div>
          </div>
          <div class="w-36 h-36 mx-auto mb-6 bg-gray-200 rounded-full"></div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            ${[1,2,3,4].map(() => `
              <div class="bg-gray-100 rounded-xl p-4">
                <div class="w-7 h-7 bg-gray-200 rounded-md mb-3"></div>
                <div class="w-16 h-8 bg-gray-200 rounded mb-2"></div>
                <div class="w-full h-1 bg-gray-200 rounded"></div>
              </div>
            `).join('')}
          </div>
          <div class="bg-gray-100 rounded-xl p-4">
            <div class="w-24 h-5 bg-gray-200 rounded mb-3"></div>
            <div class="w-full h-4 bg-gray-200 rounded mb-2"></div>
            <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      `;
    }
  }

  generateHTML() {
    const { overallScore, levelLabel, levelColor, breakdown, advice, updateTime, trend } = this.scoreData;

    return `
      <div class="health-score-card animate-fade-in" role="region" aria-label="健康评分">
        <div class="health-score-header">
          <div class="health-score-title">
            <div class="health-score-label">今日健康评分</div>
            <div class="health-score-date">${this.formatDate()}</div>
          </div>
          <button 
            class="health-score-level" 
            style="background-color: ${levelColor}"
            aria-label="${levelLabel}等级"
            tabindex="0"
            onkeydown="if(event.key === 'Enter' || event.key === ' ') event.preventDefault()"
          >${levelLabel}</button>
        </div>

        <div class="health-score-ring-container">
          <svg class="health-score-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="health-score-ring-bg" cx="50" cy="50" r="42"></circle>
            <circle 
              class="health-score-ring-progress" 
              cx="50" cy="50" r="42"
              style="stroke: ${levelColor}; stroke-dasharray: 264; stroke-dashoffset: 264;"
              id="health-score-ring-progress"
            ></circle>
          </svg>
          <div class="health-score-ring-center">
            <div class="health-score-main">
              <span class="health-score-value" style="color: ${levelColor}" id="health-score-value">0</span>
              <span class="health-score-trend ${trend.trend}" id="health-score-trend">
                (${trend.change > 0 ? '+' : ''}${trend.change})
              </span>
            </div>
            <div class="health-score-unit">分</div>
          </div>
        </div>

        <div class="health-score-breakdown">
          ${this.generateBreakdownHTML()}
        </div>

        <div class="health-score-advice">
          <div class="health-score-advice-title">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            AI健康建议
          </div>
          <div class="health-score-advice-list">
            ${advice.map((a, index) => `
              <div class="health-score-advice-item" style="animation-delay: ${index * 100}ms">
                <div class="health-score-advice-dot"></div>
                <div class="health-score-advice-text">${a}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="health-score-update">
          <div class="health-score-update-text">更新于 ${updateTime}</div>
        </div>
      </div>
    `;
  }

  generateBreakdownHTML() {
    const { breakdown } = this.scoreData;

    return Object.entries(this.dimensionConfig).map(([key, config]) => {
      const score = breakdown[config.key];
      const color = this.getScoreColor(score.score);

      return `
        <div class="health-score-item" role="button" tabindex="0" data-dimension="${key}" aria-label="${config.name}: ${score.score}分">
          <div class="health-score-item-header">
            <div class="health-score-item-icon ${key}">
              <i data-lucide="${config.icon}" class="w-4 h-4" style="color: ${color}"></i>
            </div>
            <div class="health-score-item-name">${config.name}</div>
          </div>
          <div class="health-score-item-score">
            <span class="health-score-item-value" style="color: ${color}" id="health-score-dim-${key}">${score.score}</span>
            <span class="health-score-item-percent">分</span>
          </div>
          <div class="health-score-item-bar">
            <div class="health-score-item-fill" style="width: 0%; background-color: ${color}" id="health-score-fill-${key}"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  getScoreColor(score) {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }

  formatDate() {
    const now = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`;
  }

  initElementRefs() {
    this.elementRefs = {
      ringProgress: document.getElementById('health-score-ring-progress'),
      scoreValue: document.getElementById('health-score-value'),
      trend: document.getElementById('health-score-trend')
    };
  }

  initAnimations() {
    const { overallScore, levelColor, breakdown } = this.scoreData;

    this.animateNumber('health-score-value', 0, overallScore, 1500);
    this.animateRing('health-score-ring-progress', overallScore);

    Object.keys(this.dimensionConfig).forEach((key, index) => {
      const score = breakdown[this.dimensionConfig[key].key];
      setTimeout(() => {
        this.animateBar(`health-score-fill-${key}`, score.score);
        this.animateNumber(`health-score-dim-${key}`, 0, score.score, 800);
      }, 500 + index * 150);
    });

    setTimeout(() => {
      const valueEl = document.getElementById('health-score-value');
      if (valueEl) {
        valueEl.style.color = levelColor;
      }
    }, 100);
  }

  animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();
    const diff = end - start;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);

      element.textContent = current;

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  animateRing(elementId, score) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (score / 100) * circumference;

    setTimeout(() => {
      element.style.strokeDashoffset = offset;
    }, 100);
  }

  animateBar(elementId, score) {
    const element = document.getElementById(elementId);
    if (!element) return;

    setTimeout(() => {
      element.style.width = score + '%';
    }, 100);
  }

  initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  initInteractions() {
    const items = document.querySelectorAll('.health-score-item');
    items.forEach(item => {
      item.addEventListener('click', () => this.handleItemClick(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleItemClick(item);
        }
      });
    });
  }

  handleItemClick(item) {
    const dimension = item.dataset.dimension;
    const config = this.dimensionConfig[dimension];
    const score = this.scoreData.breakdown[config.key];
    
    item.classList.add('animate-press');
    setTimeout(() => item.classList.remove('animate-press'), 150);

    if (typeof toast !== 'undefined') {
      toast.info(`${config.name}: ${score.score}分\n${score.detail || '继续保持良好习惯'}`, {
        duration: 3000
      });
    }
  }

  update() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.render();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthScoreCard;
}