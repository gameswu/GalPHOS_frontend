// 学生相关API接口
import { PasswordHasher } from '../utils/passwordHasher';
import { authService } from '../services/authService';
import { ApiResponse, BaseAPI } from '../types/api';
import { 
  StudentExam as Exam,
  ExamFile,
  ExamAnswer,
  ExamSubmission,
  DashboardData,
  ExamScore
} from '../types/common';

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

class StudentAPI extends BaseAPI {

  // 1. 考试管理 API

  // 获取考试列表
  static async getExams(): Promise<ApiResponse<Exam[]>> {
    try {
      return await this.makeRequest<Exam[]>(
        `/api/student/exams`,
        {
          method: 'GET',
        },
        '获取考试列表'
      );
    } catch (error) {
      return this.handleApiError(error, '获取考试列表');
    }
  }

  // 获取考试详情
  static async getExamDetail(examId: string): Promise<ApiResponse<Exam>> {
    try {
      this.validateRequired(examId, '考试ID');

      return await this.makeRequest<Exam>(
        `/api/student/exams/${examId}`,
        {
          method: 'GET',
        },
        '获取考试详情'
      );
    } catch (error) {
      return this.handleApiError(error, '获取考试详情');
    }
  }

  // 提交考试答案
  static async submitExamAnswers(examId: string, answers: ExamAnswer[]): Promise<ApiResponse<ExamSubmission>> {
    try {
      this.validateRequired(examId, '考试ID');
      if (!answers || answers.length === 0) {
        throw new Error('答案不能为空');
      }

      return await this.makeRequest<ExamSubmission>(
        `/api/student/exams/${examId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ answers }),
        },
        '提交考试答案'
      );
    } catch (error) {
      return this.handleApiError(error, '提交考试答案');
    }
  }

  // 获取考试提交记录
  static async getExamSubmission(examId: string): Promise<ApiResponse<ExamSubmission>> {
    try {
      this.validateRequired(examId, '考试ID');

      return await this.makeRequest<ExamSubmission>(
        `/api/student/exams/${examId}/submission`,
        {
          method: 'GET',
        },
        '获取考试提交记录'
      );
    } catch (error) {
      return this.handleApiError(error, '获取考试提交记录');
    }
  }

  // 上传答题图片
  static async uploadAnswerImage(file: File, examId: string, questionNumber: number): Promise<ApiResponse<any>> {
    // 使用新的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadAnswerImage(file, examId, questionNumber);
  }

  // 2. 个人资料管理 API

  // 获取个人资料
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/student/profile`,
        {
          method: 'GET',
        },
        '获取个人资料'
      );
    } catch (error) {
      return this.handleApiError(error, '获取个人资料');
    }
  }

  // 更新个人资料
  static async updateProfile(profileData: { 
    username?: string; 
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<ApiResponse<any>> {
    try {
      // 验证手机号格式
      if (profileData.phone && !/^1[3-9]\d{9}$/.test(profileData.phone)) {
        throw new Error('手机号格式不正确');
      }

      return await this.makeRequest<any>(
        `/api/student/profile`,
        {
          method: 'PUT',
          body: JSON.stringify(profileData),
        },
        '更新个人资料'
      );
    } catch (error) {
      return this.handleApiError(error, '更新个人资料');
    }
  }

  // 修改密码
  static async changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(data.oldPassword, '原密码');
      this.validateRequired(data.newPassword, '新密码');

      if (data.newPassword.length < 6) {
        throw new Error('新密码长度不能少于6位');
      }

      // 对密码进行哈希处理
      const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(data.oldPassword);
      const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(data.newPassword);

      return await this.makeRequest<any>(
        `/api/student/password`,
        {
          method: 'PUT',
          body: JSON.stringify({
            oldPassword: hashedOldPassword,
            newPassword: hashedNewPassword,
          }),
        },
        '修改密码'
      );
    } catch (error) {
      return this.handleApiError(error, '修改密码');
    }
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    // 使用新的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadAvatar(file);
  }

  // 3. 赛区管理 API

  // 申请赛区变更
  static async requestRegionChange(data: { province: string; school: string; reason: string }): Promise<ApiResponse<RegionChangeRequest>> {
    try {
      this.validateRequired(data.province, '省份');
      this.validateRequired(data.school, '学校');
      this.validateRequired(data.reason, '变更原因');

      return await this.makeRequest<RegionChangeRequest>(
        `/api/student/region-change`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        '申请赛区变更'
      );
    } catch (error) {
      return this.handleApiError(error, '申请赛区变更');
    }
  }

  // 获取赛区变更申请状态
  static async getRegionChangeStatus(): Promise<ApiResponse<RegionChangeRequest[]>> {
    try {
      return await this.makeRequest<RegionChangeRequest[]>(
        `/api/student/region-change/status`,
        {
          method: 'GET',
        },
        '获取赛区变更申请状态'
      );
    } catch (error) {
      return this.handleApiError(error, '获取赛区变更申请状态');
    }
  }

  // 4. 文件下载 API

  // 下载考试文件
  static async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      this.validateRequired(fileId, '文件ID');
      this.validateRequired(fileName, '文件名');

      const url = this.getApiUrl(`/api/student/files/download/${fileId}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorMessage = response.status === 404 
          ? '文件不存在' 
          : `文件下载失败: HTTP ${response.status}`;
        this.handleApiError(new Error(errorMessage), '下载考试文件');
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        this.handleApiError(new Error('文件为空'), '下载考试文件');
        return;
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      this.handleApiError(error, '下载文件');
    }
  }

  // 5. 统计数据 API

  // 获取仪表板数据
  static async getDashboardStats(): Promise<ApiResponse<DashboardData>> {
    try {
      return await this.makeRequest<DashboardData>(
        `/api/student/dashboard/stats`,
        {
          method: 'GET',
        },
        '获取仪表板数据'
      );
    } catch (error) {
      return this.handleApiError(error, '获取仪表板数据');
    }
  }

  // ===================== 成绩管理模块 =====================

  // 获取学生成绩列表（精简版）
  static async getScores(params?: {
    page?: number;
    limit?: number;
    examId?: string;
    status?: string;
  }): Promise<ApiResponse<ExamScore[]>> {
    try {
      const queryParams = this.buildQueryParams(params);
      return await this.makeRequest<ExamScore[]>(
        `/api/student/scores${queryParams}`,
        {
          method: 'GET',
        },
        '获取成绩列表'
      );
    } catch (error) {
      return this.handleApiError(error, '获取成绩列表');
    }
  }

  // 获取单次考试成绩详情（精简版：仅包含用户名、各题得分、总分、总排名、赛区排名、成绩状态）
  static async getScoreDetail(examId: string): Promise<ApiResponse<ExamScore>> {
    try {
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<ExamScore>(
        `/api/student/exams/${examId}/score`,
        {
          method: 'GET',
        },
        '获取成绩详情'
      );
    } catch (error) {
      return this.handleApiError(error, '获取成绩详情');
    }
  }

  // 获取成绩排名信息
  static async getScoreRanking(examId: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<any>(
        `/api/student/exams/${examId}/ranking`,
        {
          method: 'GET',
        },
        '获取成绩排名'
      );
    } catch (error) {
      return this.handleApiError(error, '获取成绩排名');
    }
  }

  // 获取成绩统计信息
  static async getScoreStatistics(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/student/scores/statistics`,
        {
          method: 'GET',
        },
        '获取成绩统计'
      );
    } catch (error) {
      return this.handleApiError(error, '获取成绩统计');
    }
  }

  // ===================== 学生仪表板模块 =====================
}

export default StudentAPI;
export type { 
  Exam, 
  ExamFile, 
  ExamAnswer, 
  ExamSubmission, 
  DashboardData, 
  RegionChangeRequest 
};
