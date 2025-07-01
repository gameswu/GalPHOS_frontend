import React from 'react';
import { Card, Typography, Statistic, Row, Col } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import type { StudentExam as Exam, ExamSubmission, ExamAnswer } from '../../../types/common';
import UserSettings from '../../../components/UserSettings';
import CurrentExamPage from '../../../components/CurrentExamPage';
import HistoryExamPage from '../../../components/HistoryExamPage';

const { Title, Text } = Typography;

interface StudentContentProps {
  selectedKey: string;
  userInfo: {
    username: string;
    role: 'student';
    province?: string;
    school?: string;
    avatar?: string;
  };
  loading: boolean;
  exams: Exam[];
  dashboardData?: any;
  onAccountSettings: () => void;
  updateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  requestRegionChange: (data: { province: string; school: string; reason: string }) => Promise<void>;
  onLogout: () => void;
  onDeleteAccount?: () => Promise<void>; // 添加注销账号方法
  submitExamAnswers: (examId: string, answers: ExamAnswer[]) => Promise<void>;
  getExamSubmission: (examId: string) => Promise<ExamSubmission | null>;
  downloadFile: (fileId: string, fileName: string) => Promise<void>;
  uploadAnswerImage?: (file: File, examId: string, questionNumber: number) => Promise<string>;
  uploadAvatar?: (file: File) => Promise<string>;
  getRegionChangeStatus?: () => Promise<any[]>;
}

// 账户设置页面
const AccountSettingsPage: React.FC<{ 
  userInfo: any;
  updateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  requestRegionChange: (data: { province: string; school: string; reason: string }) => Promise<void>;
  onLogout: () => void;
  onDeleteAccount?: () => Promise<void>; // 添加注销账号方法
}> = ({ userInfo, updateProfile, changePassword, requestRegionChange, onLogout, onDeleteAccount }) => (
  <UserSettings
    userInfo={userInfo}
    onUpdateProfile={updateProfile}
    onDeleteAccount={onDeleteAccount}
    onChangePassword={changePassword}
    onRequestRegionChange={requestRegionChange}
    onLogout={onLogout}
  />
);

// 仪表板页面
const DashboardPage: React.FC<{ 
  exams: Exam[];
  getExamSubmission: (examId: string) => Promise<ExamSubmission | null>;
  dashboardData?: any;
}> = ({ exams, getExamSubmission, dashboardData }) => {
  const currentTime = new Date();
  
  // 使用传入的dashboardData或计算默认值
  const stats = dashboardData || {
    totalExams: exams.length,
    completedExams: exams.filter(exam => 
      exam.status === 'completed' || new Date(exam.endTime) < currentTime
    ).length,
    ongoingExams: exams.filter(exam => 
      (exam.status === 'published' || exam.status === 'ongoing') && new Date(exam.endTime) > currentTime
    ).length,
    upcomingExams: 0,
    averageScore: 0,
    lastExamScore: 0,
    recentExams: []
  };

  const currentExams = exams.filter(exam => 
    (exam.status === 'published' || exam.status === 'ongoing') && new Date(exam.endTime) > currentTime
  );

  return (
    <div>
      <Title level={4}>
        <UserOutlined style={{ marginRight: 8 }} />
        学生仪表板
      </Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前考试"
              value={stats.ongoingExams}
              suffix="场"
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成考试"
              value={stats.completedExams}
              suffix="场"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均成绩"
              value={stats.averageScore.toFixed(1)}
              suffix="分"
              valueStyle={{ color: '#faad14' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最近成绩"
              value={stats.lastExamScore}
              suffix="分"
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="历史考试"
              value={stats.totalExams}
              suffix="场"
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

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

const StudentContent: React.FC<StudentContentProps> = ({
  selectedKey,
  userInfo,
  loading,
  exams,
  dashboardData,
  onAccountSettings,
  updateProfile,
  changePassword,
  requestRegionChange,
  onLogout,
  onDeleteAccount,
  submitExamAnswers,
  getExamSubmission,
  downloadFile,
  uploadAnswerImage,
  uploadAvatar,
  getRegionChangeStatus
}) => {
  switch (selectedKey) {
    case 'dashboard':
      return (
        <DashboardPage 
          exams={exams}
          getExamSubmission={getExamSubmission}
          dashboardData={dashboardData}
        />
      );
    
    case 'current-exam':
      return (
        <CurrentExamPage
          exams={exams}
          loading={loading}
          submitExamAnswers={submitExamAnswers}
          getExamSubmission={getExamSubmission}
          downloadFile={downloadFile}
          userRole="student"
        />
      );
    
    case 'history-exam':
      return (
        <HistoryExamPage
          exams={exams}
          loading={loading}
          downloadFile={downloadFile}
          getExamSubmission={getExamSubmission}
          userRole="student"
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
          onDeleteAccount={onDeleteAccount}
        />
      );
    
    default:
      return (
        <DashboardPage 
          exams={exams}
          getExamSubmission={getExamSubmission}
        />
      );
  }
};

export default StudentContent;
