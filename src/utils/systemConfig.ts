// 全局系统配置管理
import { SystemSettings } from '../types/common';

// 默认系统配置
const DEFAULT_CONFIG: Partial<SystemSettings> = {
  siteName: 'GalPHOS',
  siteDescription: 'Galaxy Physics Olympic System - 银河物理奥林匹克系统',
  systemLogo: undefined, // 无默认图标
  allowRegistration: true,
  examDuration: 180, // 默认180分钟
  gradingDeadline: 72, // 默认72小时
  maintenanceMode: false, // 维护模式
  maintenanceMessage: '系统正在维护中，请稍后再试。',
  announcement: '', // 公告内容
  maxUploadSize: 10, // 默认10MB
  allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.png']
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
    // 初始化页面标题
    this.updatePageTitle();
  }

  /**
   * 获取当前系统配置
   */
  getConfig(): Partial<SystemSettings> {
    return { ...this.config };
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof SystemSettings>(key: K): SystemSettings[K] | undefined {
    return this.config[key];
  }

  /**
   * 更新系统配置
   */
  updateConfig(newConfig: Partial<SystemSettings>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 应用配置变更
    this.applyConfigChanges(newConfig);
    
    // 通知监听器
    this.notifyListeners();
  }

  /**
   * 重置为默认配置
   */
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.applyConfigChanges(this.config);
    this.notifyListeners();
  }

  /**
   * 添加配置变更监听器
   */
  addListener(listener: (config: Partial<SystemSettings>) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除配置变更监听器
   */
  removeListener(listener: (config: Partial<SystemSettings>) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.getConfig());
    });
  }

  /**
   * 应用配置变更到页面
   */
  private applyConfigChanges(changes: Partial<SystemSettings>): void {
    // 更新页面标题
    if (changes.siteName) {
      this.updatePageTitle();
    }

    // 更新网站图标
    if (changes.systemLogo !== undefined) {
      this.updateFavicon(changes.systemLogo);
    }

    // 更新页面描述
    if (changes.siteDescription) {
      this.updatePageDescription(changes.siteDescription);
    }
  }

  /**
   * 更新页面标题
   */
  private updatePageTitle(): void {
    const siteName = this.config.siteName || DEFAULT_CONFIG.siteName;
    document.title = siteName!;
    
    // 更新meta标签
    let titleMeta = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (!titleMeta) {
      titleMeta = document.createElement('meta');
      titleMeta.setAttribute('property', 'og:title');
      document.head.appendChild(titleMeta);
    }
    titleMeta.content = siteName!;
  }

  /**
   * 更新网站图标
   */
  private updateFavicon(iconUrl?: string): void {
    // 移除现有的favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    if (iconUrl) {
      // 添加新的favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = iconUrl;
      favicon.type = 'image/x-icon';
      document.head.appendChild(favicon);
    }
  }

  /**
   * 更新页面描述
   */
  private updatePageDescription(description: string): void {
    let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = description;

    // 更新og:description
    let ogDescMeta = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (!ogDescMeta) {
      ogDescMeta = document.createElement('meta');
      ogDescMeta.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescMeta);
    }
    ogDescMeta.content = description;
  }

  /**
   * 检查是否在维护模式
   */
  isInMaintenanceMode(): boolean {
    return this.config.systemMaintenance || false;
  }

  /**
   * 获取维护消息
   */
  getMaintenanceMessage(): string {
    return this.config.maintenanceMessage || DEFAULT_CONFIG.maintenanceMessage!;
  }

  /**
   * 检查是否允许注册
   */
  isRegistrationAllowed(): boolean {
    return this.config.allowRegistration !== false; // 默认允许
  }

  /**
   * 获取系统公告
   */
  getAnnouncement(): string {
    return this.config.announcement || '';
  }
}

// 导出单例实例
export const systemConfig = SystemConfigManager.getInstance();

// 导出配置获取的便捷方法
export const getSystemConfig = () => systemConfig.getConfig();
export const updateSystemConfig = (config: Partial<SystemSettings>) => systemConfig.updateConfig(config);
export const isMaintenanceMode = () => systemConfig.isInMaintenanceMode();
export const isRegistrationAllowed = () => systemConfig.isRegistrationAllowed();
export const getSystemAnnouncement = () => systemConfig.getAnnouncement();

export default systemConfig;
