import React, { useState } from 'react';
import { Card, Typography, Statistic, Row, Col, Button, Table, Modal, Form, Input, Select, Space, Tag, message } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  FileTextOutlined,
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { Student, Exam, ExamSubmission, ExamAnswer } from '../hooks/useCoachLogic';
import UserSettings from '../../../components/UserSettings';
import CurrentExamPage from '../../../components/CurrentExamPage';
import HistoryExamPage from '../../../components/HistoryExamPage';

const { Title, Text } = Typography;

interface CoachContentProps {
  selectedKey: string;
  userInfo: {
    username: string;
    role: 'coach';
    province?: string;
    school?: string;
    avatar?: string;
  };
  loading: boolean;
  students: Student[];
  exams: Exam[];
  onAccountSettings: () => void;
  onAddStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateStudent: (studentId: string, studentData: Partial<Student>) => void;
  onDeleteStudent: (studentId: string) => void;
  updateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  requestRegionChange: (data: { province: string; school: string; reason: string }) => Promise<void>;
  onLogout: () => void;
  submitExamAnswers: (examId: string, answers: ExamAnswer[], studentUsername: string) => Promise<void>;
  getExamSubmission: (examId: string, studentUsername?: string) => ExamSubmission | null;
  downloadFile: (fileUrl: string, fileName: string) => void;
}

// 账户设置页面
const AccountSettingsPage: React.FC<{ 
  userInfo: any;
  updateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  requestRegionChange: (data: { province: string; school: string; reason: string }) => Promise<void>;
  onLogout: () => void;
}> = ({ userInfo, updateProfile, changePassword, requestRegionChange, onLogout }) => (
  <UserSettings
    userInfo={userInfo}
    onUpdateProfile={updateProfile}
    onChangePassword={changePassword}
    onRequestRegionChange={requestRegionChange}
    onLogout={onLogout}
  />
);

// 仪表板页面
const DashboardPage: React.FC<{ 
  students: Student[];
  exams: Exam[];
  getExamSubmission: (examId: string, studentUsername?: string) => ExamSubmission | null;
}> = ({ students, exams, getExamSubmission }) => {
  const currentTime = new Date();
  
  // 统计数据
  const activeStudents = students.filter(s => s.status === 'active').length;
  const currentExams = exams.filter(exam => 
    (exam.status === 'published' || exam.status === 'ongoing') && new Date(exam.endTime) > currentTime
  );
  
  const completedExams = exams.filter(exam => 
    exam.status === 'completed' || new Date(exam.endTime) < currentTime
  );

  // 计算学生参与度
  const totalParticipations = completedExams.reduce((sum, exam) => {
    const participatedCount = students.filter(student => 
      getExamSubmission(exam.id, student.username)
    ).length;
    return sum + participatedCount;
  }, 0);

  const averageParticipation = completedExams.length > 0 
    ? (totalParticipations / (completedExams.length * students.length)) * 100 
    : 0;

  return (
    <div>
      <Title level={4}>
        <UserOutlined style={{ marginRight: 8 }} />
        教练仪表板
      </Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="管理学生"
              value={activeStudents}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前考试"
              value={currentExams.length}
              suffix="场"
              valueStyle={{ color: '#52c41a' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="学生参与度"
              value={averageParticipation.toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="历史考试"
              value={completedExams.length}
              suffix="场"
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 学生概览 */}
      <Card title="学生概览" style={{ marginBottom: 16 }}>
        {students.length > 0 ? (
          <div>
            {students.slice(0, 5).map(student => (
              <div key={student.id} style={{ marginBottom: 12, padding: 12, background: '#f6f8fa', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold' }}>{student.name} ({student.username})</div>
                <div style={{ color: '#666', fontSize: 12 }}>
                  {student.grade} - {student.province} {student.school}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">暂无学生</Text>
        )}
      </Card>

      {/* 最近考试 */}
      <Card title="最近考试" style={{ marginBottom: 16 }}>
        {currentExams.length > 0 ? (
          <div>
            {currentExams.slice(0, 3).map(exam => (
              <div key={exam.id} style={{ marginBottom: 12, padding: 12, background: '#f6f8fa', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold' }}>{exam.title}</div>
                <div style={{ color: '#666', fontSize: 12 }}>
                  {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">暂无进行中的考试</Text>
        )}
      </Card>
    </div>
  );
};

// 学生管理页面
const StudentManagementPage: React.FC<{
  students: Student[];
  onAddStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateStudent: (studentId: string, studentData: Partial<Student>) => void;
  onDeleteStudent: (studentId: string) => void;
}> = ({ students, onAddStudent, onUpdateStudent, onDeleteStudent }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  // 处理添加学生
  const handleAddStudent = async (values: any) => {
    try {
      await onAddStudent(values);
      form.resetFields();
      setIsAddModalVisible(false);
      message.success('学生添加成功');
    } catch (error) {
      message.error('添加失败');
    }
  };

  // 处理编辑学生
  const handleEditStudent = async (values: any) => {
    if (!editingStudent) return;
    try {
      await onUpdateStudent(editingStudent.id, values);
      setIsEditModalVisible(false);
      setEditingStudent(null);
      form.resetFields();
      message.success('学生信息更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 处理删除学生
  const handleDeleteStudent = (studentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个学生吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await onDeleteStudent(studentId);
          message.success('学生删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 打开编辑对话框
  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue(student);
    setIsEditModalVisible(true);
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
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '学校',
      dataIndex: 'school',
      key: 'school',
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
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStudent(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>学生管理</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              添加学生
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={{
            total: students.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 添加学生对话框 */}
      <Modal
        title="添加学生"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStudent}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入学生姓名' }]}
          >
            <Input placeholder="请输入学生姓名" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="年级"
            rules={[{ required: true, message: '请选择年级' }]}
          >
            <Select placeholder="请选择年级">
              <Select.Option value="高一">高一</Select.Option>
              <Select.Option value="高二">高二</Select.Option>
              <Select.Option value="高三">高三</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请输入省份' }]}
          >
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item
            name="school"
            label="学校"
            rules={[{ required: true, message: '请输入学校' }]}
          >
            <Input placeholder="请输入学校" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
              <Button onClick={() => {
                setIsAddModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑学生对话框 */}
      <Modal
        title="编辑学生信息"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingStudent(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditStudent}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入学生姓名' }]}
          >
            <Input placeholder="请输入学生姓名" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="年级"
            rules={[{ required: true, message: '请选择年级' }]}
          >
            <Select placeholder="请选择年级">
              <Select.Option value="高一">高一</Select.Option>
              <Select.Option value="高二">高二</Select.Option>
              <Select.Option value="高三">高三</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请输入省份' }]}
          >
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item
            name="school"
            label="学校"
            rules={[{ required: true, message: '请输入学校' }]}
          >
            <Input placeholder="请输入学校" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                setEditingStudent(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
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
  onDeleteStudent,
  updateProfile,
  changePassword,
  requestRegionChange,
  onLogout,
  submitExamAnswers,
  getExamSubmission,
  downloadFile
}) => {
  switch (selectedKey) {
    case 'dashboard':
      return (
        <DashboardPage 
          students={students}
          exams={exams}
          getExamSubmission={getExamSubmission}
        />
      );
    
    case 'students':
      return (
        <StudentManagementPage
          students={students}
          onAddStudent={onAddStudent}
          onUpdateStudent={onUpdateStudent}
          onDeleteStudent={onDeleteStudent}
        />
      );
    
    case 'current-exam':
      return (
        <CurrentExamPage
          exams={exams}
          loading={loading}
          submitExamAnswers={(examId, answers, studentUsername) => 
            submitExamAnswers(examId, answers, studentUsername!)
          }
          getExamSubmission={getExamSubmission}
          downloadFile={downloadFile}
          userRole="coach"
          students={students}
        />
      );
    
    case 'history-exam':
      return (
        <HistoryExamPage
          exams={exams}
          loading={loading}
          downloadFile={downloadFile}
          getExamSubmission={getExamSubmission}
          userRole="coach"
          students={students}
        />
      );
    
    case 'account-settings':
      return (
        <AccountSettingsPage
          userInfo={userInfo}
          updateProfile={updateProfile}
          changePassword={changePassword}
          requestRegionChange={requestRegionChange}
          onLogout={onLogout}
        />
      );
    
    default:
      return (
        <DashboardPage 
          students={students}
          exams={exams}
          getExamSubmission={getExamSubmission}
        />
      );
  }
};

export default CoachContent;
