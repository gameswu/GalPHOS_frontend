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
  UserAddOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { StudentRegistrationRequest } from '../../../types/common';
import AdminAPI from '../../../api/admin';
import '../../../styles/responsive.css';

const { Title } = Typography;
const { TextArea } = Input;

const StudentRegistrationManagement: React.FC = () => {
  const [requests, setRequests] = useState<StudentRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<StudentRegistrationRequest | null>(null);
  const [reviewForm] = Form.useForm();

  // 加载学生注册申请
  const loadRequests = async () => {
    setLoading(true);
    try {
      // 优先使用API获取申请记录
      const response = await AdminAPI.getStudentRegistrations();
      if (response.success && response.data?.requests) {
        setRequests(response.data.requests);
      } else {
        message.warning('API获取失败，使用本地数据');
        // 回退到localStorage方式
        const requestsData = JSON.parse(localStorage.getItem('studentRegistrationRequests') || '[]');
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('API获取学生注册申请失败:', error);
      message.warning('API暂不可用，使用本地数据');
      // 回退到localStorage方式
      try {
        const requestsData = JSON.parse(localStorage.getItem('studentRegistrationRequests') || '[]');
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
  const handleReview = (request: StudentRegistrationRequest) => {
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
        const response = await AdminAPI.reviewStudentRegistration(currentRequest.id, {
          action: values.action,
          note: values.note
        });
        
        if (response.success) {
          message.success(`申请已${values.action === 'approve' ? '批准' : '拒绝'}`);
          // 如果批准，还需要创建教练-学生关系
          if (values.action === 'approve') {
            await handleApprovedStudent(currentRequest);
          }
          // API成功后重新加载数据
          await loadRequests();
        } else {
          message.warning('API处理失败，使用本地处理方式');
          // API失败时回退到本地处理
          await handleLocalReview(values);
        }
      } catch (error) {
        console.error('API处理学生注册申请失败:', error);
        message.warning('API暂不可用，使用本地处理方式');
        // API失败时回退到本地处理
        await handleLocalReview(values);
      }
      
      setReviewModalVisible(false);
      setCurrentRequest(null);
    } catch (error) {
      message.error('审核失败，请重试');
    }
  };

  // 本地审核处理（回退方案）
  const handleLocalReview = async (values: any) => {
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
    localStorage.setItem('studentRegistrationRequests', JSON.stringify(updatedRequests));
    
    // 如果批准，将学生添加到已审核用户列表
    if (values.action === 'approve') {
      await addApprovedStudent(currentRequest);
    }
    
    message.success(`申请已${values.action === 'approve' ? '批准' : '拒绝'}（本地处理）`);
  };

  // 处理批准的学生（API模式）
  const handleApprovedStudent = async (request: StudentRegistrationRequest) => {
    try {
      // 直接调用教练-学生关系创建API
      const response = await AdminAPI.createCoachStudentRelation({
        coachId: request.coachUsername, // 暂时使用username作为ID
        studentId: request.username     // 暂时使用username作为ID
      });
      
      if (response.success) {
        message.success('教练-学生关系创建成功');
      } else {
        message.warning('教练-学生关系创建失败，请手动处理');
      }
    } catch (error) {
      console.error('创建教练-学生关系失败:', error);
      message.warning('教练-学生关系创建失败，将使用本地存储方式');
      // 回退到原有的本地处理方式
      await addApprovedStudent(request);
    }
  };

  // 添加已批准的学生到系统
  const addApprovedStudent = async (request: StudentRegistrationRequest) => {
    try {
      // 获取已审核用户列表
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      
      // 创建新学生用户
      const newStudent = {
        id: `student_${Date.now()}`,
        username: request.username,
        password: request.password,
        role: 'student',
        type: 'user',
        province: request.province,
        school: request.school,
        coachUsername: request.coachUsername,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      // 添加到已审核用户列表
      approvedUsers.push(newStudent);
      localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
      
      // 同时更新教练的学生列表
      await updateCoachStudentList(request.coachUsername, newStudent);
      
    } catch (error) {
      console.error('添加已批准学生失败:', error);
    }
  };

  // 更新教练的学生列表 - 使用API调用替代localStorage
  const updateCoachStudentList = async (coachUsername: string, newStudent: any) => {
    try {
      // 优先尝试API调用
      const response = await AdminAPI.createCoachStudentRelation({
        coachId: coachUsername, // 暂时使用username作为ID
        studentId: newStudent.id
      });
      
      if (response.success) {
        message.success('教练-学生关系创建成功');
        return;
      } else {
        message.warning('API创建关系失败，使用本地存储方式');
      }
    } catch (error) {
      console.error('API创建教练学生关系失败:', error);
      message.warning('API暂不可用，使用本地存储方式');
    }
    
    // API失败时回退到localStorage方式
    try {
      const allCoachStudents = JSON.parse(localStorage.getItem('coachStudents') || '{}');
      
      if (!allCoachStudents[coachUsername]) {
        allCoachStudents[coachUsername] = [];
      }
      
      // 添加新学生到教练的学生列表
      allCoachStudents[coachUsername].push(newStudent);
      
      localStorage.setItem('coachStudents', JSON.stringify(allCoachStudents));
      message.info('已使用本地存储方式保存关系');
    } catch (error) {
      console.error('更新教练学生列表失败:', error);
      message.error('创建教练-学生关系失败');
    }
  };

  const columns = [
    {
      title: '学生用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '省份/学校',
      key: 'location',
      className: 'mobile-hidden',
      render: (_: any, record: StudentRegistrationRequest) => (
        <div>
          <div style={{ marginBottom: 4 }}>{record.province}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.school}</div>
        </div>
      )
    },
    {
      title: '申请教练/时间',
      key: 'coachAndTime',
      className: 'mobile-hidden',
      render: (_: any, record: StudentRegistrationRequest) => (
        <div>
          <div style={{ marginBottom: 4 }}>{record.coachUsername}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{new Date(record.createdAt).toLocaleString()}</div>
        </div>
      )
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
      render: (_: any, record: StudentRegistrationRequest) => (
        <Space size="small" className="responsive-buttons">
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
            <UserAddOutlined style={{ marginRight: 8 }} />
            学生注册申请管理
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
            scroll={{ x: 800 }}
          />
        </div>
      </Card>

      {/* 审核模态框 */}
      <Modal
        title="审核学生注册申请"
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
              <Descriptions.Item label="学生用户名" span={3}>
                {currentRequest.username}
              </Descriptions.Item>
              <Descriptions.Item label="省份" span={1}>
                {currentRequest.province}
              </Descriptions.Item>
              <Descriptions.Item label="学校" span={2}>
                {currentRequest.school}
              </Descriptions.Item>
              <Descriptions.Item label="申请教练" span={1}>
                {currentRequest.coachUsername}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间" span={2}>
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

export default StudentRegistrationManagement;
