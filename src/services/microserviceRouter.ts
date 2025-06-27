// 微服务路由配置管理器
export interface MicroserviceConfig {
  name: string;
  baseUrl: string;
  port: number;
  paths: string[];
  description: string;
  healthCheck?: string;
}

// 微服务配置映射
export const MICROSERVICE_CONFIG: Record<string, MicroserviceConfig> = {
  // 用户认证服务
  auth: {
    name: 'user-auth-service',
    baseUrl: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001',
    port: 3001,
    paths: [
      '/api/auth/login',
      '/api/auth/logout', 
      '/api/auth/register',
      '/api/auth/admin-login',
      '/api/auth/validate',
      '/api/auth/refresh-token',
      '/api/auth/provinces-schools'
    ],
    description: '用户认证与授权服务',
    healthCheck: '/shealth'
  },

  // TODO: 添加其他微服务配置
};

/**
 * 微服务路由器
 * 根据API路径自动路由到对应的微服务
 */
export class MicroserviceRouter {
  private static instance: MicroserviceRouter;
  private serviceHealthStatus: Map<string, boolean> = new Map();
  private failoverConfig: Map<string, string[]> = new Map();

  static getInstance(): MicroserviceRouter {
    if (!MicroserviceRouter.instance) {
      MicroserviceRouter.instance = new MicroserviceRouter();
    }
    return MicroserviceRouter.instance;
  }

  constructor() {
    // 初始化故障转移配置
    this.initFailoverConfig();
    // 开始健康检查
    this.startHealthCheck();
  }

  /**
   * 初始化故障转移配置
   */
  private initFailoverConfig(): void {
    // 配置服务间的故障转移关系
    this.failoverConfig.set('student', ['admin']); // 学生服务可故障转移到管理员服务
    this.failoverConfig.set('coach', ['admin']);   // 教练服务可故障转移到管理员服务
    this.failoverConfig.set('grader', ['admin']);  // 阅卷服务可故障转移到管理员服务
  }

  /**
   * 根据API路径路由到对应的微服务
   */
  routeRequest(apiPath: string): MicroserviceConfig {
    // 标准化路径（去除查询参数）
    const normalizedPath = apiPath.split('?')[0];
    
    // 查找匹配的微服务
    for (const [serviceName, config] of Object.entries(MICROSERVICE_CONFIG)) {
      if (this.isPathMatch(normalizedPath, config.paths)) {
        // 检查服务健康状态
        if (this.isServiceHealthy(serviceName)) {
          return config;
        } else {
          // 尝试故障转移
          const fallbackService = this.getFallbackService(serviceName);
          if (fallbackService) {
            console.warn(`服务 ${serviceName} 不可用，切换到故障转移服务: ${fallbackService.name}`);
            return fallbackService;
          }
        }
      }
    }

    // 如果没有找到匹配的服务，默认使用认证服务
    console.warn(`未找到路径 ${apiPath} 对应的微服务，使用默认认证服务`);
    return MICROSERVICE_CONFIG.auth;
  }

  /**
   * 检查路径是否匹配
   */
  private isPathMatch(requestPath: string, servicePaths: string[]): boolean {
    return servicePaths.some(servicePath => {
      // 支持通配符匹配
      const pattern = servicePath.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}`);
      return regex.test(requestPath);
    });
  }

  /**
   * 检查服务是否健康
   */
  private isServiceHealthy(serviceName: string): boolean {
    return this.serviceHealthStatus.get(serviceName) !== false;
  }

  /**
   * 获取故障转移服务
   */
  private getFallbackService(serviceName: string): MicroserviceConfig | null {
    const fallbackServices = this.failoverConfig.get(serviceName);
    if (fallbackServices) {
      for (const fallbackName of fallbackServices) {
        if (this.isServiceHealthy(fallbackName)) {
          return MICROSERVICE_CONFIG[fallbackName];
        }
      }
    }
    return null;
  }

  /**
   * 构建完整的API URL
   */
  buildApiUrl(apiPath: string): string {
    const service = this.routeRequest(apiPath);
    return `${service.baseUrl}${apiPath}`;
  }

  /**
   * 开始健康检查
   */
  private startHealthCheck(): void {
    // 立即执行一次健康检查
    this.performHealthCheck();
    
    // 每30秒执行一次健康检查
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<void> {
    const promises = Object.entries(MICROSERVICE_CONFIG).map(async ([serviceName, config]) => {
      if (config.healthCheck) {
        try {
          const response = await fetch(`${config.baseUrl}${config.healthCheck}`, {
            method: 'GET',
            timeout: 5000 // 5秒超时
          } as any);
          
          const isHealthy = response.ok;
          this.serviceHealthStatus.set(serviceName, isHealthy);
          
          if (!isHealthy) {
            console.warn(`微服务 ${serviceName} 健康检查失败: ${response.status}`);
          }
        } catch (error) {
          this.serviceHealthStatus.set(serviceName, false);
          console.error(`微服务 ${serviceName} 健康检查异常:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 获取所有服务状态
   */
  getServicesStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [serviceName] of Object.entries(MICROSERVICE_CONFIG)) {
      status[serviceName] = this.isServiceHealthy(serviceName);
    }
    return status;
  }

  /**
   * 手动设置服务状态（用于测试）
   */
  setServiceStatus(serviceName: string, isHealthy: boolean): void {
    this.serviceHealthStatus.set(serviceName, isHealthy);
  }
}

// 导出单例实例
export const microserviceRouter = MicroserviceRouter.getInstance();
