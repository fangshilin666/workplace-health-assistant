/**
 * Toast - 统一提示组件
 * 
 * 提供统一的成功、失败、警告、信息提示功能。
 * 支持自定义消息、图标、持续时间和位置。
 */
class Toast {
  constructor() {
    /**
     * Toast容器
     * @type {HTMLElement}
     */
    this.container = null;

    /**
     * Toast队列
     * @type {Array}
     */
    this.queue = [];

    /**
     * 当前是否有Toast显示
     * @type {boolean}
     */
    this.isShowing = false;

    /**
     * 默认配置
     * @type {Object}
     */
    this.defaultConfig = {
      duration: 3000,
      position: 'top-right',
      animate: true,
      closeable: true
    };

    /**
     * 图标映射
     * @type {Object}
     */
    this.iconMap = {
      success: 'check-circle',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info',
      loading: 'loader-2'
    };

    /**
     * 颜色映射
     * @type {Object}
     */
    this.colorMap = {
      success: {
        bg: 'var(--color-success-50)',
        border: 'var(--color-success-200)',
        icon: 'var(--color-success-500)',
        text: 'var(--color-success-700)'
      },
      error: {
        bg: 'var(--color-error-50)',
        border: 'var(--color-error-200)',
        icon: 'var(--color-error-500)',
        text: 'var(--color-error-700)'
      },
      warning: {
        bg: 'var(--color-warning-50)',
        border: 'var(--color-warning-200)',
        icon: 'var(--color-warning-500)',
        text: 'var(--color-warning-700)'
      },
      info: {
        bg: 'var(--color-blue-50)',
        border: 'var(--color-blue-200)',
        icon: 'var(--color-blue-500)',
        text: 'var(--color-blue-700)'
      },
      loading: {
        bg: 'var(--color-muted-50)',
        border: 'var(--color-muted-200)',
        icon: 'var(--color-muted-500)',
        text: 'var(--color-muted-700)'
      }
    };

    // 初始化容器
    this.initContainer();
  }

  /**
   * 初始化Toast容器
   * @returns {void}
   */
  initContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed z-[100] flex flex-col gap-3 p-4';
    this.container.style.right = '16px';
    this.container.style.top = '80px';

    document.body.appendChild(this.container);
  }

  /**
   * 显示Toast
   * @param {Object} options - Toast配置
   * @param {string} options.type - Toast类型：success/error/warning/info/loading
   * @param {string} options.message - 消息内容
   * @param {number} [options.duration] - 显示时长(ms)，默认3000
   * @param {string} [options.position] - 位置：top-right/top-left/bottom-right/bottom-left，默认top-right
   * @param {boolean} [options.animate] - 是否启用动画，默认true
   * @param {boolean} [options.closeable] - 是否可关闭，默认true
   * @returns {string} - Toast ID
   */
  show(options) {
    const config = { ...this.defaultConfig, ...options };
    const toastId = 'toast-' + Date.now();

    // 如果正在显示，加入队列
    if (this.isShowing) {
      this.queue.push({ ...config, toastId });
      return toastId;
    }

    this.isShowing = true;
    this.createToast(toastId, config);

    return toastId;
  }

  /**
   * 创建Toast元素
   * @param {string} toastId - Toast ID
   * @param {Object} config - Toast配置
   * @returns {void}
   */
  createToast(toastId, config) {
    const colors = this.colorMap[config.type] || this.colorMap.info;
    const iconName = this.iconMap[config.type] || 'info';

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border max-w-sm';
    toast.style.backgroundColor = colors.bg;
    toast.style.borderColor = colors.border;
    toast.style.borderWidth = '1px';
    toast.style.borderStyle = 'solid';

    // 图标
    const iconContainer = document.createElement('div');
    iconContainer.className = 'flex-shrink-0 mt-0.5';
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', iconName);
    icon.style.color = colors.icon;
    icon.style.width = '20px';
    icon.style.height = '20px';
    if (config.type === 'loading') {
      icon.style.animation = 'spin-medium 1s linear infinite';
    }
    iconContainer.appendChild(icon);
    toast.appendChild(iconContainer);

    // 消息
    const message = document.createElement('div');
    message.className = 'flex-1 min-w-0';
    message.style.color = colors.text;
    message.style.fontSize = '14px';
    message.style.lineHeight = '1.5';
    message.textContent = config.message;
    toast.appendChild(message);

    // 关闭按钮
    if (config.closeable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors';
      closeBtn.setAttribute('aria-label', '关闭提示');
      const closeIcon = document.createElement('i');
      closeIcon.setAttribute('data-lucide', 'x');
      closeIcon.style.width = '14px';
      closeIcon.style.height = '14px';
      closeIcon.style.color = colors.text;
      closeBtn.appendChild(closeIcon);
      closeBtn.addEventListener('click', () => this.hide(toastId));
      toast.appendChild(closeBtn);
    }

    // 添加到容器
    this.container.appendChild(toast);

    // 初始化图标
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // 动画
    if (config.animate) {
      toast.classList.add('animate-toast-enter');
    }

    // 自动隐藏
    if (config.duration > 0 && config.type !== 'loading') {
      setTimeout(() => {
        this.hide(toastId);
      }, config.duration);
    }
  }

  /**
   * 隐藏Toast
   * @param {string} toastId - Toast ID
   * @returns {void}
   */
  hide(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;

    toast.classList.remove('animate-toast-enter');
    toast.classList.add('animate-toast-exit');

    setTimeout(() => {
      toast.remove();
      this.isShowing = false;

      // 处理队列中的下一个Toast
      if (this.queue.length > 0) {
        const nextToast = this.queue.shift();
        this.isShowing = true;
        this.createToast(nextToast.toastId, nextToast);
      }
    }, 150);
  }

  /**
   * 成功提示
   * @param {string} message - 消息内容
   * @param {Object} [options] - 额外配置
   * @returns {string} - Toast ID
   */
  success(message, options = {}) {
    return this.show({ ...options, type: 'success', message });
  }

  /**
   * 错误提示
   * @param {string} message - 消息内容
   * @param {Object} [options] - 额外配置
   * @returns {string} - Toast ID
   */
  error(message, options = {}) {
    return this.show({ ...options, type: 'error', message });
  }

  /**
   * 警告提示
   * @param {string} message - 消息内容
   * @param {Object} [options] - 额外配置
   * @returns {string} - Toast ID
   */
  warning(message, options = {}) {
    return this.show({ ...options, type: 'warning', message });
  }

  /**
   * 信息提示
   * @param {string} message - 消息内容
   * @param {Object} [options] - 额外配置
   * @returns {string} - Toast ID
   */
  info(message, options = {}) {
    return this.show({ ...options, type: 'info', message });
  }

  /**
   * 加载提示
   * @param {string} message - 消息内容
   * @param {Object} [options] - 额外配置
   * @returns {string} - Toast ID
   */
  loading(message, options = {}) {
    return this.show({ ...options, type: 'loading', message, duration: 0, closeable: false });
  }

  /**
   * 清除所有Toast
   * @returns {void}
   */
  clear() {
    this.queue = [];
    const toasts = this.container.querySelectorAll('[id^="toast-"]');
    toasts.forEach(toast => toast.remove());
    this.isShowing = false;
  }

  /**
   * 设置默认配置
   * @param {Object} config - 默认配置
   * @returns {void}
   */
  setDefaultConfig(config) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

// 创建单例实例
const toast = new Toast();

// 全局暴露Toast
if (typeof window !== 'undefined') {
  window.toast = toast;
  window.Toast = Toast;
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toast, Toast };
}