import { useState, useCallback } from 'react';
import { message } from 'antd';
import GraderAPI from '../../../api/grader';
import type { 
  GraderExam as Exam, 
  GradingTask, 
  GradingStatistics,
  ExamSubmission,
  ExamFile,
  ExamAnswer
} from '../../../types/common';

// 重新导出类型以保持向后兼容性
export type { 
  GraderExam as Exam, 
  GradingTask, 
  GradingStatistics,
  ExamSubmission,
  ExamFile,
  ExamAnswer
} from '../../../types/common';

export const useGraderLogic = () => {
  const [loading, setLoading] = useState(false);
  const [gradingTasks, setGradingTasks] = useState<GradingTask[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [statistics, setStatistics] = useState<GradingStatistics | null>(null);

  // 加载考试数据
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GraderAPI.getAvailableExams({
        status: 'grading',
        page: 1,
        limit: 50
      });
      
      if (response.success && response.data) {
        setExams(response.data.items);
        message.success('考试数据加载成功');
      } else {
        message.error(response.message || '加载考试数据失败');
      }
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
      const [tasksResponse, statsResponse] = await Promise.all([
        GraderAPI.getGradingTasks({ page: 1, limit: 100 }),
        GraderAPI.getGradingStatistics()
      ]);
      
      if (tasksResponse.success && tasksResponse.data) {
        setGradingTasks(tasksResponse.data.items);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
      
      message.success('阅卷任务统计加载成功');
    } catch (error) {
      message.error('加载阅卷任务统计失败');
      console.error('加载阅卷任务统计失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 根据考试ID加载阅卷任务
  const loadGradingTasksByExam = useCallback(async (examId: string) => {
    setLoading(true);
    try {
      const response = await GraderAPI.getGradingTasks({
        examId,
        page: 1,
        limit: 100
      });
      
      if (response.success && response.data) {
        setGradingTasks(response.data.items);
        message.success('阅卷任务加载成功');
      } else {
        message.error(response.message || '加载阅卷任务失败');
      }
    } catch (error) {
      message.error('加载阅卷任务失败');
      console.error('加载阅卷任务失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 完成阅卷
  const completeGrading = useCallback(async (taskId: string, score: number, feedback?: string) => {
    try {
      setLoading(true);
      
      // 获取任务详情以获取最大分数
      const taskResponse = await GraderAPI.getGradingTask(taskId);
      if (!taskResponse.success || !taskResponse.data) {
        throw new Error('获取任务详情失败');
      }
      
      const maxScore = taskResponse.data.maxScore || 100;
      
      const response = await GraderAPI.submitGrading(taskId, {
        score,
        maxScore,
        feedback
      });
      
      if (response.success) {
        // 更新本地状态
        setGradingTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' as const, score, feedback }
            : task
        ));
        
        message.success('阅卷完成');
      } else {
        message.error(response.message || '提交评分失败');
      }
    } catch (error) {
      message.error('提交评分失败');
      console.error('提交评分失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 开始阅卷
  const startGrading = useCallback(async (taskId: string) => {
    try {
      const response = await GraderAPI.startGradingTask(taskId);
      
      if (response.success) {
        // 更新本地状态
        setGradingTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'grading' as const }
            : task
        ));
        
        message.success('开始阅卷');
        return true;
      } else {
        message.error(response.message || '开始阅卷失败');
        return false;
      }
    } catch (error) {
      message.error('开始阅卷失败');
      console.error('开始阅卷失败:', error);
      return false;
    }
  }, []);

  // 查看试卷
  const viewPaper = useCallback(async (taskId: string) => {
    try {
      const response = await GraderAPI.getGradingTask(taskId);
      
      if (response.success && response.data) {
        // 这里可以打开模态框显示试卷详情
        // 或者跳转到专门的试卷查看页面
        message.info(`查看试卷: ${response.data.examTitle}`);
        return response.data;
      } else {
        message.error(response.message || '获取试卷详情失败');
        return null;
      }
    } catch (error) {
      message.error('获取试卷详情失败');
      console.error('获取试卷详情失败:', error);
      return null;
    }
  }, []);

  // 保存阅卷进度
  const saveGradingProgress = useCallback(async (taskId: string, progressData: {
    score?: number;
    feedback?: string;
  }) => {
    try {
      // 转换为API期望的格式
      const apiProgressData = {
        questionScores: progressData.score ? [{
          questionId: 'default',
          score: progressData.score,
          comments: progressData.feedback
        }] : undefined,
        lastSaveTime: new Date().toISOString()
      };

      const response = await GraderAPI.saveGradingProgress(taskId, apiProgressData);
      
      if (response.success) {
        message.success('进度已保存');
        return true;
      } else {
        message.error(response.message || '保存进度失败');
        return false;
      }
    } catch (error) {
      message.error('保存进度失败');
      console.error('保存进度失败:', error);
      return false;
    }
  }, []);

  // 放弃阅卷任务
  const abandonGradingTask = useCallback(async (taskId: string, reason?: string) => {
    try {
      const response = await GraderAPI.abandonGradingTask(taskId, reason);
      
      if (response.success) {
        // 更新本地状态
        setGradingTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'pending' as const }
            : task
        ));
        
        message.success('已放弃阅卷任务');
        return true;
      } else {
        message.error(response.message || '放弃任务失败');
        return false;
      }
    } catch (error) {
      message.error('放弃任务失败');
      console.error('放弃任务失败:', error);
      return false;
    }
  }, []);

  // 更新个人资料
  const updateProfile = useCallback(async (data: { username: string; avatar?: string }) => {
    try {
      const response = await GraderAPI.updateProfile(data);
      
      if (response.success) {
        // 更新本地存储的用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const updatedUserInfo = {
          ...userInfo,
          username: data.username,
          avatar: data.avatar
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        message.success('个人资料更新成功');
      } else {
        message.error(response.message || '更新个人资料失败');
        throw new Error(response.message);
      }
    } catch (error) {
      message.error('更新个人资料失败');
      throw error;
    }
  }, []);

  // 修改密码
  const changePassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    try {
      // 转换为API期望的格式
      const passwordData = {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.newPassword
      };

      const response = await GraderAPI.changePassword(passwordData);
      
      if (response.success) {
        message.success('密码修改成功');
      } else {
        message.error(response.message || '密码修改失败');
        throw new Error(response.message);
      }
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
    statistics,
    loadExams,
    loadAllGradingTasks,
    loadGradingTasksByExam,
    completeGrading,
    startGrading,
    viewPaper,
    saveGradingProgress,
    abandonGradingTask,
    handleAccountSettings,
    handleLogout,
    updateProfile,
    changePassword
  };
};
