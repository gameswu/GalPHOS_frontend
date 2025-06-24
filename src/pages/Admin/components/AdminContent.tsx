import React from 'react';
import { Card, Typography, Table } from 'antd';
import { 
  GlobalOutlined, 
  BookOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { createColumns } from '../config/tableConfig';
import type { PendingUser } from '../hooks/useAdminLogic';

const { Title, Text } = Typography;

interface AdminContentProps {
  selectedKey: string;
  pendingUsers: PendingUser[];
  pendingCount: number;
  loading: boolean;
  isOffline: boolean;
  onApprove: (user: PendingUser) => void;
  onReject: (user: PendingUser) => void;
}

// 离线状态提示组件
const OfflineNotice: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div style={{ 
      background: '#fff7e6', 
      border: '1px solid #ffd666',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      textAlign: 'center'
    }}>
      <Text type="warning">
        ⚠️ 当前处于离线模式，数据可能不是最新的。请检查网络连接。
      </Text>
    </div>
  );
};

// 占位页面组件
const PlaceholderPage: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <Card>
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }}>
        {icon}
      </div>
      <Title level={3}>{title}</Title>
      <Text type="secondary">{description}</Text>
    </div>
  </Card>
);

// 用户管理页面组件
const UserManagementPage: React.FC<{
  pendingUsers: PendingUser[];
  pendingCount: number;
  loading: boolean;
  isOffline: boolean;
  onApprove: (user: PendingUser) => void;
  onReject: (user: PendingUser) => void;
}> = ({ pendingUsers, pendingCount, loading, isOffline, onApprove, onReject }) => {
  const columns = createColumns(onApprove, onReject);
  
  return (
    <Card>
      <OfflineNotice show={isOffline} />
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>
          <TeamOutlined style={{ marginRight: 8 }} />
          用户注册审核
        </Title>
        <Text type="secondary">
          待审核用户数量: <Text strong>{pendingCount}</Text>
        </Text>
      </div>
      
      <Table
        columns={columns}
        dataSource={pendingUsers}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </Card>
  );
};

// 主内容组件
const AdminContent: React.FC<AdminContentProps> = ({
  selectedKey,
  pendingUsers,
  pendingCount,
  loading,
  isOffline,
  onApprove,
  onReject
}) => {
  switch (selectedKey) {
    case 'region':
      return (
        <PlaceholderPage
          icon={<GlobalOutlined />}
          title="赛区管理"
          description="赛区管理功能正在开发中，敬请期待..."
        />
      );
    case 'exam':
      return (
        <PlaceholderPage
          icon={<BookOutlined />}
          title="考试管理"
          description="考试管理功能正在开发中，敬请期待..."
        />
      );
    case 'user':
    default:
      return (
        <UserManagementPage
          pendingUsers={pendingUsers}
          pendingCount={pendingCount}
          loading={loading}
          isOffline={isOffline}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
  }
};

export default AdminContent;