// 微服务路由配置管理器
export interface MicroserviceConfig {
  name: string;
  baseUrl: string;
  port: number;
  paths: string[];
  description: string;
  healthCheck?: string;
}

// 微服务配置映射 - 基于实际API路径分析的精确分配
export const MICROSERVICE_CONFIG: Record<string, MicroserviceConfig> = {
  // 1. 用户认证服务 (User Authentication Service)
  auth: {
    name: 'user-authentication-service',
    baseUrl: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001',
    port: 3001,
    paths: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/validate',
      '/api/auth/logout',
      '/api/auth/admin-login'
    ],
    description: '用户认证与授权服务',
    healthCheck: '/health'
  },

  // 2. 用户管理服务 (User Management Service)
  userManagement: {
    name: 'user-management-service',
    baseUrl: process.env.REACT_APP_USER_MANAGEMENT_SERVICE_URL || 'http://localhost:3002',
    port: 3002,
    paths: [
      // 管理员用户管理
      '/api/admin/users/*',
      '/api/admin/coach-students*',
      '/api/admin/student-registrations*',
      // 所有角色个人资料管理（统一规范 v1.2.0，v1.3.4头像上传也通过此API）
      '/api/admin/profile*',      // 包含管理员头像上传
      '/api/admin/password*',      // 新增统一密码修改接口
      '/api/student/profile*',    // 包含学生头像上传
      '/api/student/password*',
      '/api/coach/profile*',      // 包含教练头像上传
      '/api/coach/password*',      // 统一路径：原 /api/coach/profile/change-password
      '/api/grader/profile*',     // 包含阅卷员头像上传
      '/api/grader/password*',      // 统一路径：原 /api/grader/change-password
      // 账号注销功能（新增 v1.3.0）
      '/api/student/account/delete',
      '/api/coach/account/delete',
      '/api/grader/account/delete'
    ],
    description: '用户生命周期管理服务 - v1.2.0统一个人资料和密码管理API, v1.3.0账号注销功能',
    healthCheck: '/health'
  },

  // 3. 考试管理服务 (Exam Management Service)
  examManagement: {
    name: 'exam-management-service',
    baseUrl: process.env.REACT_APP_EXAM_MANAGEMENT_SERVICE_URL || 'http://localhost:3003',
    port: 3003,
    paths: [
      // 管理员考试管理
      '/api/admin/exams',
      '/api/admin/exams/*',
      '/api/admin/exams/*/publish',
      '/api/admin/exams/*/unpublish',
      // 学生考试查看（基本信息）
      '/api/student/exams',
      // 教练考试管理（基本信息）
      '/api/coach/exams',
      // 阅卷员考试查看（基本信息）
      '/api/grader/exams'
    ],
    description: '考试完整生命周期管理服务',
    healthCheck: '/health'
  },

  // 4. 答题提交服务 (Submission Service)
  submission: {
    name: 'submission-service',
    baseUrl: process.env.REACT_APP_SUBMISSION_SERVICE_URL || 'http://localhost:3004',
    port: 3004,
    paths: [
      // 独立学生账号的自主提交
      '/api/student/exams/*/submit*',
      '/api/student/exams/*/submission*',
      // 教练代理非独立学生提交（教练权限）
      '/api/coach/exams/*/submissions*',
      '/api/coach/exams/*/upload-answer*',
      // 阅卷员查看提交
      '/api/grader/submissions*',
      '/api/grader/exams/*/progress*'
    ],
    description: '答题卡提交和管理服务 - 区分独立学生自主提交和教练代理提交',
    healthCheck: '/health'
  },

  // 5. 阅卷管理服务 (Grading Service)
  grading: {
    name: 'grading-service',
    baseUrl: process.env.REACT_APP_GRADING_SERVICE_URL || 'http://localhost:3005',
    port: 3005,
    paths: [
      // 管理员阅卷管理
      '/api/admin/graders*',
      '/api/admin/grading*',
      '/api/admin/exams/*/question-scores*',  // 简化路径：题目分值设置
      // 阅卷员任务管理
      '/api/grader/tasks*',
      '/api/grader/exams/*/questions/scores*',
      // 教练管理非独立学生关系（区别于个人资料）
      '/api/coach/students*'
    ],
    description: '阅卷任务分配和过程管理服务 - 包含教练非独立学生管理',
    healthCheck: '/health'
  },

  // 6. 成绩统计服务 (Score Statistics Service)
  scoreStatistics: {
    name: 'score-statistics-service',
    baseUrl: process.env.REACT_APP_SCORE_STATISTICS_SERVICE_URL || 'http://localhost:3006',
    port: 3006,
    paths: [
      // 学生成绩查看
      '/api/student/exams/*/score*',
      '/api/student/exams/*/ranking*', 
      '/api/student/scores*',
      '/api/student/dashboard/stats*',    // 统一仪表板路径 v1.2.0
      // 教练成绩管理
      '/api/coach/grades*',
      '/api/coach/dashboard/stats*',      // 统一仪表板路径 v1.2.0
      '/api/coach/students/*/exams/*/score*',
      '/api/coach/students/scores*',
      // 阅卷员统计
      '/api/grader/statistics*',
      '/api/grader/dashboard/stats*',     // 新增阅卷员仪表板 v1.2.0
      '/api/grader/history*',
      // 管理员统计数据
      '/api/admin/dashboard/stats*'       // 统一仪表板路径 v1.2.0
    ],
    description: '成绩数据分析和排名计算服务 - v1.2.0统一所有角色仪表板API',
    healthCheck: '/health'
  },

  // 7. 区域管理服务 (Region Management Service)
  regionManagement: {
    name: 'region-management-service',
    baseUrl: process.env.REACT_APP_REGION_MANAGEMENT_SERVICE_URL || 'http://localhost:3007',
    port: 3007,
    paths: [
      // 管理员区域管理
      '/api/admin/regions*',
      // 学生区域变更申请（统一规范 v1.2.0）
      '/api/student/region-change*',
      // 教练区域变更申请（统一规范 v1.2.0）
      '/api/coach/region-change*',  // 统一路径：原 /api/coach/profile/change-region*
      // 通用区域数据查询
      '/api/regions/provinces-schools*',
      '/api/regions/provinces*',
      '/api/regions/schools*'
    ],
    description: '省份学校等地理信息管理服务 - v1.2.0统一地区变更API',
    healthCheck: '/health'
  },

  // 8. 文件存储服务 (File Storage Service)
  fileStorage: {
    name: 'file-storage-service',
    baseUrl: process.env.REACT_APP_FILE_STORAGE_SERVICE_URL || 'http://localhost:3008',
    port: 3008,
    paths: [
      // 学生文件管理
      '/api/student/files/*',
      // 阅卷图片管理
      '/api/grader/images*',
      // 考试文件导出
      '/api/coach/exams/*/ranking*',
      '/api/coach/exams/*/scores/export*',
      '/api/coach/exams/*/scores/statistics*',
      
      // 通用文件API（不包含头像上传，头像由各角色profile API内部处理）
      '/api/upload/file*',
      '/api/upload/document*',
      '/api/download*',
      '/api/files*'
    ],
    description: '文件上传存储和访问管理服务 - v1.3.4版：头像上传通过各角色profile API内部处理',
    healthCheck: '/health'
  },

  // 9. 系统配置服务 (System Configuration Service)
  systemConfig: {
    name: 'system-configuration-service',
    baseUrl: process.env.REACT_APP_SYSTEM_CONFIG_SERVICE_URL || 'http://localhost:3009',
    port: 3009,
    paths: [
      // 超级管理员管理其他管理员的API (v1.3.3最精简版)
      '/api/admin/system/settings',      // 系统基础设置
      '/api/admin/system/admins',        // 管理员列表
      '/api/admin/system/admins/create', // 创建管理员
      '/api/admin/system/admins/{id}',   // 单个管理员操作
      '/api/admin/system/admins/{id}/password', // 管理员密码重置

      // 通用系统设置接口 (其他角色访问)
      '/api/system/settings',            // 全局系统设置
      '/api/system/version'              // 系统版本信息
    ],
    description: '系统配置管理服务 - v1.3.3精简版，仅保留管理员管理和基础系统配置',
    healthCheck: '/health'
  }
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
   * 基于微服务架构设计的服务依赖关系
   */
  private initFailoverConfig(): void {
    // 配置服务间的故障转移关系 - 基于业务逻辑依赖
    
    // 用户管理相关服务可互相故障转移
    this.failoverConfig.set('userManagement', ['auth']);
    this.failoverConfig.set('auth', ['userManagement']);
    
    // 考试相关服务的故障转移链
    this.failoverConfig.set('submission', ['examManagement', 'fileStorage']);
    this.failoverConfig.set('examManagement', ['userManagement']);
    
    // 阅卷和成绩服务的故障转移
    this.failoverConfig.set('grading', ['scoreStatistics', 'userManagement']);
    this.failoverConfig.set('scoreStatistics', ['grading']);
    
    // 文件服务作为基础服务，可临时由系统配置服务处理
    this.failoverConfig.set('fileStorage', ['systemConfig']);
    
    // 区域管理可由用户管理服务代理
    this.failoverConfig.set('regionManagement', ['userManagement']);
    
    // 系统配置服务作为核心服务，由认证服务备份
    this.failoverConfig.set('systemConfig', ['auth']);
  }

  /**
   * 根据API路径路由到对应的微服务
   * 使用智能匹配算法，支持路径参数和优先级排序
   */
  routeRequest(apiPath: string): MicroserviceConfig {
    // 标准化路径（去除查询参数）
    const normalizedPath = apiPath.split('?')[0];
    
    // 使用智能匹配查找最佳服务
    const bestMatch = this.findBestMatch(normalizedPath);
    
    if (bestMatch) {
      const { service, serviceName } = bestMatch;
      
      // 检查服务健康状态
      if (this.isServiceHealthy(serviceName)) {
        return service;
      } else {
        // 尝试故障转移
        const fallbackService = this.getFallbackService(serviceName);
        if (fallbackService) {
          console.warn(`服务 ${serviceName} 不可用，切换到故障转移服务: ${fallbackService.name}`);
          return fallbackService;
        }
        
        // 如果故障转移也失败，记录警告但仍返回原服务（可能恢复）
        console.warn(`服务 ${serviceName} 及其故障转移服务均不可用，尝试使用原服务`);
        return service;
      }
    }

    // 如果没有找到匹配的服务，根据路径特征智能推断
    const inferredService = this.inferServiceFromPath(normalizedPath);
    if (inferredService) {
      console.warn(`未找到精确匹配，根据路径特征推断使用服务: ${inferredService.name}`);
      return inferredService;
    }

    // 最后默认使用认证服务
    console.warn(`未找到路径 ${apiPath} 对应的微服务，使用默认认证服务`);
    return MICROSERVICE_CONFIG.auth;
  }

  /**
   * 根据路径特征智能推断服务
   * 基于微服务职责划分的路径分析
   */
  private inferServiceFromPath(path: string): MicroserviceConfig | null {
    // 1. 认证相关
    if (path.includes('/auth/') || path.includes('/login') || path.includes('/register')) {
      return MICROSERVICE_CONFIG.auth;
    }
    
    // 2. 用户管理相关
    if (path.includes('/admin/users') || path.includes('/coach-students') || 
        path.includes('/profile') || path.includes('/password')) {
      return MICROSERVICE_CONFIG.userManagement;
    }
    
    // 3. 考试管理相关
    if (path.includes('/exams') && !path.includes('/submit') && !path.includes('/submission') && !path.includes('/upload-answer')) {
      return MICROSERVICE_CONFIG.examManagement;
    }
    
    // 4. 提交相关（优先处理特定的提交上传）
    if (path.includes('/submit') || path.includes('/submission') || path.includes('/upload-answer')) {
      return MICROSERVICE_CONFIG.submission;
    }
    
    // 5. 阅卷相关
    if (path.includes('/grader/tasks') || path.includes('/grading') || path.includes('/graders')) {
      return MICROSERVICE_CONFIG.grading;
    }
    
    // 6. 成绩统计相关
    if (path.includes('/scores') || path.includes('/ranking') || path.includes('/dashboard') || 
        path.includes('/statistics') || path.includes('/history')) {
      return MICROSERVICE_CONFIG.scoreStatistics;
    }
    
    // 7. 区域管理相关
    if (path.includes('/regions') || path.includes('/provinces-schools') || path.includes('/region-change')) {
      return MICROSERVICE_CONFIG.regionManagement;
    }
    
    // 8. 文件存储相关（通用文件上传，排除特定提交上传和头像上传）
    if (path.includes('/files') || path.includes('/download') || path.includes('/images') ||
        (path.includes('/upload/file') || path.includes('/upload/document'))) {
      return MICROSERVICE_CONFIG.fileStorage;
    }
    
    // 9. 系统配置相关（仅匹配精确的系统配置路径 - 增强版精确匹配）
    if (path.startsWith('/api/admin/system/settings') || 
        path.startsWith('/api/admin/system/admins') || 
        path.startsWith('/api/system/settings') || 
        path.startsWith('/api/system/version')) {
      // 确保是明确的系统配置路径，排除所有上传相关
      if (!path.includes('upload') && !path.includes('files')) {
        return MICROSERVICE_CONFIG.systemConfig;
      }
    }
    
    // 根据角色前缀进行二级推断
    if (path.startsWith('/api/student/')) {
      // 独立学生账号相关请求优先级：自主提交 > 考试查看 > 成绩查看 > 地区变更 > 文件下载 > 个人资料管理
      if (path.includes('submit') || path.includes('submission')) return MICROSERVICE_CONFIG.submission;
      if (path.includes('exam') && !path.includes('score') && !path.includes('ranking')) return MICROSERVICE_CONFIG.examManagement;
      if (path.includes('score') || path.includes('ranking') || path.includes('dashboard')) return MICROSERVICE_CONFIG.scoreStatistics;
      if (path.includes('region-change')) return MICROSERVICE_CONFIG.regionManagement;
      if (path.includes('files/download')) return MICROSERVICE_CONFIG.fileStorage;
      return MICROSERVICE_CONFIG.userManagement; // 个人资料、密码等
    }
    
    if (path.startsWith('/api/coach/')) {
      // 教练相关请求优先级：代理提交管理 > 考试管理 > 成绩统计 > 非独立学生管理 > 地区变更 > 文件导出 > 用户管理
      if (path.includes('submission') || path.includes('upload-answer')) return MICROSERVICE_CONFIG.submission;
      if (path.includes('exam') && !path.includes('submission') && !path.includes('scores') && !path.includes('ranking')) return MICROSERVICE_CONFIG.examManagement;
      if (path.includes('score') || path.includes('statistics') || path.includes('ranking') || path.includes('dashboard') || path.includes('grades')) return MICROSERVICE_CONFIG.scoreStatistics;
      if (path.includes('students') && !path.includes('scores')) return MICROSERVICE_CONFIG.grading; // 非独立学生管理
      if (path.includes('region-change')) return MICROSERVICE_CONFIG.regionManagement;
      if (path.includes('exams') && (path.includes('export') || path.includes('statistics'))) return MICROSERVICE_CONFIG.fileStorage;
      return MICROSERVICE_CONFIG.userManagement; // 教练个人资料管理
    }
    
    if (path.startsWith('/api/grader/')) {
      // 阅卷员相关请求优先级：阅卷任务 > 成绩统计 > 文件 > 用户管理
      if (path.includes('task') || path.includes('submission')) return MICROSERVICE_CONFIG.grading;
      if (path.includes('statistics') || path.includes('history') || path.includes('dashboard')) return MICROSERVICE_CONFIG.scoreStatistics;
      if (path.includes('file') || path.includes('image')) return MICROSERVICE_CONFIG.fileStorage;
      return MICROSERVICE_CONFIG.userManagement;
    }
    
    if (path.startsWith('/api/admin/')) {
      // 管理员相关请求优先级：系统配置 > 用户管理 > 考试管理 > 阅卷管理 > 区域管理
      if (path.includes('system') || path.includes('settings')) return MICROSERVICE_CONFIG.systemConfig;
      if (path.includes('users') || path.includes('coach-students') || path.includes('student-registrations')) return MICROSERVICE_CONFIG.userManagement;
      if (path.includes('exam') && !path.includes('grading') && !path.includes('questions/scores')) return MICROSERVICE_CONFIG.examManagement;
      if (path.includes('grading') || path.includes('graders') || path.includes('questions/scores')) return MICROSERVICE_CONFIG.grading;
      if (path.includes('regions') || path.includes('change-requests')) return MICROSERVICE_CONFIG.regionManagement;
      if (path.includes('dashboard')) return MICROSERVICE_CONFIG.scoreStatistics;
      return MICROSERVICE_CONFIG.userManagement; // 默认用户管理
    }
    
    return null;
  }

  /**
   * 检查路径是否匹配
   * 支持多种匹配模式：
   * 1. 精确匹配：/api/auth/login
   * 2. 通配符匹配：/api/student/*
   * 3. 路径参数匹配：/api/admin/users/{userId}
   * 4. 复合路径参数：/api/grader/tasks/{taskId}/questions/{questionNumber}
   */
  private isPathMatch(requestPath: string, servicePaths: string[]): boolean {
    return servicePaths.some(servicePath => {
      // 1. 精确匹配
      if (servicePath === requestPath) {
        return true;
      }

      // 2. 通配符匹配（* 匹配任意字符）
      if (servicePath.includes('*')) {
        const pattern = servicePath.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}`);
        return regex.test(requestPath);
      }

      // 3. 路径参数匹配（处理 {param} 格式）
      if (servicePath.includes('{') && servicePath.includes('}')) {
        const pathPattern = this.convertPathParamsToRegex(servicePath);
        const regex = new RegExp(`^${pathPattern}$`);
        return regex.test(requestPath);
      }

      // 4. 前缀匹配（用于 API 路径分组）
      if (requestPath.startsWith(servicePath)) {
        return true;
      }

      return false;
    });
  }

  /**
   * 将路径参数模式转换为正则表达式
   * 例如：/api/users/{userId}/profile -> /api/users/([^/]+)/profile
   */
  private convertPathParamsToRegex(pathPattern: string): string {
    return pathPattern
      // 转义特殊字符
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // 将 \{param\} 替换为捕获组
      .replace(/\\{[^}]+\\}/g, '([^/]+)')
      // 将 \* 替换为 .*
      .replace(/\\\*/g, '.*');
  }

  /**
   * 智能路径匹配 - 按优先级排序
   * 优先级：精确匹配 > 路径参数匹配 > 前缀匹配 > 通配符匹配
   */
  private findBestMatch(requestPath: string): { service: MicroserviceConfig; serviceName: string } | null {
    const matches: Array<{ 
      service: MicroserviceConfig; 
      serviceName: string; 
      priority: number; 
      matchLength: number 
    }> = [];

    for (const [serviceName, config] of Object.entries(MICROSERVICE_CONFIG)) {
      for (const servicePath of config.paths) {
        let priority = 0;
        let matchLength = 0;

        // 精确匹配 - 最高优先级
        if (servicePath === requestPath) {
          priority = 4;
          // 为头像上传路径提供更高的优先级
          if (servicePath === '/api/upload/avatar') {
            priority = 5; // 确保头像上传被正确路由到文件服务
          }
          matchLength = servicePath.length;
        }
        // 路径参数匹配
        else if (servicePath.includes('{') && servicePath.includes('}')) {
          const pathPattern = this.convertPathParamsToRegex(servicePath);
          const regex = new RegExp(`^${pathPattern}$`);
          if (regex.test(requestPath)) {
            priority = 3;
            matchLength = servicePath.length;
          }
        }
        // 前缀匹配
        else if (requestPath.startsWith(servicePath) && !servicePath.includes('*')) {
          priority = 2;
          matchLength = servicePath.length;
        }
        // 通配符匹配
        else if (servicePath.includes('*')) {
          const pattern = servicePath.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}`);
          if (regex.test(requestPath)) {
            priority = 1;
            matchLength = servicePath.replace('*', '').length;
          }
        }

        if (priority > 0) {
          matches.push({
            service: config,
            serviceName,
            priority,
            matchLength
          });
        }
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // 按优先级和匹配长度排序，返回最佳匹配
    matches.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // 优先级高的在前
      }
      return b.matchLength - a.matchLength; // 匹配长度长的在前
    });

    return {
      service: matches[0].service,
      serviceName: matches[0].serviceName
    };
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

  /**
   * 构建带路径参数的 API URL
   * @param pathTemplate 路径模板，如 '/api/users/{userId}/profile'
   * @param params 路径参数，如 { userId: '123' }
   * @param queryParams 查询参数，如 { page: 1, size: 10 }
   */
  buildApiUrlWithParams(
    pathTemplate: string, 
    params: Record<string, string | number> = {}, 
    queryParams: Record<string, any> = {}
  ): string {
    // 替换路径参数
    let path = pathTemplate;
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`{${key}}`, String(value));
    });

    // 添加查询参数
    const queryString = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });

    const fullPath = queryString.toString() ? `${path}?${queryString.toString()}` : path;
    
    // 通过路由器获取完整 URL
    return this.buildApiUrl(fullPath);
  }

  /**
   * 验证路径参数是否完整
   * @param pathTemplate 路径模板
   * @param params 提供的参数
   */
  validatePathParams(pathTemplate: string, params: Record<string, any>): { isValid: boolean; missing: string[] } {
    const requiredParams = this.extractPathParams(pathTemplate);
    const missing = requiredParams.filter(param => !(param in params) || params[param] === undefined);
    
    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * 从路径模板中提取参数名
   * @param pathTemplate 如 '/api/users/{userId}/exams/{examId}'
   * @returns ['userId', 'examId']
   */
  private extractPathParams(pathTemplate: string): string[] {
    const matches = pathTemplate.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * 获取服务配置信息
   * @param serviceName 服务名称
   */
  getServiceConfig(serviceName: string): MicroserviceConfig | null {
    return MICROSERVICE_CONFIG[serviceName] || null;
  }

  /**
   * 获取所有服务配置
   */
  getAllServiceConfigs(): Record<string, MicroserviceConfig> {
    return { ...MICROSERVICE_CONFIG };
  }

  /**
   * 根据路径获取匹配的服务信息
   * @param apiPath API 路径
   */
  getMatchingServiceInfo(apiPath: string): { serviceName: string; config: MicroserviceConfig } | null {
    const normalizedPath = apiPath.split('?')[0];
    const bestMatch = this.findBestMatch(normalizedPath);
    
    if (bestMatch) {
      // 找到对应的服务名称
      for (const [serviceName, config] of Object.entries(MICROSERVICE_CONFIG)) {
        if (config === bestMatch.service) {
          return { serviceName, config };
        }
      }
    }
    
    return null;
  }
}

/**
 * 废弃API路径映射表 - v1.2.0 API规范统一化
 * 用于向后兼容，将旧路径自动重定向到新路径
 */
export const DEPRECATED_PATH_MAPPING: Record<string, string> = {
  // 密码修改API路径变更
  '/api/coach/profile/change-password': '/api/coach/password',
  '/api/grader/change-password': '/api/grader/password',
  
  // 地区变更API路径变更  
  '/api/coach/profile/change-region': '/api/coach/region-change',
  '/api/coach/profile/change-region-requests': '/api/coach/region-change/status',
  
  // 仪表板API路径变更
  '/api/student/dashboard': '/api/student/dashboard/stats',
  
  // 头像上传API路径修正为对应角色的profile API
  '/api/student/profile/upload-avatar': '/api/student/profile',
  '/api/coach/profile/upload-avatar': '/api/coach/profile',
  '/api/grader/upload-avatar': '/api/grader/profile',
  '/api/admin/profile/upload-avatar': '/api/admin/profile'
};

/**
 * 检查并转换废弃的API路径
 * @param path 原始API路径
 * @returns 转换后的新路径或原路径
 */
export function convertDeprecatedPath(path: string): string {
  // 检查是否为废弃路径
  if (DEPRECATED_PATH_MAPPING[path]) {
    console.warn(`[API路径警告] 使用了废弃的API路径: ${path}，建议迁移到新路径: ${DEPRECATED_PATH_MAPPING[path]}`);
    return DEPRECATED_PATH_MAPPING[path];
  }
  
  // 检查带参数的废弃路径（使用正则匹配）
  for (const [deprecatedPattern, newPattern] of Object.entries(DEPRECATED_PATH_MAPPING)) {
    const deprecatedRegex = new RegExp('^' + deprecatedPattern.replace(/\*/g, '.*') + '$');
    if (deprecatedRegex.test(path)) {
      const newPath = path.replace(deprecatedRegex, newPattern);
      console.warn(`[API路径警告] 使用了废弃的API路径模式: ${path}，建议迁移到新路径: ${newPath}`);
      return newPath;
    }
  }
  
  return path;
}

// 导出默认的微服务路由器实例
export const microserviceRouter = MicroserviceRouter.getInstance();
export default microserviceRouter;
