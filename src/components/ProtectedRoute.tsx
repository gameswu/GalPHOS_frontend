// 认证保护的高阶组件
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { apiClient } from '../utils/apiClient';

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
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userInfoStr = localStorage.getItem('userInfo');
      const token = localStorage.getItem('token');

      // 基础检查：是否有登录标记、用户信息和token
      if (!isLoggedIn || !userInfoStr || !token) {
        redirectToLogin();
        return;
      }

      // 验证token有效性
      const isTokenValid = await apiClient.validateToken();
      if (!isTokenValid) {
        redirectToLogin();
        return;
      }

      const userInfo = JSON.parse(userInfoStr);

      // 检查管理员权限
      if (adminOnly && userInfo.type !== 'admin') {
        redirectToLogin();
        return;
      }

      // 检查角色权限
      if (requiredRole && userInfo.role !== requiredRole) {
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
    // 清除认证数据
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');

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
