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
  ReloadOutlined
} from '@ant-design/icons';
import type { 
  SystemSettings as SystemSettingsType,
  AdminUser,
  AdminCreateData,
  PasswordChangeData
} from '../../../types/common';
import AdminAPI from '../../../api/admin';
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
  onUpdateAdminInfo: (adminId: string, adminData: any) => Promise<void>;
  onDeleteAdmin: (adminId: string) => Promise<void>;
  onChangeAdminPassword: (adminId: string, passwordData: PasswordChangeData) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
}

// 系统信息常量（硬编码）
const SYSTEM_INFO = {
  systemName: 'GalPHOS 考试管理系统',
  version: 'v1.3.0',
  buildTime: '2025-6-30 18:31:00',
  description: '基于微服务架构的现代化考试管理平台',
  features: [
    '多角色权限管理',
    '在线考试与阅卷',
    '智能成绩统计',
    '实时数据监控',
    '微服务架构',
    '响应式界面设计'
  ],
  technicalStack: {
    frontend: 'React 18 + TypeScript + Ant Design',
    backend: '微服务架构 (Node.js)',
    database: 'MongoDB + Redis',
    deployment: 'Docker + Kubernetes'
  }
};

const SystemSettings: React.FC<SystemSettingsProps> = ({
  systemSettings,
  adminUsers,
  currentAdmin,
  loading,
  onUpdateSystemSettings,
  onCreateAdmin,
  onUpdateAdminInfo,
  onDeleteAdmin,
  onChangeAdminPassword,
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

  // 初始化表单数据
  useEffect(() => {
    if (systemSettings) {
      form.setFieldsValue({
        maintenanceMode: systemSettings.maintenanceMode,
        maintenanceMessage: systemSettings.maintenanceMessage,
        announcementEnabled: systemSettings.announcementEnabled
      });
    }
  }, [systemSettings, form]);

  // 保存维护设置
  const handleSaveMaintenanceSettings = async (values: any) => {
    try {
      await onUpdateSystemSettings({
        maintenanceMode: values.maintenanceMode,
        maintenanceMessage: values.maintenanceMessage,
        announcementEnabled: values.announcementEnabled
      });
      message.success('维护设置保存成功');
    } catch (error) {
      message.error('维护设置保存失败');
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

  // 管理员管理相关函数
  const handleCreateAdmin = async (values: any) => {
    try {
      await onCreateAdmin({
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
        permissions: values.permissions || []
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
      await onUpdateAdminInfo(editingAdmin.id, {
        email: values.email,
        role: values.role,
        permissions: values.permissions || []
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
      await onChangeAdminPassword(selectedAdminId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      setSelectedAdminId('');
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const avatarUrl = await onUploadAvatar(file);
      await onUpdateAdminInfo(currentAdmin?.id || '', { avatar: avatarUrl });
      message.success('头像上传成功');
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    if (!currentAdmin) return;
    
    try {
      await onUpdateAdminInfo(currentAdmin.id, {
        email: values.email,
        nickname: values.nickname
      });
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('个人信息更新失败');
    }
  };

  // 编辑管理员
  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    adminForm.setFieldsValue({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || []
    });
    setAdminModalVisible(true);
  };

  // 添加管理员
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

  return (
    <div className="system-settings-simplified">
      <Tabs defaultActiveKey="maintenance" size="large">
        {/* 维护设置 */}
        <TabPane
          tab={
            <span>
              <ExclamationCircleOutlined />
              维护设置
            </span>
          }
          key="maintenance"
        >
          <Card>
            <Title level={4}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              系统维护设置
            </Title>
            <Paragraph type="secondary">
              当开启维护模式时，普通用户将无法访问系统，并显示维护消息和系统公告轮播。
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveMaintenanceSettings}
              initialValues={{
                maintenanceMode: false,
                maintenanceMessage: '系统正在维护中，请稍后再试...',
                announcementEnabled: true
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="维护模式"
                    name="maintenanceMode"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      onChange={(checked) => {
                        if (checked) {
                          Modal.confirm({
                            title: '确认开启维护模式？',
                            content: '开启后，除管理员外的所有用户将无法访问系统',
                            icon: <ExclamationCircleOutlined />,
                            okText: '确认开启',
                            cancelText: '取消',
                            onOk: () => {},
                            onCancel: () => {
                              form.setFieldsValue({ maintenanceMode: false });
                            }
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="公告显示"
                    name="announcementEnabled"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="维护消息"
                name="maintenanceMessage"
                rules={[
                  { required: true, message: '请输入维护消息' },
                  { max: 200, message: '维护消息不能超过200字符' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入系统维护时显示给用户的消息..."
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存维护设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* 系统公告 */}
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
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAnnouncement}>
                添加公告
              </Button>
            </div>

            <Alert
              message="公告说明"
              description="当维护模式开启或公告显示开启时，这些公告将在系统中轮播显示。公告将按添加顺序显示。"
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

        {/* 系统信息 */}
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
                <Card size="small" title="技术架构">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="前端技术">
                      {SYSTEM_INFO.technicalStack.frontend}
                    </Descriptions.Item>
                    <Descriptions.Item label="后端技术">
                      {SYSTEM_INFO.technicalStack.backend}
                    </Descriptions.Item>
                    <Descriptions.Item label="数据库">
                      {SYSTEM_INFO.technicalStack.database}
                    </Descriptions.Item>
                    <Descriptions.Item label="部署方式">
                      {SYSTEM_INFO.technicalStack.deployment}
                    </Descriptions.Item>
                  </Descriptions>
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

        {/* 管理员管理 */}
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              管理员管理
            </span>
          }
          key="admins"
        >
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
              loading={loading}
              columns={[
                {
                  title: '头像',
                  dataIndex: 'avatar',
                  key: 'avatar',
                  width: 80,
                  render: (avatar: string) => (
                    <Avatar 
                      size={40} 
                      src={avatar} 
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#87d068' }}
                    />
                  ),
                },
                {
                  title: '用户名',
                  dataIndex: 'username',
                  key: 'username',
                },
                {
                  title: '邮箱',
                  dataIndex: 'email',
                  key: 'email',
                  render: (email: string) => email || '-',
                },
                {
                  title: '角色',
                  dataIndex: 'role',
                  key: 'role',
                  render: (role: string) => (
                    <Tag color={role === 'super_admin' ? 'red' : 'blue'}>
                      {role === 'super_admin' ? '超级管理员' : '普通管理员'}
                    </Tag>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'active' ? 'green' : 'red'}>
                      {status === 'active' ? '正常' : '禁用'}
                    </Tag>
                  ),
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date: string) => new Date(date).toLocaleDateString(),
                },
                {
                  title: '最后登录',
                  dataIndex: 'lastLoginAt',
                  key: 'lastLoginAt',
                  render: (date?: string) => date ? new Date(date).toLocaleDateString() : '-',
                },
                {
                  title: '操作',
                  key: 'actions',
                  width: 200,
                  render: (_, record: AdminUser) => (
                    <Space>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditAdmin(record)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        icon={<LockOutlined />}
                        onClick={() => handleResetPassword(record.id)}
                      >
                        重置密码
                      </Button>
                      {record.id !== currentAdmin?.id && (
                        <Popconfirm
                          title="确认删除此管理员？"
                          description="删除后无法恢复，请谨慎操作"
                          onConfirm={() => handleDeleteAdmin(record.id)}
                          okText="确认删除"
                          cancelText="取消"
                        >
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  ),
                },
              ]}
              pagination={{
                total: adminUsers.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </TabPane>

        {/* 个人资料 */}
        <TabPane
          tab={
            <span>
              <UserOutlined />
              个人资料
            </span>
          }
          key="profile"
        >
          <Card>
            <Title level={4}>
              <UserOutlined style={{ marginRight: 8 }} />
              个人资料管理
            </Title>
            
            <Row gutter={[24, 24]}>
              <Col span={8}>
                <Card size="small" title="头像设置">
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      size={100} 
                      src={currentAdmin?.avatar} 
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#87d068', marginBottom: 16 }}
                    />
                    <br />
                    <Upload
                      name="avatar"
                      listType="picture"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        handleAvatarUpload(file);
                        return false;
                      }}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={avatarUploading}
                      >
                        {avatarUploading ? '上传中...' : '更换头像'}
                      </Button>
                    </Upload>
                  </div>
                </Card>
              </Col>

              <Col span={16}>
                <Card size="small" title="基本信息">
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    initialValues={{
                      username: currentAdmin?.username,
                      email: currentAdmin?.email,
                      nickname: currentAdmin?.nickname,
                      role: currentAdmin?.role,
                    }}
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
                      <Col span={12}>
                        <Form.Item 
                          label="邮箱" 
                          name="email"
                          rules={[
                            { type: 'email', message: '请输入有效的邮箱地址' }
                          ]}
                        >
                          <Input placeholder="请输入邮箱地址" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="昵称" name="nickname">
                          <Input placeholder="请输入昵称" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        保存个人信息
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card size="small" title="安全设置">
              <Button 
                type="primary" 
                icon={<LockOutlined />}
                onClick={() => {
                  if (currentAdmin) {
                    handleResetPassword(currentAdmin.id);
                  }
                }}
              >
                修改密码
              </Button>
            </Card>
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
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          {!editingAdmin && (
            <Row gutter={16}>
              <Col span={12}>
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
              <Col span={12}>
                <Form.Item
                  label="确认密码"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('确认密码与密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Password placeholder="请再次输入密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色"
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">普通管理员</Option>
                  {currentAdmin?.role === 'super_admin' && (
                    <Option value="super_admin">超级管理员</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="权限" name="permissions">
                <Select
                  mode="multiple"
                  placeholder="请选择权限（可选）"
                  allowClear
                >
                  <Option value="exam_manage">考试管理</Option>
                  <Option value="user_manage">用户管理</Option>
                  <Option value="grading_manage">阅卷管理</Option>
                  <Option value="system_manage">系统管理</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

      {/* 密码修改模态框 */}
      <Modal
        title="修改密码"
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
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Password placeholder="请输入当前密码" />
          </Form.Item>

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

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('确认密码与新密码不一致'));
                },
              }),
            ]}
          >
            <Password placeholder="请再次输入新密码" />
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
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemSettings;
