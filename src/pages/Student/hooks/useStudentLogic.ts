import { useState, useCallback } from 'react';
import { message } from 'antd';
import StudentAPI from '../../../api/student';
import { authService } from '../../../services/authService';
import type { StudentExam as Exam, ExamAnswer, ExamSubmission } from '../../../types/common';

// DashboardData可能是StudentAPI特有的，暂时保留从API导入
import type { DashboardData } from '../../../api/student';

// 重新导出类型以保持兼容性
export type { StudentExam as Exam, ExamAnswer, ExamSubmission } from '../../../types/common';

export const useStudentLogic = () => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // 加载考试数据
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const result = await StudentAPI.getExams();
      if (result.success && result.data) {
        setExams(result.data);
        message.success(result.message || '考试数据加载成功');
      } else {
        message.error(result.message || '加载考试数据失败');
      }
    } catch (error) {
      message.error('加载考试数据失败');
      console.error('加载考试数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载仪表板数据
  const loadDashboardData = useCallback(async () => {
    try {
      const result = await StudentAPI.getDashboardStats();
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    }
  }, []);

  // 更新个人资料
  const updateProfile = useCallback(async (data: { username: string; avatar?: string }) => {
    try {
      const result = await StudentAPI.updateProfile(data);
      if (result.success) {
        // 使用 authService 更新用户信息
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUserInfo = {
            ...currentUser,
            username: data.username,
            avatar: data.avatar
          };
          authService.setAuthData(updatedUserInfo, authService.getToken() || '');
        }
        
        message.success(result.message || '个人资料更新成功');
      } else {
        message.error(result.message || '更新个人资料失败');
        throw new Error(result.message);
      }
    } catch (error) {
      message.error('更新个人资料失败');
      throw error;
    }
  }, []);

  // 修改密码
  const changePassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    try {
      const result = await StudentAPI.changePassword(data);
      if (result.success) {
        message.success(result.message || '密码修改成功');
      } else {
        message.error(result.message || '密码修改失败');
        throw new Error(result.message);
      }
    } catch (error) {
      message.error('密码修改失败');
      throw error;
    }
  }, []);

  // 申请变更赛区
  const requestRegionChange = useCallback(async (data: { province: string; school: string; reason: string }) => {
    try {
      const result = await StudentAPI.requestRegionChange(data);
      if (result.success) {
        message.success(result.message || '赛区变更申请已提交，等待管理员审核');
      } else {
        message.error(result.message || '提交申请失败');
        throw new Error(result.message);
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

  // 删除账号
  const deleteAccount = useCallback(async () => {
    try {
      const result = await authService.deleteAccount();
      if (result.success) {
        message.success(result.message || '账号已注销');
      } else {
        message.error(result.message || '账号注销失败');
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('账号注销失败:', error);
      message.error('账号注销失败，请稍后重试或联系管理员');
      throw error;
    }
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
      const result = await StudentAPI.submitExamAnswers(examId, answers);
      if (result.success) {
        message.success(result.message || '答案提交成功');
      } else {
        message.error(result.message || '答案提交失败');
        throw new Error(result.message);
      }
    } catch (error) {
      message.error('答案提交失败');
      throw error;
    }
  }, []);

  // 获取考试提交记录
  const getExamSubmission = useCallback(async (examId: string, studentUsername?: string): Promise<ExamSubmission | null> => {
    try {
      const result = await StudentAPI.getExamSubmission(examId);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('获取考试提交记录失败:', error);
      return null;
    }
  }, []);

  // 下载文件
  const downloadFile = useCallback(async (fileId: string, fileName: string) => {
    try {
      await StudentAPI.downloadFile(fileId, fileName);
      message.success(`${fileName} 下载成功`);
    } catch (error) {
      message.error('文件下载失败');
      console.error('文件下载失败:', error);
    }
  }, []);

  // 上传答题图片
  const uploadAnswerImage = useCallback(async (file: File, examId: string, questionNumber: number) => {
    try {
      const result = await StudentAPI.uploadAnswerImage(file, examId, questionNumber);
      if (result.success && result.data) {
        message.success(result.message || '图片上传成功');
        return result.data.imageUrl;
      } else {
        message.error(result.message || '图片上传失败');
        throw new Error(result.message);
      }
    } catch (error) {
      message.error('图片上传失败');
      throw error;
    }
  }, []);

  // 上传头像
  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const result = await StudentAPI.uploadAvatar(file);
      if (result.success && result.data) {
        message.success(result.message || '头像上传成功');
        return result.data.avatarUrl;
      } else {
        message.error(result.message || '头像上传失败');
        throw new Error(result.message);
      }
    } catch (error) {
      message.error('头像上传失败');
      throw error;
    }
  }, []);

  // 获取赛区变更申请状态
  const getRegionChangeStatus = useCallback(async () => {
    try {
      const result = await StudentAPI.getRegionChangeStatus();
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('获取赛区变更申请状态失败:', error);
      return [];
    }
  }, []);

  return {
    loading,
    exams,
    dashboardData,
    loadExams,
    loadDashboardData,
    handleAccountSettings,
    handleLogout,
    deleteAccount,
    startExam,
    viewExamResult,
    updateProfile,
    changePassword,
    requestRegionChange,
    submitExamAnswers,
    getExamSubmission,
    downloadFile,
    uploadAnswerImage,
    uploadAvatar,
    getRegionChangeStatus
  };
};
