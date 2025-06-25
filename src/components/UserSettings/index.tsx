import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Avatar, 
  Modal, 
  Select, 
  Row, 
  Col, 
  message,
  Divider,
  Space
} from 'antd';
import { 
  UserOutlined, 
  CameraOutlined, 
  EditOutlined, 
  LogoutOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import './UserSettings.css';

interface UserInfo {
  username: string;
  role: 'student' | 'grader' | 'coach';
  province?: string;
  school?: string;
  avatar?: string;
}

interface Province {
  id: string;
  name: string;
  schools: School[];
}

interface School {
  id: string;
  name: string;
}

interface UserSettingsProps {
  userInfo: UserInfo;
  onUpdateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  onChangePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  onRequestRegionChange?: (data: { province: string; school: string; reason: string }) => Promise<void>;
  onLogout: () => void;
  showRegionChange?: boolean; // 控制是否显示赛区变更功能
}

// 模拟省份和学校数据
const mockProvinceData: Province[] = [
  {
    id: '1',
    name: '北京市',
    schools: [
      { id: '1-1', name: '北京市第一中学' },
      { id: '1-2', name: '北京市第二中学' },
      { id: '1-3', name: '清华大学附属中学' }
    ]
  },
  {
    id: '2',
    name: '上海市',
    schools: [
      { id: '2-1', name: '上海中学' },
      { id: '2-2', name: '华东师范大学第二附属中学' },
      { id: '2-3', name: '复旦大学附属中学' }
    ]
  },
  {
    id: '3',
    name: '广东省',
    schools: [
      { id: '3-1', name: '华南师范大学附属中学' },
      { id: '3-2', name: '深圳中学' },
      { id: '3-3', name: '广州市第六中学' }
    ]
  }
];

const UserSettings: React.FC<UserSettingsProps> = ({
  userInfo,
  onUpdateProfile,
  onChangePassword,
  onRequestRegionChange,
  onLogout,
  showRegionChange = true
}) => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [regionForm] = Form.useForm();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [regionLoading, setRegionLoading] = useState(false);
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  
  const [provinces] = useState<Province[]>(mockProvinceData);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  
  const [avatar, setAvatar] = useState<string>(userInfo.avatar || '');

  // 处理头像上传
  const handleAvatarChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // 获取上传后的文件URL
      const url = info.file.response?.url || URL.createObjectURL(info.file.originFileObj as RcFile);
      setAvatar(url);
    }
  };

  // 头像上传前检查
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

  // 处理个人资料更新
  const handleProfileUpdate = async () => {
    try {
      const values = await profileForm.validateFields();
      setProfileLoading(true);
      await onUpdateProfile({
        username: values.username,
        avatar: avatar
      });
      message.success('个人资料更新成功');
    } catch (error) {
      message.error('更新失败，请重试');
    } finally {
      setProfileLoading(false);
    }
  };

  // 处理密码修改
  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordLoading(true);
      await onChangePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败，请重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 处理省份选择
  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    const province = provinces.find(p => p.id === provinceId);
    if (province) {
      setAvailableSchools(province.schools);
      regionForm.setFieldsValue({ school: undefined });
    }
  };

  // 处理赛区变更申请
  const handleRegionChangeRequest = async () => {
    if (!onRequestRegionChange) return;
    
    try {
      const values = await regionForm.validateFields();
      setRegionLoading(true);
      
      const selectedProvinceData = provinces.find(p => p.id === values.province);
      const selectedSchoolData = availableSchools.find(s => s.id === values.school);
      
      await onRequestRegionChange({
        province: selectedProvinceData?.name || '',
        school: selectedSchoolData?.name || '',
        reason: values.reason
      });
      
      message.success('赛区变更申请已提交，等待管理员审核');
      setRegionModalVisible(false);
      regionForm.resetFields();
    } catch (error) {
      message.error('提交申请失败，请重试');
    } finally {
      setRegionLoading(false);
    }
  };

  // 处理注销账号
  const handleLogout = () => {
    Modal.confirm({
      title: '确认注销',
      icon: <ExclamationCircleOutlined />,
      content: '确定要注销当前账号吗？注销后需要重新登录。',
      okText: '确认注销',
      cancelText: '取消',
      onOk: onLogout,
    });
  };

  return (
    <div className="user-settings-container">
      {/* 个人资料卡片 */}
      <Card 
        title={
          <Space>
            <UserOutlined />
            个人资料
          </Space>
        }
        className="user-settings-card"
      >
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={{
            username: userInfo.username
          }}
        >
          <Row gutter={24}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleAvatarChange}
                  customRequest={({ file, onSuccess }) => {
                    // 模拟上传成功
                    setTimeout(() => {
                      onSuccess && onSuccess({});
                    }, 1000);
                  }}
                >
                  {avatar ? (
                    <div className="avatar-upload-button">
                      <Avatar src={avatar} size={80} />
                      <div className="avatar-upload-overlay">
                        <CameraOutlined style={{ fontSize: 16, marginBottom: 2 }} />
                        <span>更换头像</span>
                      </div>
                    </div>
                  ) : (
                    <div className="avatar-upload-content">
                      <CameraOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      <div>上传头像</div>
                    </div>
                  )}
                </Upload>
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  支持 JPG、PNG 格式<br />
                  文件大小不超过 2MB
                </div>
              </div>
            </Col>
            <Col span={18}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, max: 20, message: '用户名长度为2-20个字符' }
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  loading={profileLoading}
                  onClick={handleProfileUpdate}
                >
                  更新个人资料
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 账号安全卡片 */}
      <Card 
        title={
          <Space>
            <LockOutlined />
            账号安全
          </Space>
        }
        className="user-settings-card"
      >
        <div className="security-item">
          <div className="security-item-title">登录密码</div>
          <div className="security-item-description">
            建议定期更换密码以保护账号安全
          </div>
          <Button 
            icon={<LockOutlined />}
            onClick={() => setPasswordModalVisible(true)}
          >
            修改密码
          </Button>
        </div>
      </Card>

      {/* 赛区信息卡片 */}
      {showRegionChange && (
        <Card 
          title={
            <Space>
              <GlobalOutlined />
              赛区信息
            </Space>
          }
          className="user-settings-card"
        >
          <div className="region-info-item">
            <span className="region-info-label">当前省份：</span>
            <span className="region-info-value">{userInfo.province || '未设置'}</span>
          </div>
          <div className="region-info-item">
            <span className="region-info-label">当前学校：</span>
            <span className="region-info-value">{userInfo.school || '未设置'}</span>
          </div>
          <div className="region-change-note">
            修改赛区信息需要管理员审核批准
          </div>
          <Button 
            icon={<GlobalOutlined />}
            onClick={() => setRegionModalVisible(true)}
          >
            申请变更赛区
          </Button>
        </Card>
      )}

      {/* 危险操作区域 */}
      <Card 
        title="危险操作"
        className="user-settings-card"
      >
        <div className="danger-zone">
          <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
            <strong>注意：</strong>以下操作会影响您的账号状态，请谨慎操作。
          </div>
          <Button 
            danger 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            注销账号
          </Button>
        </div>
      </Card>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onOk={handlePasswordChange}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        confirmLoading={passwordLoading}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
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
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 变更赛区模态框 */}
      {showRegionChange && (
        <Modal
          title="申请变更赛区"
          open={regionModalVisible}
          onOk={handleRegionChangeRequest}
          onCancel={() => {
            setRegionModalVisible(false);
            regionForm.resetFields();
          }}
          confirmLoading={regionLoading}
          okText="提交申请"
          cancelText="取消"
        >
          <Form form={regionForm} layout="vertical">
            <Form.Item
              name="province"
              label="省份"
              rules={[{ required: true, message: '请选择省份' }]}
            >
              <Select
                placeholder="请选择省份"
                onChange={handleProvinceChange}
              >
                {provinces.map(province => (
                  <Select.Option key={province.id} value={province.id}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="school"
              label="学校"
              rules={[{ required: true, message: '请选择学校' }]}
            >
              <Select
                placeholder="请先选择省份"
                disabled={!selectedProvince}
              >
                {availableSchools.map(school => (
                  <Select.Option key={school.id} value={school.id}>
                    {school.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="reason"
              label="申请理由"
              rules={[{ required: true, message: '请输入申请理由' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="请详细说明变更赛区的理由"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default UserSettings;
