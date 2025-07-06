// 管理员相关API接口
import { PasswordHasher } from '../utils/passwordHasher';
import { 
  ApiResponse, 
  BaseAPI, 
  PaginatedResponse, 
  CreateExamRequest,
  UpdateExamRequest 
} from '../types/api';
import { 
  Exam,
  ExamWithQuestions,
  ExamFormData,
  Question,
  QuestionScoreForm,
  SetQuestionScoresRequest
} from '../types/common';

class AdminAPI extends BaseAPI {
  // ===================== 用户管理模块 =====================
  
  // 获取待审核用户列表
  static async getPendingUsers(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/admin/users/pending`,
      { method: 'GET' },
      '获取待审核用户'
    );
  }

  // 审核用户申请
  static async approveUser(userId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<any>> {
    this.validateRequired(userId, '用户ID');
    this.validateRequired(action, '审核操作');

    return this.makeRequest<any>(
      `/api/admin/users/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, action, reason }),
      },
      '审核用户'
    );
  }

  // 获取已审核用户列表
  static async getApprovedUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = this.buildQueryParams(params);
    
    return this.makeRequest<any>(
      `/api/admin/users/approved${queryParams}`,
      { method: 'GET' },
      '获取已审核用户列表'
    );
  }

  // 更新用户状态
  static async updateUserStatus(userId: string, status: string): Promise<ApiResponse<any>> {
    this.validateRequired(userId, '用户ID');
    this.validateRequired(status, '用户状态');

    return this.makeRequest<any>(
      `/api/admin/users/status`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, status }),
      },
      '更新用户状态'
    );
  }

  // 删除用户
  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    this.validateRequired(userId, '用户ID');

    return this.makeRequest<any>(
      `/api/admin/users/${userId}`,
      { method: 'DELETE' },
      '删除用户'
    );
  }

  // ===================== 地区管理模块 =====================
  
  // 获取所有地区
  static async getRegions(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/admin/regions`,
      { method: 'GET' },
      '获取所有地区'
    );
  }

  // 获取所有省份
  static async getProvinces(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/admin/regions/provinces`,
      { method: 'GET' },
      '获取所有省份'
    );
  }

  // 添加省份
  static async addProvince(provinceName: string): Promise<ApiResponse<any>> {
    this.validateRequired(provinceName, '省份名称');

    return this.makeRequest<any>(
      `/api/admin/regions/provinces`,
      {
        method: 'POST',
        body: JSON.stringify({ name: provinceName }),
      },
      '添加省份'
    );
  }

  // 获取指定省份的学校列表
  static async getSchoolsByProvince(provinceId: string): Promise<ApiResponse<any[]>> {
    this.validateRequired(provinceId, '省份ID');

    const queryParams = this.buildQueryParams({ provinceId });

    return this.makeRequest<any[]>(
      `/api/admin/regions/schools${queryParams}`,
      { method: 'GET' },
      '获取省份学校列表'
    );
  }

  // 添加学校
  static async addSchool(provinceId: string, schoolName: string): Promise<ApiResponse<any>> {
    this.validateRequired(provinceId, '省份ID');
    this.validateRequired(schoolName, '学校名称');

    return this.makeRequest<any>(
      `/api/admin/regions/schools`,
      {
        method: 'POST',
        body: JSON.stringify({ 
          provinceId, 
          name: schoolName 
        }),
      },
      '添加学校'
    );
  }

  // 更新学校信息
  static async updateSchool(schoolId: string, schoolData: { name: string }): Promise<ApiResponse<any>> {
    this.validateRequired(schoolId, '学校ID');
    this.validateRequired(schoolData, '学校数据');
    this.validateRequired(schoolData.name, '学校名称');

    return this.makeRequest<any>(
      `/api/admin/regions/schools/${schoolId}`,
      {
        method: 'PUT',
        body: JSON.stringify(schoolData),
      },
      '更新学校信息'
    );
  }

  // 删除学校
  static async deleteSchool(schoolId: string): Promise<ApiResponse<any>> {
    this.validateRequired(schoolId, '学校ID');

    return this.makeRequest<any>(
      `/api/admin/regions/schools/${schoolId}`,
      { method: 'DELETE' },
      '删除学校'
    );
  }

  // 删除省份
  static async deleteProvince(provinceId: string): Promise<ApiResponse<any>> {
    this.validateRequired(provinceId, '省份ID');

    return this.makeRequest<any>(
      `/api/admin/regions/provinces/${provinceId}`,
      { method: 'DELETE' },
      '删除省份'
    );
  }

  // 获取地区变更申请列表
  static async getRegionChangeRequests(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<any>(
      `/api/admin/regions/change-requests${queryParams}`,
      { method: 'GET' },
      '获取地区变更申请列表'
    );
  }

  // 处理地区变更申请
  static async handleRegionChangeRequest(requestId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<any>> {
    this.validateRequired(requestId, '申请ID');
    this.validateRequired(action, '处理操作');

    return this.makeRequest<any>(
      `/api/admin/regions/change-requests/${requestId}`,
      {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      },
      '处理地区变更申请'
    );
  }

  // ===================== 考试管理模块 =====================
  
  // 获取考试列表
  static async getExams(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<any>(
      `/api/admin/exams${queryParams}`,
      { method: 'GET' },
      '获取考试列表'
    );
  }

  // 创建考试
  static async createExam(examData: CreateExamRequest): Promise<ApiResponse<any>> {
    this.validateRequired(examData.title, '考试标题');
    this.validateRequired(examData.startTime, '开始时间');
    this.validateRequired(examData.endTime, '结束时间');
    this.validateRequired(examData.duration, '考试时长');
    this.validateRequired(examData.totalScore, '总分');
    this.validateRequired(examData.totalQuestions, '题目数量');
    this.validateRequired(examData.questions, '题目分值设置');

    return this.makeRequest<any>(
      `/api/admin/exams`,
      {
        method: 'POST',
        body: JSON.stringify(examData),
      },
      '创建考试'
    );
  }

  // 更新考试
  static async updateExam(examId: string, examData: UpdateExamRequest): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');
    this.validateRequired(examData, '考试数据');

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}`,
      {
        method: 'PUT',
        body: JSON.stringify(examData),
      },
      '更新考试'
    );
  }

  // 发布考试
  static async publishExam(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}/publish`,
      { method: 'POST' },
      '发布考试'
    );
  }

  // 取消发布考试
  static async unpublishExam(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}/unpublish`,
      { method: 'POST' },
      '取消发布考试'
    );
  }

  // 删除考试
  static async deleteExam(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}`,
      { method: 'DELETE' },
      '删除考试'
    );
  }

  // 上传考试文件（统一使用文件上传服务）
  static async uploadExamFile(examId: string, file: File, type: 'question' | 'answer' | 'answerSheet'): Promise<ApiResponse<any>> {
    // 使用统一的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadExamFile(file, examId, type);
  }

  // 删除考试文件（统一使用文件删除服务）
  static async deleteExamFile(fileId: string): Promise<ApiResponse<any>> {
    this.validateRequired(fileId, '文件ID');

    return this.makeRequest<any>(
      `/api/files/${fileId}`,
      { method: 'DELETE' },
      '删除考试文件'
    );
  }

  // 兼容原方法：批量上传考试文件（使用文件上传服务）
  static async uploadExamFiles(examId: string, files: FileList): Promise<ApiResponse<any>> {
    // 使用新的文件上传服务
    const FileUploadService = await import('../services/fileUploadService');
    return FileUploadService.default.uploadExamFiles(files, examId);
  }

  // 预申请考试ID（用于文件上传）
  static async reserveExamId(): Promise<ApiResponse<{ examId: string }>> {
    return this.makeRequest<{ examId: string }>(
      `/api/admin/exams/reserve`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
      '预申请考试ID'
    );
  }

  // 删除预申请的考试ID
  static async deleteReservedExamId(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/admin/exams/reserve/${examId}`,
      { method: 'DELETE' },
      '删除预申请的考试ID'
    );
  }
  // ===================== 题目分值管理模块 =====================
  
  // 设置考试题目分值
  static async setQuestionScores(examId: string, questions: { number: number; score: number }[]): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');
    this.validateRequired(questions, '题目分值');

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('题目分值配置不能为空');
    }

    // 验证每个题目的分值
    questions.forEach((question, index) => {
      if (!question.number || question.number <= 0) {
        throw new Error(`第${index + 1}个题目编号无效`);
      }
      if (!question.score || question.score <= 0) {
        throw new Error(`第${index + 1}个题目分值必须大于0`);
      }
    });

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}/question-scores`,
      {
        method: 'POST',
        body: JSON.stringify({ questions }),
      },
      '设置题目分值'
    );
  }

  // 获取考试题目分值配置
  static async getQuestionScores(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}/question-scores`,
      { method: 'GET' },
      '获取题目分值配置'
    );
  }

  // 更新单个题目分值
  static async updateQuestionScore(examId: string, questionNumber: number, score: number): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');
    this.validateRequired(questionNumber, '题目编号');
    this.validateRequired(score, '题目分值');

    if (questionNumber <= 0) {
      throw new Error('题目编号必须大于0');
    }
    if (score <= 0) {
      throw new Error('题目分值必须大于0');
    }

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}/question-scores/${questionNumber}`,
      {
        method: 'PUT',
        body: JSON.stringify({ score }),
      },
      '更新题目分值'
    );
  }

  // 批量导入题目分值（从Excel等）
  static async importQuestionScores(examId: string, file: File): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');
    this.validateRequired(file, '分值配置文件');

    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<any>(
      `/api/admin/exams/${examId}/questions/scores/import`,
      {
        method: 'POST',
        body: formData,
        // BaseAPI会自动添加认证头
      },
      '导入题目分值配置'
    );
  }

  // ===================== 阅卷管理模块 =====================
  
  // 获取阅卷员列表
  static async getGraders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    expertise?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<any>(
      `/api/admin/graders${queryParams}`,
      { method: 'GET' },
      '获取阅卷员列表'
    );
  }

  // 获取阅卷任务列表
  static async getGradingTasks(params?: {
    page?: number;
    limit?: number;
    examId?: string;
    graderId?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = this.buildQueryParams(params);

    return this.makeRequest<any>(
      `/api/admin/grading/tasks${queryParams}`,
      { method: 'GET' },
      '获取阅卷任务列表'
    );
  }

  // 分配阅卷任务
  static async assignGradingTask(assignmentData: {
    examId: string;
    graderId: string;
    questionIds?: string[];
  }): Promise<ApiResponse<any>>;
  static async assignGradingTask(examId: string, questionNumber: number, graderIds: string[]): Promise<ApiResponse<any>>;
  static async assignGradingTask(
    assignmentDataOrExamId: {
      examId: string;
      graderId: string;
      questionIds?: string[];
    } | string,
    questionNumber?: number,
    graderIds?: string[]
  ): Promise<ApiResponse<any>> {
    // 处理新格式的调用
    if (typeof assignmentDataOrExamId === 'object') {
      this.validateRequired(assignmentDataOrExamId.examId, '考试ID');
      this.validateRequired(assignmentDataOrExamId.graderId, '阅卷员ID');

      return this.makeRequest<any>(
        `/api/admin/grading/assign`,
        {
          method: 'POST',
          body: JSON.stringify(assignmentDataOrExamId),
        },
        '分配阅卷任务'
      );
    }

    // 处理旧格式的调用 (examId, questionNumber, graderIds)
    const examId = assignmentDataOrExamId;
    this.validateRequired(examId, '考试ID');
    this.validateRequired(questionNumber, '题目编号');
    this.validateRequired(graderIds, '阅卷员ID列表');

    // 为每个阅卷员创建分配任务
    const assignments = graderIds!.map(graderId => ({
      examId,
      graderId,
      questionIds: [`question_${questionNumber}`]
    }));

    // 批量分配
    const results = await Promise.all(
      assignments.map(assignment =>
        this.makeRequest<any>(
          `/api/admin/grading/assign`,
          {
            method: 'POST',
            body: JSON.stringify(assignment),
          },
          '分配阅卷任务'
        )
      )
    );

    // 返回汇总结果
    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount === results.length,
      message: `成功分配 ${successCount}/${results.length} 个任务`,
      data: results
    };
  }

  // 获取阅卷进度
  static async getGradingProgress(examId: string): Promise<ApiResponse<any>> {
    this.validateRequired(examId, '考试ID');

    return this.makeRequest<any>(
      `/api/admin/grading/progress/${examId}`,
      { method: 'GET' },
      '获取阅卷进度'
    );
  }

  // ===================== 系统设置模块 =====================
  
  // 获取系统设置
  static async getSystemSettings(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/api/admin/system/settings`,
      { method: 'GET' },
      '获取系统设置'
    );
  }

  // 更新系统设置（简化版 v1.3.2）
  static async updateSystemSettings(settings: {}): Promise<ApiResponse<any>> {
    this.validateRequired(settings, '系统设置');

    return this.makeRequest<any>(
      `/api/admin/system/settings`,
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      },
      '更新系统设置'
    );
  }

  // 获取管理员列表
  static async getAdmins(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/admin/system/admins`,
      { method: 'GET' },
      '获取管理员列表'
    );
  }

  // 创建管理员
  static async createAdmin(adminData: {
    username: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(adminData.username, '用户名');
    this.validateRequired(adminData.password, '密码');

    // 密码哈希处理
    const hashedPassword = PasswordHasher.hashPasswordWithSalt(adminData.password);

    return this.makeRequest<any>(
      `/api/admin/system/admins`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...adminData,
          password: hashedPassword,
        }),
      },
      '创建管理员'
    );
  }

  // 更新管理员信息
  static async updateAdmin(adminId: string, adminData: {
    name?: string;
    username?: string;
    avatar?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(adminId, '管理员ID');
    this.validateRequired(adminData, '管理员数据');

    return this.makeRequest<any>(
      `/api/admin/system/admins/${adminId}`,
      {
        method: 'PUT',
        body: JSON.stringify(adminData),
      },
      '更新管理员信息'
    );
  }

  // 重置管理员密码
  static async resetAdminPassword(adminId: string, newPassword: string): Promise<ApiResponse<any>> {
    this.validateRequired(adminId, '管理员ID');
    this.validateRequired(newPassword, '新密码');

    // 密码哈希处理
    const hashedPassword = PasswordHasher.hashPasswordWithSalt(newPassword);

    return this.makeRequest<any>(
      `/api/admin/system/admins/${adminId}/password`,
      {
        method: 'PUT',
        body: JSON.stringify({ password: hashedPassword }),
      },
      '重置管理员密码'
    );
  }

  // 删除管理员
  static async deleteAdmin(adminId: string): Promise<ApiResponse<any>> {
    this.validateRequired(adminId, '管理员ID');

    return this.makeRequest<any>(
      `/api/admin/system/admins/${adminId}`,
      { method: 'DELETE' },
      '删除管理员'
    );
  }

  // ===================== 文件上传模块 =====================
  
  // 上传头像（通过profile API处理，与其他角色统一）
  static async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    try {
      // 使用文件上传服务处理文件（验证和转base64）
      const FileUploadService = await import('../services/fileUploadService');
      const fileResult = await FileUploadService.default.uploadAvatar(file);
      
      if (!fileResult.success || !fileResult.data) {
        return fileResult;
      }
      
      // 使用profile API更新头像
      return this.updateProfile({
        avatar: fileResult.data.fileUrl
      });
    } catch (error) {
      console.error('处理头像上传失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '头像上传失败',
        data: null
      };
    }
  }

  // ===================== 个人资料模块 =====================
  
  // 获取个人资料
  static async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/api/admin/profile`,
      { method: 'GET' },
      '获取个人资料'
    );
  }

  // 获取当前管理员信息
  static async getCurrentAdmin(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/api/admin/profile`,
      { method: 'GET' },
      '获取当前管理员信息'
    );
  }

  // 更新个人资料
  static async updateProfile(profileData: {
    username?: string;
    avatar?: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(profileData, '个人资料');

    return this.makeRequest<any>(
      `/api/admin/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      },
      '更新个人资料'
    );
  }

  // 修改个人密码
  static async changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(passwordData.oldPassword, '当前密码');
    this.validateRequired(passwordData.newPassword, '新密码');

    if (passwordData.newPassword.length < 6) {
      throw new Error('新密码长度不能少于6位');
    }

    // 密码哈希处理
    const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(passwordData.oldPassword);
    const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(passwordData.newPassword);

    return this.makeRequest<any>(
      `/api/admin/password`,
      {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: hashedOldPassword,
          newPassword: hashedNewPassword,
        }),
      },
      '修改个人密码'
    );
  }

  // 修改管理员密码
  static async changeAdminPassword(adminId: string, passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(adminId, '管理员ID');
    this.validateRequired(passwordData.oldPassword, '旧密码');
    this.validateRequired(passwordData.newPassword, '新密码');

    // 密码哈希处理
    const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(passwordData.oldPassword);
    const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(passwordData.newPassword);

    return this.makeRequest<any>(
      `/api/admin/system/admins/${adminId}/password`,
      {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: hashedOldPassword,
          newPassword: hashedNewPassword,
        }),
      },
      '修改管理员密码'
    );
  }

  // ===================== 仪表盘模块 =====================
  
  // 获取仪表盘统计数据
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/api/admin/dashboard/stats`,
      { method: 'GET' },
      '获取仪表盘统计数据'
    );
  }

  // 添加教练-学生关系API方法到AdminAPI
  static async createCoachStudentRelation(data: {
    coachId: string;
    studentId: string;
  }): Promise<ApiResponse<any>> {
    this.validateRequired(data.coachId, '教练ID');
    this.validateRequired(data.studentId, '学生ID');

    return this.makeRequest<any>(
      `/api/admin/coach-students`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      '创建教练学生关系'
    );
  }

  // 删除教练-学生关系
  static async deleteCoachStudentRelation(relationId: string): Promise<ApiResponse<any>> {
    this.validateRequired(relationId, '关系ID');

    return this.makeRequest<any>(
      `/api/admin/coach-students/${relationId}`,
      { method: 'DELETE' },
      '删除教练学生关系'
    );
  }
}

export default AdminAPI;
