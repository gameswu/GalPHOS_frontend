import { useState, useCallback } from 'react';
import { message } from 'antd';

export interface GradingTask {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  submittedAt: string;
  status: 'pending' | 'completed';
  score?: number;
}

// 模拟数据
const mockGradingTasks: GradingTask[] = [
  {
    id: '1',
    examId: '1',
    examTitle: '2024年春季物理竞赛预赛',
    studentName: '张三',
    submittedAt: '2024-03-15T12:00:00.000Z',
    status: 'pending'
  },
  {
    id: '2',
    examId: '1',
    examTitle: '2024年春季物理竞赛预赛',
    studentName: '李四',
    submittedAt: '2024-03-15T11:58:00.000Z',
    status: 'completed',
    score: 85
  },
  {
    id: '3',
    examId: '2',
    examTitle: '2023年秋季物理竞赛决赛',
    studentName: '王五',
    submittedAt: '2023-11-20T12:00:00.000Z',
    status: 'pending'
  },
  {
    id: '4',
    examId: '2',
    examTitle: '2023年秋季物理竞赛决赛',
    studentName: '赵六',
    submittedAt: '2023-11-20T11:55:00.000Z',
    status: 'completed',
    score: 92
  }
];

export const useGraderLogic = () => {
  const [loading, setLoading] = useState(false);
  const [gradingTasks, setGradingTasks] = useState<GradingTask[]>([]);

  // 加载阅卷任务
  const loadGradingTasks = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setGradingTasks(mockGradingTasks);
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

  // 账户设置
  const handleAccountSettings = useCallback(() => {
    message.info('账户设置功能开发中...');
  }, []);

  // 退出登录
  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    message.success('已退出登录');
  }, []);

  return {
    loading,
    gradingTasks,
    loadGradingTasks,
    completeGrading,
    startGrading,
    viewPaper,
    handleAccountSettings,
    handleLogout
  };
};
