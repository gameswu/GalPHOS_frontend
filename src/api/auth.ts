// 认证相关API接口
import { PasswordHasher } from '../utils/passwordHasher';
import { ApiResponse, BaseAPI } from '../types/api';

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

class AuthAPI extends BaseAPI {
  // 用户登录
  static async login(data: LoginRequest): Promise<ApiResponse<any>> {
    try {
      // 验证必填字段
      this.validateRequired(data.username, '用户名');
      this.validateRequired(data.password, '密码');
      this.validateRequired(data.role, '角色');

      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(data.password);
      
      const loginData = {
        ...data,
        password: hashedPassword
      };
      
      return await this.makeRequest<any>(
        `/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify(loginData),
        },
        '用户登录'
      );
    } catch (error) {
      return this.handleApiError(error, '用户登录');
    }
  }

  // 用户注册
  static async register(data: RegisterRequest): Promise<ApiResponse<any>> {
    try {
      // 验证必填字段
      this.validateRequired(data.username, '用户名');
      this.validateRequired(data.phone, '手机号');
      this.validateRequired(data.password, '密码');
      this.validateRequired(data.confirmPassword, '确认密码');
      this.validateRequired(data.role, '角色');

      // 验证密码一致性
      if (data.password !== data.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      // 验证密码强度
      if (data.password.length < 6) {
        throw new Error('密码长度不能少于6位');
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new Error('手机号格式不正确');
      }
      
      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(data.password);
      
      const registerData = {
        ...data,
        password: hashedPassword,
        confirmPassword: hashedPassword // 确认密码也需要哈希
      };
      
      return await this.makeRequest<any>(
        `/api/auth/register`,
        {
          method: 'POST',
          body: JSON.stringify(registerData),
        },
        '用户注册'
      );
    } catch (error) {
      return this.handleApiError(error, '用户注册');
    }
  }

  // 获取省份和学校数据
  static async getProvincesAndSchools(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/regions/provinces-schools`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        '获取省份学校数据'
      );
    } catch (error) {
      return this.handleApiError(error, '获取省份学校数据');
    }
  }

  // 验证token有效性
  static async validateToken(token: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(token, 'Token');

      return await this.makeRequest<any>(
        `/api/auth/validate`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        'Token验证'
      );
    } catch (error) {
      return this.handleApiError(error, 'Token验证');
    }
  }

  // 用户登出
  static async logout(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/auth/logout`,
        {
          method: 'POST',
        },
        '用户登出'
      );
    } catch (error) {
      return this.handleApiError(error, '用户登出');
    }
  }

  // 管理员登录
  static async adminLogin(data: { username: string; password: string }): Promise<ApiResponse<any>> {
    try {
      // 验证必填字段
      this.validateRequired(data.username, '用户名');
      this.validateRequired(data.password, '密码');

      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(data.password);
      
      const loginData = {
        ...data,
        password: hashedPassword
      };
      
      return await this.makeRequest<any>(
        `/api/auth/admin-login`,
        {
          method: 'POST',
          body: JSON.stringify(loginData),
        },
        '管理员登录'
      );
    } catch (error) {
      return this.handleApiError(error, '管理员登录');
    }
  }
}

export default AuthAPI;
export type { LoginRequest, RegisterRequest, AdminLoginRequest };
