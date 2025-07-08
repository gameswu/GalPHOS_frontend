import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import AdminAPI from '../../../api/admin';
import { authService } from '../../../services/authService';
import { microserviceRouter } from '../../../services/microserviceRouter';
import type { 
  Province, 
  School,
  RegionFormData,
  RegionChangeRequest,
  Exam, 
  ExamFile, 
  ExamFormData,
  AdminGradingTask,
  GradingAssignment,
  GraderInfo,
  GradingProgress,
  AdminUser, 
  SystemSettings, 
  PasswordChangeData, 
  AdminCreateData 
} from '../../../types/common';

// 用户类型定义
export interface PendingUser {
  id: string;
  username: string;
  phone: string;
  province: string;
  school: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'coach' | 'student' | 'grader';
}

export interface ApprovedUser {
  id: string;
  username: string;
  phone: string;
  province: string;
  school: string;
  appliedAt: string;
  approvedAt: string;
  lastLoginAt?: string;
  status: 'approved' | 'active' | 'disabled';
  role: 'coach' | 'student' | 'grader';
}

// 初始化省份和学校数据 - 只保留基本结构
// 所有数据现在通过API获取，不再使用localStorage初始化

export const useAdminLogic = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [regions, setRegions] = useState<Province[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [graders, setGraders] = useState<GraderInfo[]>([]);
  const [gradingTasks, setGradingTasks] = useState<AdminGradingTask[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  
  // 计算待审核用户数量
  const pendingCount = pendingUsers.filter(user => user.status === 'pending').length;

  // 加载待审核用户
  const loadPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getPendingUsers();
      if (response.success && response.data) {
        setPendingUsers(response.data);
      } else {
        notification.showError(response.message || '获取待审核用户失败');
        setPendingUsers([]);
      }
    } catch (error) {
      console.error('加载待审核用户失败:', error);
      notification.showError('网络错误，无法获取待审核用户');
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载已审核用户
  const loadApprovedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getApprovedUsers();
      if (response.success && response.data) {
        setApprovedUsers(response.data.users || []);
      } else {
        notification.showError(response.message || '获取已审核用户失败');
        setApprovedUsers([]);
      }
    } catch (error) {
      console.error('加载已审核用户失败:', error);
      notification.showError('网络错误，无法获取已审核用户');
      setApprovedUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载赛区数据
  const loadRegions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getRegions();
      if (response.success && response.data) {
        setRegions(response.data);
      } else {
        notification.showError(response.message || '获取赛区数据失败');
        setRegions([]);
      }
    } catch (error) {
      console.error('加载赛区数据失败:', error);
      notification.showError('网络错误，无法获取赛区数据');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载考试数据
  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getExams();
      if (response.success && response.data) {
        // 直接使用API返回的数据，包括participants字段
        // 后端API应该返回正确的participants信息
        setExams(response.data);
      } else {
        notification.showError(response.message || '获取考试数据失败');
        setExams([]);
      }
    } catch (error) {
      console.error('加载考试数据失败:', error);
      notification.showError('网络错误，无法获取考试数据');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载阅卷者数据
  const loadGraders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getGraders();
      if (response.success && response.data) {
        setGraders(response.data);
      } else {
        notification.showError(response.message || '获取阅卷者数据失败');
        setGraders([]);
      }
    } catch (error) {
      console.error('加载阅卷者数据失败:', error);
      notification.showError('网络错误，无法获取阅卷者数据');
      setGraders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载阅卷任务数据
  const loadGradingTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getGradingTasks();
      if (response.success && response.data) {
        setGradingTasks(Array.isArray(response.data) ? response.data : (response.data as any).tasks || []);
      } else {
        notification.showError(response.message || '获取阅卷任务失败');
        setGradingTasks([]);
      }
    } catch (error) {
      console.error('加载阅卷任务失败:', error);
      notification.showError('网络错误，无法获取阅卷任务');
      setGradingTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载仪表盘统计数据
  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getDashboardStats();
      if (response.success && response.data) {
        return response.data;
      } else {
        console.warn('获取仪表盘数据失败:', response.message);
        return null;
      }
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 审核通过
  const handleApprove = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.approveUser(userId, 'approve');
      if (response.success) {
        notification.showSuccess('用户审核通过');
        // 重新加载数据
        await loadPendingUsers();
        await loadApprovedUsers();
      } else {
        notification.showError(response.message || '审核失败');
      }
    } catch (error) {
      console.error('审核用户失败:', error);
      notification.showError('网络错误，审核失败');
    } finally {
      setLoading(false);
    }
  }, [loadPendingUsers, loadApprovedUsers]);

  // 审核拒绝
  const handleReject = useCallback(async (userId: string, reason?: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.approveUser(userId, 'reject', reason);
      if (response.success) {
        notification.showSuccess('用户审核拒绝');
        // 重新加载数据
        await loadPendingUsers();
      } else {
        notification.showError(response.message || '操作失败');
      }
    } catch (error) {
      console.error('审核拒绝失败:', error);
      notification.showError('网络错误，操作失败');
    } finally {
      setLoading(false);
    }
  }, [loadPendingUsers]);

  // 禁用用户
  const handleDisableUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateUserStatus(userId, 'disabled');
      if (response.success) {
        notification.showSuccess('用户已禁用');
        // 重新加载数据
        await loadApprovedUsers();
      } else {
        notification.showError(response.message || '操作失败');
      }
    } catch (error) {
      console.error('禁用用户失败:', error);
      notification.showError('网络错误，操作失败');
    } finally {
      setLoading(false);
    }
  }, [loadApprovedUsers]);

  // 启用用户
  const handleEnableUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateUserStatus(userId, 'active');
      if (response.success) {
        notification.showSuccess('用户已启用');
        // 重新加载数据
        await loadApprovedUsers();
      } else {
        notification.showError(response.message || '操作失败');
      }
    } catch (error) {
      console.error('启用用户失败:', error);
      notification.showError('网络错误，操作失败');
    } finally {
      setLoading(false);
    }
  }, [loadApprovedUsers]);

  // 删除用户
  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteUser(userId);
      if (response.success) {
        notification.showSuccess('用户已删除');
        // 重新加载数据
        await loadApprovedUsers();
      } else {
        notification.showError(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      notification.showError('网络错误，删除失败');
    } finally {
      setLoading(false);
    }
  }, [loadApprovedUsers]);

  // 添加省份
  const addProvince = useCallback(async (provinceName: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.addProvince(provinceName);
      if (response.success) {
        notification.showSuccess('省份添加成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        notification.showError(response.message || '添加省份失败');
      }
    } catch (error) {
      console.error('添加省份失败:', error);
      notification.showError('网络错误，添加省份失败');
    } finally {
      setLoading(false);
    }
  }, [loadRegions]);

  // 添加学校
  const addSchool = useCallback(async (provinceId: string, schoolName: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.addSchool(provinceId, schoolName);
      if (response.success) {
        notification.showSuccess('学校添加成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        notification.showError(response.message || '添加学校失败');
      }
    } catch (error) {
      console.error('添加学校失败:', error);
      notification.showError('网络错误，添加学校失败');
    } finally {
      setLoading(false);
    }
  }, [loadRegions]);

  // 更新学校
  const updateSchool = useCallback(async (provinceId: string, schoolId: string, schoolName: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateSchool(schoolId, { name: schoolName });
      if (response.success) {
        notification.showSuccess('学校更新成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        notification.showError(response.message || '更新学校失败');
      }
    } catch (error) {
      console.error('更新学校失败:', error);
      notification.showError('网络错误，更新学校失败');
    } finally {
      setLoading(false);
    }
  }, [loadRegions]);

  // 删除学校
  const deleteSchool = useCallback(async (provinceId: string, schoolId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteSchool(schoolId);
      if (response.success) {
        notification.showSuccess('学校删除成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        notification.showError(response.message || '删除学校失败');
      }
    } catch (error) {
      console.error('删除学校失败:', error);
      notification.showError('网络错误，删除学校失败');
    } finally {
      setLoading(false);
    }
  }, [loadRegions]);

  // 删除省份
  const deleteProvince = useCallback(async (provinceId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteProvince(provinceId);
      if (response.success) {
        notification.showSuccess('省份删除成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        notification.showError(response.message || '删除省份失败');
      }
    } catch (error) {
      console.error('删除省份失败:', error);
      notification.showError('网络错误，删除省份失败');
    } finally {
      setLoading(false);
    }
  }, [loadRegions]);

  // 创建考试
  const createExam = useCallback(async (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      setLoading(true);
      const response = await AdminAPI.createExam({
        title: examData.title,
        description: examData.description,
        startTime: examData.startTime,
        endTime: examData.endTime,
        totalQuestions: examData.totalQuestions || 0, // 确保有数值
        duration: examData.duration || 120, // 默认120分钟
        totalScore: 100, // 默认总分
        questions: Array.from({length: examData.totalQuestions || 0}, (_, i) => ({ number: i+1, score: 0 })),
        status: 'draft' // 默认为草稿状态
      });
      if (response.success && response.data) {
        notification.showSuccess('考试创建成功');
        // 重新加载考试数据
        await loadExams();
        return response.data.id;
      } else {
        notification.showError(response.message || '创建考试失败');
        throw new Error(response.message || '创建考试失败');
      }
    } catch (error) {
      console.error('创建考试失败:', error);
      notification.showError('网络错误，创建考试失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadExams]);

  // 更新考试
  const updateExam = useCallback(async (examId: string, examData: Partial<Exam>) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateExam(examId, {
        title: examData.title,
        description: examData.description,
        startTime: examData.startTime,
        endTime: examData.endTime,
        totalQuestions: examData.totalQuestions,
        duration: examData.duration
      });
      if (response.success) {
        notification.showSuccess('考试更新成功');
        // 重新加载考试数据
        await loadExams();
      } else {
        notification.showError(response.message || '更新考试失败');
        throw new Error(response.message || '更新考试失败');
      }
    } catch (error) {
      console.error('更新考试失败:', error);
      notification.showError('网络错误，更新考试失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadExams]);

  // 发布考试
  const publishExam = useCallback(async (examId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.publishExam(examId);
      if (response.success) {
        notification.showSuccess('考试已发布');
        // 重新加载考试数据
        await loadExams();
      } else {
        notification.showError(response.message || '发布考试失败');
      }
    } catch (error) {
      console.error('发布考试失败:', error);
      notification.showError('网络错误，发布考试失败');
    } finally {
      setLoading(false);
    }
  }, [loadExams]);

  // 撤回考试
  const unpublishExam = useCallback(async (examId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.unpublishExam(examId);
      if (response.success) {
        notification.showSuccess('考试已撤回');
        // 重新加载考试数据
        await loadExams();
      } else {
        notification.showError(response.message || '撤回考试失败');
      }
    } catch (error) {
      console.error('撤回考试失败:', error);
      notification.showError('网络错误，撤回考试失败');
    } finally {
      setLoading(false);
    }
  }, [loadExams]);

  // 删除考试
  const deleteExam = useCallback(async (examId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteExam(examId);
      if (response.success) {
        notification.showSuccess('考试删除成功');
        // 重新加载考试数据
        await loadExams();
      } else {
        notification.showError(response.message || '删除考试失败');
      }
    } catch (error) {
      console.error('删除考试失败:', error);
      notification.showError('网络错误，删除考试失败');
    } finally {
      setLoading(false);
    }
  }, [loadExams]);

  // 文件上传
  const uploadFile = useCallback(async (file: File, type: 'question' | 'answer' | 'answerSheet', examId?: string): Promise<ExamFile> => {
    try {
      if (!examId) {
        throw new Error('考试ID不能为空');
      }

      // 使用AdminAPI的uploadExamFile方法，该方法会自动处理认证和微服务路由
      const response = await AdminAPI.uploadExamFile(examId, file, type);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || '文件上传失败');
      }
      
      const uploadedFile = response.data;
      const examFile: ExamFile = {
        id: uploadedFile.fileId,
        name: uploadedFile.fileName,
        url: uploadedFile.downloadUrl,
        size: uploadedFile.fileSize,
        uploadTime: uploadedFile.uploadedAt
      };
      
      return examFile;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }, []);

  // 删除文件
  const deleteFile = useCallback(async (fileId: string, examId?: string): Promise<void> => {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }

      // 使用AdminAPI的deleteExamFile方法，该方法会自动处理认证和微服务路由
      const response = await AdminAPI.deleteExamFile(fileId);
      
      if (!response.success) {
        throw new Error(response.message || '文件删除失败');
      }
    } catch (error) {
      console.error('文件删除失败:', error);
      throw error;
    }
  }, []);

  // 分配阅卷任务
  const assignGradingTask = useCallback(async (
    examId: string, 
    questionNumber: number, 
    graderIds: string[]
  ) => {
    try {
      setLoading(true);
      const response = await AdminAPI.assignGradingTask(examId, questionNumber, graderIds);
      if (response.success) {
        notification.showSuccess('阅卷任务分配成功');
        // 重新加载阅卷任务数据
        await loadGradingTasks();
      } else {
        notification.showError(response.message || '分配阅卷任务失败');
      }
    } catch (error) {
      console.error('分配阅卷任务失败:', error);
      notification.showError('网络错误，分配阅卷任务失败');
    } finally {
      setLoading(false);
    }
  }, [loadGradingTasks]);

  // 获取阅卷进度
  const getGradingProgress = useCallback(async (examId: string): Promise<GradingProgress | null> => {
    try {
      const response = await AdminAPI.getGradingProgress(examId);
      if (response.success && response.data) {
        return response.data;
      } else {
        notification.showError(response.message || '获取阅卷进度失败');
        return null;
      }
    } catch (error) {
      console.error('获取阅卷进度失败:', error);
      notification.showError('网络错误，获取阅卷进度失败');
      return null;
    }
  }, []);

  // 更新阅卷进度
  const updateGradingProgress = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      // 这里需要根据实际API调整
      notification.showSuccess('阅卷进度更新成功');
      // 重新加载阅卷任务数据
      await loadGradingTasks();
    } catch (error) {
      console.error('更新阅卷进度失败:', error);
      notification.showError('网络错误，更新阅卷进度失败');
    } finally {
      setLoading(false);
    }
  }, [loadGradingTasks]);

  // 菜单点击处理
  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    setSelectedKey(key);
  }, []);

  // 退出登录
  const handleLogout = useCallback(() => {
    authService.clearAuthData();
    notification.showSuccess('退出登录成功');
    navigate('/admin-login');
  }, [navigate]);

  // 加载管理员数据
  const loadAdminUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAdmins();
      if (response.success && response.data) {
        // 处理可能的数据结构差异
        // 使用类型断言来处理数据
        const responseData = response.data as any;
        
        if (responseData.data && Array.isArray(responseData.data)) {
          // 响应格式: { data: { data: [...adminUsers] } }
          setAdminUsers(responseData.data);
        } else if (Array.isArray(responseData)) {
          // 响应格式: { data: [...adminUsers] }
          setAdminUsers(responseData);
        } else {
          console.error('无法解析管理员数据格式:', responseData);
          notification.showError('数据格式错误，无法加载管理员数据');
          setAdminUsers([]);
        }
      } else {
        notification.showError(response.message || '获取管理员数据失败');
        setAdminUsers([]);
      }
    } catch (error) {
      console.error('加载管理员数据失败:', error);
      notification.showError('网络错误，无法获取管理员数据');
      setAdminUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载系统设置
  const loadSystemSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getSystemSettings();
      if (response.success && response.data) {
        setSystemSettings(response.data);
      } else {
        notification.showError(response.message || '获取系统设置失败');
        setSystemSettings(null);
      }
    } catch (error) {
      console.error('加载系统设置失败:', error);
      notification.showError('网络错误，无法获取系统设置');
      setSystemSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载当前管理员信息
  const loadCurrentAdmin = useCallback(async () => {
    try {
      const response = await AdminAPI.getCurrentAdmin();
      if (response.success && response.data) {
        // 处理可能的数据结构差异，根据后端响应调整
        // 使用类型断言处理数据
        const responseData = response.data as any;
        
        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          // 响应格式: { data: { data: [...adminUsers] } }
          setCurrentAdmin(responseData.data[0]);
        } else {
          // 响应格式: { data: adminUser }
          setCurrentAdmin(responseData);
        }
      } else {
        // 静默失败，不显示错误消息
        setCurrentAdmin(null);
      }
    } catch (error) {
      console.error('获取当前管理员信息失败:', error);
      setCurrentAdmin(null);
    }
  }, []);

  // 修改管理员密码
  const changeAdminPassword = useCallback(async (adminId: string, passwordData: PasswordChangeData) => {
    try {
      setLoading(true);
      
      const response = await AdminAPI.changeAdminPassword(adminId, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        notification.showSuccess('密码修改成功');
      } else {
        notification.showError(response.message || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      notification.showError('网络错误，密码修改失败');
    } finally {
      setLoading(false);
    }
  }, [currentAdmin]);

  // 更新管理员信息
  const updateAdminInfo = useCallback(async (adminId: string, updateData: Partial<AdminUser>) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateAdmin(adminId, {
        username: updateData.username,
        avatar: updateData.avatar,
        role: updateData.role,
        status: updateData.status
      });
      
      if (response.success) {
        notification.showSuccess('管理员信息更新成功');
        // 重新加载管理员数据
        await loadAdminUsers();
        // 如果更新的是当前管理员，重新加载当前管理员信息
        if (adminId === currentAdmin?.id) {
          await loadCurrentAdmin();
        }
      } else {
        notification.showError(response.message || '更新管理员信息失败');
      }
    } catch (error) {
      console.error('更新管理员信息失败:', error);
      notification.showError('网络错误，更新管理员信息失败');
    } finally {
      setLoading(false);
    }
  }, [currentAdmin, loadAdminUsers, loadCurrentAdmin]);

  // 创建管理员
  const createAdmin = useCallback(async (adminData: AdminCreateData) => {
    try {
      setLoading(true);
      const response = await AdminAPI.createAdmin({
        username: adminData.username,
        password: adminData.password,
        role: adminData.role
      });
      
      if (response.success) {
        notification.showSuccess('管理员创建成功');
        // 重新加载管理员数据
        await loadAdminUsers();
      } else {
        notification.showError(response.message || '创建管理员失败');
      }
    } catch (error) {
      console.error('创建管理员失败:', error);
      notification.showError('网络错误，创建管理员失败');
    } finally {
      setLoading(false);
    }
  }, [loadAdminUsers]);

  // 删除管理员
  const deleteAdmin = useCallback(async (adminId: string) => {
    try {
      setLoading(true);
      if (adminId === currentAdmin?.id) {
        notification.showError('不能删除自己的账户');
        return;
      }
      
      const response = await AdminAPI.deleteAdmin(adminId);
      if (response.success) {
        notification.showSuccess('管理员删除成功');
        // 重新加载管理员数据
        await loadAdminUsers();
      } else {
        notification.showError(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除管理员失败:', error);
      notification.showError('网络错误，删除失败');
    } finally {
      setLoading(false);
    }
  }, [currentAdmin, loadAdminUsers]);

  // 更新系统设置（简化版 v1.3.2）
  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    try {
      setLoading(true);
      // 系统设置已简化
      const apiSettings = {};
      
      const response = await AdminAPI.updateSystemSettings(apiSettings);
      
      if (response.success) {
        notification.showSuccess('系统设置更新成功');
        // 重新加载系统设置
        await loadSystemSettings();
        
        // 实时更新全局系统配置
        const { systemConfig } = await import('../../../utils/systemConfig');
        systemConfig.updateConfig(settings);
        
        notification.showSuccess('系统设置已生效');
      } else {
        notification.showError(response.message || '更新系统设置失败');
      }
    } catch (error) {
      console.error('更新系统设置失败:', error);
      notification.showError('网络错误，更新系统设置失败');
    } finally {
      setLoading(false);
    }
  }, [loadSystemSettings]);

  // 上传头像文件（直接通过profile API处理）
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      setLoading(true);
      const response = await AdminAPI.uploadAvatar(file);
      
      if (response.success) {
        // 更新已成功，通过profile获取新头像URL
        const profileResponse = await AdminAPI.getProfile();
        if (profileResponse.success && profileResponse.data && profileResponse.data.avatar) {
          return profileResponse.data.avatar;
        }
        
        // 如果无法获取到更新后的头像URL，尝试使用响应中的信息
        if (response.data && response.data.avatar) {
          return response.data.avatar;
        }
        
        throw new Error('无法获取更新后的头像地址');
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      console.error(error instanceof Error ? error.message : '未知错误');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // 修改个人密码（统一接口）
  const changePassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    try {
      setLoading(true);
      const response = await AdminAPI.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      
      if (response.success) {
        notification.showSuccess('密码修改成功');
      } else {
        notification.showError(response.message || '密码修改失败');
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('修改个人密码失败:', error);
      notification.showError('密码修改失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 设置题目分值（只支持每题单独填写分值）
  const setQuestionScores = useCallback(async (
    examId: string, 
    questions: { number: number; score: number }[]
  ) => {
    try {
      setLoading(true);
      
      // 使用AdminAPI的setQuestionScores方法，该方法会自动处理认证和微服务路由
      const response = await AdminAPI.setQuestionScores(examId, questions);
      
      if (response.success) {
        const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
        notification.showSuccess(`成功设置${questions.length}道题目分值，总分${totalScore}分`);
        return response.data;
      } else {
        notification.showError(response.message || '分值设置失败');
        throw new Error(response.message || '分值设置失败');
      }
    } catch (error) {
      console.error('设置题目分值失败:', error);
      notification.showError('网络错误，设置题目分值失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取题目分值配置
  const getQuestionScores = useCallback(async (examId: string) => {
    try {
      const response = await AdminAPI.getQuestionScores(examId);
      if (response.success && response.data) {
        return response.data;
      } else {
        notification.showError(response.message || '获取题目分值失败');
        return null;
      }
    } catch (error) {
      console.error('获取题目分值失败:', error);
      notification.showError('网络错误，获取题目分值失败');
      return null;
    }
  }, []);

  // 更新单个题目分值
  const updateSingleQuestionScore = useCallback(async (
    examId: string,
    questionNumber: number,
    score: number
  ) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateQuestionScore(examId, questionNumber, score);
      if (response.success) {
        notification.showSuccess(`第${questionNumber}题分值已更新为${score}分`);
        return response.data;
      } else {
        notification.showError(response.message || '更新题目分值失败');
        throw new Error(response.message || '更新题目分值失败');
      }
    } catch (error) {
      console.error('更新题目分值失败:', error);
      notification.showError('网络错误，更新题目分值失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);


  // 预留考试ID
  const reserveExamId = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.reserveExamId();
      if (response.success && response.data) {
        notification.showSuccess('考试ID预留成功');
        return response.data.examId;
      } else {
        notification.showError(response.message || '预留考试ID失败');
        throw new Error(response.message || '预留考试ID失败');
      }
    } catch (error) {
      console.error('预留考试ID失败:', error);
      notification.showError('网络错误，预留考试ID失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除预留的考试ID
  const deleteReservedExamId = useCallback(async (examId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteReservedExamId(examId);
      if (response.success) {
        notification.showSuccess('预留考试ID已删除');
      } else {
        notification.showError(response.message || '删除预留考试ID失败');
        throw new Error(response.message || '删除预留考试ID失败');
      }
    } catch (error) {
      console.error('删除预留考试ID失败:', error);
      notification.showError('网络错误，删除预留考试ID失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新个人资料
  const updateProfile = useCallback(async (data: { username: string; avatar?: string }) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateProfile({
        username: data.username,
        avatar: data.avatar
      });
      
      if (response.success) {
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
        
        notification.showSuccess('个人资料更新成功');
        // 重新加载当前管理员信息
        await loadCurrentAdmin();
      } else {
        notification.showError(response.message || '更新个人资料失败');
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      notification.showError('网络错误，更新个人资料失败');
    } finally {
      setLoading(false);
    }
  }, [loadCurrentAdmin]);

  // 初始化数据 - 修复：将useEffect移到所有函数定义之后，并添加正确的依赖
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        notification.showError('请先登录');
        navigate('/admin-login');
        return;
      }
      
      const user = authService.getCurrentUser();
      if (!user || !authService.isAdmin()) {
        notification.showError('权限不足');
        navigate('/login');
        return;
      }
      
      // 加载所有数据
      loadPendingUsers();
      loadApprovedUsers();
      loadRegions();
      loadExams();
      loadGraders();
      loadGradingTasks();
      loadAdminUsers();
      loadSystemSettings();
      loadCurrentAdmin();
      loadDashboardStats();
    };
    
    checkAuth();
  }, [
    navigate,
    loadPendingUsers,
    loadApprovedUsers,
    loadRegions,
    loadExams,
    loadGraders,
    loadGradingTasks,
    loadAdminUsers,
    loadSystemSettings,
    loadCurrentAdmin,
    loadDashboardStats
  ]);

  return {
    // 状态
    pendingUsers,
    approvedUsers,
    regions,
    exams,
    graders,
    gradingTasks,
    adminUsers,
    systemSettings,
    currentAdmin,
    loading,
    selectedKey,
    collapsed,
    isOffline,
    pendingCount,
    // 方法
    handleApprove,
    handleReject,
    handleDisableUser,
    handleEnableUser,
    handleDeleteUser,
    handleLogout,
    handleMenuClick,
    setCollapsed,
    addProvince,
    addSchool,
    updateSchool,
    deleteSchool,
    deleteProvince,
    loadRegions,
    // 考试管理方法
    createExam,
    updateExam,
    publishExam,
    unpublishExam,
    deleteExam,
    uploadFile,
    // 文件管理方法
    deleteFile,
    // 题目分值管理方法
    setQuestionScores,
    getQuestionScores,
    updateSingleQuestionScore,
    // 考试ID管理方法
    reserveExamId,
    deleteReservedExamId,
    // 阅卷管理方法
    assignGradingTask,
    getGradingProgress,
    updateGradingProgress,
    loadGraders,
    loadGradingTasks,
    // 系统设置方法
    changePassword,
    changeAdminPassword,
    updateAdminInfo,
    createAdmin,
    deleteAdmin,
    updateProfile,
    updateSystemSettings,
    loadAdminUsers,
    loadSystemSettings,
    uploadAvatar,
    // 仪表盘和数据加载方法
    loadDashboardStats
  };
};