import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import LoginUI from './LoginUI';

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

// 模拟省份和学校数据
const mockProvinceData: Province[] = [
  {
    id: '1',
    name: '北京市',
    schools: [
      { id: '1-1', name: '清华大学' },
      { id: '1-2', name: '北京大学' },
      { id: '1-3', name: '中国人民大学' },
      { id: '1-4', name: '北京师范大学' },
      { id: '1-5', name: '北京理工大学' }
    ]
  },
  {
    id: '2',
    name: '上海市',
    schools: [
      { id: '2-1', name: '复旦大学' },
      { id: '2-2', name: '上海交通大学' },
      { id: '2-3', name: '同济大学' },
      { id: '2-4', name: '华东师范大学' },
      { id: '2-5', name: '上海大学' }
    ]
  },
  {
    id: '3',
    name: '广东省',
    schools: [
      { id: '3-1', name: '中山大学' },
      { id: '3-2', name: '华南理工大学' },
      { id: '3-3', name: '暨南大学' },
      { id: '3-4', name: '深圳大学' },
      { id: '3-5', name: '南方科技大学' }
    ]
  },
  {
    id: '4',
    name: '江苏省',
    schools: [
      { id: '4-1', name: '南京大学' },
      { id: '4-2', name: '东南大学' },
      { id: '4-3', name: '苏州大学' },
      { id: '4-4', name: '南京理工大学' },
      { id: '4-5', name: '南京师范大学' }
    ]
  },
  {
    id: '5',
    name: '浙江省',
    schools: [
      { id: '5-1', name: '浙江大学' },
      { id: '5-2', name: '杭州电子科技大学' },
      { id: '5-3', name: '浙江工业大学' },
      { id: '5-4', name: '宁波大学' },
      { id: '5-5', name: '浙江师范大学' }
    ]
  }
];

// 预置测试账户数据
const initializeTestAccounts = () => {
  const existingApprovedUsers = localStorage.getItem('approvedUsers');
  
  // 如果没有已审核用户，则初始化测试账户
  if (!existingApprovedUsers) {
    const testAccounts = [
      {
        id: 'test-coach-001',
        role: 'coach',
        username: 'coach001',
        phone: '13800138001',
        password: '123456',
        province: '1', // 北京市
        school: '1-1', // 清华大学
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z',
        approvedAt: '2024-01-01T01:00:00.000Z'
      },
      {
        id: 'test-student-001',
        role: 'student',
        username: 'student001',
        phone: '13800138002',
        password: '123456',
        province: '2', // 上海市
        school: '2-1', // 复旦大学
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z',
        approvedAt: '2024-01-01T01:00:00.000Z'
      },
      {
        id: 'test-student-002',
        role: 'student',
        username: 'student002',
        phone: '13800138003',
        password: '123456',
        province: '3', // 广东省
        school: '3-1', // 中山大学
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z',
        approvedAt: '2024-01-01T01:00:00.000Z'
      },
      {
        id: 'test-grader-001',
        role: 'grader',
        username: 'grader001',
        phone: '13800138004',
        password: '123456',
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z',
        approvedAt: '2024-01-01T01:00:00.000Z'
      }
    ];
    
    localStorage.setItem('approvedUsers', JSON.stringify(testAccounts));
    console.log('已初始化测试账户数据');
  }
};

// 自定义Hook
const useLogin = () => {
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [provinces] = useState<Province[]>(mockProvinceData);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  
  // 初始化测试账户和检查登录状态
  useEffect(() => {
    // 初始化测试账户
    initializeTestAccounts();
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userInfo = localStorage.getItem('userInfo');
    
    if (isLoggedIn && userInfo) {
      const user = JSON.parse(userInfo);
      navigate(user.type === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
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

  // 处理登录 - 添加调试信息
  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      console.log('登录信息:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      console.log('已审核用户列表:', approvedUsers);
      
      const user = approvedUsers.find((u: any) => 
        u.username === values.username && 
        u.password === values.password &&
        u.role === values.role
      );
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify({
          username: values.username,
          role: values.role,
          // 从已保存的用户信息中获取赛区数据
          province: user.province,
          school: user.school,
          type: 'user'
        }));
        message.success('登录成功！');
        navigate('/dashboard', { replace: true });
      } else {
        const pendingUsers: PendingUser[] = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const pendingUser = pendingUsers.find(u => 
          u.username === values.username && u.role === values.role
        );
        
        if (pendingUser) {
          const statusMessages = {
            pending: '您的账号正在等待管理员审核，请耐心等待',
            rejected: '您的注册申请已被拒绝，请联系管理员'
          };
          const messageType = pendingUser.status === 'pending' ? 'warning' : 'error';
          message[messageType](statusMessages[pendingUser.status as keyof typeof statusMessages]);
        } else {
          message.error('用户名、密码或角色信息错误！');
        }
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理注册 - 依然需要验证赛区信息
  const handleRegister = async (values: RegisterForm) => {
    if (!validateRegionInfo(values.role, values.province, values.school)) {
      return;
    }

    setLoading(true);
    try {
      console.log('注册信息:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pendingUsers: PendingUser[] = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      
      // 只检查用户名和手机号是否重复
      const existingUser = [...pendingUsers, ...approvedUsers].find(
        (u: any) => u.username === values.username || u.phone === values.phone
      );
      
      if (existingUser) {
        if (existingUser.username === values.username) {
          message.error('用户名已存在！');
        } else {
          message.error('手机号已存在！');
        }
        return;
      }
      
      const newUser: PendingUser = {
        id: Date.now().toString(),
        role: values.role,
        username: values.username,
        phone: values.phone,
        password: values.password,
        province: values.province,
        school: values.school,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const updatedPendingUsers = [...pendingUsers, newUser];
      localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
      
      message.success('注册申请已提交！请等待管理员审核，审核通过后即可登录');
      handleTabChange('login');
      
    } catch (error) {
      message.error('注册失败，请稍后重试');
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