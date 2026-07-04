/**
 * Skeleton - 统一骨架屏组件
 * 
 * 提供多种类型的骨架屏占位符，用于数据加载期间的视觉反馈。
 */
class Skeleton {
  constructor() {
    this.templates = {
      healthScore: this.createHealthScoreSkeleton.bind(this),
      smartCoach: this.createSmartCoachSkeleton.bind(this),
      statsCard: this.createStatsCardSkeleton.bind(this),
      statsGrid: this.createStatsGridSkeleton.bind(this),
      stretchCard: this.createStretchCardSkeleton.bind(this),
      stretchGrid: this.createStretchGridSkeleton.bind(this),
      emptyState: this.createEmptyState.bind(this),
      loading: this.createLoading.bind(this)
    };
  }

  createHealthScoreSkeleton() {
    return `
      <div class="health-score-skeleton">
        <div class="health-score-skeleton-header">
          <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-title"></div>
          <div class="skeleton skeleton-animated skeleton-rounded health-score-skeleton-level"></div>
        </div>
        <div class="skeleton skeleton-animated skeleton-circle health-score-skeleton-ring"></div>
        <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-center"></div>
        <div class="health-score-skeleton-breakdown">
          <div class="health-score-skeleton-item">
            <div class="skeleton skeleton-animated skeleton-circle health-score-skeleton-item-icon"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-score"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-bar"></div>
          </div>
          <div class="health-score-skeleton-item">
            <div class="skeleton skeleton-animated skeleton-circle health-score-skeleton-item-icon"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-score"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-bar"></div>
          </div>
          <div class="health-score-skeleton-item">
            <div class="skeleton skeleton-animated skeleton-circle health-score-skeleton-item-icon"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-score"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-bar"></div>
          </div>
          <div class="health-score-skeleton-item">
            <div class="skeleton skeleton-animated skeleton-circle health-score-skeleton-item-icon"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-score"></div>
            <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-item-bar"></div>
          </div>
        </div>
        <div class="health-score-skeleton-advice">
          <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-advice-title"></div>
          <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-advice-item"></div>
          <div class="skeleton skeleton-animated skeleton-rect health-score-skeleton-advice-item"></div>
        </div>
      </div>
    `;
  }

  createSmartCoachSkeleton() {
    return `
      <div class="smart-coach-skeleton">
        <div class="smart-coach-skeleton-header">
          <div class="skeleton skeleton-animated skeleton-rounded smart-coach-skeleton-avatar"></div>
          <div>
            <div class="skeleton skeleton-animated skeleton-rect smart-coach-skeleton-title"></div>
            <div class="skeleton skeleton-animated skeleton-rect smart-coach-skeleton-subtitle"></div>
          </div>
        </div>
        <div class="smart-coach-skeleton-card">
          <div class="smart-coach-skeleton-action-header">
            <div class="smart-coach-skeleton-action-info">
              <div class="skeleton skeleton-animated skeleton-rounded smart-coach-skeleton-action-icon"></div>
              <div>
                <div class="skeleton skeleton-animated skeleton-rect smart-coach-skeleton-action-name"></div>
                <div class="skeleton skeleton-animated skeleton-rect smart-coach-skeleton-action-duration"></div>
              </div>
            </div>
            <div class="skeleton skeleton-animated skeleton-full smart-coach-skeleton-score-tag"></div>
          </div>
          <div class="skeleton skeleton-animated skeleton-rounded smart-coach-skeleton-reason"></div>
          <div class="smart-coach-skeleton-improve">
            <div class="skeleton skeleton-animated skeleton-full smart-coach-skeleton-improve-tag"></div>
            <div class="skeleton skeleton-animated skeleton-full smart-coach-skeleton-improve-tag"></div>
          </div>
          <div class="smart-coach-skeleton-actions">
            <div class="skeleton skeleton-animated skeleton-full smart-coach-skeleton-btn-primary"></div>
            <div class="skeleton skeleton-animated skeleton-rounded smart-coach-skeleton-btn-secondary"></div>
          </div>
        </div>
      </div>
    `;
  }

  createStatsCardSkeleton() {
    return `
      <div class="stats-skeleton-card">
        <div class="stats-skeleton-header">
          <div class="skeleton skeleton-animated skeleton-rounded stats-skeleton-icon"></div>
          <div class="skeleton skeleton-animated skeleton-full stats-skeleton-badge"></div>
        </div>
        <div class="skeleton skeleton-animated skeleton-rect stats-skeleton-value"></div>
        <div class="skeleton skeleton-animated skeleton-rect stats-skeleton-label"></div>
        <div class="skeleton skeleton-animated skeleton-full stats-skeleton-bar"></div>
      </div>
    `;
  }

  createStatsGridSkeleton(count = 4) {
    let html = `<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`;
    for (let i = 0; i < count; i++) {
      html += this.createStatsCardSkeleton();
    }
    html += `</div>`;
    return html;
  }

  createStretchCardSkeleton() {
    return `
      <div class="bg-white rounded-2xl p-5 shadow-card">
        <div class="skeleton skeleton-animated skeleton-rounded w-12 h-12 mb-4"></div>
        <div class="skeleton skeleton-animated skeleton-rect w-full h-5 mb-2"></div>
        <div class="skeleton skeleton-animated skeleton-rect w-3/4 h-4 mb-4"></div>
        <div class="flex items-center gap-2">
          <div class="skeleton skeleton-animated skeleton-circle w-4 h-4"></div>
          <div class="skeleton skeleton-animated skeleton-rect w-16 h-4"></div>
        </div>
      </div>
    `;
  }

  createStretchGridSkeleton(count = 4) {
    let html = `<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">`;
    for (let i = 0; i < count; i++) {
      html += this.createStretchCardSkeleton();
    }
    html += `</div>`;
    return html;
  }

  createEmptyState(options = {}) {
    const { title = '暂无数据', desc = '暂无相关数据，请稍后再试', icon = 'inbox' } = options;
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="${icon}" class="w-full h-full text-muted-300"></i>
        </div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-desc">${desc}</div>
      </div>
    `;
  }

  createLoading(options = {}) {
    const { type = 'spinner', size = 'medium', text = '' } = options;
    
    let spinnerHtml = '';
    switch (type) {
      case 'dots':
        spinnerHtml = `
          <div class="spinner spinner-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        `;
        break;
      case 'ring':
        spinnerHtml = `<div class="spinner spinner-ring"></div>`;
        break;
      case 'pulse':
        spinnerHtml = `<div class="spinner spinner-pulse"></div>`;
        break;
      default:
        spinnerHtml = `<div class="spinner spinner-circle ${size === 'small' ? 'spinner-circle-sm' : size === 'large' ? 'spinner-circle-lg' : ''}"></div>`;
    }

    return `
      <div class="loading-overlay">
        ${spinnerHtml}
        ${text ? `<div class="loading-text">${text}</div>` : ''}
      </div>
    `;
  }

  show(type, container, options = {}) {
    const createFn = this.templates[type];
    if (!createFn) {
      console.warn(`Skeleton type "${type}" not found`);
      return;
    }

    const containerEl = typeof container === 'string' ? document.querySelector(container) : container;
    if (!containerEl) {
      console.warn('Skeleton container not found');
      return;
    }

    containerEl.innerHTML = createFn(options);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    return containerEl;
  }

  hide(container) {
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container;
    if (containerEl) {
      containerEl.innerHTML = '';
    }
  }

  replaceWithContent(container, content) {
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container;
    if (!containerEl) return;

    containerEl.classList.add('animate-fade-in');
    setTimeout(() => {
      containerEl.innerHTML = content;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      containerEl.classList.remove('animate-fade-in');
    }, 50);
  }
}

const skeleton = new Skeleton();

if (typeof window !== 'undefined') {
  window.skeleton = skeleton;
  window.Skeleton = Skeleton;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { skeleton, Skeleton };
}