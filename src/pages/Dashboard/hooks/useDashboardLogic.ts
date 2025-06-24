import { useState, useCallback } from 'react';
import { message } from 'antd';

// 类型定义
export interface Student {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

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
const mockStudents: Student[] = [
  {
    id: '1',
    name: '张三',
    username: 'student001',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: '李四',
    username: 'student002',
    email: 'lisi@example.com',
    phone: '13800138002',
    status: 'active',
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

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
  }
];

export const useDashboardLogic = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [gradingTasks, setGradingTasks] = useState<GradingTask[]>([]);

  // 加载学生数据
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(mockStudents);
    } catch (error) {
      message.error('加载学生数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载考试数据
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setExams(mockExams);
    } catch (error) {
      message.error('加载考试数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载阅卷任务数据
  const loadGradingTasks = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGradingTasks(mockGradingTasks);
    } catch (error) {
      message.error('加载阅卷任务失败');
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
    message.success('退出登录成功');
  }, []);

  // 添加学生
  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newStudent: Student = {
        ...studentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setStudents(prev => [...prev, newStudent]);
      message.success('添加学生成功');
    } catch (error) {
      message.error('添加学生失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除学生
  const deleteStudent = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(prev => prev.filter(s => s.id !== studentId));
      message.success('删除学生成功');
    } catch (error) {
      message.error('删除学生失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 开始阅卷
  const startGrading = useCallback(async (taskId: string) => {
    message.info('跳转到阅卷界面...');
  }, []);

  return {
    // 状态
    loading,
    students,
    exams,
    gradingTasks,
    // 方法
    loadStudents,
    loadExams,
    loadGradingTasks,
    handleAccountSettings,
    handleLogout,
    addStudent,
    deleteStudent,
    startGrading
  };
};