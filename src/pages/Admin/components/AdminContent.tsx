import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Statistic, 
  Row, 
  Col,
  Tabs,
  Popconfirm,
  Input,
  Select,
  Avatar
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EnvironmentOutlined,
  StopOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import type { PendingUser, ApprovedUser } from '../hooks/useAdminLogic';
import type { 
  Province,
  Exam,
  GradingTask,
  AdminGradingTask,
  GraderInfo,
  AdminUser,
  SystemSettings as SystemSettingsType,
  PasswordChangeData,
  AdminCreateData
} from '../../../types/common';
import RegionManagement from './RegionManagement';
import RegionChangeRequestManagement from './RegionChangeRequestManagement';
import StudentRegistrationManagement from './StudentRegistrationManagement';
import ExamManagement from './ExamManagement';
import GradingManagement from './GradingManagement';
import SystemSettings from './SystemSettings';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface AdminContentProps {
  selectedKey: string;
  pendingUsers: PendingUser[];
  approvedUsers: ApprovedUser[];
  regions: Province[];
  exams: Exam[];
  graders: GraderInfo[];
  gradingTasks: AdminGradingTask[];
  adminUsers: AdminUser[];
  systemSettings: SystemSettingsType | null;
  currentAdmin: AdminUser | null;
  pendingCount: number;
  loading: boolean;
  isOffline: boolean;
  coachStudentsStats?: {
    totalCoachStudents: number;
    coachStudentsByCoach: { [coachId: string]: number };
  };
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onEnableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddProvince: (name: string) => void;
  onAddSchool: (provinceId: string, schoolName: string) => void;
  onUpdateSchool: (provinceId: string, schoolId: string, schoolName: string) => void;
  onDeleteSchool: (provinceId: string, schoolId: string) => void;
  onDeleteProvince: (provinceId: string) => void;
  onCreateExam: (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  onUpdateExam: (examId: string, examData: Partial<Exam>) => Promise<void>;
  onPublishExam: (examId: string) => Promise<void>;
  onUnpublishExam: (examId: string) => Promise<void>;
  onDeleteExam: (examId: string) => Promise<void>;
  onUploadFile: (file: File, type: 'question' | 'answer' | 'answerSheet') => Promise<any>;
  onAssignGradingTask: (examId: string, questionNumber: number, graderIds: string[]) => Promise<void>;
  onGetGradingProgress: (examId: string) => any;
  onUpdateGradingProgress: (taskId: string) => Promise<void>;
  onChangeAdminPassword: (adminId: string, passwordData: PasswordChangeData) => Promise<void>;
  onUpdateAdmin: (adminId: string, updateData: Partial<AdminUser>) => Promise<void>;
  onCreateAdmin: (adminData: AdminCreateData) => Promise<void>;
  onDeleteAdmin: (adminId: string) => Promise<void>;
  onUpdateSystemSettings: (settings: Partial<SystemSettingsType>) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
}

// 仪表盘页面
const DashboardPage: React.FC<{ 
  pendingCount: number; 
  isOffline: boolean;
  regions: Province[];
  approvedUsers: ApprovedUser[];
  exams: Exam[];
  gradingTasks: AdminGradingTask[];
  graders: GraderInfo[];
  coachStudentsStats?: {
    totalCoachStudents: number;
    coachStudentsByCoach: { [coachId: string]: number };
  };
}> = ({ pendingCount, isOffline, regions, approvedUsers, exams, gradingTasks, graders, coachStudentsStats }) => {
  const totalSchools = regions.reduce((sum, region) => sum + region.schools.length, 0);
  const activeUsers = approvedUsers.filter(user => user.status === 'approved').length;
  
  // 考试统计
  const examStats = {
    total: exams.length,
    published: exams.filter(e => e.status === 'published').length,
    ongoing: exams.filter(e => e.status === 'ongoing').length,
    grading: exams.filter(e => e.status === 'grading').length,
    completed: exams.filter(e => e.status === 'completed').length
  };

  // 阅卷统计
  const gradingStats = {
    totalTasks: gradingTasks.length,
    pendingTasks: gradingTasks.filter(t => t.status === 'pending').length,
    inProgressTasks: gradingTasks.filter(t => t.status === 'in_progress').length,
    completedTasks: gradingTasks.filter(t => t.status === 'completed').length,
    availableGraders: graders.filter(g => g.status === 'available').length,
    busyGraders: graders.filter(g => g.status === 'busy').length
  };

  // 用户角色统计
  const userRoleStats = {
    coaches: approvedUsers.filter(u => u.role === 'coach').length,
    students: approvedUsers.filter(u => u.role === 'student').length,
    graders: approvedUsers.filter(u => u.role === 'grader').length
  };

  // 教练管理的学生统计 - 优先使用API数据，回退到localStorage
  const getCoachManagedStudentsCount = () => {
    // 优先使用API数据
    if (coachStudentsStats && coachStudentsStats.totalCoachStudents >= 0) {
      return coachStudentsStats.totalCoachStudents;
    }
    
    // API数据不可用时，回退到localStorage
    try {
      const allCoachStudents = JSON.parse(localStorage.getItem('coachStudents') || '{}');
      return Object.values(allCoachStudents).reduce((total: number, students: any) => 
        total + (Array.isArray(students) ? students.length : 0), 0
      );
    } catch {
      return 0;
    }
  };
  
  const coachManagedStudentsCount = getCoachManagedStudentsCount();

  return (
    <div>
      {/* 基础统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核用户"
              value={pendingCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={activeUsers}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="省份总数"
              value={regions.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="学校总数"
              value={totalSchools}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户角色统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="教练数量"
              value={userRoleStats.coaches}
              valueStyle={{ color: '#1890ff' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="独立学生"
              value={userRoleStats.students}
              valueStyle={{ color: '#52c41a' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="教练管理学生"
              value={coachManagedStudentsCount}
              valueStyle={{ color: '#13c2c2' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="阅卷者数量"
              value={userRoleStats.graders}
              valueStyle={{ color: '#fa8c16' }}
              suffix="人"
            />
          </Card>
        </Col>
      </Row>

      {/* 考试统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="考试统计" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="考试总数"
                  value={examStats.total}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="已发布"
                  value={examStats.published}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {examStats.ongoing}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>考试中</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722ed1' }}>
                    {examStats.grading}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>阅卷中</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                    {examStats.completed}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>已完成</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="阅卷统计" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="总任务数"
                  value={gradingStats.totalTasks}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="已完成"
                  value={gradingStats.completedTasks}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {gradingStats.pendingTasks}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>待开始</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722ed1' }}>
                    {gradingStats.inProgressTasks}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>进行中</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                    {gradingStats.availableGraders}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>空闲阅卷者</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {isOffline && (
        <Card style={{ marginBottom: 24, borderColor: '#ff4d4f' }}>
          <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
            <Title level={4}>系统离线</Title>
            <Text>当前系统处于离线状态，部分功能可能受限</Text>
          </div>
        </Card>
      )}

      <Card>
        <Title level={4}>系统概览</Title>
        <Paragraph>
          欢迎使用 <Text strong>GalPHOS 物理竞赛管理系统</Text>！
        </Paragraph>
        <Paragraph>
          <Text type="secondary">
            当前系统运行正常，共有 <Text strong style={{ color: '#cf1322' }}>{pendingCount}</Text> 个用户等待审核，
            <Text strong style={{ color: '#52c41a' }}>{activeUsers}</Text> 个活跃用户，
            管理着 <Text strong style={{ color: '#1890ff' }}>{regions.length}</Text> 个省份的 
            <Text strong style={{ color: '#fa8c16' }}>{totalSchools}</Text> 所学校。
          </Text>
        </Paragraph>
        <Paragraph>
          <Text type="secondary">
            系统共有 <Text strong>{examStats.total}</Text> 场考试，
            其中 <Text strong style={{ color: '#52c41a' }}>{examStats.published}</Text> 场已发布，
            <Text strong style={{ color: '#fa8c16' }}>{examStats.ongoing}</Text> 场正在进行，
            <Text strong style={{ color: '#722ed1' }}>{examStats.grading}</Text> 场正在阅卷。
          </Text>
        </Paragraph>
        <Paragraph>
          <Text type="secondary">
            阅卷系统有 <Text strong>{graders.length}</Text> 位阅卷者，
            <Text strong style={{ color: '#52c41a' }}>{gradingStats.availableGraders}</Text> 位空闲，
            <Text strong style={{ color: '#fa8c16' }}>{gradingStats.busyGraders}</Text> 位忙碌，
            共 <Text strong>{gradingStats.totalTasks}</Text> 个阅卷任务。
          </Text>
        </Paragraph>
      </Card>
    </div>
  );
};

// 用户管理页面
const UserManagementPage: React.FC<{
  pendingUsers: PendingUser[];
  approvedUsers: ApprovedUser[];
  loading: boolean;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onEnableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}> = ({ pendingUsers, approvedUsers, loading, onApprove, onReject, onDisableUser, onEnableUser, onDeleteUser }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // 待审核用户表格列
  const pendingColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '用户类型',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          student: { text: '学生', color: 'blue' },
          coach: { text: '教练', color: 'green' },
          grader: { text: '阅卷者', color: 'orange' }
        };
        const roleInfo = roleMap[role as keyof typeof roleMap];
        return <Tag color={roleInfo?.color}>{roleInfo?.text}</Tag>;
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
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
      title: '申请时间',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { text: '待审核', color: 'processing' },
          approved: { text: '已通过', color: 'success' },
          rejected: { text: '已拒绝', color: 'error' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PendingUser) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onApprove(record.id)}
                loading={loading}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => onReject(record.id)}
                loading={loading}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 已审核用户表格列
  const approvedColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '用户类型',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          student: { text: '学生', color: 'blue' },
          coach: { text: '教练', color: 'green' },
          grader: { text: '阅卷者', color: 'orange' }
        };
        const roleInfo = roleMap[role as keyof typeof roleMap];
        return <Tag color={roleInfo?.color}>{roleInfo?.text}</Tag>;
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
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
      title: '审核时间',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (text: string) => (
        <Text type="secondary">
          {text ? new Date(text).toLocaleString() : '从未登录'}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          approved: { text: '正常', color: 'success' },
          active: { text: '正常', color: 'success' },
          disabled: { text: '禁用', color: 'default' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovedUser) => (
        <Space size="small">
          {/* 修复状态判断逻辑 */}
          {(record.status === 'approved' || record.status === 'active') ? (
            <Button
              size="small"
              icon={<StopOutlined />}
              onClick={() => onDisableUser(record.id)}
              loading={loading}
            >
              禁用
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => onEnableUser(record.id)}
              loading={loading}
            >
              启用
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="删除后将无法恢复"
            onConfirm={() => onDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={loading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 过滤数据 - 修复可能的undefined值
  const filteredApprovedUsers = approvedUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.phone.includes(searchText) ||
                         (user.province || '').toLowerCase().includes(searchText.toLowerCase()) ||
                         (user.school || '').toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // 待审核用户筛选
  const filteredPendingUsers = pendingUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.phone.includes(searchText) ||
                         (user.province || '').toLowerCase().includes(searchText.toLowerCase()) ||
                         (user.school || '').toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* 筛选控件 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="搜索用户名、手机号、省份或学校"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 120 }}
            placeholder="用户类型"
          >
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="student">学生</Select.Option>
            <Select.Option value="coach">教练</Select.Option>
            <Select.Option value="grader">阅卷者</Select.Option>
          </Select>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            placeholder="用户状态"
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="approved">正常</Select.Option>
            <Select.Option value="active">正常</Select.Option>
            <Select.Option value="disabled">禁用</Select.Option>
          </Select>
        </Space>
      </Card>

      <Tabs defaultActiveKey="pending">
        <TabPane tab={`待审核 (${filteredPendingUsers.length})`} key="pending">
          <Card>
            <Table
              columns={pendingColumns}
              dataSource={filteredPendingUsers}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab={`已审核 (${filteredApprovedUsers.length})`} key="approved">
          <Card>
            <Table
              columns={approvedColumns}
              dataSource={filteredApprovedUsers}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

// 主内容组件
const AdminContent: React.FC<AdminContentProps> = ({
  selectedKey,
  pendingUsers,
  approvedUsers,
  regions,
  exams,
  graders,
  gradingTasks,
  adminUsers,
  systemSettings,
  currentAdmin,
  pendingCount,
  loading,
  isOffline,
  coachStudentsStats,
  onApprove,
  onReject,
  onDisableUser,
  onEnableUser,
  onDeleteUser,
  onAddProvince,
  onAddSchool,
  onUpdateSchool,
  onDeleteSchool,
  onDeleteProvince,
  onCreateExam,
  onUpdateExam,
  onPublishExam,
  onUnpublishExam,
  onDeleteExam,
  onUploadFile,
  onAssignGradingTask,
  onGetGradingProgress,
  onUpdateGradingProgress,
  onChangeAdminPassword,
  onUpdateAdmin,
  onCreateAdmin,
  onDeleteAdmin,
  onUpdateSystemSettings,
  onUploadAvatar
}) => {
  switch (selectedKey) {
    case 'dashboard':
      return (
        <DashboardPage 
          pendingCount={pendingCount} 
          isOffline={isOffline} 
          regions={regions} 
          approvedUsers={approvedUsers}
          exams={exams}
          gradingTasks={gradingTasks}
          graders={graders}
          coachStudentsStats={coachStudentsStats}
        />
      );
    
    case 'user-management':
      return (
        <UserManagementPage
          pendingUsers={pendingUsers}
          approvedUsers={approvedUsers}
          loading={loading}
          onApprove={onApprove}
          onReject={onReject}
          onDisableUser={onDisableUser}
          onEnableUser={onEnableUser}
          onDeleteUser={onDeleteUser}
        />
      );
    
    case 'region-management':
      return (
        <RegionManagement
          regions={regions}
          loading={loading}
          onAddProvince={onAddProvince}
          onAddSchool={onAddSchool}
          onUpdateSchool={onUpdateSchool}
          onDeleteSchool={onDeleteSchool}
          onDeleteProvince={onDeleteProvince}
        />
      );
    
    case 'region-change-requests':
      return <RegionChangeRequestManagement />;
    
    case 'student-registration-requests':
      return <StudentRegistrationManagement />;
    
    case 'exam-management':
      return (
        <ExamManagement
          exams={exams}
          loading={loading}
          onCreateExam={onCreateExam}
          onUpdateExam={onUpdateExam}
          onPublishExam={onPublishExam}
          onUnpublishExam={onUnpublishExam}
          onDeleteExam={onDeleteExam}
          onUploadFile={onUploadFile}
        />
      );
    
    case 'grading-management':
      return (
        <GradingManagement
          exams={exams}
          graders={graders}
          gradingTasks={gradingTasks}
          loading={loading}
          onAssignGradingTask={onAssignGradingTask}
          onGetGradingProgress={onGetGradingProgress}
          onUpdateGradingProgress={onUpdateGradingProgress}
        />
      );
    
    case 'system-settings':
      return (
        <SystemSettings
          systemSettings={systemSettings}
          adminUsers={adminUsers}
          currentAdmin={currentAdmin}
          loading={loading}
          onUpdateSystemSettings={onUpdateSystemSettings}
          onCreateAdmin={onCreateAdmin}
          onUpdateAdmin={onUpdateAdmin}
          onDeleteAdmin={onDeleteAdmin}
          onResetAdminPassword={(id, pwd) =>
            onChangeAdminPassword(id, {
              currentPassword: '',
              newPassword: pwd,
              confirmPassword: pwd
            })
          }
          onUploadAvatar={onUploadAvatar}
        />
      );
    
    default:
      return (
        <DashboardPage 
          pendingCount={pendingCount} 
          isOffline={isOffline} 
          regions={regions} 
          approvedUsers={approvedUsers}
          exams={exams}
          gradingTasks={gradingTasks}
          graders={graders}
          coachStudentsStats={coachStudentsStats}
        />
      );
  }
};

export default AdminContent;