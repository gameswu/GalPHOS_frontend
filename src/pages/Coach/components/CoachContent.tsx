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
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  requestRegionChange: (data: { province: string; school: string; reason: string }) => Promise<void>;
  onLogout: () => void;
  submitExamAnswers: (examId: string, answers: ExamAnswer[], studentUsername: string) => Promise<void>;
  getExamSubmission: (examId: string, studentUsername?: string) => Promise<ExamSubmission | null>;
  downloadFile: (fileUrl: string, fileName: string) => void;
  getExamDetail: (examId: string) => Promise<any>;
  uploadAnswerImage: (examId: string, file: File, questionNumber: number, studentUsername: string) => Promise<string | null>;
  getGradeReports: (params?: { examId?: string; studentUsername?: string }) => Promise<any[]>;
  getDashboardStats: () => Promise<any>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

// 账户设置页面
const AccountSettingsPage: React.FC<{ 
  userInfo: any;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
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

// 增强仪表板页面
const EnhancedDashboardPage: React.FC<{ 
  students: Student[];
  exams: Exam[];
  getDashboardStats: () => Promise<any>;
}> = ({ students, exams, getDashboardStats }) => {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const stats = await getDashboardStats();
        setStatsData(stats);
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [getDashboardStats]);

  // 本地计算的统计数据作为后备
  const currentTime = new Date();
  const activeStudents = students.filter(s => s.status === 'active').length;
  const currentExams = exams.filter(exam => 
    (exam.status === 'published' || exam.status === 'ongoing') && new Date(exam.endTime) > currentTime
  );
  const completedExams = exams.filter(exam => 
    exam.status === 'completed' || new Date(exam.endTime) < currentTime
  );

  // 使用API数据或本地计算数据
  const displayStats = statsData || {
    totalStudents: students.length,
    activeStudents,
    totalExams: exams.length,
    currentExams: currentExams.length,
    completedExams: completedExams.length,
    pendingGrading: 0,
    averageScore: 0
  };

  return (
    <div>
      <Title level={4}>
        <UserOutlined style={{ marginRight: 8 }} />
        教练仪表板
      </Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={displayStats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃学生"
              value={displayStats.activeStudents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="进行中考试"
              value={displayStats.currentExams}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成考试"
              value={displayStats.completedExams}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {statsData && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="待批改答卷"
                  value={statsData.pendingGrading || 0}
                  valueStyle={{ color: '#fa541c' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="平均成绩"
                  value={statsData.averageScore || 0}
                  precision={1}
                  suffix="分"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="参与率"
                  value={statsData.participationRate || 0}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="及格率"
                  value={statsData.passRate || 0}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {statsData.recentActivity && (
            <Card title="最近活动" style={{ marginBottom: 24 }}>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {statsData.recentActivity.map((activity: any, index: number) => (
                  <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Text>{activity.description}</Text>
                    <Text type="secondary" style={{ float: 'right' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {statsData.topStudents && (
            <Card title="优秀学生" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                {statsData.topStudents.slice(0, 5).map((student: any, index: number) => (
                  <Col key={student.id} xs={24} sm={12} md={8}>
                    <Card size="small">
                      <Text strong>{student.name}</Text>
                      <br />
                      <Text type="secondary">平均分: {student.averageScore}分</Text>
                      <br />
                      <Text type="secondary">排名: #{index + 1}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      )}
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
  downloadFile,
  getExamDetail,
  uploadAnswerImage,
  getGradeReports,
  getDashboardStats,
  uploadAvatar
}) => {
  switch (selectedKey) {
    case 'dashboard':
      return (
        <EnhancedDashboardPage 
          students={students}
          exams={exams}
          getDashboardStats={getDashboardStats}
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
          getExamSubmission={(examId, studentUsername) => {
            // 为了兼容性，这里返回null，实际应该重构组件支持异步
            return null;
          }}
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
          getExamSubmission={(examId, studentUsername) => {
            // 为了兼容性，这里返回null，实际应该重构组件支持异步
            return null;
          }}
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
          getExamSubmission={(examId, studentUsername) => {
            // 为了兼容性，这里返回null，实际应该重构组件支持异步
            return null;
          }}
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
        <EnhancedDashboardPage 
          students={students}
          exams={exams}
          getDashboardStats={getDashboardStats}
        />
      );
  }
};

export default CoachContent;
