// 教练相关API接口
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

class CoachAPI {
  // ===================== 学生管理模块 =====================
  
  // 获取学生列表
  static async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    grade?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/coach/students?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取学生列表失败:', error);
      throw error;
    }
  }

  // 添加学生
  static async addStudent(studentData: {
    username: string;
    grade: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData),
      });
      return await response.json();
    } catch (error) {
      console.error('添加学生失败:', error);
      throw error;
    }
  }

  // 更新学生信息
  static async updateStudent(studentId: string, updateData: {
    grade?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/students/${studentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新学生信息失败:', error);
      throw error;
    }
  }

  // 移除学生
  static async removeStudent(studentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('移除学生失败:', error);
      throw error;
    }
  }

  // ===================== 考试管理模块 =====================

  // 获取考试列表
  static async getExams(params?: {
    status?: string;
    timeRange?: string;
  }): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value);
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/coach/exams?${queryParams}`, {
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
  static async getExamDetails(examId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/exams/${examId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取考试详情失败:', error);
      throw error;
    }
  }

  // 下载考试文件
  static async downloadExamFile(examId: string, fileType: 'question' | 'answerSheet' | 'result'): Promise<Blob> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/coach/exams/${examId}/files/${fileType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('文件下载失败');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('下载考试文件失败:', error);
      throw error;
    }
  }

  // ===================== 答题提交模块 =====================

  // 代学生提交答案
  static async submitAnswersForStudent(examId: string, submissionData: {
    studentUsername: string;
    answers: Array<{
      questionNumber: number;
      imageUrl: string;
      uploadTime: string;
    }>;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/exams/${examId}/submissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });
      return await response.json();
    } catch (error) {
      console.error('提交答案失败:', error);
      throw error;
    }
  }

  // 上传答案图片
  static async uploadAnswerImage(examId: string, file: File, questionNumber: number, studentUsername: string): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionNumber', questionNumber.toString());
      formData.append('studentUsername', studentUsername);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/coach/exams/${examId}/upload-answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('上传答案图片失败:', error);
      throw error;
    }
  }

  // 获取提交记录
  static async getSubmissions(examId: string, studentUsername?: string): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (studentUsername) {
        queryParams.append('studentUsername', studentUsername);
      }
      
      const response = await fetch(`${API_BASE_URL}/coach/exams/${examId}/submissions?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取提交记录失败:', error);
      throw error;
    }
  }

  // ===================== 成绩查询模块 =====================

  // 获取成绩概览
  static async getGradesOverview(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/grades/overview`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取成绩概览失败:', error);
      throw error;
    }
  }

  // 获取详细成绩
  static async getGradesDetails(params?: {
    examId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value);
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/coach/grades/details?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取详细成绩失败:', error);
      throw error;
    }
  }

  // ===================== 个人设置模块 =====================

  // 获取个人信息
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/profile`, {
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
  static async updateProfile(updateData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
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

      const response = await fetch(`${API_BASE_URL}/coach/profile/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: hashedOldPassword,
          newPassword: hashedNewPassword
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  // 申请赛区变更
  static async requestRegionChange(requestData: {
    province: string;
    school: string;
    reason: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/profile/change-region`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      return await response.json();
    } catch (error) {
      console.error('申请赛区变更失败:', error);
      throw error;
    }
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/coach/profile/upload-avatar`, {
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

  // ===================== 仪表板统计模块 =====================

  // 获取仪表板数据
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/coach/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      throw error;
    }
  }
}

export default CoachAPI;
