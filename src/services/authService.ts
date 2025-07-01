// 统一认证服务，处理所有认证相关逻辑
import { message } from 'antd';
import { apiClient } from '../utils/apiClient';

interface AuthUser {
  id: string;
  username: string;
  role: 'student' | 'coach' | 'grader' | 'admin';
  type?: 'admin' | 'user';
  province?: string;
  school?: string;
  avatar?: string;
  phone?: string;
}

interface TokenValidationResult {
  valid: boolean;
  error?: 'NO_TOKEN' | 'TOKEN_EXPIRED' | 'NETWORK_ERROR' | 'INVALID_TOKEN';
}

class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 检查用户是否已登录（同时验证localStorage和Token）
   * 区分网络错误和认证错误，提供更好的用户体验
   */
  async isAuthenticated(): Promise<boolean> {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    // 基础检查：本地存储是否完整
    if (!isLoggedIn || !token || !userInfo) {
      this.clearAuthData();
      return false;
    }

    // Token验证
    const tokenResult = await this.validateToken();
    
    switch (tokenResult.error) {
      case 'NO_TOKEN':
      case 'TOKEN_EXPIRED':
      case 'INVALID_TOKEN':
        // 认证错误，清除数据并要求重新登录
        this.clearAuthData();
        return false;
        
      case 'NETWORK_ERROR':
        // 网络错误，暂时信任本地状态，但显示警告
        console.warn('网络连接异常，使用离线模式');
        return true;
        
      default:
        // 验证成功
        return tokenResult.valid;
    }
  }

  /**
   * 验证Token有效性
   * 返回详细的验证结果，包括错误类型
   */
  async validateToken(): Promise<TokenValidationResult> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { valid: false, error: 'NO_TOKEN' };
      }

      // 使用微服务路由器获取正确的API URL
      const microserviceRouterModule = await import('./microserviceRouter');
      const microserviceRouter = microserviceRouterModule.microserviceRouter;
      const url = microserviceRouter.buildApiUrl('/api/auth/validate');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        return { valid: false, error: 'TOKEN_EXPIRED' };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return { 
        valid: result.success,
        error: result.success ? undefined : 'INVALID_TOKEN'
      };
    } catch (error) {
      console.error('Token验证网络错误:', error);
      return { valid: false, error: 'NETWORK_ERROR' };
    }
  }

  /**
   * 清除所有认证数据
   */
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): AuthUser | null {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * 设置用户认证信息
   */
  setAuthData(userData: AuthUser, token: string): void {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem('token', token);
  }

  /**
   * 获取当前认证 token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * 检查用户是否具有指定角色
   */
  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === requiredRole;
  }

  /**
   * 检查是否为管理员
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.type === 'admin' || user?.role === 'admin';
  }

  /**
   * 检查用户权限
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // 管理员拥有所有权限
    if (this.isAdmin()) return true;

    // 根据角色和权限进行检查
    const rolePermissions: Record<string, string[]> = {
      coach: ['manage_students', 'view_exams', 'submit_answers'],
      student: ['view_exams', 'submit_answers'],
      grader: ['grade_papers', 'view_grading_tasks']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  }

  /**
   * 获取用户角色显示名称
   */
  getRoleDisplayName(role?: string): string {
    const roleNames: Record<string, string> = {
      admin: '管理员',
      coach: '教练',
      student: '学生',
      grader: '阅卷员'
    };
    
    const userRole = role || this.getCurrentUser()?.role;
    return roleNames[userRole || ''] || '未知角色';
  }

  /**
   * 安全登出
   */
  async logout(): Promise<void> {
    try {
      // 调用服务器端登出API
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('服务器端登出失败:', error);
    } finally {
      // 无论服务器端是否成功，都清除本地数据
      this.clearAuthData();
    }
  }

  /**
   * 删除当前用户账号
   * @returns 操作结果
   */
  async deleteAccount(): Promise<{success: boolean; message: string}> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        return { success: false, message: '未找到用户信息' };
      }

      let endpoint = '';
      switch (user.role) {
        case 'student':
          endpoint = '/student/account/delete';
          break;
        case 'coach':
          endpoint = '/coach/account/delete';
          break;
        case 'grader':
          endpoint = '/grader/account/delete';
          break;
        default:
          return { success: false, message: '不支持当前用户角色的账号注销' };
      }
      
      const response = await apiClient.post(endpoint);
      
      if (response.success) {
        // 删除成功后，清除本地认证数据
        this.clearAuthData();
        return { success: true, message: '账号注销成功' };
      } else {
        return { success: false, message: response.message || '账号注销失败' };
      }
    } catch (error) {
      console.error('账号注销失败:', error);
      return { success: false, message: '账号注销请求发生错误' };
    }
  }

  /**
   * 获取用户头像URL
   */
  getUserAvatar(): string {
    const user = this.getCurrentUser();
    return user?.avatar || '/default-avatar.png';
  }

  /**
   * 检查会话是否即将过期（基于token时间戳）
   */
  isSessionExpiringSoon(): boolean {
    try {
      const token = localStorage.getItem('token');
      if (!token) return true;

      // 解析JWT token的payload部分
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;

      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // JWT exp是秒，转换为毫秒
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // 如果30分钟内过期，则认为即将过期
      return timeUntilExpiry < 30 * 60 * 1000;
    } catch (error) {
      console.error('检查token过期时间失败:', error);
      return true;
    }
  }
}

// 导出单例实例
export const authService = AuthService.getInstance();
export type { AuthUser, TokenValidationResult };
export default authService;
