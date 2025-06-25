// 管理员相关API接口
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

class AdminAPI {
  // ===================== 用户管理模块 =====================
  
  // 获取待审核用户列表
  static async getPendingUsers(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取待审核用户失败:', error);
      throw error;
    }
  }

  // 审核用户申请
  static async approveUser(userId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, action, reason }),
      });
      return await response.json();
    } catch (error) {
      console.error('审核用户失败:', error);
      throw error;
    }
  }

  // 获取已审核用户列表
  static async getApprovedUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
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
      
      const response = await fetch(`${API_BASE_URL}/admin/users/approved?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取已审核用户失败:', error);
      throw error;
    }
  }

  // 启用/禁用用户
  static async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, status }),
      });
      return await response.json();
    } catch (error) {
      console.error('更新用户状态失败:', error);
      throw error;
    }
  }

  // 删除用户
  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  }

  // ===================== 赛区管理模块 =====================

  // 获取赛区列表
  static async getRegions(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取赛区列表失败:', error);
      throw error;
    }
  }

  // 添加省份
  static async addProvince(name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/provinces`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      return await response.json();
    } catch (error) {
      console.error('添加省份失败:', error);
      throw error;
    }
  }

  // 添加学校
  static async addSchool(provinceId: string, name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/schools`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ provinceId, name }),
      });
      return await response.json();
    } catch (error) {
      console.error('添加学校失败:', error);
      throw error;
    }
  }

  // 更新学校
  static async updateSchool(schoolId: string, name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/schools/${schoolId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      return await response.json();
    } catch (error) {
      console.error('更新学校失败:', error);
      throw error;
    }
  }

  // 删除学校
  static async deleteSchool(schoolId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/schools/${schoolId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('删除学校失败:', error);
      throw error;
    }
  }

  // 删除省份
  static async deleteProvince(provinceId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/provinces/${provinceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('删除省份失败:', error);
      throw error;
    }
  }

  // 获取赛区变更申请
  static async getRegionChangeRequests(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/change-requests`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取赛区变更申请失败:', error);
      throw error;
    }
  }

  // 处理赛区变更申请
  static async handleRegionChangeRequest(requestId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regions/change-requests/${requestId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, reason }),
      });
      return await response.json();
    } catch (error) {
      console.error('处理赛区变更申请失败:', error);
      throw error;
    }
  }

  // ===================== 考试管理模块 =====================

  // 获取考试列表
  static async getExams(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取考试列表失败:', error);
      throw error;
    }
  }

  // 创建考试
  static async createExam(examData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    totalQuestions?: number;
    duration?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(examData),
      });
      return await response.json();
    } catch (error) {
      console.error('创建考试失败:', error);
      throw error;
    }
  }

  // 更新考试
  static async updateExam(examId: string, examData: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    totalQuestions?: number;
    duration?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(examData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新考试失败:', error);
      throw error;
    }
  }

  // 发布考试
  static async publishExam(examId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('发布考试失败:', error);
      throw error;
    }
  }

  // 取消发布考试
  static async unpublishExam(examId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}/unpublish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('取消发布考试失败:', error);
      throw error;
    }
  }

  // 删除考试
  static async deleteExam(examId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('删除考试失败:', error);
      throw error;
    }
  }

  // 上传考试文件
  static async uploadExamFile(examId: string, file: File, type: 'question' | 'answer' | 'answerSheet'): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('上传考试文件失败:', error);
      throw error;
    }
  }

  // ===================== 阅卷管理模块 =====================

  // 获取阅卷者列表
  static async getGraders(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/graders`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷者列表失败:', error);
      throw error;
    }
  }

  // 获取阅卷任务列表
  static async getGradingTasks(params?: {
    examId?: string;
    status?: string;
    graderId?: string;
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

      const response = await fetch(`${API_BASE_URL}/admin/grading/tasks?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷任务失败:', error);
      throw error;
    }
  }

  // 分配阅卷任务
  static async assignGradingTask(examId: string, questionNumber: number, graderIds: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/grading/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ examId, questionNumber, graderIds }),
      });
      return await response.json();
    } catch (error) {
      console.error('分配阅卷任务失败:', error);
      throw error;
    }
  }

  // 获取阅卷进度
  static async getGradingProgress(examId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/grading/progress/${examId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取阅卷进度失败:', error);
      throw error;
    }
  }

  // ===================== 系统管理模块 =====================

  // 获取系统设置
  static async getSystemSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system/settings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取系统设置失败:', error);
      throw error;
    }
  }

  // 更新系统设置
  static async updateSystemSettings(settings: {
    systemName?: string;
    systemLogo?: string;
    allowRegistration?: boolean;
    examDuration?: number;
    gradingDeadline?: number;
    maintenanceMode?: boolean;
    announcement?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      return await response.json();
    } catch (error) {
      console.error('更新系统设置失败:', error);
      throw error;
    }
  }

  // 获取管理员列表
  static async getAdmins(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system/admins`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      throw error;
    }
  }

  // 创建管理员
  static async createAdmin(adminData: {
    username: string;
    password: string;
    role: 'super_admin' | 'admin';
  }): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedPassword = PasswordHasher.hashPasswordWithSalt(adminData.password);

      const response = await fetch(`${API_BASE_URL}/admin/system/admins`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...adminData,
          password: hashedPassword
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('创建管理员失败:', error);
      throw error;
    }
  }

  // 更新管理员信息
  static async updateAdmin(adminId: string, updateData: {
    username?: string;
    avatar?: string;
    role?: 'super_admin' | 'admin';
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system/admins/${adminId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新管理员信息失败:', error);
      throw error;
    }
  }

  // 修改管理员密码
  static async changeAdminPassword(adminId: string, passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    try {
      // 对密码进行哈希处理
      const hashedOldPassword = PasswordHasher.hashPasswordWithSalt(passwordData.oldPassword);
      const hashedNewPassword = PasswordHasher.hashPasswordWithSalt(passwordData.newPassword);

      const response = await fetch(`${API_BASE_URL}/admin/system/admins/${adminId}/password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: hashedOldPassword,
          newPassword: hashedNewPassword
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('修改管理员密码失败:', error);
      throw error;
    }
  }

  // 删除管理员
  static async deleteAdmin(adminId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system/admins/${adminId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('删除管理员失败:', error);
      throw error;
    }
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/system/upload/avatar`, {
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

  // 获取当前管理员信息
  static async getCurrentAdmin(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取当前管理员信息失败:', error);
      throw error;
    }
  }

  // ===================== 仪表盘统计模块 =====================

  // 获取仪表盘数据
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      throw error;
    }
  }
}

export default AdminAPI;
