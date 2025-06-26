// 学生相关API接口
import { PasswordHasher } from '../utils/passwordHasher';

// TODO: 替换为真实的后端API地址
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ExamFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: string;
}

interface Exam {
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

interface ExamAnswer {
  questionNumber: number;
  imageUrl: string;
  uploadTime: string;
}

interface ExamSubmission {
  id: string;
  examId: string;
  studentUsername: string;
  answers: ExamAnswer[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  score?: number;
}

interface DashboardData {
  totalExams: number;
  completedExams: number;
  ongoingExams: number;
  upcomingExams: number;
  averageScore: number;
  lastExamScore: number;
  recentExams: Array<{
    id: string;
    title: string;
    submittedAt: string;
    status: string;
    score: number;
  }>;
}

interface RegionChangeRequest {
  id: string;
  username: string;
  role: string;
  currentProvince: string;
  currentSchool: string;
  requestedProvince: string;
  requestedSchool: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  adminComment?: string;
}

class StudentAPI {
  // 获取认证请求头
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // 1. 考试管理 API

  // 获取考试列表
  static async getExams(): Promise<ApiResponse<Exam[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/exams`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取考试列表失败:', error);
      throw error;
    }
  }

  // 获取考试详情
  static async getExamDetail(examId: string): Promise<ApiResponse<Exam>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/exams/${examId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取考试详情失败:', error);
      throw error;
    }
  }

  // 提交考试答案
  static async submitExamAnswers(examId: string, answers: ExamAnswer[]): Promise<ApiResponse<ExamSubmission>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/exams/${examId}/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ answers }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('提交考试答案失败:', error);
      throw error;
    }
  }

  // 获取考试提交记录
  static async getExamSubmission(examId: string): Promise<ApiResponse<ExamSubmission>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/exams/${examId}/submission`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取考试提交记录失败:', error);
      throw error;
    }
  }

  // 上传答题图片
  static async uploadAnswerImage(file: File, examId: string, questionNumber: number): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examId', examId);
      formData.append('questionNumber', questionNumber.toString());

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/student/upload/answer-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('上传答题图片失败:', error);
      throw error;
    }
  }

  // 2. 个人资料管理 API

  // 更新个人资料
  static async updateProfile(data: { username: string; avatar?: string }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('更新个人资料失败:', error);
      throw error;
    }
  }

  // 修改密码
  static async changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(data.oldPassword);
      const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(data.newPassword);

      const response = await fetch(`${API_BASE_URL}/student/password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: hashedOldPassword,
          newPassword: hashedNewPassword,
        }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/student/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  }

  // 3. 赛区管理 API

  // 申请赛区变更
  static async requestRegionChange(data: { province: string; school: string; reason: string }): Promise<ApiResponse<RegionChangeRequest>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/region-change`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('申请赛区变更失败:', error);
      throw error;
    }
  }

  // 获取赛区变更申请状态
  static async getRegionChangeStatus(): Promise<ApiResponse<RegionChangeRequest[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/region-change/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取赛区变更申请状态失败:', error);
      throw error;
    }
  }

  // 4. 文件下载 API

  // 下载考试文件
  static async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/student/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('文件下载失败');
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  }

  // 5. 统计数据 API

  // 获取学生仪表板数据
  static async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      throw error;
    }
  }
}

export default StudentAPI;
export type {
  ApiResponse,
  Exam,
  ExamFile,
  ExamAnswer,
  ExamSubmission,
  DashboardData,
  RegionChangeRequest
};
