import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// 类型定义
export interface PendingUser {
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

// API服务
const apiService = {
  // 获取待审核用户列表
  async getPendingUsers(): Promise<PendingUser[]> {
    try {
      const response = await fetch('/api/admin/pending-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('获取数据失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      // 降级到本地存储
      return JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    }
  },

  // 审核用户
  async approveUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('审核失败');
      }
    } catch (error) {
      console.error('API error:', error);
      // 降级到本地存储操作
      this.fallbackApprove(userId);
    }
  },

  // 拒绝用户
  async rejectUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/reject-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('拒绝失败');
      }
    } catch (error) {
      console.error('API error:', error);
      // 降级到本地存储操作
      this.fallbackReject(userId);
    }
  },

  // 降级方案：本地存储操作
  fallbackApprove(userId: string) {
    const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const user = pendingUsers.find((u: PendingUser) => u.id === userId);
    if (user) {
      // 从待审核列表移除
      const updatedPending = pendingUsers.filter((u: PendingUser) => u.id !== userId);
      localStorage.setItem('pendingUsers', JSON.stringify(updatedPending));
      
      // 添加到已审核列表
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      approvedUsers.push({ ...user, status: 'approved', approvedAt: new Date().toISOString() });
      localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
    }
  },

  fallbackReject(userId: string) {
    const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const updatedPending = pendingUsers.map((u: PendingUser) => 
      u.id === userId ? { ...u, status: 'rejected' } : u
    );
    localStorage.setItem('pendingUsers', JSON.stringify(updatedPending));
  }
};

// 自定义Hook：管理员业务逻辑
export const useAdminLogic = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState('user');
  const [collapsed, setCollapsed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // 检查管理员权限
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      message.error('请先登录');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (user.type !== 'admin') {
      message.error('您没有管理员权限');
      navigate('/login');
      return;
    }
    
    loadPendingUsers();
  }, [navigate]);

  // 加载待审核用户
  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const users = await apiService.getPendingUsers();
      setPendingUsers(users);
      setIsOffline(false);
    } catch (error) {
      console.error('加载用户失败:', error);
      setIsOffline(true);
      message.warning('网络连接异常，已切换到离线模式');
      // 使用本地数据
      const localUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      setPendingUsers(localUsers);
    } finally {
      setLoading(false);
    }
  };

  // 审核通过
  const handleApprove = async (user: PendingUser) => {
    setLoading(true);
    try {
      await apiService.approveUser(user.id);
      message.success(`用户 ${user.username} 审核通过`);
      await loadPendingUsers();
    } catch (error) {
      message.error('审核失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 审核拒绝
  const handleReject = async (user: PendingUser) => {
    setLoading(true);
    try {
      await apiService.rejectUser(user.id);
      message.success(`用户 ${user.username} 审核拒绝`);
      await loadPendingUsers();
    } catch (error) {
      message.error('拒绝失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    message.success('退出登录成功');
    navigate('/login');
  };

  // 菜单点击处理
  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
    switch (key) {
      case 'region':
        message.info('赛区管理功能开发中...');
        break;
      case 'exam':
        message.info('考试管理功能开发中...');
        break;
      case 'user':
        loadPendingUsers();
        break;
      default:
        break;
    }
  };

  // 获取待审核用户数量
  const getPendingCount = () => {
    return pendingUsers.filter(u => u.status === 'pending').length;
  };

  return {
    // 状态
    pendingUsers,
    loading,
    selectedKey,
    collapsed,
    isOffline,
    // 计算值
    pendingCount: getPendingCount(),
    // 方法
    handleApprove,
    handleReject,
    handleLogout,
    handleMenuClick,
    setCollapsed,
    loadPendingUsers
  };
};