// 教练相关API接口
import { PasswordHasher } from '../utils/passwordHasher';
import { authService } from '../services/authService';
import { ApiResponse, BaseAPI, PaginatedResponse } from '../types/api';
import { 
  StudentExam as Exam,
  ExamFile,
  ExamAnswer,
  ExamSubmission,
  ExamScore,
  QuestionScore
} from '../types/common';

class CoachAPI extends BaseAPI {
  // ===================== 学生管理模块 =====================
  
  // 获取学生列表
  static async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      const queryString = this.buildQueryParams(params);
      
      return await this.makeRequest<PaginatedResponse<any>>(
        `/api/coach/students${queryString}`,
        {
          method: 'GET',
        },
        '获取学生列表'
      );
    } catch (error) {
      return this.handleApiError(error, '获取学生列表');
    }
  }

  // 添加学生
  static async addStudent(studentData: {
    username: string;
  }): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(studentData.username, '学生用户名');

      return await this.makeRequest<any>(
        `/api/coach/students`,
        {
          method: 'POST',
          body: JSON.stringify(studentData),
        },
        '添加学生'
      );
    } catch (error) {
      return this.handleApiError(error, '添加学生');
    }
  }

  // 更新学生信息
  static async updateStudent(studentId: string, updateData: {
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(studentId, '学生ID');

      return await this.makeRequest<any>(
        `/api/coach/students/${studentId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        },
        '更新学生信息'
      );
    } catch (error) {
      return this.handleApiError(error, '更新学生信息');
    }
  }

  // 移除学生
  static async removeStudent(studentId: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(studentId, '学生ID');

      return await this.makeRequest<any>(
        `/api/coach/students/${studentId}`,
        {
          method: 'DELETE',
        },
        '移除学生'
      );
    } catch (error) {
      return this.handleApiError(error, '移除学生');
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
      
      const response = await fetch(`/api/coach/exams?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(`/api/coach/exams/${examId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
      const token = authService.getToken();
      const response = await fetch(`/api/coach/exams/${examId}/files/${fileType}`, {
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
      const response = await fetch(`/api/coach/exams/${examId}/submissions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
    // 使用新的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadAnswerImageByCoach(file, examId, questionNumber, studentUsername);
  }

  // 获取提交记录
  static async getSubmissions(examId: string, studentUsername?: string): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (studentUsername) {
        queryParams.append('studentUsername', studentUsername);
      }
      
      const response = await fetch(`/api/coach/exams/${examId}/submissions?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(`/api/coach/grades/overview`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
      
      const response = await fetch(`/api/coach/grades/details?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(`/api/coach/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(`/api/coach/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
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

      const response = await fetch(`/api/coach/profile/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(`/api/coach/profile/change-region`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
    // 使用新的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadAvatar(file);
  }

  // ===================== 成绩管理模块 =====================

  // 获取学生成绩列表
  static async getStudentScores(params?: {
    page?: number;
    limit?: number;
    studentId?: string;
    examId?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const queryParams = this.buildQueryParams(params);
      return await this.makeRequest<any>(
        `/api/coach/students/scores${queryParams}`,
        {
          method: 'GET',
        },
        '获取学生成绩列表'
      );
    } catch (error) {
      return this.handleApiError(error, '获取学生成绩列表');
    }
  }

  // 获取单个学生的考试成绩详情
  static async getStudentScoreDetail(studentId: string, examId: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(studentId, '学生ID');
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<any>(
        `/api/coach/students/${studentId}/exams/${examId}/score`,
        {
          method: 'GET',
        },
        '获取学生成绩详情'
      );
    } catch (error) {
      return this.handleApiError(error, '获取学生成绩详情');
    }
  }

  // 获取考试成绩统计
  static async getExamScoreStatistics(examId: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<any>(
        `/api/coach/exams/${examId}/scores/statistics`,
        {
          method: 'GET',
        },
        '获取考试成绩统计'
      );
    } catch (error) {
      return this.handleApiError(error, '获取考试成绩统计');
    }
  }

  // 获取学生排名信息
  static async getStudentRanking(examId: string, studentId?: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(examId, '考试ID');
      
      const params = studentId ? { studentId } : {};
      const queryParams = this.buildQueryParams(params);
      
      return await this.makeRequest<any>(
        `/api/coach/exams/${examId}/ranking${queryParams}`,
        {
          method: 'GET',
        },
        '获取学生排名'
      );
    } catch (error) {
      return this.handleApiError(error, '获取学生排名');
    }
  }

  // 导出成绩报告
  static async exportScoreReport(examId: string, format: 'excel' | 'pdf' = 'excel'): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<any>(
        `/api/coach/exams/${examId}/scores/export`,
        {
          method: 'POST',
          body: JSON.stringify({ format }),
        },
        '导出成绩报告'
      );
    } catch (error) {
      return this.handleApiError(error, '导出成绩报告');
    }
  }

  // ===================== 仪表板统计模块 =====================

  // 获取仪表板数据
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`/api/coach/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      throw error;
    }
  }

  // ===================== 赛区变更申请模块 =====================

  // 申请赛区变更
  static async submitRegionChangeRequest(data: {
    province: string;
    school: string;
    reason: string;
  }): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(data.province, '省份');
      this.validateRequired(data.school, '学校');
      this.validateRequired(data.reason, '申请理由');

      return await this.makeRequest<any>(
        `/api/coach/profile/change-region`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        '提交赛区变更申请'
      );
    } catch (error) {
      return this.handleApiError(error, '提交赛区变更申请');
    }
  }

  // 获取我的赛区变更申请记录
  static async getMyRegionChangeRequests(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/coach/profile/change-region-requests`,
        {
          method: 'GET',
        },
        '获取赛区变更申请记录'
      );
    } catch (error) {
      return this.handleApiError(error, '获取赛区变更申请记录');
    }
  }
}

export default CoachAPI;
