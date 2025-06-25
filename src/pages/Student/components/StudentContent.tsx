import React from 'react';
import { Card, Typography, Table, Button, Space, Tag, Statistic, Row, Col } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { Exam } from '../hooks/useStudentLogic';

const { Title, Text } = Typography;

interface StudentContentProps {
  selectedKey: string;
  userInfo: {
    username: string;
    role: 'student';
    province?: string;
    school?: string;
  };
  loading: boolean;
  exams: Exam[];
  onAccountSettings: () => void;
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
          <Statistic title="角色" value="学生" />
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

// 当前考试页面
const CurrentExamPage: React.FC<{ 
  exams: Exam[]; 
  loading: boolean;
}> = ({ exams, loading }) => {
  const currentExams = exams.filter(exam => exam.status === 'upcoming' || exam.status === 'ongoing');
  
  const columns = [
    {
      title: '考试名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}分钟`,
    },
    {
      title: '题目数',
      dataIndex: 'questions',
      key: 'questions',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          upcoming: { color: 'blue', text: '即将开始' },
          ongoing: { color: 'green', text: '进行中' },
          completed: { color: 'gray', text: '已结束' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small">
          {record.status === 'ongoing' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<PlayCircleOutlined />}
              onClick={() => console.log('开始考试', record.id)}
            >
              开始考试
            </Button>
          )}
          {record.status === 'upcoming' && (
            <Button 
              size="small" 
              icon={<ClockCircleOutlined />}
              disabled
            >
              等待开始
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        当前可参加的考试
      </Title>
      <Table
        columns={columns}
        dataSource={currentExams}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

// 历史考试页面
const HistoryExamsPage: React.FC<{ 
  exams: Exam[]; 
  loading: boolean;
}> = ({ exams, loading }) => {
  const historyExams = exams.filter(exam => exam.status === 'completed');
  
  const columns = [
    {
      title: '考试名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '考试时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}分钟`,
    },
    {
      title: '题目数',
      dataIndex: 'questions',
      key: 'questions',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="gray">已完成</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => console.log('查看结果', record.id)}
          >
            查看结果
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        历史考试记录
      </Title>
      <Table
        columns={columns}
        dataSource={historyExams}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

const StudentContent: React.FC<StudentContentProps> = ({
  selectedKey,
  userInfo,
  loading,
  exams,
  onAccountSettings
}) => {
  const renderContent = () => {
    switch (selectedKey) {
      case 'account':
        return <AccountSettingsPage userInfo={userInfo} />;
      case 'current-exam':
        return <CurrentExamPage exams={exams} loading={loading} />;
      case 'history-exams':
        return <HistoryExamsPage exams={exams} loading={loading} />;
      default:
        return <div>页面未找到</div>;
    }
  };

  return <>{renderContent()}</>;
};

export default StudentContent;
