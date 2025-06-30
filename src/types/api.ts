// 通用API类型定义
import { microserviceRouter } from '../services/microserviceRouter';

// 定义全局通知函数类型
type NotificationFunction = (message: string, title?: string, duration?: number) => void;

// 全局通知实例（会在App初始化时设置）
let globalNotificationMethods: {
  showError?: NotificationFunction;
} = {};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

// 通用API基础类
export class BaseAPI {
  // 设置全局通知方法（在App初始化时调用）
  public static setGlobalNotificationMethods(methods: {
    showError?: NotificationFunction;
    showSuccess?: NotificationFunction;
    showWarning?: NotificationFunction;
    showInfo?: NotificationFunction;
  }): void {
    globalNotificationMethods = methods;
  }

  // 获取认证头
  protected static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // 获取完整API URL（通过微服务路由）
  protected static getApiUrl(path: string): string {
    return microserviceRouter.buildApiUrl(path);
  }

  // 统一错误处理
  protected static handleApiError(error: any, operation: string): never {
    console.error(`${operation}失败:`, error);
    
    // 提取错误消息
    let errorMessage = '请求失败，请稍后重试';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // 显示全局错误通知
    console.log('globalNotificationMethods:', globalNotificationMethods); // 调试信息
    if (globalNotificationMethods.showError) {
      console.log('显示错误通知:', errorMessage, operation); // 调试信息
      globalNotificationMethods.showError(errorMessage, operation);
    } else {
      console.warn('globalNotificationMethods.showError未设置'); // 调试信息
    }

    if (error.response?.status === 401 || (error.message && error.message.includes('401'))) {
      // Token过期，清除本地存储并跳转登录页
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      const userInfo = localStorage.getItem('userInfo');
      const isAdmin = userInfo && JSON.parse(userInfo).type === 'admin';
      window.location.href = isAdmin ? '/admin-login' : '/login';
    }
    throw error;
  }

  // 统一请求处理
  protected static async makeRequest<T>(
    path: string,
    options: RequestInit = {},
    operation: string
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.getApiUrl(path);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.handleApiError(error, operation);
      // 这行永远不会执行，因为handleApiError会抛出异常
      // 但为了满足TypeScript，我们需要返回一个值
      throw error;
    }
  }

  // 构建查询参数
  protected static buildQueryParams(params?: Record<string, any>): string {
    if (!params) return '';
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return queryParams.toString() ? `?${queryParams.toString()}` : '';
  }

  // 验证必填参数
  protected static validateRequired(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName}不能为空`);
    }
  }
}
