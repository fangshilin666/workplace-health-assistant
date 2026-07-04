/**
 * SmartCoachCard - 智能教练卡片组件
 * 
 * 负责展示智能推荐动作，包含推荐理由、预计改善、评分提升预估和操作按钮。
 * 支持开始训练、稍后提醒、换一个推荐等功能。
 */
class SmartCoachCard {
  constructor(containerId, coachService) {
    /**
     * 容器元素ID
     * @type {string}
     */
    this.containerId = containerId;

    /**
     * 智能教练服务实例
     * @type {SmartCoachService}
     */
    this.coachService = coachService || window.smartCoachService;

    /**
     * 当前推荐数据
     * @type {Object}
     */
    this.currentRecommendation = null;

    /**
     * 当前状态：idle/training/completed
     * @type {string}
     */
    this.currentState = 'idle';

    /**
     * 训练计时器
     * @type {number}
     */
    this.trainingTimer = null;

    /**
     * 训练剩余秒数
     * @type {number}
     */
    this.trainingSeconds = 0;

    /**
     * 是否正在加载
     * @type {boolean}
     */
    this.isLoading = false;
  }

  /**
   * 渲染智能教练卡片
   * @returns {void}
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('[SmartCoachCard] 容器不存在:', this.containerId);
      return;
    }

    if (this.currentState === 'idle') {
      this.showSkeleton(container);
      setTimeout(() => {
        this.loadRecommendation();
        container.innerHTML = this.generateHTML();
        this.bindEvents();
        this.initIcons();
      }, 600);
    } else {
      container.innerHTML = this.generateHTML();
      this.bindEvents();
      this.initIcons();
    }
  }

  /**
   * 显示骨架屏
   * @param {HTMLElement} container - 容器元素
   */
  showSkeleton(container) {
    if (typeof skeleton !== 'undefined') {
      skeleton.show('smartCoach', container);
    } else {
      container.innerHTML = `
        <div class="smart-coach-card">
          <div class="smart-coach-bg-decoration"></div>
          <div class="smart-coach-header">
            <div class="skeleton-avatar"></div>
            <div class="smart-coach-title-area">
              <div class="skeleton-line" style="width: 120px; height: 18px;"></div>
              <div class="skeleton-line" style="width: 80px; height: 14px;"></div>
            </div>
          </div>
          <div class="smart-coach-content">
            <div class="smart-coach-action-card">
              <div class="skeleton-line" style="width: 100%; height: 20px; margin-bottom: 12px;"></div>
              <div class="skeleton-line" style="width: 80%; height: 16px; margin-bottom: 8px;"></div>
              <div class="skeleton-line" style="width: 60%; height: 14px; margin-bottom: 16px;"></div>
              <div class="skeleton-line" style="width: 100%; height: 44px;"></div>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * 加载推荐数据
   * @returns {void}
   */
  loadRecommendation() {
    this.currentRecommendation = this.coachService.getRecommendation();
  }

  /**
   * 生成HTML结构
   * @returns {string} - HTML字符串
   */
  generateHTML() {
    if (!this.currentRecommendation) {
      return this.generateEmptyHTML();
    }

    if (this.currentState === 'training') {
      return this.generateTrainingHTML();
    }

    if (this.currentState === 'completed') {
      return this.generateCompletedHTML();
    }

    return this.generateRecommendationHTML();
  }

  /**
   * 生成推荐卡片HTML
   * @returns {string} - HTML字符串
   */
  generateRecommendationHTML() {
    const { action, reason, expectedScore, expectedImprovement, currentScore } = this.currentRecommendation;

    return `
      <div class="smart-coach-card">
        <div class="smart-coach-bg-decoration"></div>
        
        <!-- 头部 -->
        <div class="smart-coach-header">
          <div class="smart-coach-avatar">
            <i data-lucide="sparkles" class="smart-coach-avatar-icon"></i>
          </div>
          <div class="smart-coach-title-area">
            <div class="smart-coach-title">AI 智能健康教练</div>
            <div class="smart-coach-subtitle">为您量身定制的健康建议</div>
          </div>
        </div>

        <!-- 推荐内容 -->
        <div class="smart-coach-content">
          <div class="smart-coach-action-card animate-enter">
            <!-- 动作头部 -->
            <div class="smart-coach-action-header">
              <div class="smart-coach-action-info">
                <div class="smart-coach-action-icon">
                  <i data-lucide="${action.icon}" class="w-6 h-6 text-primary-600"></i>
                </div>
                <div>
                  <div class="smart-coach-action-name">${action.name}</div>
                  <div class="smart-coach-action-duration">
                    <i data-lucide="clock" class="w-3 h-3"></i>
                    ${action.duration}分钟
                  </div>
                </div>
              </div>
              <div class="smart-coach-score-tag">
                <i data-lucide="trending-up" class="smart-coach-score-icon"></i>
                <span class="smart-coach-score-text">+${expectedScore} 分</span>
              </div>
            </div>

            <!-- 推荐理由 -->
            <div class="smart-coach-reason">
              <div class="smart-coach-reason-label">推荐理由</div>
              <div class="smart-coach-reason-text">${reason}，为您推荐「${action.name}」</div>
            </div>

            <!-- 预计改善 -->
            <div class="smart-coach-improve">
              <span class="smart-coach-improve-label">预计改善：</span>
              <div class="smart-coach-improve-tags">
                ${expectedImprovement.split('、').map(benefit => 
                  `<span class="smart-coach-improve-tag">${benefit}</span>`
                ).join('')}
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="smart-coach-actions">
              <button id="btn-start-training" class="smart-coach-btn-primary">
                <i data-lucide="play" class="smart-coach-btn-icon"></i>
                <span>开始训练</span>
              </button>
              <button id="btn-snooze" class="smart-coach-btn-secondary">
                <i data-lucide="clock" class="smart-coach-btn-icon"></i>
              </button>
              <button id="btn-next-recommendation" class="smart-coach-btn-secondary">
                <i data-lucide="refresh-cw" class="smart-coach-btn-icon"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 生成空状态HTML
   * @returns {string} - HTML字符串
   */
  generateEmptyHTML() {
    return `
      <div class="smart-coach-card">
        <div class="smart-coach-bg-decoration"></div>
        
        <div class="smart-coach-header">
          <div class="smart-coach-avatar">
            <i data-lucide="sparkles" class="smart-coach-avatar-icon"></i>
          </div>
          <div class="smart-coach-title-area">
            <div class="smart-coach-title">AI 智能健康教练</div>
            <div class="smart-coach-subtitle">今日建议</div>
          </div>
        </div>

        <div class="smart-coach-content">
          <div class="smart-coach-action-card">
            <div class="smart-coach-empty">
              <i data-lucide="smile" class="smart-coach-empty-icon text-muted-400"></i>
              <div class="smart-coach-empty-title">状态完美！</div>
              <div class="smart-coach-empty-desc">您的健康评分处于优秀水平，继续保持规律作息！</div>
              <div class="smart-coach-improve">
                <span class="smart-coach-improve-label">保持建议：</span>
                <div class="smart-coach-improve-tags">
                  <span class="smart-coach-improve-tag">补充饮水</span>
                  <span class="smart-coach-improve-tag">定时活动</span>
                  <span class="smart-coach-improve-tag">保持坐姿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 生成训练中HTML
   * @returns {string} - HTML字符串
   */
  generateTrainingHTML() {
    const { action } = this.currentRecommendation;

    return `
      <div class="smart-coach-card">
        <div class="smart-coach-bg-decoration"></div>
        
        <div class="smart-coach-header">
          <div class="smart-coach-avatar">
            <i data-lucide="sparkles" class="smart-coach-avatar-icon"></i>
          </div>
          <div class="smart-coach-title-area">
            <div class="smart-coach-title">训练进行中</div>
            <div class="smart-coach-subtitle">${action.name}</div>
          </div>
        </div>

        <div class="smart-coach-content">
          <div class="smart-coach-action-card">
            <div class="smart-coach-training">
              <i data-lucide="${action.icon}" class="smart-coach-training-icon text-primary-500"></i>
              <div class="smart-coach-training-title">${action.name}</div>
              <div class="smart-coach-training-countdown" id="training-countdown">
                ${this.formatTime(this.trainingSeconds)}
              </div>
              <div class="smart-coach-training-desc">${action.description}</div>
              
              <div class="smart-coach-actions" style="margin-top: var(--spacing-6)">
                <button id="btn-stop-training" class="smart-coach-btn-secondary" style="flex: 1">
                  <i data-lucide="square" class="smart-coach-btn-icon"></i>
                  <span>结束训练</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 生成训练完成HTML
   * @returns {string} - HTML字符串
   */
  generateCompletedHTML() {
    const { action, expectedScore } = this.currentRecommendation;

    return `
      <div class="smart-coach-card">
        <div class="smart-coach-bg-decoration"></div>
        
        <div class="smart-coach-header">
          <div class="smart-coach-avatar">
            <i data-lucide="sparkles" class="smart-coach-avatar-icon"></i>
          </div>
          <div class="smart-coach-title-area">
            <div class="smart-coach-title">训练完成</div>
            <div class="smart-coach-subtitle">太棒了！</div>
          </div>
        </div>

        <div class="smart-coach-content">
          <div class="smart-coach-action-card">
            <div class="smart-coach-completed">
              <i data-lucide="check-circle" class="smart-coach-completed-icon text-success-500"></i>
              <div class="smart-coach-completed-title">${action.name}已完成</div>
              <div class="smart-coach-completed-score">
                预计健康评分提升 +${expectedScore}
              </div>
              
              <div class="smart-coach-actions" style="margin-top: var(--spacing-6)">
                <button id="btn-new-recommendation" class="smart-coach-btn-primary">
                  <i data-lucide="refresh-cw" class="smart-coach-btn-icon"></i>
                  <span>获取新推荐</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 格式化时间显示
   * @param {number} seconds - 秒数
   * @returns {string} - 格式化后的时间
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * 绑定事件
   * @returns {void}
   */
  bindEvents() {
    const container = document.getElementById(this.containerId);

    // 开始训练按钮
    const btnStart = container.querySelector('#btn-start-training');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.addPressFeedback(btnStart);
        this.startTraining();
      });
      btnStart.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.addPressFeedback(btnStart);
          this.startTraining();
        }
      });
    }

    // 稍后提醒按钮
    const btnSnooze = container.querySelector('#btn-snooze');
    if (btnSnooze) {
      btnSnooze.addEventListener('click', () => {
        this.addPressFeedback(btnSnooze);
        this.snooze();
      });
      btnSnooze.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.addPressFeedback(btnSnooze);
          this.snooze();
        }
      });
    }

    // 换一个推荐按钮
    const btnNext = container.querySelector('#btn-next-recommendation');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.addPressFeedback(btnNext);
        this.nextRecommendation();
      });
      btnNext.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.addPressFeedback(btnNext);
          this.nextRecommendation();
        }
      });
    }

    // 停止训练按钮
    const btnStop = container.querySelector('#btn-stop-training');
    if (btnStop) {
      btnStop.addEventListener('click', () => {
        this.addPressFeedback(btnStop);
        this.stopTraining(true);
      });
      btnStop.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.addPressFeedback(btnStop);
          this.stopTraining(true);
        }
      });
    }

    // 新推荐按钮
    const btnNew = container.querySelector('#btn-new-recommendation');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.addPressFeedback(btnNew);
        this.reset();
      });
      btnNew.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.addPressFeedback(btnNew);
          this.reset();
        }
      });
    }
  }

  /**
   * 添加按钮点击反馈
   * @param {HTMLElement} btn - 按钮元素
   */
  addPressFeedback(btn) {
    btn.classList.add('animate-press');
    setTimeout(() => btn.classList.remove('animate-press'), 150);
  }

  /**
   * 初始化图标
   * @returns {void}
   */
  initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * 开始训练
   * @returns {void}
   */
  startTraining() {
    if (!this.currentRecommendation) return;

    this.currentState = 'training';
    this.trainingSeconds = this.currentRecommendation.action.duration * 60;
    this.render();

    this.trainingTimer = setInterval(() => {
      this.trainingSeconds--;
      
      const countdownEl = document.getElementById('training-countdown');
      if (countdownEl) {
        countdownEl.textContent = this.formatTime(this.trainingSeconds);
      }

      if (this.trainingSeconds <= 0) {
        this.stopTraining(false);
      }
    }, 1000);
  }

  /**
   * 停止训练
   * @param {boolean} manual - 是否手动停止
   * @returns {void}
   */
  stopTraining(manual) {
    if (this.trainingTimer) {
      clearInterval(this.trainingTimer);
      this.trainingTimer = null;
    }

    if (!manual) {
      // 自动完成
      this.currentState = 'completed';
      const duration = this.currentRecommendation.action.duration * 60;
      this.coachService.recordCompletion(this.currentRecommendation.action.id, duration);

      // 更新健康数据
      this.updateHealthData();
    } else {
      // 手动停止，回到推荐状态
      this.currentState = 'idle';
    }

    this.render();
  }

  /**
   * 更新健康数据
   * @returns {void}
   */
  updateHealthData() {
    if (window.healthService) {
      const impact = this.currentRecommendation.action.scoreImpact;
      const updates = {};

      if (impact.stretch) {
        updates.stretchCount = (window.healthService.getTodayHealthData().stretchCount || 0) + 1;
        updates.stretchCompleteRate = Math.min(1, updates.stretchCount / 5);
      }

      if (impact.eye) {
        updates.eyeBreakCount = (window.healthService.getTodayHealthData().eyeBreakCount || 0) + 1;
        updates.eyeCompleteRate = Math.min(1, updates.eyeBreakCount / 6);
      }

      if (Object.keys(updates).length > 0) {
        window.healthService.updateHealthData(updates);
        
        // 刷新健康评分卡片
        if (window.healthScoreCard) {
          window.healthScoreCard.update();
        }
      }
    }
  }

  /**
   * 稍后提醒
   * @returns {void}
   */
  snooze() {
    if (!this.currentRecommendation) return;

    this.coachService.recordSkip(this.currentRecommendation.action.id);

    // 显示提示
    this.showToast('已推迟提醒，10分钟后再次提醒', 'info');

    // 10分钟后刷新推荐
    setTimeout(() => {
      this.reset();
    }, 10 * 60 * 1000);
  }

  /**
   * 获取下一个推荐
   * @returns {void}
   */
  nextRecommendation() {
    const nextAction = this.coachService.recommendNext();
    if (!nextAction) return;

    const state = this.coachService.getUserState();
    const reason = this.coachService.recommendReason(nextAction, state);
    const expectedScore = this.coachService.estimateScore(nextAction);
    const expectedImprovement = nextAction.benefits.slice(0, 2).join('、');

    this.currentRecommendation = {
      action: nextAction,
      reason,
      expectedScore,
      expectedImprovement,
      currentScore: state.score.overallScore,
      todayCompleted: state.todayCompletedActions.length
    };

    this.render();
  }

  /**
   * 重置到初始状态
   * @returns {void}
   */
  reset() {
    this.currentState = 'idle';
    this.trainingSeconds = 0;
    this.loadRecommendation();
    this.render();
  }

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 提示类型：success/error/warning/info/loading
   * @returns {void}
   */
  showToast(message, type = 'info') {
    if (typeof toast !== 'undefined') {
      toast[type](message, {
        duration: 3000
      });
    } else {
      // Fallback to native alert if toast is not available
      alert(message);
    }
  }

  /**
   * 更新推荐数据并重新渲染
   * @returns {void}
   */
  update() {
    if (this.currentState === 'idle') {
      this.loadRecommendation();
      this.render();
    }
  }

  /**
   * 销毁组件
   * @returns {void}
   */
  destroy() {
    if (this.trainingTimer) {
      clearInterval(this.trainingTimer);
      this.trainingTimer = null;
    }

    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartCoachCard;
}