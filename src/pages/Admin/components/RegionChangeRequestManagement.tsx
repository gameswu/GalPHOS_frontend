import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select,
  message,
  Descriptions,
  Typography
} from 'antd';
import { 
  SwapOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { RegionChangeRequest } from '../../../types/common';

const { Title } = Typography;
const { TextArea } = Input;

const RegionChangeRequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<RegionChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<RegionChangeRequest | null>(null);
  const [reviewForm] = Form.useForm();

  // 加载赛区变更申请
  const loadRequests = async () => {
    setLoading(true);
    try {
      // 从localStorage获取申请记录（实际应该从后端API获取）
      const requestsData = JSON.parse(localStorage.getItem('regionChangeRequests') || '[]');
      setRequests(requestsData);
    } catch (error) {
      message.error('加载申请记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // 开始审核
  const handleReview = (request: RegionChangeRequest) => {
    setCurrentRequest(request);
    setReviewModalVisible(true);
    reviewForm.resetFields();
  };

  // 提交审核结果
  const handleSubmitReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      
      if (!currentRequest) return;
      
      // 更新申请状态
      const updatedRequests = requests.map(req => 
        req.id === currentRequest.id 
          ? {
              ...req,
              status: values.action as 'approved' | 'rejected',
              reviewedBy: 'admin', // 实际应该使用当前管理员的用户名
              reviewedAt: new Date().toISOString(),
              reviewNote: values.note
            }
          : req
      );
      
      setRequests(updatedRequests);
      localStorage.setItem('regionChangeRequests', JSON.stringify(updatedRequests));
      
      // 如果批准，更新用户的赛区信息
      if (values.action === 'approved') {
        updateUserRegion(currentRequest);
      }
      
      message.success(`申请已${values.action === 'approved' ? '批准' : '拒绝'}`);
      setReviewModalVisible(false);
      setCurrentRequest(null);
    } catch (error) {
      message.error('审核失败，请重试');
    }
  };

  // 更新用户赛区信息
  const updateUserRegion = (request: RegionChangeRequest) => {
    try {
      // 更新已审核用户列表中的用户信息
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      const updatedUsers = approvedUsers.map((user: any) => 
        user.username === request.username && user.role === request.role
          ? {
              ...user,
              province: request.requestedProvince,
              school: request.requestedSchool
            }
          : user
      );
      
      localStorage.setItem('approvedUsers', JSON.stringify(updatedUsers));
      
      // 如果用户当前已登录，也更新userInfo
      const currentUserInfo = localStorage.getItem('userInfo');
      if (currentUserInfo) {
        const userInfo = JSON.parse(currentUserInfo);
        if (userInfo.username === request.username && userInfo.role === request.role) {
          const updatedUserInfo = {
            ...userInfo,
            province: request.requestedProvince,
            school: request.requestedSchool
          };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        }
      }
    } catch (error) {
      console.error('更新用户赛区信息失败:', error);
    }
  };

  const columns = [
    {
      title: '申请人',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          student: '学生',
          grader: '阅卷者',
          coach: '教练'
        };
        return roleMap[role as keyof typeof roleMap] || role;
      }
    },
    {
      title: '当前赛区',
      key: 'currentRegion',
      render: (_: any, record: RegionChangeRequest) => 
        `${record.currentProvince || '未设置'} - ${record.currentSchool || '未设置'}`
    },
    {
      title: '申请变更为',
      key: 'requestedRegion',
      render: (_: any, record: RegionChangeRequest) => 
        `${record.requestedProvince} - ${record.requestedSchool}`
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已批准' },
          rejected: { color: 'red', text: '已拒绝' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RegionChangeRequest) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleReview(record)}
          >
            {record.status === 'pending' ? '审核' : '查看详情'}
          </Button>
        </Space>
      ),
    },
  ];

  // 统计数据
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const approvedRequests = requests.filter(req => req.status === 'approved').length;
  const rejectedRequests = requests.filter(req => req.status === 'rejected').length;

  return (
    <div>
      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{totalRequests}</div>
            <div style={{ color: '#666' }}>总申请数</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>{pendingRequests}</div>
            <div style={{ color: '#666' }}>待审核</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{approvedRequests}</div>
            <div style={{ color: '#666' }}>已批准</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>{rejectedRequests}</div>
            <div style={{ color: '#666' }}>已拒绝</div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4}>
            <SwapOutlined style={{ marginRight: 8 }} />
            赛区变更申请管理
          </Title>
          <Button onClick={loadRequests}>刷新</Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 审核模态框 */}
      <Modal
        title="审核赛区变更申请"
        open={reviewModalVisible}
        onOk={handleSubmitReview}
        onCancel={() => {
          setReviewModalVisible(false);
          setCurrentRequest(null);
        }}
        okText="提交审核"
        cancelText="取消"
        width={600}
      >
        {currentRequest && (
          <div>
            <Descriptions bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="申请人" span={2}>
                {currentRequest.username}
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                {currentRequest.role === 'student' ? '学生' : 
                 currentRequest.role === 'grader' ? '阅卷者' : '教练'}
              </Descriptions.Item>
              <Descriptions.Item label="当前省份" span={2}>
                {currentRequest.currentProvince || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="当前学校">
                {currentRequest.currentSchool || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="申请省份" span={2}>
                {currentRequest.requestedProvince}
              </Descriptions.Item>
              <Descriptions.Item label="申请学校">
                {currentRequest.requestedSchool}
              </Descriptions.Item>
              <Descriptions.Item label="申请理由" span={3}>
                {currentRequest.reason}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间" span={3}>
                {new Date(currentRequest.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {currentRequest.status === 'pending' ? (
              <Form form={reviewForm} layout="vertical">
                <Form.Item
                  name="action"
                  label="审核结果"
                  rules={[{ required: true, message: '请选择审核结果' }]}
                >
                  <Select placeholder="请选择审核结果">
                    <Select.Option value="approved">
                      <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      批准
                    </Select.Option>
                    <Select.Option value="rejected">
                      <CloseOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                      拒绝
                    </Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="note"
                  label="审核备注"
                  rules={[{ required: true, message: '请输入审核备注' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请输入审核备注，说明批准或拒绝的理由"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Form>
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <strong>审核结果：</strong>
                  <Tag color={currentRequest.status === 'approved' ? 'green' : 'red'}>
                    {currentRequest.status === 'approved' ? '已批准' : '已拒绝'}
                  </Tag>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>审核人：</strong>{currentRequest.reviewedBy}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>审核时间：</strong>{currentRequest.reviewedAt && new Date(currentRequest.reviewedAt).toLocaleString()}
                </div>
                <div>
                  <strong>审核备注：</strong>{currentRequest.reviewNote}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RegionChangeRequestManagement;
