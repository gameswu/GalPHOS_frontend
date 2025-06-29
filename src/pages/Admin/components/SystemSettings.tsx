import React, { useState } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Tabs,
  Table,
  Modal,
  Tag,
  Switch,
  InputNumber,
  Select,
  Divider,
  Avatar,
  Popconfirm,
  Row,
  Col,
  Upload,
  message,
  Image
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CameraOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import type { AdminUser, SystemSettings as SystemSettingsType, PasswordChangeData, AdminCreateData } from '../../../types/common';
import type { UploadProps, RcFile } from 'antd/es/upload';
import './SystemSettings.css'; // 导入样式文件

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Password } = Input;
const { Option } = Select;

interface SystemSettingsProps {
  adminUsers: AdminUser[];
  systemSettings: SystemSettingsType | null;
  currentAdmin: AdminUser | null;
  loading: boolean;
  onChangePassword: (passwordData: PasswordChangeData) => Promise<void>;
  onUpdateAdminInfo: (adminId: string, updateData: Partial<AdminUser>) => Promise<void>;
  onCreateAdmin: (adminData: AdminCreateData) => Promise<void>;
  onDeleteAdmin: (adminId: string) => Promise<void>;
  onUpdateSystemSettings: (settings: Partial<SystemSettingsType>) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({
  adminUsers,
  systemSettings,
  currentAdmin,
  loading,
  onChangePassword,
  onUpdateAdminInfo,
  onCreateAdmin,
  onDeleteAdmin,
  onUpdateSystemSettings,
  onUploadAvatar
}) => {
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [passwordForm] = Form.useForm();
  const [adminForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string>('');

  // 头像上传前的验证
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return false;
    }
    return true;
  };

  // 处理头像上传
  const handleAvatarUpload = async (file: RcFile) => {
    if (!beforeUpload(file)) {
      return false;
    }
    
    setUploadingAvatar(true);
    try {
      const avatarUrl = await onUploadAvatar(file);
      setTempAvatar(avatarUrl);
      message.success('头像上传成功');
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
    return false; // 阻止默认上传行为
  };

  // 管理员表格列
  const adminColumns = [
    {
      title: '管理员',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: AdminUser) => (
        <Space>
          <Avatar 
            src={record.avatar} 
            icon={!record.avatar && <UserOutlined />} 
            size="small"
            style={{ backgroundColor: !record.avatar ? '#1890ff' : 'transparent' }}
          />
          <div>
            <Text strong>{text}</Text>
            {record.id === currentAdmin?.id && (
              <Tag color="blue" style={{ marginLeft: 8, fontSize: '12px' }}>当前用户</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          super_admin: { text: '超级管理员', color: 'red' },
          admin: { text: '管理员', color: 'blue' }
        };
        const roleInfo = roleMap[role as keyof typeof roleMap];
        return <Tag color={roleInfo?.color}>{roleInfo?.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { text: '正常', color: 'success' },
          disabled: { text: '禁用', color: 'default' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (text: string) => (
        <Text type="secondary">
          {text ? new Date(text).toLocaleString() : '从未登录'}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AdminUser) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditAdmin(record)}
          >
            编辑
          </Button>
          {record.role !== 'super_admin' && record.id !== currentAdmin?.id && (
            <Popconfirm
              title="确定要删除这个管理员吗？"
              description="删除后将无法恢复"
              onConfirm={() => onDeleteAdmin(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
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
  ];

  // 处理修改密码
  const handleChangePassword = async (values: PasswordChangeData) => {
    try {
      await onChangePassword(values);
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('修改密码失败:', error);
    }
  };

  // 处理创建管理员
  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setTempAvatar('');
    setAdminModalVisible(true);
    adminForm.resetFields();
  };

  // 处理编辑管理员
  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setTempAvatar(admin.avatar || '');
    setAdminModalVisible(true);
    adminForm.setFieldsValue({
      username: admin.username,
      status: admin.status
    });
  };

  // 提交管理员表单
  const handleAdminSubmit = async (values: any) => {
    try {
      if (editingAdmin) {
        // 编辑管理员
        await onUpdateAdminInfo(editingAdmin.id, {
          username: values.username,
          status: values.status,
          avatar: tempAvatar
        });
      } else {
        // 创建管理员
        await onCreateAdmin({
          username: values.username,
          password: values.password,
          avatar: tempAvatar,
          role: 'admin'
        });
      }
      setAdminModalVisible(false);
      adminForm.resetFields();
      setEditingAdmin(null);
      setTempAvatar('');
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 处理系统设置提交
  const handleSystemSettingsSubmit = async (values: any) => {
    try {
      await onUpdateSystemSettings(values);
    } catch (error) {
      console.error('更新系统设置失败:', error);
    }
  };

  // 头像上传组件
  const AvatarUpload: React.FC<{ value?: string; onChange?: (url: string) => void }> = ({ value, onChange }) => (
    <div style={{ textAlign: 'center' }}>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={handleAvatarUpload}
        style={{ marginBottom: 16 }}
      >
        {value ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Avatar src={value} size={80} />
            <div 
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                background: 'rgba(0,0,0,0.5)', 
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CameraOutlined style={{ color: 'white', fontSize: 12 }} />
            </div>
          </div>
        ) : (
          <div>
            {uploadingAvatar ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>上传头像</div>
          </div>
        )}
      </Upload>
      <Text type="secondary" style={{ fontSize: '12px' }}>
        支持 JPG、PNG 格式，文件大小不超过 2MB
      </Text>
    </div>
  );

  return (
    <div>
      <Card>
        <Title level={4}>
          <SettingOutlined style={{ marginRight: 8 }} />
          系统设置
        </Title>
        
        <Tabs defaultActiveKey="account">
          {/* 账号管理 */}
          <TabPane tab="账号管理" key="account">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card size="small" title="当前账号信息">
                  {currentAdmin && (
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Avatar 
                          src={currentAdmin.avatar} 
                          icon={!currentAdmin.avatar && <UserOutlined />} 
                          size={64}
                          style={{ backgroundColor: !currentAdmin.avatar ? '#1890ff' : 'transparent' }}
                        />
                      </div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">用户名：</Text>
                          <Text strong>{currentAdmin.username}</Text>
                        </div>
                        <div>
                          <Text type="secondary">角色：</Text>
                          <Tag color={currentAdmin.role === 'super_admin' ? 'red' : 'blue'}>
                            {currentAdmin.role === 'super_admin' ? '超级管理员' : '管理员'}
                          </Tag>
                        </div>
                        <div>
                          <Text type="secondary">创建时间：</Text>
                          <Text>
                            {new Date(currentAdmin.createdAt).toLocaleString()}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">最后登录：</Text>
                          <Text>
                            {currentAdmin.lastLoginAt 
                              ? new Date(currentAdmin.lastLoginAt).toLocaleString() 
                              : '从未登录'
                            }
                          </Text>
                        </div>
                      </Space>
                      <Divider />
                      <Space>
                        <Button
                          type="primary"
                          icon={<LockOutlined />}
                          onClick={() => setPasswordModalVisible(true)}
                        >
                          修改密码
                        </Button>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => handleEditAdmin(currentAdmin)}
                        >
                          编辑资料
                        </Button>
                      </Space>
                    </div>
                  )}
                </Card>
              </Col>
              
              <Col span={12}>
                <Card size="small" title="管理员列表" extra={
                  currentAdmin?.role === 'super_admin' && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleCreateAdmin}
                    >
                      新增管理员
                    </Button>
                  )
                }>
                  <Table
                    columns={adminColumns}
                    dataSource={adminUsers}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 300 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 系统配置 */}
          <TabPane tab="系统配置" key="system">
            <Form
              form={settingsForm}
              layout="vertical"
              initialValues={systemSettings || undefined}
              onFinish={handleSystemSettingsSubmit}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Card size="small" title="基础设置">
                    <Form.Item
                      label="网站名称"
                      name="siteName"
                      rules={[{ required: true, message: '请输入网站名称' }]}
                    >
                      <Input placeholder="请输入网站名称" />
                    </Form.Item>

                    <Form.Item
                      label="网站描述"
                      name="siteDescription"
                    >
                      <TextArea rows={3} placeholder="请输入网站描述" />
                    </Form.Item>

                    <Form.Item
                      label="最大上传文件大小 (MB)"
                      name="maxUploadSize"
                      rules={[{ required: true, message: '请设置最大上传文件大小' }]}
                    >
                      <InputNumber min={1} max={200} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      label="允许的文件类型"
                      name="allowedFileTypes"
                    >
                      <Select
                        mode="tags"
                        placeholder="请选择允许的文件类型"
                        style={{ width: '100%' }}
                      >
                        <Option value=".pdf">PDF</Option>
                        <Option value=".doc">DOC</Option>
                        <Option value=".docx">DOCX</Option>
                        <Option value=".jpg">JPG</Option>
                        <Option value=".png">PNG</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="允许用户注册"
                      name="allowRegistration"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card size="small" title="考试设置">
                    <Form.Item
                      label="默认考试时长 (分钟)"
                      name="examDuration"
                    >
                      <InputNumber min={30} max={300} style={{ width: '100%' }} placeholder="默认180分钟" />
                    </Form.Item>

                    <Form.Item
                      label="阅卷截止时间 (小时)"
                      name="gradingDeadline"
                    >
                      <InputNumber min={24} max={168} style={{ width: '100%' }} placeholder="默认72小时" />
                    </Form.Item>
                  </Card>

                  <Card size="small" title="维护设置" style={{ marginTop: 16 }}>
                    <Form.Item
                      label="系统维护模式"
                      name="maintenanceMode"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      label="维护提示信息"
                      name="maintenanceMessage"
                    >
                      <TextArea rows={4} placeholder="请输入维护提示信息" />
                    </Form.Item>

                    <Form.Item
                      label="系统公告"
                      name="announcement"
                    >
                      <TextArea rows={3} placeholder="请输入系统公告（支持轮播显示）" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={400}
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
            <Password
              placeholder="请输入当前密码"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Password
              placeholder="请输入新密码"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Password
              placeholder="请再次输入新密码"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setPasswordModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建/编辑管理员模态框 */}
      <Modal
        title={editingAdmin ? '编辑管理员' : '新增管理员'}
        open={adminModalVisible}
        onCancel={() => {
          setAdminModalVisible(false);
          setTempAvatar('');
        }}
        footer={null}
        width={500}
      >
        <Form
          form={adminForm}
          layout="vertical"
          onFinish={handleAdminSubmit}
        >
          <Form.Item label="头像" style={{ textAlign: 'center' }}>
            <AvatarUpload value={tempAvatar} onChange={setTempAvatar} />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20位' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          {!editingAdmin && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Password
                placeholder="请输入密码"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          )}

          {editingAdmin && (
            <Form.Item
              label="状态"
              name="status"
            >
              <Select>
                <Option value="active">正常</Option>
                <Option value="disabled">禁用</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setAdminModalVisible(false);
                setTempAvatar('');
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingAdmin ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemSettings;