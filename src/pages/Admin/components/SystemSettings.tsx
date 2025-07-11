import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Tabs,
  Switch,
  Divider,
  List,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Descriptions,
  Alert,
  Table,
  Avatar,
  Popconfirm,
  Upload,
  Select
} from 'antd';
import {
  SettingOutlined,
  ExclamationCircleOutlined,
  SoundOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  UploadOutlined,
  LockOutlined,
  ReloadOutlined,
  GithubOutlined,
  HeartOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import type { 
  SystemSettings as SystemSettingsType,
  AdminUser,
  AdminCreateData,
  PasswordChangeData
} from '../../../types/common';
import './SystemSettings.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea, Password } = Input;
const { Option } = Select;

interface SystemSettingsProps {
  systemSettings: SystemSettingsType | null;
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  loading: boolean;
  onUpdateSystemSettings: (settings: Partial<SystemSettingsType>) => Promise<void>;
  onCreateAdmin: (adminData: AdminCreateData) => Promise<void>;
  onUpdateAdmin: (adminId: string, adminData: Partial<AdminUser>) => Promise<void>;
  onUpdateProfile: (profileData: { username: string; avatar?: string }) => Promise<void>;
  onDeleteAdmin: (adminId: string) => Promise<void>;
  onResetAdminPassword: (adminId: string, newPassword: string) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
}

// 系统信息常量（硬编码）
const SYSTEM_INFO = {
  systemName: 'GalPHOS 考试管理系统',
  version: 'v1.3.0',
  buildTime: '2025-7-1 01:15:00',
  developers: [
    'gameswu',
    'X-02Y', 
    'laoli006'
  ],
  repositories: {
    frontend: 'https://github.com/gameswu/GalPHOS_frontend',
    backend: 'https://github.com/X-02Y/GalPHOS_backend/'
  },
  supporters: [
    '小夜',
    'SuddeИ',
    '岭华廷阳',
    'Zzz',
    '东方地灵殿 全体'
  ],
  description: '基于微服务架构的现代化考试管理平台'
};

const SystemSettings: React.FC<SystemSettingsProps> = ({
  systemSettings,
  adminUsers,
  currentAdmin,
  loading,
  onUpdateSystemSettings,
  onCreateAdmin,
  onUpdateAdmin,
  onUpdateProfile,
  onDeleteAdmin,
  onResetAdminPassword,
  onUploadAvatar
}) => {
  const [form] = Form.useForm();
  const [adminForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // 初始化当前管理员信息表单
  useEffect(() => {
    if (currentAdmin) {
      profileForm.setFieldsValue({
        username: currentAdmin.username,
        role: currentAdmin.role
      });
    }
  }, [currentAdmin, profileForm]);

  // 管理员个人信息更新
  const handleUpdateProfile = async (values: any) => {
    try {
      if (!currentAdmin) return;
      await onUpdateProfile({
        username: values.username
      });
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('个人信息更新失败');
    }
  };

  // 管理员管理相关函数
  const handleCreateAdmin = async (values: any) => {
    try {
      await onCreateAdmin({
        username: values.username,
        password: values.password,
        role: 'admin'
      });
      message.success('管理员创建成功');
      setAdminModalVisible(false);
      adminForm.resetFields();
    } catch (error) {
      message.error('管理员创建失败');
    }
  };

  const handleUpdateAdmin = async (values: any) => {
    if (!editingAdmin) return;
    
    try {
      await onUpdateAdmin(editingAdmin.id, {
        status: values.status
      });
      message.success('管理员信息更新成功');
      setAdminModalVisible(false);
      setEditingAdmin(null);
      adminForm.resetFields();
    } catch (error) {
      message.error('管理员信息更新失败');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await onDeleteAdmin(adminId);
      message.success('管理员删除成功');
    } catch (error) {
      message.error('管理员删除失败');
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      await onResetAdminPassword(selectedAdminId, values.newPassword);
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      setSelectedAdminId('');
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败');
    }
  };

  // 管理员操作
  const handleEditAdmin = async (admin: AdminUser) => {
    try {
      // 直接切换用户状态，不再显示模态框
      const newStatus = admin.status === 'active' ? 'disabled' : 'active';
      await onUpdateAdmin(admin.id, {
        status: newStatus
      });
      message.success(`管理员已${newStatus === 'active' ? '启用' : '禁用'}`);
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    adminForm.resetFields();
    setAdminModalVisible(true);
  };

  // 重置密码
  const handleResetPassword = (adminId: string) => {
    setSelectedAdminId(adminId);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // 头像上传
  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarUploading(true);
      const avatarUrl = await onUploadAvatar(file);
      if (currentAdmin) {
        await onUpdateProfile({ username: currentAdmin.username, avatar: avatarUrl });
        message.success('头像上传成功');
      }
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setAvatarUploading(false);
    }
  };

  // 所有公告相关方法已删除

  return (
    <div className="system-settings">
      <Tabs defaultActiveKey="admin" size="large">
        {/* 管理员 Tab */}
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              管理员
            </span>
          }
          key="admin"
        >
          {/* 个人资料卡片 */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>
              <UserOutlined style={{ marginRight: 8 }} />
              个人资料
            </Title>
            
            <Row gutter={24}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={120} 
                    src={currentAdmin?.avatar} 
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  <br />
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleAvatarUpload(file);
                      return false;
                    }}
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={avatarUploading}
                      size="small"
                    >
                      更换头像
                    </Button>
                  </Upload>
                </div>
              </Col>
              <Col span={18}>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        label="用户名" 
                        name="username" 
                        rules={[
                          { required: true, message: '请输入用户名' },
                          { min: 3, message: '用户名至少3个字符' },
                          { max: 20, message: '用户名不能超过20个字符' }
                        ]}
                      >
                        <Input placeholder="请输入用户名" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="角色">
                        <Input 
                          value={currentAdmin?.role === 'super_admin' ? '超级管理员' : '普通管理员'} 
                          disabled 
                          style={{ color: currentAdmin?.role === 'super_admin' ? '#f5222d' : '#1890ff' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        保存个人信息
                      </Button>
                      <Button 
                        icon={<LockOutlined />}
                        onClick={() => {
                          if (currentAdmin) {
                            handleResetPassword(currentAdmin.id);
                          }
                        }}
                      >
                        修改密码
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>

          {/* 管理员管理卡片 - 仅超级管理员可见 */}
          {currentAdmin?.role === 'super_admin' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  管理员管理
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAdmin}>
                  添加管理员
                </Button>
              </div>

              <Table
                dataSource={adminUsers}
                rowKey="id"
                pagination={false}
              >
                <Table.Column title="用户名" dataIndex="username" />
                <Table.Column
                  title="角色"
                  dataIndex="role"
                  render={(role: string) => (
                    <Tag color={role === 'super_admin' ? 'red' : 'blue'}>
                      {role === 'super_admin' ? '超级管理员' : '普通管理员'}
                    </Tag>
                  )}
                />
                <Table.Column
                  title="状态"
                  dataIndex="status"
                  render={(status: string) => (
                    <Tag color={status === 'active' ? 'green' : 'red'}>
                      {status === 'active' ? '启用' : '禁用'}
                    </Tag>
                  )}
                />
                <Table.Column
                  title="操作"
                  render={(_, record: AdminUser) => (
                    <Space>
                      {record.status === 'active' ? (
                        <Button
                          size="small"
                          icon={<StopOutlined />}
                          onClick={() => handleEditAdmin(record)}
                          disabled={record.id === currentAdmin?.id}
                          loading={loading}
                        >
                          禁用
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleEditAdmin(record)}
                          disabled={record.id === currentAdmin?.id}
                          loading={loading}
                        >
                          启用
                        </Button>
                      )}
                      <Button
                        type="link"
                        size="small"
                        icon={<LockOutlined />}
                        onClick={() => handleResetPassword(record.id)}
                      >
                        重置密码
                      </Button>
                      <Popconfirm
                        title="确认删除此管理员？"
                        description="删除后无法恢复，请谨慎操作"
                        onConfirm={() => handleDeleteAdmin(record.id)}
                        disabled={record.id === currentAdmin?.id}
                      >
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={record.id === currentAdmin?.id}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                />
              </Table>
            </Card>
          )}
        </TabPane>

        {/* 系统公告 Tab 已移除 */}

        {/* 系统信息 Tab */}
        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              系统信息
            </span>
          }
          key="systeminfo"
        >
          <Card>
            <Title level={4}>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              系统信息
            </Title>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="系统名称">
                      {SYSTEM_INFO.systemName}
                    </Descriptions.Item>
                    <Descriptions.Item label="系统版本">
                      <Tag color="green">{SYSTEM_INFO.version}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="构建时间">
                      {SYSTEM_INFO.buildTime}
                    </Descriptions.Item>
                    <Descriptions.Item label="系统描述">
                      {SYSTEM_INFO.description}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small" title="开发信息">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="开发者">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {SYSTEM_INFO.developers.map((developer, index) => (
                          <Tag key={index} color="green">{developer}</Tag>
                        ))}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="项目仓库">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <a href={SYSTEM_INFO.repositories.frontend} target="_blank" rel="noopener noreferrer">
                          <GithubOutlined style={{ marginRight: 4 }} />
                          前端仓库
                        </a>
                        <a href={SYSTEM_INFO.repositories.backend} target="_blank" rel="noopener noreferrer">
                          <GithubOutlined style={{ marginRight: 4 }} />
                          后端仓库
                        </a>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card size="small" title="项目支持者">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SYSTEM_INFO.supporters.map((supporter, index) => (
                      <Tag key={index} icon={<HeartOutlined />} color="pink">
                        {supporter}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* 公告编辑模态框已删除 */}

      {/* 管理员创建/编辑模态框 */}
      <Modal
        title={editingAdmin ? '编辑管理员' : '创建管理员'}
        open={adminModalVisible}
        onCancel={() => {
          setAdminModalVisible(false);
          setEditingAdmin(null);
          adminForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={adminForm}
          layout="vertical"
          onFinish={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 20, message: '用户名不能超过20个字符' }
                ]}
              >
                <Input 
                  placeholder="请输入用户名" 
                  disabled={!!editingAdmin} // 编辑时禁用用户名修改
                />
              </Form.Item>
            </Col>
          </Row>

          {!editingAdmin && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {editingAdmin && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="状态"
                  name="status"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态">
                    <Option value="active">启用</Option>
                    <Option value="disabled">禁用</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button
                onClick={() => {
                  setAdminModalVisible(false);
                  setEditingAdmin(null);
                  adminForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingAdmin ? '保存修改' : '创建管理员'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 密码重置模态框 */}
      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          setSelectedAdminId('');
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button
                onClick={() => {
                  setPasswordModalVisible(false);
                  setSelectedAdminId('');
                  passwordForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemSettings;
