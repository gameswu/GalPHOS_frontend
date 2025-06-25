import { useState, useCallback } from 'react';
import { message } from 'antd';

export interface ExamFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questionFile?: ExamFile; // 试题文件
  answerFile?: ExamFile;   // 答案文件
  answerSheetFile?: ExamFile; // 答题卡文件
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants?: string[]; // 参与考试的用户ID
  totalQuestions?: number;
  duration?: number; // 考试时长（分钟）
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentUsername: string;
  answers: ExamAnswer[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  score?: number;
}

export interface ExamAnswer {
  questionNumber: number;
  imageUrl: string;
  uploadTime: string;
}

// 模拟数据
const mockExams: Exam[] = [
  // 这里可以添加模拟数据用于开发调试
  // 实际使用时应该通过API获取数据
];

export const useStudentLogic = () => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);

  // 加载考试数据
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setExams(mockExams);
      message.success('考试数据加载成功');
    } catch (error) {
      message.error('加载考试数据失败');
      console.error('加载考试数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新个人资料
  const updateProfile = useCallback(async (data: { username: string; avatar?: string }) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新本地存储的用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const updatedUserInfo = {
        ...userInfo,
        username: data.username,
        avatar: data.avatar
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      
      message.success('个人资料更新成功');
    } catch (error) {
      message.error('更新个人资料失败');
      throw error;
    }
  }, []);

  // 修改密码
  const changePassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    try {
      // 模拟API调用验证旧密码
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里应该调用后端API验证旧密码并更新新密码
      // 暂时模拟成功
      message.success('密码修改成功');
    } catch (error) {
      message.error('密码修改失败');
      throw error;
    }
  }, []);

  // 申请变更赛区
  const requestRegionChange = useCallback(async (data: { province: string; school: string; reason: string }) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 将申请保存到本地存储（实际应该发送到后端）
      const requests = JSON.parse(localStorage.getItem('regionChangeRequests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        username: JSON.parse(localStorage.getItem('userInfo') || '{}').username,
        role: 'student',
        currentProvince: JSON.parse(localStorage.getItem('userInfo') || '{}').province,
        currentSchool: JSON.parse(localStorage.getItem('userInfo') || '{}').school,
        requestedProvince: data.province,
        requestedSchool: data.school,
        reason: data.reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      requests.push(newRequest);
      localStorage.setItem('regionChangeRequests', JSON.stringify(requests));
      
      message.success('赛区变更申请已提交，等待管理员审核');
    } catch (error) {
      message.error('提交申请失败');
      throw error;
    }
  }, []);

  // 账户设置（保留兼容性）
  const handleAccountSettings = useCallback(() => {
    message.info('请使用新的账户设置页面');
  }, []);

  // 退出登录
  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    message.success('已退出登录');
  }, []);

  // 开始考试
  const startExam = useCallback((examId: string) => {
    message.info(`开始考试 ${examId}`);
    // 这里可以添加开始考试的逻辑
  }, []);

  // 查看考试结果
  const viewExamResult = useCallback((examId: string) => {
    message.info(`查看考试结果 ${examId}`);
    // 这里可以添加查看考试结果的逻辑
  }, []);

  // 提交考试答案
  const submitExamAnswers = useCallback(async (examId: string, answers: ExamAnswer[]) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      const submission: ExamSubmission = {
        id: `submission_${Date.now()}`,
        examId,
        studentUsername: userInfo.username,
        answers,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      // 保存到localStorage（实际应该发送到后端API）
      const existingSubmissions = JSON.parse(localStorage.getItem('examSubmissions') || '[]');
      // 检查是否已有提交记录，如果有则更新，没有则新增
      const existingIndex = existingSubmissions.findIndex((sub: ExamSubmission) => 
        sub.examId === examId && sub.studentUsername === userInfo.username
      );
      
      if (existingIndex >= 0) {
        existingSubmissions[existingIndex] = submission;
        message.success('答案提交更新成功');
      } else {
        existingSubmissions.push(submission);
        message.success('答案提交成功');
      }
      
      localStorage.setItem('examSubmissions', JSON.stringify(existingSubmissions));
      
    } catch (error) {
      message.error('答案提交失败');
      throw error;
    }
  }, []);

  // 获取考试提交记录
  const getExamSubmission = useCallback((examId: string): ExamSubmission | null => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const submissions = JSON.parse(localStorage.getItem('examSubmissions') || '[]');
      
      return submissions.find((sub: ExamSubmission) => 
        sub.examId === examId && sub.studentUsername === userInfo.username
      ) || null;
    } catch (error) {
      return null;
    }
  }, []);

  // 下载文件
  const downloadFile = useCallback((fileUrl: string, fileName: string) => {
    try {
      // 模拟文件下载
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(`${fileName} 下载成功`);
    } catch (error) {
      message.error('文件下载失败');
    }
  }, []);

  return {
    loading,
    exams,
    loadExams,
    handleAccountSettings,
    handleLogout,
    startExam,
    viewExamResult,
    updateProfile,
    changePassword,
    requestRegionChange,
    submitExamAnswers,
    getExamSubmission,
    downloadFile
  };
};
