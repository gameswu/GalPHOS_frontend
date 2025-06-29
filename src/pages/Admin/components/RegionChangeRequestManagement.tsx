import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
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
import AdminAPI from '../../../api/admin';
import '../../../styles/responsive.css';

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
      // 优先使用API获取申请记录
      const response = await AdminAPI.getRegionChangeRequests();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        message.warning('API获取失败，使用本地数据');
        // 回退到localStorage方式
        const requestsData = JSON.parse(localStorage.getItem('regionChangeRequests') || '[]');
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('API获取赛区变更申请失败:', error);
      message.warning('API暂不可用，使用本地数据');
      // 回退到localStorage方式
      try {
        const requestsData = JSON.parse(localStorage.getItem('regionChangeRequests') || '[]');
        setRequests(requestsData);
      } catch (localError) {
        console.error('加载本地申请记录失败:', localError);
        message.error('加载申请记录失败');
        setRequests([]);
      }
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
      
      // 优先使用API处理审核
      try {
        const response = await AdminAPI.handleRegionChangeRequest(
          currentRequest.id,
          values.action,
          values.note
        );
        
        if (response.success) {
          message.success(`申请已${values.action === 'approve' ? '批准' : '拒绝'}`);
          // API成功后重新加载数据
          await loadRequests();
        } else {
          message.warning('API处理失败，使用本地处理方式');
          // API失败时回退到本地处理
          handleLocalReview(values);
        }
      } catch (error) {
        console.error('API处理赛区变更申请失败:', error);
        message.warning('API暂不可用，使用本地处理方式');
        // API失败时回退到本地处理
        handleLocalReview(values);
      }
      
      setReviewModalVisible(false);
      setCurrentRequest(null);
    } catch (error) {
      message.error('审核失败，请重试');
    }
  };

  // 本地审核处理（回退方案）
  const handleLocalReview = (values: any) => {
    if (!currentRequest) return;
    
    // 更新申请状态
    const updatedRequests = requests.map(req => 
      req.id === currentRequest.id 
        ? {
            ...req,
            status: values.action as 'approved' | 'rejected',
            updatedAt: new Date().toISOString(),
            reviewedBy: 'admin', // 实际应该使用当前管理员的用户名
            reviewedAt: new Date().toISOString(),
            reviewNote: values.note
          }
        : req
    );
    
    setRequests(updatedRequests);
    localStorage.setItem('regionChangeRequests', JSON.stringify(updatedRequests));
    
    // 如果批准，更新用户的赛区信息
    if (values.action === 'approve') {
      updateUserRegion(currentRequest);
    }
    
    message.success(`申请已${values.action === 'approve' ? '批准' : '拒绝'}（本地处理）`);
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
      width: 100,
      render: (username: string, record: RegionChangeRequest) => {
        const roleMap = {
          student: '学生',
          grader: '阅卷者',
          coach: '教练'
        };
        const roleText = roleMap[record.role as keyof typeof roleMap] || record.role;
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>({roleText})</div>
          </div>
        );
      }
    },
    {
      title: '赛区变更申请',
      key: 'regionChangeInfo',
      width: 350,
      render: (_: any, record: RegionChangeRequest) => (
        <div style={{ fontSize: '13px' }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#666' }}>当前：</span>
            <span>{`${record.currentProvince || '未设置'} - ${record.currentSchool || '未设置'}`}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#666' }}>变更为：</span>
            <span style={{ color: '#1890ff' }}>{`${record.requestedProvince} - ${record.requestedSchool}`}</span>
          </div>
          <div style={{ color: '#999', fontSize: '12px' }}>
            申请时间：{record.createdAt ? new Date(record.createdAt).toLocaleString() : '-'}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
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
      title: '审核信息',
      key: 'reviewInfo',
      width: 160,
      render: (_: any, record: RegionChangeRequest) => {
        if (record.status === 'pending') {
          return <span style={{ color: '#faad14' }}>待审核</span>;
        }
        return (
          <div style={{ fontSize: '12px' }}>
            <div>审核者：{record.reviewedBy || '-'}</div>
            <div style={{ color: '#999' }}>
              {record.reviewedAt ? new Date(record.reviewedAt).toLocaleString() : '-'}
            </div>
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: RegionChangeRequest) => (
        <Button 
          size="small" 
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleReview(record)}
        >
          {record.status === 'pending' ? '审核' : '查看'}
        </Button>
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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>{totalRequests}</div>
          <div style={{ color: '#666', fontSize: '13px' }}>总申请数</div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>{pendingRequests}</div>
          <div style={{ color: '#666', fontSize: '13px' }}>待审核</div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>{approvedRequests}</div>
          <div style={{ color: '#666', fontSize: '13px' }}>已批准</div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5222d' }}>{rejectedRequests}</div>
          <div style={{ color: '#666', fontSize: '13px' }}>已拒绝</div>
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
        
        <div className="responsive-table-wrapper">
          <Table
            columns={columns}
            dataSource={requests}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="responsive-table"
            scroll={{ x: 780 }}
            size="small"
          />
        </div>
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
              <Descriptions.Item label="申请时间" span={2}>
                {new Date(currentRequest.createdAt).toLocaleString()}
              </Descriptions.Item>
              {currentRequest.updatedAt && currentRequest.updatedAt !== currentRequest.createdAt && (
                <Descriptions.Item label="最后修改时间" span={1}>
                  {new Date(currentRequest.updatedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {currentRequest.status !== 'pending' && (
                <>
                  <Descriptions.Item label="审核者" span={1}>
                    {currentRequest.reviewedBy || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="审核时间" span={2}>
                    {currentRequest.reviewedAt ? new Date(currentRequest.reviewedAt).toLocaleString() : '-'}
                  </Descriptions.Item>
                  {currentRequest.reviewNote && (
                    <Descriptions.Item label="审核备注" span={3}>
                      {currentRequest.reviewNote}
                    </Descriptions.Item>
                  )}
                </>
              )}
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
