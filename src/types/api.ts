// 通用API类型定义
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
  protected static API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

  // 获取认证头
  protected static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // 统一错误处理
  protected static handleApiError(error: any, operation: string): never {
    console.error(`${operation}失败:`, error);
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
    url: string,
    options: RequestInit = {},
    operation: string
  ): Promise<ApiResponse<T>> {
    try {
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
      return this.handleApiError(error, operation);
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
