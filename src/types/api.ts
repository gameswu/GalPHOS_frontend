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
    const startTime = Date.now();
    console.log('🌐 API 请求开始', { 
      operation, 
      path, 
      method: options.method || 'GET',
      timestamp: new Date().toISOString()
    });
    
    try {
      const url = this.getApiUrl(path);
      const requestOptions = {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      };
      
      console.log('🌐 请求配置', { 
        url, 
        method: requestOptions.method,
        hasAuth: !!(requestOptions.headers as any)?.Authorization,
        headers: {
          ...(requestOptions.headers as any),
          Authorization: (requestOptions.headers as any)?.Authorization ? '[REDACTED]' : undefined
        }
      });
      
      const response = await fetch(url, requestOptions);
      const duration = Date.now() - startTime;
      
      console.log('🌐 HTTP 响应', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        duration: `${duration}ms`,
        operation
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌐 HTTP 错误响应', { 
          status: response.status, 
          statusText: response.statusText,
          errorText,
          operation 
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('🌐 API 响应成功', { 
        operation, 
        duration: `${duration}ms`,
        success: responseData.success,
        hasData: !!responseData.data
      });
      
      return responseData;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('🌐 API 请求异常', { 
        operation, 
        path,
        duration: `${duration}ms`,
        error 
      });
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

// ===================== 考试API请求类型 =====================
export interface CreateExamRequest {
  title: string;
  description: string; // 必需字段，与Exam接口保持一致
  startTime: string; // ISO格式字符串
  endTime: string; // ISO格式字符串
  duration: number; // 考试时长（分钟）
  totalScore: number;
  totalQuestions: number;
  questions: { number: number; score: number }[];
  status: 'draft' | 'published';
  instructions?: string;
}

export interface UpdateExamRequest {
  title?: string;
  description?: string; // 更新时可选
  startTime?: string; // ISO格式字符串
  endTime?: string; // ISO格式字符串
  duration?: number;
  totalScore?: number;
  totalQuestions?: number;
  questions?: { number: number; score: number }[];
  status?: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  instructions?: string;
}

// 时间格式验证辅助函数
export const validateISOString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString.includes('T');
};

// 时间格式转换辅助函数
export const ensureISOString = (date: Date | string | any): string => {
  // 处理空值
  if (!date) {
    throw new Error('Date value is required');
  }
  
  if (typeof date === 'string') {
    // 如果已经是字符串，验证格式并返回
    if (validateISOString(date)) {
      return date;
    }
    // 尝试解析字符串为Date再转换
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
    throw new Error('Invalid date string format');
  }
  if (date && typeof date.toISOString === 'function') {
    // 原生Date对象
    return date.toISOString();
  }
  if (date && typeof date.format === 'function') {
    // dayjs 对象
    return date.toDate().toISOString();
  }
  throw new Error('Invalid date format');
};

// 安全的时间格式转换函数（处理可能为空的值）
export const safeEnsureISOString = (date: Date | string | any | null | undefined): string | null => {
  try {
    return ensureISOString(date);
  } catch (error) {
    console.warn('Date conversion failed:', error);
    return null;
  }
};

// 验证时间范围的辅助函数
export const validateTimeRange = (startTime: any, endTime: any): { isValid: boolean; message?: string } => {
  if (!startTime || !endTime) {
    return { isValid: false, message: '请选择考试开始和结束时间' };
  }
  
  try {
    const start = ensureISOString(startTime);
    const end = ensureISOString(endTime);
    
    if (new Date(start) >= new Date(end)) {
      return { isValid: false, message: '结束时间必须晚于开始时间' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, message: '时间格式无效' };
  }
};
