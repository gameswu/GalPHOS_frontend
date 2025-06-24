import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDashboardLogic } from './hooks/useDashboardLogic';
import { getMenuItemsByRole, getTitleByKey } from './config/menuConfig';
import DashboardContent from './components/DashboardContent';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

interface UserInfo {
  username: string;
  role: 'coach' | 'student' | 'grader';
  province?: string;
  school?: string;
  type: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');

  const {
    // 状态
    loading,
    students,
    exams,
    gradingTasks,
    // 方法
    loadStudents,
    loadExams,
    loadGradingTasks,
    handleAccountSettings,
    handleLogout: handleLogoutLogic
  } = useDashboardLogic();

  // 检查登录状态和用户权限
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (!isLoggedIn || !userInfoStr) {
      message.error('请先登录');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userInfoStr) as UserInfo;
    if (user.type === 'admin') {
      message.error('管理员请使用管理员面板');
      navigate('/admin');
      return;
    }
    
    setUserInfo(user);
    
    // 根据角色设置默认选中的菜单项 - 修复类型错误
    const defaultKeys: Record<'coach' | 'student' | 'grader', string> = {
      coach: 'students',
      student: 'current-exam',
      grader: 'grading-tasks'
    };
    
    // 使用类型断言确保 user.role 是正确的类型
    const userRole = user.role as 'coach' | 'student' | 'grader';
    setSelectedKey(defaultKeys[userRole] || 'account');
    
    // 根据角色加载相应数据
    switch (userRole) {
      case 'coach':
        loadStudents();
        loadExams();
        break;
      case 'student':
        loadExams();
        break;
      case 'grader':
        loadGradingTasks();
        break;
      default:
        // 处理未知角色的情况
        console.warn('Unknown user role:', userRole);
        break;
    }
  }, [navigate, loadStudents, loadExams, loadGradingTasks]);

  // 菜单点击处理
  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
  };

  // 退出登录
  const handleLogout = () => {
    handleLogoutLogic();
    navigate('/login');
  };

  if (!userInfo) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px'
      }}>
        加载中...
      </div>
    );
  }

  const menuItems = getMenuItemsByRole(userInfo.role);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 1
        }}
      >
        {/* Logo区域 */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '16px'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'G' : 'GalPHOS'}
          </Title>
        </div>

        {/* 用户信息 */}
        {!collapsed && (
          <div style={{
            padding: '0 16px 16px',
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {userInfo.username}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {userInfo.role === 'coach' ? '教练' : 
               userInfo.role === 'student' ? '学生' : '阅卷者'}
            </div>
            {userInfo.province && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                {userInfo.province} - {userInfo.school}
              </div>
            )}
          </div>
        )}

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航 */}
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1
        }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {getTitleByKey(selectedKey)}
          </Title>
          <Button 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="text"
          >
            退出登录
          </Button>
        </Header>
        
        {/* 主要内容区域 */}
        <Content style={{ 
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <DashboardContent
            selectedKey={selectedKey}
            userInfo={userInfo}
            loading={loading}
            students={students}
            exams={exams}
            gradingTasks={gradingTasks}
            onAccountSettings={handleAccountSettings}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;