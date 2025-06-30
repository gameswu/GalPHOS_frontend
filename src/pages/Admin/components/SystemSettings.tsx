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
  HeartOutlined
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
  onDeleteAdmin: (adminId: string) => Promise<void>;
  onResetAdminPassword: (adminId: string, newPassword: string) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
}

// 系统信息常量（硬编码）
const SYSTEM_INFO = {
  systemName: 'GalPHOS 考试管理系统',
  version: 'v1.3.0',
  buildTime: '2025-7-1 01:15:00',
  developer: 'gameswu, X-02Y, laoli006',
  repository: 'https://github.com/gameswu/GalPHOS_frontend',
  supporters: [
    '小夜',
    'SuddeИ',
    '岭华廷阳',
    '东方地灵殿全体'
  ],
  description: '基于微服务架构的现代化考试管理平台',
  features: [
    '多角色权限管理',
    '在线考试与阅卷',
    '智能成绩统计',
    '实时数据监控',
    '微服务架构',
    '响应式界面设计'
  ]
};

const SystemSettings: React.FC<SystemSettingsProps> = ({
  systemSettings,
  adminUsers,
  currentAdmin,
  loading,
  onUpdateSystemSettings,
  onCreateAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onResetAdminPassword,
  onUploadAvatar
}) => {
  const [form] = Form.useForm();
  const [announcementForm] = Form.useForm();
  const [adminForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
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
        name: currentAdmin.name,
        role: currentAdmin.role
      });
    }
  }, [currentAdmin, profileForm]);

  // 管理员个人信息更新
  const handleUpdateProfile = async (values: any) => {
    try {
      if (!currentAdmin) return;
      await onUpdateAdmin(currentAdmin.id, {
        name: values.name
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
        name: values.name,
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
        name: values.name,
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
  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    adminForm.setFieldsValue({
      username: admin.username,
      name: admin.name,
      status: admin.status
    });
    setAdminModalVisible(true);
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
        await onUpdateAdmin(currentAdmin.id, { avatar: avatarUrl });
        message.success('头像上传成功');
      }
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setAvatarUploading(false);
    }
  };

  // 添加/编辑公告
  const handleSaveAnnouncement = async (values: { content: string }) => {
    try {
      const currentAnnouncements = systemSettings?.systemAnnouncements || [];
      let newAnnouncements: string[];

      if (editingAnnouncement !== null) {
        // 编辑现有公告
        newAnnouncements = [...currentAnnouncements];
        newAnnouncements[editingAnnouncement] = values.content;
      } else {
        // 添加新公告
        newAnnouncements = [...currentAnnouncements, values.content];
      }

      await onUpdateSystemSettings({
        systemAnnouncements: newAnnouncements
      });

      message.success(editingAnnouncement !== null ? '公告修改成功' : '公告添加成功');
      setAnnouncementModalVisible(false);
      setEditingAnnouncement(null);
      announcementForm.resetFields();
    } catch (error) {
      message.error('公告保存失败');
    }
  };

  // 删除公告
  const handleDeleteAnnouncement = async (index: number) => {
    try {
      const currentAnnouncements = systemSettings?.systemAnnouncements || [];
      const newAnnouncements = currentAnnouncements.filter((_, i) => i !== index);

      await onUpdateSystemSettings({
        systemAnnouncements: newAnnouncements
      });

      message.success('公告删除成功');
    } catch (error) {
      message.error('公告删除失败');
    }
  };

  // 编辑公告
  const handleEditAnnouncement = (index: number) => {
    const announcement = systemSettings?.systemAnnouncements?.[index];
    if (announcement) {
      setEditingAnnouncement(index);
      announcementForm.setFieldsValue({ content: announcement });
      setAnnouncementModalVisible(true);
    }
  };

  // 添加公告
  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    announcementForm.resetFields();
    setAnnouncementModalVisible(true);
  };

  // 切换公告显示状态
  const handleToggleAnnouncement = async (enabled: boolean) => {
    try {
      await onUpdateSystemSettings({
        announcementEnabled: enabled
      });
      message.success(enabled ? '公告显示已开启' : '公告显示已关闭');
    } catch (error) {
      message.error('公告显示状态切换失败');
    }
  };

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
                      <Form.Item label="用户名" name="username">
                        <Input disabled />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="角色" name="role">
                        <Select disabled>
                          <Option value="super_admin">超级管理员</Option>
                          <Option value="admin">普通管理员</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="显示名称" name="name">
                        <Input placeholder="请输入显示名称" />
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
                <Table.Column
                  title="头像"
                  dataIndex="avatar"
                  render={(avatar: string) => (
                    <Avatar src={avatar} icon={<UserOutlined />} />
                  )}
                />
                <Table.Column title="用户名" dataIndex="username" />
                <Table.Column title="显示名称" dataIndex="name" />
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
                  title="最后登录"
                  dataIndex="lastLoginAt"
                  render={(time: string) => time ? new Date(time).toLocaleString() : '从未登录'}
                />
                <Table.Column
                  title="操作"
                  render={(_, record: AdminUser) => (
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditAdmin(record)}
                        disabled={record.id === currentAdmin?.id}
                      >
                        编辑
                      </Button>
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

        {/* 系统公告 Tab */}
        <TabPane
          tab={
            <span>
              <SoundOutlined />
              系统公告
            </span>
          }
          key="announcements"
        >
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                <SoundOutlined style={{ marginRight: 8 }} />
                系统公告管理
              </Title>
              <Space>
                <Switch
                  checked={systemSettings?.announcementEnabled}
                  onChange={handleToggleAnnouncement}
                  checkedChildren="显示"
                  unCheckedChildren="隐藏"
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAnnouncement}>
                  添加公告
                </Button>
              </Space>
            </div>

            <Alert
              message="公告说明"
              description="开启公告显示后，这些公告将在系统中轮播显示。公告将按添加顺序显示。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={systemSettings?.systemAnnouncements || []}
              renderItem={(announcement, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEditAnnouncement(index)}
                    >
                      编辑
                    </Button>,
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '确认删除此公告？',
                          content: '删除后无法恢复',
                          onOk: () => handleDeleteAnnouncement(index)
                        });
                      }}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Tag color="blue">#{index + 1}</Tag>}
                    description={announcement}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无系统公告' }}
            />
          </Card>
        </TabPane>

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
                      {SYSTEM_INFO.developer}
                    </Descriptions.Item>
                    <Descriptions.Item label="项目仓库">
                      <a href={SYSTEM_INFO.repository} target="_blank" rel="noopener noreferrer">
                        <GithubOutlined style={{ marginRight: 4 }} />
                        GitHub 仓库
                      </a>
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

              <Col span={24}>
                <Card size="small" title="系统特性">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SYSTEM_INFO.features.map((feature, index) => (
                      <Tag key={index} color="blue">{feature}</Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* 公告编辑模态框 */}
      <Modal
        title={editingAnnouncement !== null ? '编辑公告' : '添加公告'}
        open={announcementModalVisible}
        onCancel={() => {
          setAnnouncementModalVisible(false);
          setEditingAnnouncement(null);
          announcementForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleSaveAnnouncement}
        >
          <Form.Item
            label="公告内容"
            name="content"
            rules={[
              { required: true, message: '请输入公告内容' },
              { max: 500, message: '公告内容不能超过500字符' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请输入公告内容..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button
                onClick={() => {
                  setAnnouncementModalVisible(false);
                  setEditingAnnouncement(null);
                  announcementForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAnnouncement !== null ? '保存修改' : '添加公告'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
                <Input 
                  placeholder="请输入用户名" 
                  disabled={!!editingAdmin} // 编辑时禁用用户名修改
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="显示名称"
                name="name"
                rules={[
                  { required: true, message: '请输入显示名称' }
                ]}
              >
                <Input placeholder="请输入显示名称" />
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
