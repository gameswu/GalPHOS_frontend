import React, { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Statistic, Row, Col, Modal, Form, InputNumber } from 'antd';
import { 
  UserOutlined, 
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { GradingTask } from '../hooks/useGraderLogic';

const { Title, Text } = Typography;

interface GraderContentProps {
  selectedKey: string;
  userInfo: {
    username: string;
    role: 'grader';
    province?: string;
    school?: string;
  };
  loading: boolean;
  gradingTasks: GradingTask[];
  onAccountSettings: () => void;
  onCompleteGrading: (taskId: string, score: number) => void;
}

// 账户设置页面
const AccountSettingsPage: React.FC<{ userInfo: any }> = ({ userInfo }) => (
  <Card>
    <Title level={4}>
      <UserOutlined style={{ marginRight: 8 }} />
      账户信息
    </Title>
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card size="small">
          <Statistic title="用户名" value={userInfo.username} />
        </Card>
      </Col>
      <Col span={12}>
        <Card size="small">
          <Statistic title="角色" value="阅卷者" />
        </Card>
      </Col>
      {userInfo.province && (
        <>
          <Col span={12}>
            <Card size="small">
              <Statistic title="省份" value={userInfo.province} />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small">
              <Statistic title="学校" value={userInfo.school} />
            </Card>
          </Col>
        </>
      )}
    </Row>
  </Card>
);

// 阅卷任务页面
const GradingTasksPage: React.FC<{ 
  gradingTasks: GradingTask[]; 
  loading: boolean;
  onCompleteGrading: (taskId: string, score: number) => void;
}> = ({ gradingTasks, loading, onCompleteGrading }) => {
  const [gradingModalVisible, setGradingModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<GradingTask | null>(null);
  const [form] = Form.useForm();

  const handleStartGrading = (task: GradingTask) => {
    setCurrentTask(task);
    setGradingModalVisible(true);
    form.resetFields();
  };

  const handleSubmitGrading = async () => {
    try {
      const values = await form.validateFields();
      if (currentTask) {
        onCompleteGrading(currentTask.id, values.score);
        setGradingModalVisible(false);
        setCurrentTask(null);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const columns = [
    {
      title: '考试名称',
      dataIndex: 'examTitle',
      key: 'examTitle',
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: '待阅卷' },
          completed: { color: 'green', text: '已完成' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
      render: (score: number | undefined) => score !== undefined ? `${score}分` : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: GradingTask) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => console.log('查看试卷', record.id)}
          >
            查看试卷
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="primary"
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleStartGrading(record)}
            >
              开始阅卷
            </Button>
          )}
          {record.status === 'completed' && (
            <Button 
              size="small" 
              icon={<CheckCircleOutlined />}
              disabled
            >
              已完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 统计数据
  const totalTasks = gradingTasks.length;
  const completedTasks = gradingTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = gradingTasks.filter(task => task.status === 'pending').length;

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>
          <EditOutlined style={{ marginRight: 8 }} />
          阅卷统计
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="总任务数" value={totalTasks} />
          </Col>
          <Col span={8}>
            <Statistic title="已完成" value={completedTasks} valueStyle={{ color: '#3f8600' }} />
          </Col>
          <Col span={8}>
            <Statistic title="待阅卷" value={pendingTasks} valueStyle={{ color: '#cf1322' }} />
          </Col>
        </Row>
      </Card>

      <Card>
        <Title level={4}>
          <EditOutlined style={{ marginRight: 8 }} />
          阅卷任务列表
        </Title>
        <Table
          columns={columns}
          dataSource={gradingTasks}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="阅卷评分"
        open={gradingModalVisible}
        onOk={handleSubmitGrading}
        onCancel={() => {
          setGradingModalVisible(false);
          setCurrentTask(null);
        }}
        okText="提交评分"
        cancelText="取消"
      >
        {currentTask && (
          <div>
            <p><strong>考试：</strong>{currentTask.examTitle}</p>
            <p><strong>学生：</strong>{currentTask.studentName}</p>
            <p><strong>提交时间：</strong>{new Date(currentTask.submittedAt).toLocaleString()}</p>
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="score"
                label="分数"
                rules={[
                  { required: true, message: '请输入分数' },
                  { type: 'number', min: 0, max: 100, message: '分数必须在0-100之间' }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="请输入分数"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </>
  );
};

const GraderContent: React.FC<GraderContentProps> = ({
  selectedKey,
  userInfo,
  loading,
  gradingTasks,
  onAccountSettings,
  onCompleteGrading
}) => {
  const renderContent = () => {
    switch (selectedKey) {
      case 'account':
        return <AccountSettingsPage userInfo={userInfo} />;
      case 'grading-tasks':
        return (
          <GradingTasksPage 
            gradingTasks={gradingTasks} 
            loading={loading}
            onCompleteGrading={onCompleteGrading}
          />
        );
      default:
        return <div>页面未找到</div>;
    }
  };

  return <>{renderContent()}</>;
};

export default GraderContent;
