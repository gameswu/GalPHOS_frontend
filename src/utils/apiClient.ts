// 全局API客户端，处理token机制和错误处理
import { message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

class ApiClient {
  private static instance: ApiClient;

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // 获取认证头
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // 处理响应错误
  private async handleResponse(response: Response): Promise<any> {
    if (response.status === 401) {
      // Token过期或无效，清除本地数据并跳转登录页
      this.clearAuthData();
      message.error('登录已过期，请重新登录');
      
      // 判断是管理员还是普通用户，跳转到对应登录页
      const userInfo = localStorage.getItem('userInfo');
      const isAdmin = userInfo && JSON.parse(userInfo).type === 'admin';
      window.location.href = isAdmin ? '/admin-login' : '/login';
      
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  // 清除认证数据
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
  }

  // GET请求
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('GET请求失败:', error);
      throw error;
    }
  }

  // POST请求
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('POST请求失败:', error);
      throw error;
    }
  }

  // PUT请求
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PUT请求失败:', error);
      throw error;
    }
  }

  // DELETE请求
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('DELETE请求失败:', error);
      throw error;
    }
  }

  // 文件上传请求（不设置Content-Type，让浏览器自动设置）
  async uploadFile<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  // 验证Token有效性
  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await this.get('/auth/validate');
      return response.success;
    } catch (error) {
      console.error('Token验证失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const apiClient = ApiClient.getInstance();
export default apiClient;
