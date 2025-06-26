// 阅卷者相关API接口
import { PasswordHasher } from '../utils/passwordHasher';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 获取Token的辅助函数
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// 考试文件接口
export interface ExamFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: string;
  type: 'question' | 'answer' | 'answer_sheet';
}

// 考试接口
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
  maxScore?: number;
  province?: string;
  grade?: string;
  subject?: string;
}

// 学生答案接口
export interface ExamAnswer {
  questionNumber: number;
  imageUrl: string;
  uploadTime: string;
  originalFileName?: string;
}

// 考试提交接口
export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  studentSchool?: string;
  studentProvince?: string;
  answers: ExamAnswer[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  score?: number;
  gradedBy?: string;
  gradedAt?: string;
  feedback?: string;
}

// 阅卷任务接口
export interface GradingTask {
  id: string;
  examId: string;
  examTitle: string;
  submissionId: string;
  studentName: string;
  studentUsername: string;
  studentSchool?: string;
  studentProvince?: string;
  submittedAt: string;
  status: 'pending' | 'grading' | 'completed';
  score?: number;
  maxScore?: number;
  graderId?: string;
  graderName?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  feedback?: string;
  submission: ExamSubmission;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// 阅卷统计接口
export interface GradingStatistics {
  totalTasks: number;
  pendingTasks: number;
  gradingTasks: number;
  completedTasks: number;
  todayCompleted: number;
  averageScore?: number;
  efficiency?: {
    tasksPerHour: number;
    averageGradingTime: number; // 分钟
  };
}

// 阅卷进度接口
export interface GradingProgress {
  examId: string;
  examTitle: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  myCompletedTasks: number;
  progress: number; // 百分比
}

class GraderAPI {
  // ===================== 阅卷任务管理模块 =====================
  
  // 获取阅卷任务列表
  static async getGradingTasks(params?: {
    page?: number;
    limit?: number;
    examId?: string;
    status?: 'pending' | 'grading' | 'completed';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    search?: string;
  }): Promise<ApiResponse<{
    tasks: GradingTask[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/grader/tasks?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷任务失败:', error);
      throw error;
    }
  }

  // 获取单个阅卷任务详情
  static async getGradingTask(taskId: string): Promise<ApiResponse<GradingTask>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/tasks/${taskId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷任务详情失败:', error);
      throw error;
    }
  }

  // 开始阅卷任务
  static async startGradingTask(taskId: string): Promise<ApiResponse<GradingTask>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/tasks/${taskId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('开始阅卷任务失败:', error);
      throw error;
    }
  }

  // 提交阅卷结果
  static async submitGrading(taskId: string, gradingData: {
    score: number;
    maxScore: number;
    feedback?: string;
    questionScores?: Array<{
      questionNumber: number;
      score: number;
      maxScore: number;
      feedback?: string;
    }>;
  }): Promise<ApiResponse<GradingTask>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(gradingData),
      });
      return await response.json();
    } catch (error) {
      console.error('提交阅卷结果失败:', error);
      throw error;
    }
  }

  // 暂存阅卷进度
  static async saveGradingProgress(taskId: string, progressData: {
    score?: number;
    feedback?: string;
    questionScores?: Array<{
      questionNumber: number;
      score: number;
      maxScore: number;
      feedback?: string;
    }>;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/tasks/${taskId}/save-progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(progressData),
      });
      return await response.json();
    } catch (error) {
      console.error('保存阅卷进度失败:', error);
      throw error;
    }
  }

  // 放弃阅卷任务
  static async abandonGradingTask(taskId: string, reason?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/tasks/${taskId}/abandon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      return await response.json();
    } catch (error) {
      console.error('放弃阅卷任务失败:', error);
      throw error;
    }
  }

  // ===================== 考试管理模块 =====================
  
  // 获取可阅卷的考试列表
  static async getAvailableExams(params?: {
    page?: number;
    limit?: number;
    status?: 'grading' | 'completed';
    province?: string;
    grade?: string;
    subject?: string;
  }): Promise<ApiResponse<{
    exams: Exam[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/grader/exams?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取考试列表失败:', error);
      throw error;
    }
  }

  // 获取考试详情
  static async getExamDetail(examId: string): Promise<ApiResponse<Exam>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/exams/${examId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取考试详情失败:', error);
      throw error;
    }
  }

  // 获取考试的阅卷进度
  static async getExamGradingProgress(examId: string): Promise<ApiResponse<GradingProgress>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/exams/${examId}/progress`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取考试阅卷进度失败:', error);
      throw error;
    }
  }

  // ===================== 学生答卷管理模块 =====================
  
  // 获取学生答卷详情
  static async getSubmissionDetail(submissionId: string): Promise<ApiResponse<ExamSubmission>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/submissions/${submissionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取答卷详情失败:', error);
      throw error;
    }
  }

  // 获取答案图片
  static async getAnswerImage(imageUrl: string): Promise<ApiResponse<{
    url: string;
    base64?: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/images?url=${encodeURIComponent(imageUrl)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取答案图片失败:', error);
      throw error;
    }
  }

  // ===================== 统计与报告模块 =====================
  
  // 获取阅卷统计信息
  static async getGradingStatistics(params?: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    examId?: string;
  }): Promise<ApiResponse<GradingStatistics>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.dateRange) {
        queryParams.append('startDate', params.dateRange.startDate);
        queryParams.append('endDate', params.dateRange.endDate);
      }
      if (params?.examId) {
        queryParams.append('examId', params.examId);
      }
      
      const response = await fetch(`${API_BASE_URL}/grader/statistics?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷统计失败:', error);
      throw error;
    }
  }

  // 获取我的阅卷历史
  static async getMyGradingHistory(params?: {
    page?: number;
    limit?: number;
    examId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    tasks: GradingTask[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/grader/history?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷历史失败:', error);
      throw error;
    }
  }

  // ===================== 个人中心模块 =====================
  
  // 获取个人信息
  static async getProfile(): Promise<ApiResponse<{
    id: string;
    username: string;
    email: string;
    avatar?: string;
    role: 'grader';
    province?: string;
    school?: string;
    subjects?: string[];
    certification?: {
      level: string;
      subjects: string[];
      validUntil: string;
    };
    statistics: {
      totalGraded: number;
      averageScore: number;
      efficiency: number;
      accuracy: number;
    };
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取个人信息失败:', error);
      throw error;
    }
  }

  // 更新个人信息
  static async updateProfile(profileData: {
    username?: string;
    email?: string;
    avatar?: string;
    school?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新个人信息失败:', error);
      throw error;
    }
  }

  // 修改密码
  static async changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(passwordData.oldPassword);
      const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(passwordData.newPassword);
      
      const response = await fetch(`${API_BASE_URL}/grader/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: hashedOldPassword,
          newPassword: hashedNewPassword,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  // ===================== 文件处理模块 =====================
  
  // 下载考试文件
  static async downloadExamFile(fileId: string, fileType: 'question' | 'answer' | 'answer_sheet'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/files/${fileId}/download?type=${fileType}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('文件下载失败');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 从响应头获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `exam-${fileType}-${fileId}`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/grader/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  }

  // ===================== 系统通知模块 =====================
  
  // 获取通知列表
  static async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: 'unread' | 'read' | 'all';
  }): Promise<ApiResponse<{
    notifications: Array<{
      id: string;
      title: string;
      content: string;
      type: 'system' | 'exam' | 'task' | 'warning';
      status: 'unread' | 'read';
      createdAt: string;
      data?: any;
    }>;
    total: number;
    unreadCount: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/grader/notifications?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取通知列表失败:', error);
      throw error;
    }
  }

  // 标记通知为已读
  static async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  }

  // 标记所有通知为已读
  static async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/grader/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      throw error;
    }
  }
}

export default GraderAPI;
