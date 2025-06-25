// 认证相关API接口
import { PasswordHasher } from '../utils/passwordHasher';

// TODO: 替换为真实的后端API地址
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

interface LoginRequest {
  role: 'coach' | 'student' | 'grader';
  username: string;
  password: string; // 前端会自动哈希化
}

interface RegisterRequest {
  role: 'coach' | 'student' | 'grader';
  username: string;
  phone: string;
  password: string; // 前端会自动哈希化
  confirmPassword: string; // 前端会自动哈希化
  province?: string;
  school?: string;
}

interface AdminLoginRequest {
  username: string;
  password: string; // 前端会自动哈希化
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

class AuthAPI {
  // 用户登录
  static async login(data: LoginRequest): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(data.password);
      
      const loginData = {
        ...data,
        password: hashedPassword
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('登录API调用失败:', error);
      throw error;
    }
  }

  // 用户注册
  static async register(data: RegisterRequest): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(data.password);
      
      const registerData = {
        ...data,
        password: hashedPassword,
        confirmPassword: hashedPassword // 确认密码也需要哈希
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('注册API调用失败:', error);
      throw error;
    }
  }

  // 获取省份和学校数据
  static async getProvincesAndSchools(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/regions/provinces-schools`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取省份学校数据失败:', error);
      throw error;
    }
  }

  // 验证token有效性
  static async validateToken(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Token验证失败:', error);
      throw error;
    }
  }

  // 用户登出
  static async logout(): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('登出API调用失败:', error);
      throw error;
    }
  }

  // 管理员登录
  static async adminLogin(data: { username: string; password: string }): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(data.password);
      
      const loginData = {
        ...data,
        password: hashedPassword
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('管理员登录API调用失败:', error);
      throw error;
    }
  }
}

export default AuthAPI;
export type { LoginRequest, RegisterRequest, AdminLoginRequest, ApiResponse };
