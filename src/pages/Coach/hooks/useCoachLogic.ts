import { useState, useCallback } from 'react';
import { message } from 'antd';
import CoachAPI from '../../../api/coach';
import { authService } from '../../../services/authService';
import { 
  StudentExam as Exam,
  ExamFile,
  ExamAnswer,
  ExamSubmission
} from '../../../types/common';

export interface Student {
  id: string;
  name: string;
  username: string;
  phone: string;
  province: string;
  school: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const useCoachLogic = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  // 加载学生数据
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await CoachAPI.getStudents();
      if (response.success && response.data) {
        setStudents(Array.isArray(response.data) ? response.data : (response.data as any).students || []);
        message.success('学生数据加载成功');
      } else {
        message.error(response.message || '加载学生数据失败');
      }
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
      const response = await CoachAPI.getExams();
      if (response.success && response.data) {
        setExams(Array.isArray(response.data) ? response.data : (response.data as any).exams || []);
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

  // 提交学生注册申请
  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await CoachAPI.addStudent({
        username: studentData.username
      });
      
      if (response.success) {
        message.success('学生添加成功');
        // 重新加载学生列表
        loadStudents();
      } else {
        message.error(response.message || '添加学生失败');
      }
    } catch (error) {
      message.error('添加学生失败');
      console.error('添加学生失败:', error);
    }
  }, [loadStudents]);

  // 更新学生
  const updateStudent = useCallback(async (studentId: string, studentData: Partial<Student>) => {
    try {
      const response = await CoachAPI.updateStudent(studentId, studentData);
      
      if (response.success) {
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, ...studentData }
            : student
        ));
        message.success('学生信息更新成功');
      } else {
        message.error(response.message || '更新学生信息失败');
      }
    } catch (error) {
      message.error('更新学生信息失败');
      console.error('更新学生信息失败:', error);
    }
  }, []);

  // 删除学生
  const deleteStudent = useCallback(async (studentId: string) => {
    try {
      const response = await CoachAPI.removeStudent(studentId);
      
      if (response.success) {
        setStudents(prev => prev.filter(student => student.id !== studentId));
        message.success('学生删除成功');
      } else {
        message.error(response.message || '删除学生失败');
      }
    } catch (error) {
      message.error('删除学生失败');
      console.error('删除学生失败:', error);
    }
  }, []);

  // 更新个人资料
  const updateProfile = useCallback(async (data: { name?: string; phone?: string; avatar?: string }) => {
    try {
      const response = await CoachAPI.updateProfile(data);
      
      if (response.success) {
        // 使用 authService 更新用户信息
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUserInfo = {
            ...currentUser,
            ...data
          };
          authService.setAuthData(updatedUserInfo, authService.getToken() || '');
        }
        
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
      const response = await CoachAPI.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      
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

  // 申请变更赛区
  const requestRegionChange = useCallback(async (data: { province: string; school: string; reason: string }) => {
    try {
      const response = await CoachAPI.requestRegionChange({
        province: data.province,
        school: data.school,
        reason: data.reason
      });
      
      if (response.success) {
        message.success('赛区变更申请已提交，等待管理员审核');
      } else {
        message.error(response.message || '提交申请失败');
        throw new Error(response.message);
      }
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
    authService.clearAuthData();
    message.success('已退出登录');
  }, []);

  // 为学生提交考试答案（教练代为提交）
  const submitExamAnswers = useCallback(async (examId: string, answers: ExamAnswer[], studentUsername: string) => {
    try {
      const response = await CoachAPI.submitAnswersForStudent(examId, {
        studentUsername,
        answers: answers.map(answer => ({
          questionNumber: answer.questionNumber,
          imageUrl: answer.imageUrl || '',
          uploadTime: answer.uploadTime || new Date().toISOString()
        }))
      });
      
      if (response.success) {
        message.success(`${studentUsername} 的答案提交成功`);
      } else {
        message.error(response.message || '答案提交失败');
        throw new Error(response.message);
      }
    } catch (error) {
      message.error('答案提交失败');
      throw error;
    }
  }, []);

  // 获取考试提交记录
  const getExamSubmission = useCallback(async (examId: string, studentUsername?: string): Promise<ExamSubmission | null> => {
    try {
      const response = await CoachAPI.getSubmissions(examId, studentUsername);
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0]; // 返回第一个匹配的提交记录
      }
      return null;
    } catch (error) {
      console.error('获取考试提交记录失败:', error);
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

  // 获取考试详情
  const getExamDetail = useCallback(async (examId: string) => {
    try {
      const response = await CoachAPI.getExamDetails(examId);
      if (response.success && response.data) {
        return response.data;
      } else {
        message.error(response.message || '获取考试详情失败');
        return null;
      }
    } catch (error) {
      message.error('获取考试详情失败');
      console.error('获取考试详情失败:', error);
      return null;
    }
  }, []);

  // 上传答题图片
  const uploadAnswerImage = useCallback(async (examId: string, file: File, questionNumber: number, studentUsername: string) => {
    try {
      const response = await CoachAPI.uploadAnswerImage(examId, file, questionNumber, studentUsername);
      if (response.success && response.data) {
        message.success('图片上传成功');
        return response.data.imageUrl;
      } else {
        message.error(response.message || '图片上传失败');
        return null;
      }
    } catch (error) {
      message.error('图片上传失败');
      console.error('图片上传失败:', error);
      return null;
    }
  }, []);

  // 获取成绩报告
  const getGradeReports = useCallback(async (params?: { examId?: string; studentUsername?: string }) => {
    try {
      const response = await CoachAPI.getGradesDetails(params);
      if (response.success && response.data) {
        return response.data;
      } else {
        message.error(response.message || '获取成绩报告失败');
        return [];
      }
    } catch (error) {
      message.error('获取成绩报告失败');
      console.error('获取成绩报告失败:', error);
      return [];
    }
  }, []);

  // 获取仪表板统计
  const getDashboardStats = useCallback(async () => {
    try {
      const response = await CoachAPI.getDashboardStats();
      if (response.success && response.data) {
        return response.data;
      } else {
        message.error(response.message || '获取统计数据失败');
        return null;
      }
    } catch (error) {
      message.error('获取统计数据失败');
      console.error('获取统计数据失败:', error);
      return null;
    }
  }, []);

  // 上传头像
  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const response = await CoachAPI.uploadAvatar(file);
      if (response.success && response.data) {
        message.success('头像上传成功');
        return response.data.avatarUrl;
      } else {
        message.error(response.message || '头像上传失败');
        return null;
      }
    } catch (error) {
      message.error('头像上传失败');
      console.error('头像上传失败:', error);
      return null;
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
    downloadFile,
    getExamDetail,
    uploadAnswerImage,
    getGradeReports,
    getDashboardStats,
    uploadAvatar
  };
};
