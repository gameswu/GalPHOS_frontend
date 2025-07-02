import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import AdminAPI from '../../../api/admin';
import { authService } from '../../../services/authService';
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
  
  // 教练管理学生统计状态
  const [coachStudentsStats, setCoachStudentsStats] = useState<{
    totalCoachStudents: number;
    coachStudentsByCoach: { [coachId: string]: number };
  }>({
    totalCoachStudents: 0,
    coachStudentsByCoach: {}
  });

  // 计算待审核用户数量
  const pendingCount = pendingUsers.filter(user => user.status === 'pending').length;

  // 初始化数据
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
      loadCoachStudentsStats();
      loadDashboardStats();
    };
    
    checkAuth();
  }, [navigate]);

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
  const uploadFile = useCallback(async (file: File, type: 'question' | 'answer' | 'answerSheet'): Promise<ExamFile> => {
    try {
      // 使用文件上传服务的通用文件上传方法
      const FileUploadService = await import('../../../services/fileUploadService');
      const result = await FileUploadService.default.uploadFile(file, {
        category: 'exam-file',
        relatedId: '', // examId暂时为空，实际使用时需要传入
        allowedTypes: [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'
        ],
        maxSize: 50 * 1024 * 1024 // 50MB
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.message || '文件上传失败');
      }
      
      const uploadedFile = result.data;
      const examFile: ExamFile = {
        id: uploadedFile.fileId,
        name: uploadedFile.fileName,
        url: uploadedFile.fileUrl,
        size: uploadedFile.fileSize,
        uploadTime: uploadedFile.uploadTime
      };
      
      return examFile;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }, []);

  // 删除文件
  const deleteFile = useCallback(async (fileId: string): Promise<void> => {
    try {
      const FileUploadService = await import('../../../services/fileUploadService');
      const result = await FileUploadService.default.deleteFile(fileId);
      
      if (!result.success) {
        throw new Error(result.message || '文件删除失败');
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
        role: updateData.role
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

  // 上传头像文件
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      const response = await AdminAPI.uploadAvatar(file);
      if (response.success && response.data) {
        return response.data.url;
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  }, []);

  // 加载教练管理学生统计
  const loadCoachStudentsStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getCoachStudentsStats();
      if (response.success && response.data) {
        setCoachStudentsStats(response.data);
      } else {
        notification.showError(response.message || '获取教练学生统计失败');
        // 如果API失败，回退到localStorage方式
        const fallbackStats = getCoachStudentsStatsFromLocalStorage();
        setCoachStudentsStats(fallbackStats);
      }
    } catch (error) {
      console.error('加载教练学生统计失败:', error);
      // 如果API失败，回退到localStorage方式
      const fallbackStats = getCoachStudentsStatsFromLocalStorage();
      setCoachStudentsStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  }, []);

  // 从localStorage获取教练学生统计（回退方案）
  const getCoachStudentsStatsFromLocalStorage = useCallback(() => {
    try {
      const allCoachStudents = JSON.parse(localStorage.getItem('coachStudents') || '{}');
      const totalCoachStudents = Object.values(allCoachStudents).reduce((total: number, students: any) => 
        total + (Array.isArray(students) ? students.length : 0), 0
      );
      
      const coachStudentsByCoach: { [coachId: string]: number } = {};
      Object.entries(allCoachStudents).forEach(([coachId, students]: [string, any]) => {
        coachStudentsByCoach[coachId] = Array.isArray(students) ? students.length : 0;
      });
      
      return {
        totalCoachStudents,
        coachStudentsByCoach
      };
    } catch {
      return {
        totalCoachStudents: 0,
        coachStudentsByCoach: {}
      };
    }
  }, []);

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
      
      const requestData = {
        questions
      };

      const apiResponse = await fetch(`/api/admin/exams/${examId}/question-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await apiResponse.json();
      
      if (result.success) {
        const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
        notification.showSuccess(`成功设置${questions.length}道题目分值，总分${totalScore}分`);
        return result.data;
      } else {
        notification.showError(result.message || '分值设置失败');
        throw new Error(result.message || '分值设置失败');
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
    coachStudentsStats,
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
    updateSystemSettings,
    loadAdminUsers,
    loadSystemSettings,
    uploadAvatar,
    // 仪表盘和数据加载方法
    loadDashboardStats,
    loadCoachStudentsStats
  };
};