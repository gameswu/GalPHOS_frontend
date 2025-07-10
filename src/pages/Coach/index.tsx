import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, message, Avatar } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCoachLogic } from './hooks/useCoachLogic';
import { authService } from '../../services/authService';
import { getCoachMenuItems, getTitleByKey } from './config/menuConfig';
import CoachContent from './components/CoachContent';



const { Title } = Typography;
const { Header, Content, Sider } = Layout;

interface UserInfo {
  username: string;
  role: 'coach';
  province?: string;
  school?: string;
  type: string;
  avatar?: string;
}

const Coach: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');


  const {
    loading,
    students,
    exams,
    provinces,
    selectedProvince,
    availableSchools,
    loadStudents,
    loadExams,
    loadProvinces,
    handleProvinceChange,
    handleAccountSettings,
    handleLogout: handleLogoutLogic,
    addStudent,
    updateStudent,
    deleteStudent,
    updateProfile,
    changePassword,
    requestRegionChange,
    submitExamAnswers,
    getExamSubmission,
    downloadFile,
    getExamDetail,
    uploadAnswerImage,
    getGradeReports,
    getDashboardStats,
    uploadAvatar
  } = useCoachLogic();

  // 系统设置加载已移除

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
      
      if (user.role !== 'coach') {
        message.error('当前用户不是教练角色');
        navigate('/login');
        return;
      }
      
      setUserInfo(user as UserInfo);
      loadStudents();
      loadExams();
      loadProvinces();
    };
    
    checkAuth();
  }, [navigate, loadStudents, loadExams, loadProvinces]);

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

  const menuItems = getCoachMenuItems();

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
          <img 
            src="/icon.png" 
            alt="GalPHOS Logo" 
            style={{ 
              height: '28px', 
              width: '28px', 
              marginRight: collapsed ? '0' : '8px' 
            }} 
          />
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              GalPHOS
            </Title>
          )}
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
                教练
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
          {/* 公告轮播已移除 */}
          
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
          {/* 使用前先检查deleteStudent函数是否可用 */}
          {(() => {
            console.log('🔍 检查 deleteStudent 函数', { 
              isDefined: !!deleteStudent,
              type: typeof deleteStudent,
              isFunction: typeof deleteStudent === 'function' 
            });
            return null;
          })()}
          
          <CoachContent
            selectedKey={selectedKey}
            userInfo={userInfo}
            loading={loading}
            students={students}
            exams={exams}
            provinces={provinces}
            selectedProvince={selectedProvince}
            availableSchools={availableSchools}
            onProvinceChange={handleProvinceChange}
            onAccountSettings={handleAccountSettings}
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
            updateProfile={updateProfile}
            changePassword={changePassword}
            requestRegionChange={requestRegionChange}
            onLogout={handleLogoutLogic}
            submitExamAnswers={submitExamAnswers}
            getExamSubmission={getExamSubmission}
            downloadFile={downloadFile}
            getExamDetail={getExamDetail}
            uploadAnswerImage={uploadAnswerImage}
            getGradeReports={getGradeReports}
            getDashboardStats={getDashboardStats}
            uploadAvatar={uploadAvatar}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Coach;
