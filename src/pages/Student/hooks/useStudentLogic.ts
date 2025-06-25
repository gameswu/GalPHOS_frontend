import { useState, useCallback } from 'react';
import { message } from 'antd';

export interface Exam {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number; // 分钟
  status: 'upcoming' | 'ongoing' | 'completed';
  questions: number;
}

// 模拟数据
const mockExams: Exam[] = [
  {
    id: '1',
    title: '2024年春季物理竞赛预赛',
    description: '涵盖力学、电磁学、光学等基础知识',
    startTime: '2024-03-15T09:00:00.000Z',
    endTime: '2024-03-15T12:00:00.000Z',
    duration: 180,
    status: 'upcoming',
    questions: 20
  },
  {
    id: '2',
    title: '2023年秋季物理竞赛决赛',
    description: '高难度综合题目',
    startTime: '2023-11-20T09:00:00.000Z',
    endTime: '2023-11-20T12:00:00.000Z',
    duration: 180,
    status: 'completed',
    questions: 15
  }
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

  return {
    loading,
    exams,
    loadExams,
    handleAccountSettings,
    handleLogout,
    startExam,
    viewExamResult
  };
};
