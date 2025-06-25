import { useState, useCallback } from 'react';
import { message } from 'antd';

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
  },
  {
    id: '3',
    name: '王五',
    username: 'student003',
    email: 'wangwu@example.com',
    phone: '13800138003',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00.000Z'
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

export const useCoachLogic = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  // 加载学生数据
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(mockStudents);
      message.success('学生数据加载成功');
    } catch (error) {
      message.error('加载学生数据失败');
      console.error('加载学生数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // 添加学生
  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStudent: Student = {
        ...studentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setStudents(prev => [...prev, newStudent]);
      message.success('学生添加成功');
    } catch (error) {
      message.error('添加学生失败');
      console.error('添加学生失败:', error);
    }
  }, []);

  // 更新学生
  const updateStudent = useCallback(async (studentId: string, studentData: Partial<Student>) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, ...studentData }
          : student
      ));
      
      message.success('学生信息更新成功');
    } catch (error) {
      message.error('更新学生信息失败');
      console.error('更新学生信息失败:', error);
    }
  }, []);

  // 删除学生
  const deleteStudent = useCallback(async (studentId: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudents(prev => prev.filter(student => student.id !== studentId));
      message.success('学生删除成功');
    } catch (error) {
      message.error('删除学生失败');
      console.error('删除学生失败:', error);
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

  return {
    loading,
    students,
    exams,
    loadStudents,
    loadExams,
    addStudent,
    updateStudent,
    deleteStudent,
    handleAccountSettings,
    handleLogout
  };
};
