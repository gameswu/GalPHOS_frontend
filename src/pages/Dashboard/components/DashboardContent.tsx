import React from 'react';
import { Card, Typography, Table, Button, Space, Tag, Statistic, Row, Col } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Student, Exam, GradingTask } from '../hooks/useDashboardLogic';

const { Title, Text } = Typography;

interface DashboardContentProps {
  selectedKey: string;
  userInfo: {
    username: string;
    role: 'coach' | 'student' | 'grader';
    province?: string;
    school?: string;
  };
  loading: boolean;
  students: Student[];
  exams: Exam[];
  gradingTasks: GradingTask[];
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
          <Statistic 
            title="角色" 
            value={userInfo.role === 'coach' ? '教练' : 
                   userInfo.role === 'student' ? '学生' : '阅卷者'} 
          />
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
    <div style={{ marginTop: 24 }}>
      <Button type="primary">修改密码</Button>
      <Button style={{ marginLeft: 8 }}>编辑资料</Button>
    </div>
  </Card>
);

// 学生管理页面（教练专用）
const StudentManagementPage: React.FC<{ 
  students: Student[]; 
  loading: boolean;
}> = ({ students, loading }) => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>
          <UserOutlined style={{ marginRight: 8 }} />
          学生管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          添加学生
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

// 历史试题页面
const HistoryExamsPage: React.FC<{ 
  exams: Exam[]; 
  loading: boolean; 
  role: string;
}> = ({ exams, loading, role }) => {
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
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} 分钟`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'upcoming' ? 'blue' : 
          status === 'ongoing' ? 'green' : 'default'
        }>
          {status === 'upcoming' ? '即将开始' : 
           status === 'ongoing' ? '进行中' : '已结束'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看试题
          </Button>
          {role === 'student' && record.status === 'completed' && (
            <Button type="link" size="small">
              查看成绩
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>
        <BookOutlined style={{ marginRight: 8 }} />
        历史试题
      </Title>
      <Table
        columns={columns}
        dataSource={exams.filter(exam => exam.status === 'completed')}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

// 当前考试页面
const CurrentExamPage: React.FC<{ 
  exams: Exam[]; 
  loading: boolean; 
  role: string;
}> = ({ exams, loading, role }) => {
  const currentExams = exams.filter(exam => 
    exam.status === 'upcoming' || exam.status === 'ongoing'
  );

  return (
    <Card>
      <Title level={4}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        当前考试
      </Title>
      {currentExams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="secondary">暂无进行中的考试</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {currentExams.map(exam => (
            <Col span={24} key={exam.id}>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {exam.title}
                    </Title>
                    <Text type="secondary">{exam.description}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={exam.status === 'upcoming' ? 'blue' : 'green'}>
                        {exam.status === 'upcoming' ? '即将开始' : '进行中'}
                      </Tag>
                      <Text style={{ marginLeft: 8 }}>
                        {new Date(exam.startTime).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                  <div>
                    {role === 'student' && exam.status === 'ongoing' && (
                      <Button type="primary" size="large">
                        开始考试
                      </Button>
                    )}
                    {role === 'coach' && (
                      <Space>
                        <Button>查看详情</Button>
                        <Button type="primary">管理考试</Button>
                      </Space>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

// 阅卷任务页面（阅卷者专用）
const GradingTasksPage: React.FC<{ 
  gradingTasks: GradingTask[]; 
  loading: boolean;
}> = ({ gradingTasks, loading }) => {
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
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'orange' : 'green'}>
          {status === 'pending' ? '待阅卷' : '已完成'}
        </Tag>
      ),
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number | undefined) => score ? `${score}分` : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: GradingTask) => (
        <Space size="small">
          {record.status === 'pending' ? (
            <Button type="primary" size="small" icon={<EditOutlined />}>
              开始阅卷
            </Button>
          ) : (
            <Button type="link" size="small" icon={<EyeOutlined />}>
              查看详情
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>
        <EditOutlined style={{ marginRight: 8 }} />
        阅卷任务
      </Title>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          待阅卷任务: <Text strong>{gradingTasks.filter(task => task.status === 'pending').length}</Text> 个
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={gradingTasks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

// 主内容组件
const DashboardContent: React.FC<DashboardContentProps> = ({
  selectedKey,
  userInfo,
  loading,
  students,
  exams,
  gradingTasks,
  onAccountSettings
}) => {
  switch (selectedKey) {
    case 'account':
      return <AccountSettingsPage userInfo={userInfo} />;
    
    case 'students':
      return <StudentManagementPage students={students} loading={loading} />;
    
    case 'history-exams':
      return <HistoryExamsPage exams={exams} loading={loading} role={userInfo.role} />;
    
    case 'current-exam':
      return <CurrentExamPage exams={exams} loading={loading} role={userInfo.role} />;
    
    case 'grading-tasks':
      return <GradingTasksPage gradingTasks={gradingTasks} loading={loading} />;
    
    default:
      return <AccountSettingsPage userInfo={userInfo} />;
  }
};

export default DashboardContent;