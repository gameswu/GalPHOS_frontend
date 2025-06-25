import React, { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Statistic, Row, Col, Modal, Form, Input, Select } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Student, Exam } from '../hooks/useCoachLogic';

const { Title, Text } = Typography;

interface CoachContentProps {
  selectedKey: string;
  userInfo: {
    username: string;
    role: 'coach';
    province?: string;
    school?: string;
  };
  loading: boolean;
  students: Student[];
  exams: Exam[];
  onAccountSettings: () => void;
  onAddStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => void;
  onUpdateStudent: (studentId: string, studentData: Partial<Student>) => void;
  onDeleteStudent: (studentId: string) => void;
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
          <Statistic title="角色" value="教练" />
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

// 学生管理页面
const StudentsPage: React.FC<{ 
  students: Student[]; 
  loading: boolean;
  onAddStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => void;
  onUpdateStudent: (studentId: string, studentData: Partial<Student>) => void;
  onDeleteStudent: (studentId: string) => void;
}> = ({ students, loading, onAddStudent, onUpdateStudent, onDeleteStudent }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingStudent(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setModalVisible(true);
    form.setFieldsValue(student);
  };

  const handleDelete = (studentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个学生吗？',
      onOk: () => onDeleteStudent(studentId),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStudent) {
        onUpdateStudent(editingStudent.id, values);
      } else {
        onAddStudent(values);
      }
      setModalVisible(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

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
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4}>
            <TeamOutlined style={{ marginRight: 8 }} />
            学生管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加学生
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingStudent ? '编辑学生' : '添加学生'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingStudent(null);
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">活跃</Select.Option>
              <Select.Option value="inactive">非活跃</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

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
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => console.log('查看详情', record.id)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        当前考试
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
            onClick={() => console.log('查看详情', record.id)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        历史考试
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

const CoachContent: React.FC<CoachContentProps> = ({
  selectedKey,
  userInfo,
  loading,
  students,
  exams,
  onAccountSettings,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const renderContent = () => {
    switch (selectedKey) {
      case 'account':
        return <AccountSettingsPage userInfo={userInfo} />;
      case 'students':
        return (
          <StudentsPage 
            students={students} 
            loading={loading}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
          />
        );
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

export default CoachContent;
