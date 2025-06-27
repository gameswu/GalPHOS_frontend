// 认证保护的高阶组件
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student' | 'coach' | 'grader';
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  adminOnly = false 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // 使用 authService 进行统一认证检查
      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        redirectToLogin();
        return;
      }

      const userInfo = authService.getCurrentUser();
      if (!userInfo) {
        redirectToLogin();
        return;
      }

      // 检查管理员权限
      if (adminOnly && !authService.isAdmin()) {
        redirectToLogin();
        return;
      }

      // 检查角色权限
      if (requiredRole && !authService.hasRole(requiredRole)) {
        redirectToLogin();
        return;
      }

      setAuthenticated(true);
    } catch (error) {
      console.error('认证检查失败:', error);
      redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const redirectToLogin = () => {
    // 使用 authService 清除认证数据
    authService.clearAuthData();

    // 根据是否需要管理员权限决定跳转页面
    if (adminOnly) {
      navigate('/admin-login', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="验证登录状态..." />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
