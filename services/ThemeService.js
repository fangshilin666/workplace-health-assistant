/**
 * ThemeService - 主题管理服务
 * 
 * 负责管理应用的主题切换，支持实时切换、持久化保存和动态应用。
 * 通过 CSS Variables 实现主题系统，无需刷新页面即可切换。
 */
class ThemeService {
  constructor(storageService) {
    /**
     * 存储服务实例
     * @type {StorageService}
     */
    this.storageService = storageService;

    /**
     * 可用主题列表
     * @type {Object}
     */
    this.themes = {
      forest: {
        name: 'Forest',
        description: '浅色护眼',
        primaryColor: '#22c55e',
        bgColor: '#f8fafc',
        textColor: '#262626',
        previewColors: ['#22c55e', '#f0fdf4', '#f8fafc']
      },
      darkcode: {
        name: 'Dark Code',
        description: '深色代码风',
        primaryColor: '#00b3b3',
        bgColor: '#0d1117',
        textColor: '#cccccc',
        previewColors: ['#0d1117', '#21262d', '#00b3b3']
      }
    };

    /**
     * 当前主题
     * @type {string}
     */
    this.currentTheme = 'forest';

    /**
     * 主题切换回调函数列表
     * @type {Array}
     */
    this.changeListeners = [];
  }

  /**
   * 初始化主题服务
   * 从存储中加载上次保存的主题并应用
   * @returns {void}
   */
  init() {
    const settings = this.storageService.loadSettings();
    this.currentTheme = settings.theme || 'forest';
    this.applyTheme(this.currentTheme);
  }

  /**
   * 获取当前主题名称
   * @returns {string} - 当前主题名称
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * 获取主题配置
   * @param {string} themeName - 主题名称
   * @returns {Object|null} - 主题配置对象
   */
  getTheme(themeName) {
    return this.themes[themeName] || null;
  }

  /**
   * 获取所有可用主题
   * @returns {Object} - 所有主题配置
   */
  getAllThemes() {
    return { ...this.themes };
  }

  /**
   * 切换主题
   * @param {string} themeName - 主题名称
   * @returns {boolean} - 是否切换成功
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.error('[ThemeService] 主题不存在:', themeName);
      return false;
    }

    this.currentTheme = themeName;
    
    // 应用主题到页面
    this.applyTheme(themeName);
    
    // 保存到存储
    const settings = this.storageService.loadSettings();
    settings.theme = themeName;
    this.storageService.saveSettings(settings);
    
    // 通知所有监听器
    this.notifyChange(themeName);
    
    return true;
  }

  /**
   * 应用主题到页面
   * 通过设置 HTML 元素的 data-theme 属性实现
   * @param {string} themeName - 主题名称
   * @returns {void}
   */
  applyTheme(themeName) {
    const html = document.documentElement;
    
    if (themeName === 'darkcode') {
      html.setAttribute('data-theme', 'darkcode');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  /**
   * 注册主题变化监听器
   * @param {Function} callback - 回调函数，接收新主题名称作为参数
   * @returns {void}
   */
  onChange(callback) {
    if (typeof callback === 'function') {
      this.changeListeners.push(callback);
    }
  }

  /**
   * 移除主题变化监听器
   * @param {Function} callback - 要移除的回调函数
   * @returns {void}
   */
  offChange(callback) {
    this.changeListeners = this.changeListeners.filter(cb => cb !== callback);
  }

  /**
   * 通知所有监听器主题已变化
   * @param {string} themeName - 新主题名称
   * @returns {void}
   */
  notifyChange(themeName) {
    this.changeListeners.forEach(callback => {
      try {
        callback(themeName);
      } catch (e) {
        console.error('[ThemeService] 通知监听器失败:', e);
      }
    });
  }

  /**
   * 切换到下一个主题（循环切换）
   * @returns {string} - 新主题名称
   */
  toggleTheme() {
    const themeNames = Object.keys(this.themes);
    const currentIndex = themeNames.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    const nextTheme = themeNames[nextIndex];
    
    this.setTheme(nextTheme);
    return nextTheme;
  }

  /**
   * 获取主题预览数据
   * @returns {Array} - 主题预览数组
   */
  getThemePreviews() {
    return Object.entries(this.themes).map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
      colors: config.previewColors,
      isActive: key === this.currentTheme
    }));
  }
}

// 创建单例实例
// 注意：这里需要先确保 storageService 已定义
let themeService = null;

if (typeof storageService !== 'undefined') {
  themeService = new ThemeService(storageService);
}

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { themeService, ThemeService };
}