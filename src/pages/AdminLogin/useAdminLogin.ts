import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import AuthAPI from '../../api/auth';
import { authService } from '../../services/authService';

interface AdminLoginForm {
  username: string;
  password: string;
}

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 检查是否已经登录，如果是则重定向
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const userInfo = authService.getCurrentUser();
        if (userInfo?.type === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    
    checkLoginStatus();
  }, [navigate]);

  // 处理管理员登录
  const handleAdminLogin = async (values: AdminLoginForm) => {
    setLoading(true);
    try {
      console.log('管理员登录信息:', values);
      
      const response = await AuthAPI.adminLogin(values);
      if (response.success) {
        // 使用 authService 统一处理登录状态
        authService.setAuthData({
          ...response.data,
          type: 'admin'
        }, response.token || '');
        message.success('管理员登录成功！');
        navigate('/admin', { replace: true });
      } else {
        message.error(response.message || '管理员登录失败');
      }
    } catch (error) {
      message.error('登录失败，请检查网络连接或稍后重试');
      console.error('管理员登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 跳转到普通用户登录页面
  const handleGoToUserLogin = () => {
    navigate('/login');
  };

  return {
    // 状态
    form,
    loading,
    // 方法
    handleAdminLogin,
    handleBackToUserLogin: handleGoToUserLogin // 保持向后兼容
  };
};