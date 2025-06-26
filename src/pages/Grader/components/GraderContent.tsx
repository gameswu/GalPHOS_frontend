import React, { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Statistic, Row, Col, Modal, Form, InputNumber } from 'antd';
import { 
  UserOutlined, 
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { GradingTask, Exam, GradingStatistics } from '../hooks/useGraderLogic';
import UserSettings from '../../../components/UserSettings';
import GradingQueue from './GradingQueue';
import GraderDashboard from './GraderDashboard';

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
  exams: Exam[];
  gradingTasks: GradingTask[];
  statistics?: GradingStatistics;
  loadExams: () => void;
  loadAllGradingTasks: () => void;
  loadGradingTasksByExam: (examId: string) => void;
  onAccountSettings: () => void;
  onCompleteGrading: (taskId: string, score: number, feedback?: string) => void;
  onStartGrading?: (taskId: string) => Promise<boolean>;
  onSaveProgress?: (taskId: string, progressData: { score?: number; feedback?: string }) => Promise<boolean>;
  onAbandonTask?: (taskId: string, reason?: string) => Promise<boolean>;
  updateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  onLogout: () => void;
}

// 账户设置页面
const AccountSettingsPage: React.FC<{ 
  userInfo: any;
  updateProfile: (data: { username: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  onLogout: () => void;
}> = ({ userInfo, updateProfile, changePassword, onLogout }) => (
  <UserSettings
    userInfo={userInfo}
    onUpdateProfile={updateProfile}
    onChangePassword={changePassword}
    onLogout={onLogout}
    showRegionChange={false}
  />
);

const GraderContent: React.FC<GraderContentProps> = ({
  selectedKey,
  userInfo,
  loading,
  exams,
  gradingTasks,
  statistics,
  loadExams,
  loadAllGradingTasks,
  loadGradingTasksByExam,
  onAccountSettings,
  onCompleteGrading,
  onStartGrading,
  onSaveProgress,
  onAbandonTask,
  updateProfile,
  changePassword,
  onLogout
}) => {
  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return (
          <GraderDashboard
            loading={loading}
            exams={exams}
            gradingTasks={gradingTasks}
            statistics={statistics}
            loadAllGradingTasks={loadAllGradingTasks}
          />
        );
      case 'account':
        return (
          <AccountSettingsPage 
            userInfo={userInfo}
            updateProfile={updateProfile}
            changePassword={changePassword}
            onLogout={onLogout}
          />
        );
      case 'grading-queue':
        return (
          <GradingQueue
            loading={loading}
            exams={exams}
            gradingTasks={gradingTasks}
            loadExams={loadExams}
            loadGradingTasksByExam={loadGradingTasksByExam}
            completeGrading={onCompleteGrading}
            startGrading={onStartGrading}
            saveProgress={onSaveProgress}
            abandonTask={onAbandonTask}
          />
        );
      default:
        return <div>页面未找到</div>;
    }
  };

  return <>{renderContent()}</>;
};

export default GraderContent;
