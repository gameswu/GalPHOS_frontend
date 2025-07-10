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

  // 添加学生（直接添加，无需审核）
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
    name?: string;
    province?: string;
    school?: string;
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

  // 删除学生
  static async deleteStudent(studentId: string): Promise<ApiResponse<any>> {
    console.log('🔵 CoachAPI.deleteStudent 开始执行', { studentId });
    
    try {
      this.validateRequired(studentId, '学生ID');
      
      const apiUrl = `/api/coach/students/${studentId}`;
      const headers = this.getAuthHeaders();
      
      console.log('🔵 API 请求配置', { 
        url: apiUrl, 
        method: 'DELETE',
        hasAuth: !!headers.Authorization,
        headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined }
      });

      const result = await this.makeRequest<any>(
        apiUrl,
        {
          method: 'DELETE',
        },
        '删除学生'
      );
      
      console.log('🔵 API 请求完成', { result });
      return result;
    } catch (error) {
      console.error('🔴 CoachAPI.deleteStudent 异常', { error, studentId });
      return this.handleApiError(error, '删除学生');
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
      
      const response = await this.makeRequest<any>(
        `/api/coach/exams?${queryParams}`,
        {
          method: 'GET',
        },
        '获取考试列表'
      );
      return response;
    } catch (error) {
      return this.handleApiError(error, '获取考试列表');
    }
  }

  // 获取考试详情
  static async getExamDetails(examId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest<any>(
        `/api/coach/exams/${examId}`,
        {
          method: 'GET',
        },
        '获取考试详情'
      );
      return response;
    } catch (error) {
      return this.handleApiError(error, '获取考试详情');
    }
  }

  // 下载考试文件
  static async downloadExamFile(examId: string, fileType: 'question' | 'answerSheet' | 'result'): Promise<Blob> {
    try {
      const url = this.getApiUrl(`/api/coach/exams/${examId}/files/${fileType}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorMessage = `文件下载失败: HTTP ${response.status}`;
        this.handleApiError(new Error(errorMessage), '下载考试文件');
      }
      
      return await response.blob();
    } catch (error) {
      return this.handleApiError(error, '下载考试文件');
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
      return await this.makeRequest<any>(
        `/api/coach/exams/${examId}/submissions`,
        {
          method: 'POST',
          body: JSON.stringify(submissionData),
        },
        '代学生提交答案'
      );
    } catch (error) {
      return this.handleApiError(error, '代学生提交答案');
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
      
      return await this.makeRequest<any[]>(
        `/api/coach/exams/${examId}/submissions?${queryParams}`,
        {
          method: 'GET',
        },
        '获取提交记录'
      );
    } catch (error) {
      return this.handleApiError(error, '获取提交记录');
    }
  }

  // ===================== 成绩查询模块 =====================

  // 获取成绩概览
  static async getGradesOverview(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/coach/grades/overview`,
        {
          method: 'GET',
        },
        '获取成绩概览'
      );
    } catch (error) {
      return this.handleApiError(error, '获取成绩概览');
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
      
      return await this.makeRequest<any[]>(
        `/api/coach/grades/details?${queryParams}`,
        {
          method: 'GET',
        },
        '获取详细成绩'
      );
    } catch (error) {
      return this.handleApiError(error, '获取详细成绩');
    }
  }

  // ===================== 个人设置模块 =====================

  // 获取个人信息
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/coach/profile`,
        {
          method: 'GET',
        },
        '获取个人信息'
      );
    } catch (error) {
      return this.handleApiError(error, '获取个人信息');
    }
  }

  // 更新个人信息
  static async updateProfile(profileData: {
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
        `/api/coach/profile`,
        {
          method: 'PUT',
          body: JSON.stringify(profileData),
        },
        '更新个人信息'
      );
    } catch (error) {
      return this.handleApiError(error, '更新个人信息');
    }
  }

  // 修改密码
  static async changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(passwordData.oldPassword, '当前密码');
      this.validateRequired(passwordData.newPassword, '新密码');

      if (passwordData.newPassword.length < 6) {
        throw new Error('新密码长度不能少于6位');
      }

      // 对密码进行哈希处理
      const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(passwordData.oldPassword);
      const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(passwordData.newPassword);

      return await this.makeRequest<any>(
        `/api/coach/password`,
        {
          method: 'PUT',
          body: JSON.stringify({
            oldPassword: hashedOldPassword,
            newPassword: hashedNewPassword
          }),
        },
        '修改密码'
      );
    } catch (error) {
      return this.handleApiError(error, '修改密码');
    }
  }

  // 申请赛区变更
  static async requestRegionChange(requestData: {
    province: string;
    school: string;
    reason: string;
  }): Promise<ApiResponse<any>> {
    try {
      this.validateRequired(requestData.province, '省份');
      this.validateRequired(requestData.school, '学校');
      this.validateRequired(requestData.reason, '申请理由');

      return await this.makeRequest<any>(
        `/api/coach/region-change`,
        {
          method: 'POST',
          body: JSON.stringify(requestData),
        },
        '申请赛区变更'
      );
    } catch (error) {
      return this.handleApiError(error, '申请赛区变更');
    }
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    // 使用新的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadAvatar(file);
  }

  // ===================== 成绩管理模块 =====================

  // 获取学生成绩列表（精简版）
  static async getStudentScores(params?: {
    page?: number;
    limit?: number;
    studentId?: string;
    examId?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<ExamScore[]>> {
    try {
      const queryParams = this.buildQueryParams(params);
      return await this.makeRequest<ExamScore[]>(
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

  // 获取单个学生的考试成绩详情（精简版）
  static async getStudentScoreDetail(studentId: string, examId: string): Promise<ApiResponse<ExamScore>> {
    try {
      this.validateRequired(studentId, '学生ID');
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<ExamScore>(
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

  // 获取考试成绩统计（精简版）
  static async getExamScoreStatistics(examId: string): Promise<ApiResponse<ExamScore[]>> {
    try {
      this.validateRequired(examId, '考试ID');
      
      return await this.makeRequest<ExamScore[]>(
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
      return await this.makeRequest<any>(
        `/api/coach/dashboard/stats`,
        {
          method: 'GET',
        },
        '获取仪表板数据'
      );
    } catch (error) {
      return this.handleApiError(error, '获取仪表板数据');
    }
  }

  // ===================== 赛区变更申请模块 =====================
  // 注意：教练地区变更API与学生保持一致的路径和方法命名规范
  // 路径：/api/coach/region-change* （统一规范）
  // 微服务路由：区域管理服务 (port 3007)
  // 详细文档：docs/API_REGION.md

  // 获取赛区变更申请状态
  static async getRegionChangeStatus(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest<any>(
        `/api/coach/region-change/status`,
        {
          method: 'GET',
        },
        '获取赛区变更申请状态'
      );
    } catch (error) {
      return this.handleApiError(error, '获取赛区变更申请状态');
    }
  }
}

export default CoachAPI;
