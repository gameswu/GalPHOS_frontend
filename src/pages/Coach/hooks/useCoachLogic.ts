import { useState, useCallback } from 'react';
import { message } from 'antd';

export interface Student {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  grade: string;
  province: string;
  school: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants?: string[];
  totalQuestions?: number;
  duration?: number;
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
const mockStudents: Student[] = [
  // 这里可以添加模拟数据用于开发调试
  // 实际使用时应该通过API获取数据
];

const mockExams: Exam[] = [
  // 这里可以添加模拟数据用于开发调试
  // 实际使用时应该通过API获取数据
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

  // 提交学生注册申请
  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt' | 'status'>) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取当前教练信息
      const currentUserInfo = localStorage.getItem('userInfo');
      if (!currentUserInfo) {
        throw new Error('未找到教练信息');
      }
      
      const coachInfo = JSON.parse(currentUserInfo);
      
      // 创建学生注册申请
      const registrationRequest = {
        id: `req_${Date.now()}`,
        username: studentData.username,
        password: 'default123', // 临时密码，审核通过后可以修改
        province: studentData.province,
        school: studentData.school,
        grade: studentData.grade,
        coachUsername: coachInfo.username,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      
      // 保存到localStorage（实际应该发送到后端API）
      const existingRequests = JSON.parse(localStorage.getItem('studentRegistrationRequests') || '[]');
      existingRequests.push(registrationRequest);
      localStorage.setItem('studentRegistrationRequests', JSON.stringify(existingRequests));
      
      message.success('学生注册申请已提交，等待管理员审核');
    } catch (error) {
      message.error('提交学生注册申请失败');
      console.error('提交学生注册申请失败:', error);
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
        role: 'coach',
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

  // 为学生提交考试答案（教练代为提交）
  const submitExamAnswers = useCallback(async (examId: string, answers: ExamAnswer[], studentUsername: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submission: ExamSubmission = {
        id: `submission_${Date.now()}`,
        examId,
        studentUsername,
        answers,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      // 保存到localStorage（实际应该发送到后端API）
      const existingSubmissions = JSON.parse(localStorage.getItem('examSubmissions') || '[]');
      // 检查是否已有提交记录，如果有则更新，没有则新增
      const existingIndex = existingSubmissions.findIndex((sub: ExamSubmission) => 
        sub.examId === examId && sub.studentUsername === studentUsername
      );
      
      if (existingIndex >= 0) {
        existingSubmissions[existingIndex] = submission;
        message.success(`${studentUsername} 的答案提交更新成功`);
      } else {
        existingSubmissions.push(submission);
        message.success(`${studentUsername} 的答案提交成功`);
      }
      
      localStorage.setItem('examSubmissions', JSON.stringify(existingSubmissions));
      
    } catch (error) {
      message.error('答案提交失败');
      throw error;
    }
  }, []);

  // 获取考试提交记录
  const getExamSubmission = useCallback((examId: string, studentUsername?: string): ExamSubmission | null => {
    try {
      const submissions = JSON.parse(localStorage.getItem('examSubmissions') || '[]');
      
      return submissions.find((sub: ExamSubmission) => 
        sub.examId === examId && sub.studentUsername === studentUsername
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
    students,
    exams,
    loadStudents,
    loadExams,
    addStudent,
    updateStudent,
    deleteStudent,
    handleAccountSettings,
    handleLogout,
    updateProfile,
    changePassword,
    requestRegionChange,
    submitExamAnswers,
    getExamSubmission,
    downloadFile
  };
};
