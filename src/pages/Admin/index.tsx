import React from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAdminLogic } from './hooks/useAdminLogic';
import { menuItems, getTitleByKey } from './config/menuConfig';
import AdminContent from './components/AdminContent';

const { Title, Text } = Typography;
const { Header, Content, Sider } = Layout;

const Admin: React.FC = () => {
  const {
    // 状态
    pendingUsers,
    approvedUsers,
    regions,
    exams,
    graders,
    gradingTasks,
    adminUsers,
    systemSettings,
    currentAdmin,
    loading,
    selectedKey,
    collapsed,
    isOffline,
    pendingCount,
    coachStudentsStats,
    // 方法
    handleApprove,
    handleReject,
    handleDisableUser,
    handleEnableUser,
    handleDeleteUser,
    handleLogout,
    handleMenuClick,
    setCollapsed,
    addProvince,
    addSchool,
    updateSchool,
    deleteSchool,
    deleteProvince,
    // 考试管理方法
    createExam,
    updateExam,
    publishExam,
    unpublishExam,
    deleteExam,
    uploadFile,
    deleteFile,
    // 分值设置方法
    setQuestionScores,
    getQuestionScores,
    updateSingleQuestionScore,
    // 阅卷管理方法
    assignGradingTask,
    getGradingProgress,
    updateGradingProgress,
    // 系统设置方法
    changeAdminPassword,
    updateAdminInfo,
    createAdmin,
    deleteAdmin,
    updateSystemSettings,
    uploadAvatar
  } = useAdminLogic();

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
          <Space>
            {/* 显示当前管理员头像 */}
            {currentAdmin && (
              <Space>
                <Avatar 
                  src={currentAdmin.avatar} 
                  icon={!currentAdmin.avatar && <UserOutlined />} 
                  size="small"
                  style={{ backgroundColor: !currentAdmin.avatar ? '#1890ff' : 'transparent' }}
                />
                <Text>{currentAdmin.username}</Text>
              </Space>
            )}
            <Button 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              type="text"
            >
              退出登录
            </Button>
          </Space>
        </Header>
        
        {/* 主要内容区域 */}
        <Content style={{ 
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <AdminContent
            selectedKey={selectedKey}
            pendingUsers={pendingUsers}
            approvedUsers={approvedUsers}
            regions={regions}
            exams={exams}
            graders={graders}
            gradingTasks={gradingTasks}
            adminUsers={adminUsers}
            systemSettings={systemSettings}
            currentAdmin={currentAdmin}
            pendingCount={pendingCount}
            loading={loading}
            isOffline={isOffline}
            coachStudentsStats={coachStudentsStats}
            onApprove={handleApprove}
            onReject={handleReject}
            onDisableUser={handleDisableUser}
            onEnableUser={handleEnableUser}
            onDeleteUser={handleDeleteUser}
            onAddProvince={addProvince}
            onAddSchool={addSchool}
            onUpdateSchool={updateSchool}
            onDeleteSchool={deleteSchool}
            onDeleteProvince={deleteProvince}
            onCreateExam={createExam}
            onUpdateExam={updateExam}
            onPublishExam={publishExam}
            onUnpublishExam={unpublishExam}
            onDeleteExam={deleteExam}
            onUploadFile={uploadFile}
            onDeleteFile={deleteFile}
            onSetQuestionScores={setQuestionScores}
            onGetQuestionScores={getQuestionScores}
            onUpdateSingleQuestionScore={updateSingleQuestionScore}
            onAssignGradingTask={assignGradingTask}
            onGetGradingProgress={getGradingProgress}
            onUpdateGradingProgress={updateGradingProgress}
            onChangeAdminPassword={changeAdminPassword}
            onUpdateAdmin={updateAdminInfo}
            onCreateAdmin={createAdmin}
            onDeleteAdmin={deleteAdmin}
            onUpdateSystemSettings={updateSystemSettings}
            onUploadAvatar={uploadAvatar}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;