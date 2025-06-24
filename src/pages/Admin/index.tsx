import React from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAdminLogic } from './hooks/useAdminLogic';
import { menuItems, getTitleByKey } from './config/menuConfig';
import AdminContent from './components/AdminContent';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

const Admin: React.FC = () => {
  const {
    // 状态
    pendingUsers,
    loading,
    selectedKey,
    collapsed,
    isOffline,
    pendingCount,
    // 方法
    handleApprove,
    handleReject,
    handleLogout,
    handleMenuClick,
    setCollapsed
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
          <AdminContent
            selectedKey={selectedKey}
            pendingUsers={pendingUsers}
            pendingCount={pendingCount}
            loading={loading}
            isOffline={isOffline}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;