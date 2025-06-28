// 阅卷员相关API接口
import { PasswordHasher } from '../utils/passwordHasher';
import { ApiResponse, BaseAPI, PaginatedResponse } from '../types/api';
import { 
  GraderExam as Exam,
  GradingTask,
  GradingStatistics,
  ExamSubmission,
  ExamAnswer,
  ExamFile
} from '../types/common';

class GraderAPI extends BaseAPI {
  // ===================== 分值验证和题目分值模块 =====================

  // 获取考试题目分值配置
  static async getExamQuestionScores(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/grader/exams/${examId}/questions/scores`,
      { method: 'GET' },
      '获取题目分值配置'
    );
  }

  // 验证分数输入是否有效
  static validateScore(score: number, questionNumber: number, maxScore: number): {
    isValid: boolean;
    errorMessage?: string;
    suggestedScore?: number;
  } {
    // 检查分数是否为有效数字
    if (isNaN(score) || score === null || score === undefined) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数必须是有效数字`
      };
    }

    // 检查分数是否在有效范围内
    if (score < 0) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数不能为负数`,
        suggestedScore: 0
      };
    }

    if (score > maxScore) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数不能超过${maxScore}分`,
        suggestedScore: maxScore
      };
    }

    // 检查小数位数（通常限制为1位小数）
    const decimalPlaces = (score.toString().split('.')[1] || '').length;
    if (decimalPlaces > 1) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数最多保留1位小数`,
        suggestedScore: Math.round(score * 10) / 10
      };
    }

    return { isValid: true };
  }

  // 批量验证题目分数
  static validateQuestionScores(questionScores: Array<{
    questionNumber: number;
    score: number;
    maxScore: number;
  }>): {
    isValid: boolean;
    errors: Array<{
      questionNumber: number;
      errorMessage: string;
      suggestedScore?: number;
    }>;
  } {
    const errors: Array<{
      questionNumber: number;
      errorMessage: string;
      suggestedScore?: number;
    }> = [];

    questionScores.forEach((question) => {
      const validation = this.validateScore(
        question.score,
        question.questionNumber,
        question.maxScore
      );

      if (!validation.isValid) {
        errors.push({
          questionNumber: question.questionNumber,
          errorMessage: validation.errorMessage!,
          suggestedScore: validation.suggestedScore
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 提交单题分数（带验证）
  static async submitQuestionScore(
    taskId: string,
    questionNumber: number,
    score: number,
    maxScore: number,
    comments?: string
  ): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');
    this.validateRequired(questionNumber, '题目编号');
    this.validateRequired(score, '题目分数');
    this.validateRequired(maxScore, '题目满分');

    // 验证分数
    const validation = this.validateScore(score, questionNumber, maxScore);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}/questions/${questionNumber}/score`,
      {
        method: 'POST',
        body: JSON.stringify({
          score,
          maxScore,
          comments,
          submittedAt: new Date().toISOString()
        }),
      },
      '提交题目分数'
    );
  }

  // 获取单题的评分历史
  static async getQuestionGradingHistory(taskId: string, questionNumber: number): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');
    this.validateRequired(questionNumber, '题目编号');

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}/questions/${questionNumber}/history`,
      { method: 'GET' },
      '获取题目评分历史'
    );
  }

  // ===================== 阅卷任务管理模块 =====================
  
  // 获取阅卷任务列表
  static async getGradingTasks(params?: {
    status?: 'pending' | 'in_progress' | 'grading' | 'completed' | 'abandoned';
    page?: number;
    limit?: number;
    examId?: string;
    priority?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<PaginatedResponse<any>>(
      `/api/grader/tasks${queryParams}`,
      { method: 'GET' },
      '获取阅卷任务'
    );
  }

  // 获取单个阅卷任务详情
  static async getGradingTaskDetail(taskId: string): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}`,
      { method: 'GET' },
      '获取阅卷任务详情'
    );
  }

  // 获取单个阅卷任务（别名方法，用于兼容性）
  static async getGradingTask(taskId: string): Promise<ApiResponse<GradingTask>> {
    return this.getGradingTaskDetail(taskId);
  }

  // 开始阅卷任务
  static async startGradingTask(taskId: string): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}/start`,
      { method: 'POST' },
      '开始阅卷任务'
    );
  }

  // 提交阅卷结果（增强版带分值验证）
  static async submitGradingResult(taskId: string, gradingData: {
    questionScores: Array<{
      questionId: string;
      questionNumber: number;
      score: number;
      maxScore: number;
      comments?: string;
      annotations?: any[];
    }>;
    totalScore: number;
    maxTotalScore: number;
    generalComments?: string;
    submissionTime: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');
    this.validateRequired(gradingData, '阅卷数据');
    this.validateRequired(gradingData.questionScores, '题目分数');
    this.validateRequired(gradingData.totalScore, '总分');

    // 验证总分有效性
    if (gradingData.totalScore < 0) {
      throw new Error('总分不能为负数');
    }

    if (gradingData.maxTotalScore && gradingData.totalScore > gradingData.maxTotalScore) {
      throw new Error(`总分不能超过${gradingData.maxTotalScore}分`);
    }

    // 批量验证所有题目分数
    const questionValidations = gradingData.questionScores.map(item => ({
      questionNumber: item.questionNumber,
      score: item.score,
      maxScore: item.maxScore
    }));

    const validation = this.validateQuestionScores(questionValidations);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(error => error.errorMessage).join('; ');
      throw new Error(`分数验证失败: ${errorMessages}`);
    }

    // 验证每个题目的基本信息
    gradingData.questionScores.forEach((item, index) => {
      if (!item.questionId) {
        throw new Error(`第${index + 1}题的题目ID不能为空`);
      }
      if (!item.questionNumber || item.questionNumber <= 0) {
        throw new Error(`第${index + 1}题的题目编号无效`);
      }
    });

    // 验证总分是否与各题得分之和一致
    const calculatedTotal = gradingData.questionScores.reduce((sum, item) => sum + item.score, 0);
    if (Math.abs(calculatedTotal - gradingData.totalScore) > 0.01) {
      throw new Error(`总分(${gradingData.totalScore})与各题得分之和(${calculatedTotal})不一致`);
    }

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(gradingData),
      },
      '提交阅卷结果'
    );
  }

  // 提交阅卷（兼容性方法）
  static async submitGrading(taskId: string, gradingData: {
    score: number;
    maxScore: number;
    feedback?: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');
    this.validateRequired(gradingData, '阅卷数据');

    const submissionData = {
      questionScores: [{
        questionId: 'default',
        questionNumber: 1,
        score: gradingData.score,
        maxScore: gradingData.maxScore,
        comments: gradingData.feedback
      }],
      totalScore: gradingData.score,
      maxTotalScore: gradingData.maxScore,
      generalComments: gradingData.feedback,
      submissionTime: new Date().toISOString()
    };

    return this.submitGradingResult(taskId, submissionData);
  }

  // 保存阅卷进度
  static async saveGradingProgress(taskId: string, progressData: {
    questionScores?: Array<{
      questionId: string;
      score?: number;
      comments?: string;
      annotations?: any[];
    }>;
    currentQuestionIndex?: number;
    lastSaveTime: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');
    this.validateRequired(progressData, '进度数据');

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}/save-progress`,
      {
        method: 'POST',
        body: JSON.stringify(progressData),
      },
      '保存阅卷进度'
    );
  }

  // 放弃阅卷任务
  static async abandonGradingTask(taskId: string, reason?: string): Promise<ApiResponse<any>> {
    this.validateRequired(taskId, '任务ID');

    return this.makeRequest<any>(
      `/api/grader/tasks/${taskId}/abandon`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
      '放弃阅卷任务'
    );
  }

  // ===================== 考试管理模块 =====================
  
  // 获取可阅卷的考试列表
  static async getAvailableExams(params?: {
    status?: string;
    page?: number;
    limit?: number;
    subject?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<PaginatedResponse<any>>(
      `/api/grader/exams${queryParams}`,
      { method: 'GET' },
      '获取考试列表'
    );
  }

  // 获取考试详情
  static async getExamDetail(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/grader/exams/${examId}`,
      { method: 'GET' },
      '获取考试详情'
    );
  }

  // 获取考试阅卷进度
  static async getExamGradingProgress(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/grader/exams/${examId}/progress`,
      { method: 'GET' },
      '获取考试阅卷进度'
    );
  }

  // ===================== 答卷管理模块 =====================
  
  // 获取学生答卷详情
  static async getSubmissionDetail(submissionId: string): Promise<ApiResponse<any>> {
    this.validateRequired(submissionId, '答卷ID');

    return this.makeRequest<any>(
      `/api/grader/submissions/${submissionId}`,
      { method: 'GET' },
      '获取答卷详情'
    );
  }

  // 获取答案图片
  static async getAnswerImage(imageUrl: string): Promise<ApiResponse<any>> {
    this.validateRequired(imageUrl, '图片URL');

    return this.makeRequest<any>(
      `/api/grader/images?url=${encodeURIComponent(imageUrl)}`,
      { method: 'GET' },
      '获取答案图片'
    );
  }

  // ===================== 统计分析模块 =====================
  
  // 获取阅卷统计数据
  static async getGradingStatistics(params?: {
    examId?: string;
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<any>(
      `/api/grader/statistics${queryParams}`,
      { method: 'GET' },
      '获取阅卷统计'
    );
  }

  // 获取阅卷历史记录
  static async getGradingHistory(params?: {
    page?: number;
    limit?: number;
    examId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<PaginatedResponse<any>>(
      `/api/grader/history${queryParams}`,
      { method: 'GET' },
      '获取阅卷历史'
    );
  }

  // ===================== 个人信息管理模块 =====================
  
  // 获取个人信息
  static async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/api/grader/profile`,
      { method: 'GET' },
      '获取个人信息'
    );
  }

  // 更新个人信息
  static async updateProfile(profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    expertise?: string[];
    avatar?: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(profileData, '个人信息');

    // 验证手机号格式
    if (profileData.phone && !/^1[3-9]\d{9}$/.test(profileData.phone)) {
      throw new Error('手机号格式不正确');
    }

    return this.makeRequest<any>(
      `/api/grader/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      },
      '更新个人信息'
    );
  }

  // 修改密码
  static async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(passwordData.currentPassword, '当前密码');
    this.validateRequired(passwordData.newPassword, '新密码');
    this.validateRequired(passwordData.confirmPassword, '确认密码');

    // 验证新密码和确认密码是否一致
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('新密码和确认密码不一致');
    }

    // 验证密码强度
    if (passwordData.newPassword.length < 6) {
      throw new Error('密码长度至少6位');
    }

    // 密码哈希处理
    const hashedCurrentPassword = PasswordHasher.hashPasswordWithSalt(passwordData.currentPassword);
    const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(passwordData.newPassword);

    return this.makeRequest<any>(
      `/api/grader/change-password`,
      {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: hashedCurrentPassword,
          newPassword: hashedNewPassword,
        }),
      },
      '修改密码'
    );
  }

  // ===================== 文件下载模块 =====================
  
  // 下载考试相关文件
  static async downloadFile(fileId: string, fileType: 'exam' | 'answer' | 'template'): Promise<any> {
    this.validateRequired(fileId, '文件ID');
    this.validateRequired(fileType, '文件类型');

    try {
      const url = this.getApiUrl(`/api/grader/files/${fileId}/download?type=${fileType}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorMessage = `文件下载失败: HTTP ${response.status}`;
        this.handleApiError(new Error(errorMessage), '下载文件');
        return { success: false, message: errorMessage };
      }

      // 下载文件
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `file_${fileId}.${fileType === 'exam' ? 'pdf' : 'zip'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      return { success: true, message: '文件下载成功' };
    } catch (error) {
      return this.handleApiError(error, '下载文件');
    }
  }
}

export default GraderAPI;
