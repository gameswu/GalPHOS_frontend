import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, message, Avatar } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStudentLogic } from './hooks/useStudentLogic';
import { authService } from '../../services/authService';
import { getStudentMenuItems, getTitleByKey } from './config/menuConfig';
import StudentContent from './components/StudentContent';
import SystemAnnouncementCarousel from '../../components/SystemAnnouncementCarousel';
import { SystemSettings } from '../../types/common';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

interface UserInfo {
  username: string;
  role: 'student';
  province?: string;
  school?: string;
  type: string;
  avatar?: string;
}

const Student: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  const {
    loading,
    exams,
    dashboardData,
    loadExams,
    loadDashboardData,
    handleAccountSettings,
    handleLogout: handleLogoutLogic,
    deleteAccount,
    updateProfile,
    changePassword,
    requestRegionChange,
    submitExamAnswers,
    getExamSubmission,
    downloadFile,
    uploadAnswerImage,
    uploadAvatar,
    getRegionChangeStatus
  } = useStudentLogic();

  // 获取系统设置
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const { systemConfig } = await import('../../utils/systemConfig');
        const settings = await systemConfig.fetchSystemSettings();
        if (settings) {
          setSystemSettings(settings);
        }
      } catch (error) {
        console.error('加载系统设置失败:', error);
      }
    };
    
    loadSystemSettings();
  }, []);

  // 检查登录状态和用户权限
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      const user = authService.getCurrentUser();
      if (!user) {
        message.error('获取用户信息失败');
        navigate('/login');
        return;
      }
      
      if (user.type === 'admin') {
        message.error('管理员请使用管理员面板');
        navigate('/admin');
        return;
      }
      
      if (user.role !== 'student') {
        message.error('当前用户不是学生角色');
        navigate('/login');
        return;
      }
      
      setUserInfo(user as UserInfo);
      loadExams();
      loadDashboardData();
    };
    
    checkAuth();
  }, [navigate, loadExams, loadDashboardData]);

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

  const menuItems = getStudentMenuItems();

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
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                <Avatar 
                  src={userInfo.avatar} 
                  size={48} 
                  icon={<UserOutlined />}
                  style={{ 
                    border: '2px solid #1890ff',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div className="user-name" style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {userInfo.username}
              </div>
              <div className="user-role" style={{ fontSize: '12px', color: '#666' }}>
                学生
              </div>
              {userInfo.province && (
                <div className="user-location" style={{ fontSize: '12px', color: '#999' }}>
                  {userInfo.province} - {userInfo.school}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 折叠时的用户头像 */}
        {collapsed && (
          <div style={{
            padding: '8px',
            display: 'flex',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '16px'
          }}>
            <Avatar 
              src={userInfo.avatar} 
              size={32} 
              icon={<UserOutlined />}
              style={{ 
                border: '1px solid #1890ff',
                objectFit: 'cover'
              }}
            />
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
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1
        }}>
          {/* 公告轮播 */}
          <SystemAnnouncementCarousel systemSettings={systemSettings} />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0 0 10px'
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
          </div>
        </Header>
        
        {/* 主要内容区域 */}
        <Content style={{ 
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <StudentContent
            selectedKey={selectedKey}
            userInfo={userInfo}
            loading={loading}
            exams={exams}
            dashboardData={dashboardData}
            onAccountSettings={handleAccountSettings}
            updateProfile={updateProfile}
            changePassword={changePassword}
            requestRegionChange={requestRegionChange}
            onLogout={handleLogoutLogic}
            onDeleteAccount={deleteAccount}
            submitExamAnswers={submitExamAnswers}
            getExamSubmission={getExamSubmission}
            downloadFile={downloadFile}
            uploadAnswerImage={uploadAnswerImage}
            uploadAvatar={uploadAvatar}
            getRegionChangeStatus={getRegionChangeStatus}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Student;
