// 全局系统配置管理（简化版 v1.3.0）
import { SystemSettings } from '../types/common';
import { apiClient } from './apiClient';

// 默认系统配置（简化版 v1.3.2）
const DEFAULT_CONFIG: Partial<SystemSettings> = {
  // 系统信息（硬编码）
  systemName: 'GalPHOS 考试管理系统',
  version: 'v1.3.2',
  buildTime: '2025-07-02 10:30:00'
};

class SystemConfigManager {
  private static instance: SystemConfigManager;
  private config: Partial<SystemSettings> = { ...DEFAULT_CONFIG };
  private listeners: ((config: Partial<SystemSettings>) => void)[] = [];

  static getInstance(): SystemConfigManager {
    if (!SystemConfigManager.instance) {
      SystemConfigManager.instance = new SystemConfigManager();
    }
    return SystemConfigManager.instance;
  }

  private constructor() {
    this.init();
  }

  /**
   * 初始化系统配置
   */
  private init(): void {
    this.updatePageTitle();
    this.loadFromStorage();
  }

  /**
   * 从本地存储加载配置
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('galphos_system_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = { ...DEFAULT_CONFIG, ...parsedConfig };
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to load system config from storage:', error);
    }
  }

  /**
   * 保存配置到本地存储
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('galphos_system_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save system config to storage:', error);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(changes: Partial<SystemSettings>): void {
    this.config = { ...this.config, ...changes };
    this.applyConfigChanges(changes);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * 获取当前配置
   */
  getConfig(): Partial<SystemSettings> {
    return { ...this.config };
  }

  /**
   * 应用配置变更
   */
  private applyConfigChanges(changes: Partial<SystemSettings>): void {
    // 更新页面标题
    if (changes.systemName) {
      this.updatePageTitle();
    }
  }

  /**
   * 更新页面标题
   */
  private updatePageTitle(): void {
    const systemName = this.config.systemName || DEFAULT_CONFIG.systemName;
    document.title = systemName!;
    
    // 更新meta标签
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) {
      metaTitle.setAttribute('content', systemName!);
    }
  }

  // 所有特殊配置方法已删除
  
  /**
   * 从服务器获取系统设置
   */
  async fetchSystemSettings(): Promise<SystemSettings | null> {
    try {
      const response = await apiClient.get('/api/system/settings');
      if (response.success && response.data) {
        const settings = response.data as SystemSettings;
        this.updateConfig(settings);
        return settings;
      }
      return null;
    } catch (error) {
      console.error('获取系统设置失败:', error);
      return null;
    }
  }

  /**
   * 添加配置监听器
   */
  addListener(listener: (config: Partial<SystemSettings>) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除配置监听器
   */
  removeListener(listener: (config: Partial<SystemSettings>) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.error('Error in system config listener:', error);
      }
    });
  }
}

// 导出单例实例
export const systemConfig = SystemConfigManager.getInstance();
export default systemConfig;
