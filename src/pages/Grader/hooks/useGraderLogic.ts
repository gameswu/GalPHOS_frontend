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
  questionFile?: ExamFile;
  answerFile?: ExamFile;
  answerSheetFile?: ExamFile;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  totalQuestions?: number;
  duration?: number;
}

export interface ExamAnswer {
  questionNumber: number;
  imageUrl: string;
  uploadTime: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentUsername: string;
  answers: ExamAnswer[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  score?: number;
}

export interface GradingTask {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentUsername: string;
  submittedAt: string;
  status: 'pending' | 'grading' | 'completed';
  score?: number;
  submission: ExamSubmission;
}

// 模拟数据
const mockGradingTasks: GradingTask[] = [
  // 这里可以添加模拟数据用于开发调试
  // 实际使用时应该通过API获取数据
];

const mockExams: Exam[] = [
  // 这里可以添加模拟数据用于开发调试
  // 实际使用时应该通过API获取数据
];

export const useGraderLogic = () => {
  const [loading, setLoading] = useState(false);
  const [gradingTasks, setGradingTasks] = useState<GradingTask[]>([]);
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

  // 加载所有阅卷任务（用于仪表盘统计）
  const loadAllGradingTasks = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 这里应该调用API获取所有阅卷任务
      // const response = await api.getAllGradingTasks();
      // setGradingTasks(response.data);
      
      setGradingTasks(mockGradingTasks);
      message.success('阅卷任务统计加载成功');
    } catch (error) {
      message.error('加载阅卷任务统计失败');
      console.error('加载阅卷任务统计失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  const loadGradingTasksByExam = useCallback(async (examId: string) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 这里应该调用API获取指定考试的阅卷任务
      // const response = await api.getGradingTasksByExam(examId);
      // setGradingTasks(response.data);
      
      setGradingTasks(mockGradingTasks.filter(task => task.examId === examId));
      message.success('阅卷任务加载成功');
    } catch (error) {
      message.error('加载阅卷任务失败');
      console.error('加载阅卷任务失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 完成阅卷
  const completeGrading = useCallback(async (taskId: string, score: number) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGradingTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, score }
          : task
      ));
      
      message.success('阅卷完成');
    } catch (error) {
      message.error('提交评分失败');
      console.error('提交评分失败:', error);
    }
  }, []);

  // 开始阅卷
  const startGrading = useCallback((taskId: string) => {
    message.info(`开始阅卷任务 ${taskId}`);
    // 这里可以添加开始阅卷的逻辑，比如跳转到阅卷页面
  }, []);

  // 查看试卷
  const viewPaper = useCallback((taskId: string) => {
    message.info(`查看试卷 ${taskId}`);
    // 这里可以添加查看试卷的逻辑
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

  // 账户设置（保留兼容性）
  const handleAccountSettings = useCallback(() => {
    message.info('请使用新的账户设置页面');
  }, []);

  // 退出登录
  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    message.success('已退出登录');
  }, []);

  return {
    loading,
    exams,
    gradingTasks,
    loadExams,
    loadAllGradingTasks,
    loadGradingTasksByExam,
    completeGrading,
    startGrading,
    viewPaper,
    handleAccountSettings,
    handleLogout,
    updateProfile,
    changePassword
  };
};
