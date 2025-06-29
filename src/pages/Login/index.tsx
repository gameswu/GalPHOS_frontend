import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import LoginUI from './LoginUI';
import AuthAPI from '../../api/auth';
import RegionAPI from '../../api/region';
import { authService } from '../../services/authService';

// 统一的类型定义 - 登录表单移除赛区字段
interface LoginForm {
  role: 'coach' | 'student' | 'grader';
  username: string;
  password: string;
  // 移除 province 和 school 字段
}

interface RegisterForm {
  role: 'coach' | 'student' | 'grader';
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  province?: string;
  school?: string;
}

interface PendingUser {
  id: string;
  role: 'coach' | 'student' | 'grader';
  username: string;
  phone: string;
  password: string;
  province?: string;
  school?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Province {
  id: string;
  name: string;
  schools: School[];
}

interface School {
  id: string;
  name: string;
}



// 自定义Hook
const useLogin = () => {
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  
  // 初始化数据和检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const userInfo = authService.getCurrentUser();
        if (userInfo?.type === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userInfo?.role) {
          // 根据角色跳转到对应页面
          const roleRoutes: Record<string, string> = {
            student: '/student',
            grader: '/grader',
            coach: '/coach'
          };
          navigate(roleRoutes[userInfo.role] || '/login', { replace: true });
        }
      }
    };
    
    checkLoginStatus();
    
    // 加载省份和学校数据
    loadProvincesData();
  }, [navigate]);

  // 验证注册赛区信息的函数（只用于注册）
  const validateRegionInfo = (role: string, province?: string, school?: string): boolean => {
    if (role !== 'grader' && (!province || !school)) {
      message.error('请选择省份和学校！');
      return false;
    }
    return true;
  };

  // 处理省份选择（只用于注册）
  const handleProvinceChange = (provinceId: string, formType: 'login' | 'register') => {
    // 登录时不需要处理省份变化
    if (formType === 'login') return;
    
    setSelectedProvince(provinceId);
    const province = provinces.find(p => p.id === provinceId);
    if (province) {
      setAvailableSchools(province.schools);
      registerForm.setFieldsValue({ school: undefined });
    }
  };

  // 处理登录
  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      console.log('登录信息:', values);
      
      const response = await AuthAPI.login(values);
      if (response.success) {
        // 使用 authService 统一处理登录状态
        authService.setAuthData(response.data, response.token || '');
        message.success('登录成功！');
        
        // 根据角色跳转到对应页面
        const roleRoutes: Record<string, string> = {
          student: '/student',
          grader: '/grader',
          coach: '/coach'
        };
        navigate(roleRoutes[values.role], { replace: true });
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请检查网络连接或稍后重试');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values: RegisterForm) => {
    if (!validateRegionInfo(values.role, values.province, values.school)) {
      return;
    }

    setLoading(true);
    try {
      console.log('注册信息:', values);
      
      const response = await AuthAPI.register(values);
      if (response.success) {
        message.success('注册申请已提交！请等待管理员审核');
        handleTabChange('login');
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error) {
      message.error('注册失败，请检查网络连接或稍后重试');
      console.error('注册错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重置表单和状态的通用函数
  const resetFormAndState = () => {
    setSelectedProvince('');
    setAvailableSchools([]);
  };

  // 标签切换
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
    if (activeKey === 'login') {
      registerForm.resetFields();
    } else {
      loginForm.resetFields();
    }
    resetFormAndState();
  };

  // 跳转到管理员登录
  const handleGoToAdminLogin = () => {
    navigate('/admin-login');
  };

  // 加载省份和学校数据
  const loadProvincesData = async () => {
    try {
      const response = await RegionAPI.getProvincesAndSchools();
      if (response.success && response.data) {
        setProvinces(response.data);
      } else {
        console.error('获取省份数据失败:', response.message);
        message.warning('获取省份数据失败，请刷新页面重试');
      }
    } catch (error) {
      console.error('加载省份数据失败:', error);
      message.warning('加载省份数据失败，请检查网络连接');
    }
  };

  return {
    // 状态
    loginForm,
    registerForm,
    loading,
    activeTab,
    provinces,
    selectedProvince,
    availableSchools,
    // 方法
    handleLogin,
    handleRegister,
    handleTabChange,
    handleGoToAdminLogin,
    handleProvinceChange
  };
};

// 主组件
const Login: React.FC = () => {
  const loginHookData = useLogin();

  return (
    <LoginUI
      {...loginHookData}
      onLogin={loginHookData.handleLogin}
      onRegister={loginHookData.handleRegister}
      onTabChange={loginHookData.handleTabChange}
      onAdminLogin={loginHookData.handleGoToAdminLogin}
      onProvinceChange={loginHookData.handleProvinceChange}
    />
  );
};

export default Login;