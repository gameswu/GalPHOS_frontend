import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined,
  CrownOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

const { Title, Text, Link } = Typography;

interface AdminLoginUIProps {
  form: FormInstance;
  loading: boolean;
  onAdminLogin: (values: any) => void;
  onBackToUserLogin: () => void;
}

const AdminLoginUI: React.FC<AdminLoginUIProps> = ({
  form,
  loading,
  onAdminLogin,
  onBackToUserLogin
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* 半透明遮罩层 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }} />
      
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: 'none',
          position: 'relative',
          zIndex: 2
        }}
        bodyStyle={{ 
          padding: 0,
          margin: 0
        }}
      >
        {/* 紫底白字标题 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          textAlign: 'center',
          margin: 0,
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <CrownOutlined style={{ 
              fontSize: '32px', 
              color: 'white',
              marginBottom: '8px'
            }} />
          </div>
          <Title level={2} style={{ 
            color: 'white', 
            margin: 0,
            fontWeight: 'bold'
          }}>
            管理员登录
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            GalPHOS 系统管理中心
          </Text>
        </div>

        {/* 表单内容 */}
        <div style={{ padding: '32px 24px 24px' }}>
          <Form
            form={form}
            name="adminLogin"
            onFinish={onAdminLogin}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入管理员用户名!' },
                { min: 3, message: '用户名至少3个字符!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#764ba2' }} />} 
                placeholder="请输入管理员用户名"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入管理员密码!' },
                { min: 6, message: '密码至少6个字符!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#764ba2' }} />}
                placeholder="请输入管理员密码"
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
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                {loading ? '登录中...' : '管理员登录'}
              </Button>
            </Form.Item>
          </Form>

          {/* 返回普通登录 */}
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size={8}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                不是管理员？返回普通用户登录
              </Text>
              <Button 
                type="link" 
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={onBackToUserLogin}
                style={{ 
                  fontSize: '12px',
                  height: 'auto',
                  padding: '4px 8px'
                }}
              >
                返回普通用户登录
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginUI;