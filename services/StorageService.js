/**
 * StorageService - 统一存储服务
 * 
 * 封装 LocalStorage 操作，提供统一的 API，支持自动 JSON 转换、异常处理和默认值。
 * 所有存储键都带有 'workease_' 前缀，避免与其他应用冲突。
 */
class StorageService {
  constructor() {
    /**
     * 存储键前缀
     * @type {string}
     */
    this.prefix = 'workease_';

    /**
     * 默认设置配置
     * @type {Object}
     */
    this.defaultSettings = {
      theme: 'forest',
      sitReminder: 45,
      eyeReminder: 20,
      restTime: 5,
      sound: true,
      music: false,
      volume: 60,
      camera: true,
      pose: true,
      sensitivity: 'medium'
    };
  }

  /**
   * 保存数据到 LocalStorage
   * @param {string} key - 存储键名（不带前缀）
   * @param {any} value - 要存储的值
   * @returns {boolean} - 是否保存成功
   */
  save(key, value) {
    try {
      const fullKey = this.prefix + key;
      localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[StorageService] LocalStorage 空间不足，请清理浏览器缓存');
      } else {
        console.error('[StorageService] 保存数据失败:', e);
      }
      return false;
    }
  }

  /**
   * 从 LocalStorage 读取数据
   * @param {string} key - 存储键名（不带前缀）
   * @param {any} defaultValue - 默认值（当数据不存在或读取失败时返回）
   * @returns {any} - 存储的值或默认值
   */
  load(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const value = localStorage.getItem(fullKey);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error('[StorageService] 读取数据失败:', e);
      return defaultValue;
    }
  }

  /**
   * 删除指定键的数据
   * @param {string} key - 存储键名（不带前缀）
   * @returns {boolean} - 是否删除成功
   */
  remove(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error('[StorageService] 删除数据失败:', e);
      return false;
    }
  }

  /**
   * 清除所有 workease 相关数据
   * @returns {boolean} - 是否清除成功
   */
  clear() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('[StorageService] 清除数据失败:', e);
      return false;
    }
  }

  /**
   * 检查指定键是否存在
   * @param {string} key - 存储键名（不带前缀）
   * @returns {boolean} - 是否存在
   */
  has(key) {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * 获取所有 workease 相关的键值对
   * @returns {Object} - 所有数据
   */
  getAll() {
    const data = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          data[key.replace(this.prefix, '')] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          data[key.replace(this.prefix, '')] = localStorage.getItem(key);
        }
      }
    });
    return data;
  }

  /**
   * 获取当前 LocalStorage 使用情况
   * @returns {Object} - 使用情况信息
   */
  getStorageInfo() {
    let used = 0;
    const maxSize = 5 * 1024 * 1024; // 5MB

    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      used += key.length + (value ? value.length : 0);
    });

    return {
      used: used,
      usedKB: (used / 1024).toFixed(2),
      usedMB: (used / 1024 / 1024).toFixed(4),
      maxSize: maxSize,
      maxSizeMB: 5,
      percentage: ((used / maxSize) * 100).toFixed(2)
    };
  }

  /**
   * 保存用户设置
   * @param {Object} settings - 设置对象
   * @returns {boolean} - 是否保存成功
   */
  saveSettings(settings) {
    const mergedSettings = { ...this.defaultSettings, ...settings };
    return this.save('settings', mergedSettings);
  }

  /**
   * 读取用户设置
   * @returns {Object} - 用户设置对象
   */
  loadSettings() {
    const saved = this.load('settings');
    return saved ? { ...this.defaultSettings, ...saved } : { ...this.defaultSettings };
  }

  /**
   * 导出所有数据为 JSON 文件
   * @returns {void}
   */
  exportData() {
    const data = this.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workease_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// 创建单例实例
const storageService = new StorageService();

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storageService, StorageService };
}