import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  // 检查用户是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userInfo = localStorage.getItem('userInfo');

  if (!isLoggedIn || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  // 如果指定了角色要求，检查用户角色
  if (requiredRole) {
    const user = JSON.parse(userInfo);
    if (user.type !== requiredRole) {
      // 根据用户角色重定向到对应页面
      const redirectTo = user.type === 'admin' ? '/admin' : '/dashboard';
      return <Navigate to={redirectTo} replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;