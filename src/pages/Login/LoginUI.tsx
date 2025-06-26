import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Tabs,
  Space,
  Divider,
  Select,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  PhoneOutlined,
  CrownOutlined,
  TeamOutlined,
  BookOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 在组件内部定义必要的类型
interface Province {
  id: string;
  name: string;
  schools: School[];
}

interface School {
  id: string;
  name: string;
}

interface LoginUIProps {
  loginForm: FormInstance;
  registerForm: FormInstance;
  loading: boolean;
  activeTab: string;
  provinces: Province[];
  selectedProvince: string;
  availableSchools: School[];
  onLogin: (values: any) => void;
  onRegister: (values: any) => void;
  onTabChange: (activeKey: string) => void;
  onAdminLogin: () => void;
  onProvinceChange: (provinceId: string, formType: 'login' | 'register') => void;
}

const LoginUI: React.FC<LoginUIProps> = ({
  loginForm,
  registerForm,
  loading,
  activeTab,
  provinces,
  selectedProvince,
  availableSchools,
  onLogin,
  onRegister,
  onTabChange,
  onAdminLogin,
  onProvinceChange
}) => {
  // 角色选项配置
  const roleOptions = [
    { value: 'coach', label: '教练', icon: <TeamOutlined /> },
    { value: 'student', label: '学生', icon: <BookOutlined /> },
    { value: 'grader', label: '阅卷者', icon: <EditOutlined /> }
  ];

  // 角色变化处理（只用于注册）
  const handleRoleChange = (role: string, formInstance: FormInstance) => {
    if (role === 'grader') {
      formInstance.setFieldsValue({ province: undefined, school: undefined });
    }
  };

  // 赛区选择组件 - 只用于注册
  const RegionSelector: React.FC<{ 
    formType: 'login' | 'register';
    role?: string;
  }> = ({ formType, role }) => {
    // 登录时不显示赛区选择
    if (formType === 'login') return null;
    if (!role || role === 'grader') return null;

    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请选择省份!' }]}
          >
            <Select
              placeholder="选择省份"
              style={{ borderRadius: '8px' }}
              onChange={(value) => onProvinceChange(value, formType)}
            >
              {provinces.map(province => (
                <Option key={province.id} value={province.id}>
                  {province.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="school"
            label="学校"
            rules={[{ required: true, message: '请选择学校!' }]}
          >
            <Select
              placeholder="选择学校"
              style={{ borderRadius: '8px' }}
              disabled={!selectedProvince}
            >
              {availableSchools.map(school => (
                <Option key={school.id} value={school.id}>
                  {school.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* 遮罩层 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }} />
      
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: 'none',
          position: 'relative',
          zIndex: 2
        }}
        bodyStyle={{ padding: 0, margin: 0 }}
      >
        {/* 标题 */}
        <div style={{
          background: '#1890ff',
          padding: '24px',
          textAlign: 'center',
          margin: 0,
          borderRadius: '12px 12px 0 0'
        }}>
          <Title level={2} style={{ 
            color: 'white', 
            margin: 0,
            fontWeight: 'bold'
          }}>
            GalPHOS 系统
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            普通用户登录中心
          </Text>
        </div>

        {/* 表单内容 */}
        <div style={{ padding: '32px 24px 24px' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={onTabChange}
            centered
            size="large"
          >
            {/* 登录标签页 */}
            <TabPane tab="登录" key="login">
              <Form
                form={loginForm}
                name="login"
                onFinish={onLogin}
                autoComplete="off"
                layout="vertical"
                size="large"
              >
                {/* 角色选择 */}
                <Form.Item
                  name="role"
                  label="选择角色"
                  rules={[{ required: true, message: '请选择角色!' }]}
                >
                  <Select
                    placeholder="请选择您的角色"
                    style={{ borderRadius: '8px' }}
                  >
                    {roleOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Space>
                          {option.icon}
                          {option.label}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* 用户名 */}
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: '请输入用户名!' },
                    { min: 3, message: '用户名至少3个字符!' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                    placeholder="请输入用户名"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                {/* 密码 */}
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码!' },
                    { min: 6, message: '密码至少6个字符!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                    placeholder="请输入密码"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    style={{ 
                      width: '100%', 
                      height: '44px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            {/* 注册标签页 */}
            <TabPane tab="注册" key="register">
              <Form
                form={registerForm}
                name="register"
                onFinish={onRegister}
                autoComplete="off"
                layout="vertical"
                size="large"
              >
                {/* 角色选择 */}
                <Form.Item
                  name="role"
                  label="选择角色"
                  rules={[{ required: true, message: '请选择角色!' }]}
                >
                  <Select
                    placeholder="请选择您的角色"
                    style={{ borderRadius: '8px' }}
                    onChange={(value) => handleRoleChange(value, registerForm)}
                  >
                    {roleOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Space>
                          {option.icon}
                          {option.label}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* 用户名 */}
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名!' },
                    { min: 3, message: '用户名至少3个字符!' },
                    { max: 20, message: '用户名最多20个字符!' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                    placeholder="请输入用户名"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                {/* 手机号 */}
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号!' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
                  ]}
                >
                  <Input 
                    prefix={<PhoneOutlined style={{ color: '#1890ff' }} />} 
                    placeholder="请输入手机号"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                {/* 赛区选择 - 只在注册时显示 */}
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                  prevValues.role !== currentValues.role
                }>
                  {({ getFieldValue }) => (
                    <RegionSelector 
                      formType="register" 
                      role={getFieldValue('role')} 
                    />
                  )}
                </Form.Item>

                {/* 密码 */}
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码!' },
                    { min: 6, message: '密码至少6个字符!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                    placeholder="请输入密码"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                {/* 确认密码 */}
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                    placeholder="请确认密码"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    style={{ 
                      width: '100%', 
                      height: '44px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? '注册中...' : '提交注册申请'}
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          {/* 管理员登录链接 */}
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size={8}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                管理员请使用专用登录入口
              </Text>
              <Button 
                type="link" 
                size="small"
                icon={<CrownOutlined />}
                onClick={onAdminLogin}
                style={{ 
                  fontSize: '12px',
                  height: 'auto',
                  padding: '4px 8px'
                }}
              >
                切换到管理员登录
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginUI;