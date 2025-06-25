import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import AdminAPI from '../../../api/admin';
import type { Province, School } from '../types/regionTypes';
import type { Exam, ExamFile } from '../types/examTypes';
import type { GradingTask, GradingAssignment, GraderInfo, GradingProgress } from '../types/gradingTypes';
import type { AdminUser, SystemSettings, PasswordChangeData, AdminCreateData } from '../types/systemTypes';

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
const initializeRegionData = (): Province[] => {
  const savedRegions = localStorage.getItem('regionData');
  if (!savedRegions) {
    const defaultRegions: Province[] = [];
    localStorage.setItem('regionData', JSON.stringify(defaultRegions));
    return defaultRegions;
  }
  return JSON.parse(savedRegions);
};

// 初始化考试数据 - 空数组
const initializeExamData = (): Exam[] => {
  const savedExams = localStorage.getItem('examData');
  if (!savedExams) {
    const defaultExams: Exam[] = [];
    localStorage.setItem('examData', JSON.stringify(defaultExams));
    return defaultExams;
  }
  return JSON.parse(savedExams);
};

// 初始化阅卷者数据 - 空数组
const initializeGraderData = (): GraderInfo[] => {
  const savedGraders = localStorage.getItem('graderData');
  if (!savedGraders) {
    const defaultGraders: GraderInfo[] = [];
    localStorage.setItem('graderData', JSON.stringify(defaultGraders));
    return defaultGraders;
  }
  return JSON.parse(savedGraders);
};

// 初始化阅卷任务数据 - 空数组
const initializeGradingTasks = (): GradingTask[] => {
  const savedTasks = localStorage.getItem('gradingTasks');
  if (!savedTasks) {
    const defaultTasks: GradingTask[] = [];
    localStorage.setItem('gradingTasks', JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  return JSON.parse(savedTasks);
};

// 初始化管理员数据 - 只保留默认管理员
const initializeAdminUsers = (): AdminUser[] => {
  const defaultAdmins: AdminUser[] = [
    {
      id: 'admin001',
      username: 'admin',
      password: 'admin123',
      avatar: '',
      role: 'super_admin',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      createdBy: 'system'
    }
  ];

  const savedAdmins = localStorage.getItem('adminUsers');
  if (!savedAdmins) {
    localStorage.setItem('adminUsers', JSON.stringify(defaultAdmins));
    return defaultAdmins;
  }
  return JSON.parse(savedAdmins);
};

// 初始化系统设置
const initializeSystemSettings = (): SystemSettings => {
  const defaultSettings: SystemSettings = {
    siteName: 'GalPHOS 物理竞赛系统',
    siteDescription: '全国物理竞赛在线考试与阅卷系统',
    maxUploadSize: 50,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
    systemMaintenance: false,
    maintenanceMessage: '系统正在维护中，预计在30分钟后恢复正常。'
  };

  const savedSettings = localStorage.getItem('systemSettings');
  if (!savedSettings) {
    localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  return JSON.parse(savedSettings);
};

// 初始化用户数据 - 空数组
const initializePendingUsers = (): PendingUser[] => {
  const savedUsers = localStorage.getItem('pendingUsers');
  if (!savedUsers) {
    const defaultUsers: PendingUser[] = [];
    localStorage.setItem('pendingUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(savedUsers);
};

const initializeApprovedUsers = (): ApprovedUser[] => {
  const savedUsers = localStorage.getItem('approvedUsers');
  if (!savedUsers) {
    const defaultUsers: ApprovedUser[] = [];
    localStorage.setItem('approvedUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(savedUsers);
};

export const useAdminLogic = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [regions, setRegions] = useState<Province[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [graders, setGraders] = useState<GraderInfo[]>([]);
  const [gradingTasks, setGradingTasks] = useState<GradingTask[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // 计算待审核用户数量
  const pendingCount = pendingUsers.filter(user => user.status === 'pending').length;

  // 初始化数据
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userInfo = localStorage.getItem('userInfo');
    
    if (!isLoggedIn || !userInfo) {
      message.error('请先登录');
      navigate('/admin-login');
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (user.type !== 'admin') {
      message.error('权限不足');
      navigate('/login');
      return;
    }
    
    loadPendingUsers();
    loadApprovedUsers();
    loadRegions();
    loadExams();
    loadGraders();
    loadGradingTasks();
    loadAdminUsers();
    loadSystemSettings();
    loadCurrentAdmin();
  }, [navigate]);

  // 加载待审核用户
  const loadPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getPendingUsers();
      if (response.success && response.data) {
        setPendingUsers(response.data);
      } else {
        message.error(response.message || '获取待审核用户失败');
        setPendingUsers([]);
      }
    } catch (error) {
      console.error('加载待审核用户失败:', error);
      message.error('网络错误，无法获取待审核用户');
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
        message.error(response.message || '获取已审核用户失败');
        setApprovedUsers([]);
      }
    } catch (error) {
      console.error('加载已审核用户失败:', error);
      message.error('网络错误，无法获取已审核用户');
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
        message.error(response.message || '获取赛区数据失败');
        setRegions([]);
      }
    } catch (error) {
      console.error('加载赛区数据失败:', error);
      message.error('网络错误，无法获取赛区数据');
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
        message.error(response.message || '获取考试数据失败');
        setExams([]);
      }
    } catch (error) {
      console.error('加载考试数据失败:', error);
      message.error('网络错误，无法获取考试数据');
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
        message.error(response.message || '获取阅卷者数据失败');
        setGraders([]);
      }
    } catch (error) {
      console.error('加载阅卷者数据失败:', error);
      message.error('网络错误，无法获取阅卷者数据');
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
        message.error(response.message || '获取阅卷任务失败');
        setGradingTasks([]);
      }
    } catch (error) {
      console.error('加载阅卷任务失败:', error);
      message.error('网络错误，无法获取阅卷任务');
      setGradingTasks([]);
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
        message.success('用户审核通过');
        // 重新加载数据
        await loadPendingUsers();
        await loadApprovedUsers();
      } else {
        message.error(response.message || '审核失败');
      }
    } catch (error) {
      console.error('审核用户失败:', error);
      message.error('网络错误，审核失败');
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
        message.success('用户审核拒绝');
        // 重新加载数据
        await loadPendingUsers();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('审核拒绝失败:', error);
      message.error('网络错误，操作失败');
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
        message.success('用户已禁用');
        // 重新加载数据
        await loadApprovedUsers();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('禁用用户失败:', error);
      message.error('网络错误，操作失败');
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
        message.success('用户已启用');
        // 重新加载数据
        await loadApprovedUsers();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('启用用户失败:', error);
      message.error('网络错误，操作失败');
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
        message.success('用户已删除');
        // 重新加载数据
        await loadApprovedUsers();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('网络错误，删除失败');
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
        message.success('省份添加成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        message.error(response.message || '添加省份失败');
      }
    } catch (error) {
      console.error('添加省份失败:', error);
      message.error('网络错误，添加省份失败');
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
        message.success('学校添加成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        message.error(response.message || '添加学校失败');
      }
    } catch (error) {
      console.error('添加学校失败:', error);
      message.error('网络错误，添加学校失败');
    } finally {
      setLoading(false);
    }
  }, [loadRegions]);

  // 更新学校
  const updateSchool = useCallback(async (provinceId: string, schoolId: string, schoolName: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateSchool(schoolId, schoolName);
      if (response.success) {
        message.success('学校更新成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        message.error(response.message || '更新学校失败');
      }
    } catch (error) {
      console.error('更新学校失败:', error);
      message.error('网络错误，更新学校失败');
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
        message.success('学校删除成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        message.error(response.message || '删除学校失败');
      }
    } catch (error) {
      console.error('删除学校失败:', error);
      message.error('网络错误，删除学校失败');
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
        message.success('省份删除成功');
        // 重新加载赛区数据
        await loadRegions();
      } else {
        message.error(response.message || '删除省份失败');
      }
    } catch (error) {
      console.error('删除省份失败:', error);
      message.error('网络错误，删除省份失败');
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
        totalQuestions: examData.totalQuestions,
        duration: examData.duration
      });
      if (response.success && response.data) {
        message.success('考试创建成功');
        // 重新加载考试数据
        await loadExams();
        return response.data.id;
      } else {
        message.error(response.message || '创建考试失败');
        throw new Error(response.message || '创建考试失败');
      }
    } catch (error) {
      console.error('创建考试失败:', error);
      message.error('网络错误，创建考试失败');
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
        message.success('考试更新成功');
        // 重新加载考试数据
        await loadExams();
      } else {
        message.error(response.message || '更新考试失败');
        throw new Error(response.message || '更新考试失败');
      }
    } catch (error) {
      console.error('更新考试失败:', error);
      message.error('网络错误，更新考试失败');
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
        message.success('考试已发布');
        // 重新加载考试数据
        await loadExams();
      } else {
        message.error(response.message || '发布考试失败');
      }
    } catch (error) {
      console.error('发布考试失败:', error);
      message.error('网络错误，发布考试失败');
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
        message.success('考试已撤回');
        // 重新加载考试数据
        await loadExams();
      } else {
        message.error(response.message || '撤回考试失败');
      }
    } catch (error) {
      console.error('撤回考试失败:', error);
      message.error('网络错误，撤回考试失败');
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
        message.success('考试删除成功');
        // 重新加载考试数据
        await loadExams();
      } else {
        message.error(response.message || '删除考试失败');
      }
    } catch (error) {
      console.error('删除考试失败:', error);
      message.error('网络错误，删除考试失败');
    } finally {
      setLoading(false);
    }
  }, [loadExams]);

  // 文件上传
  const uploadFile = useCallback(async (file: File, type: 'question' | 'answer' | 'answerSheet'): Promise<ExamFile> => {
    try {
      // 对于考试文件上传，我们需要examId，这里暂时模拟返回
      // 实际使用时应该传入examId参数
      const examFile: ExamFile = {
        id: `${type}_${Date.now()}`,
        name: file.name,
        url: `/files/${file.name}`,
        size: file.size,
        uploadTime: new Date().toISOString()
      };
      return examFile;
    } catch (error) {
      console.error('文件上传失败:', error);
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
        message.success('阅卷任务分配成功');
        // 重新加载阅卷任务数据
        await loadGradingTasks();
      } else {
        message.error(response.message || '分配阅卷任务失败');
      }
    } catch (error) {
      console.error('分配阅卷任务失败:', error);
      message.error('网络错误，分配阅卷任务失败');
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
        message.error(response.message || '获取阅卷进度失败');
        return null;
      }
    } catch (error) {
      console.error('获取阅卷进度失败:', error);
      message.error('网络错误，获取阅卷进度失败');
      return null;
    }
  }, []);

  // 更新阅卷进度
  const updateGradingProgress = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      // 这里需要根据实际API调整
      message.success('阅卷进度更新成功');
      // 重新加载阅卷任务数据
      await loadGradingTasks();
    } catch (error) {
      console.error('更新阅卷进度失败:', error);
      message.error('网络错误，更新阅卷进度失败');
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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    message.success('退出登录成功');
    navigate('/admin-login');
  }, [navigate]);

  // 加载管理员数据
  const loadAdminUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAdmins();
      if (response.success && response.data) {
        setAdminUsers(response.data);
      } else {
        message.error(response.message || '获取管理员数据失败');
        setAdminUsers([]);
      }
    } catch (error) {
      console.error('加载管理员数据失败:', error);
      message.error('网络错误，无法获取管理员数据');
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
        message.error(response.message || '获取系统设置失败');
        setSystemSettings(null);
      }
    } catch (error) {
      console.error('加载系统设置失败:', error);
      message.error('网络错误，无法获取系统设置');
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
        setCurrentAdmin(response.data);
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
  const changeAdminPassword = useCallback(async (passwordData: PasswordChangeData) => {
    try {
      setLoading(true);
      if (!currentAdmin) {
        message.error('未找到当前管理员信息');
        return;
      }
      
      const response = await AdminAPI.changeAdminPassword(currentAdmin.id, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        message.success('密码修改成功');
      } else {
        message.error(response.message || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('网络错误，密码修改失败');
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
        message.success('管理员信息更新成功');
        // 重新加载管理员数据
        await loadAdminUsers();
        // 如果更新的是当前管理员，重新加载当前管理员信息
        if (adminId === currentAdmin?.id) {
          await loadCurrentAdmin();
        }
      } else {
        message.error(response.message || '更新管理员信息失败');
      }
    } catch (error) {
      console.error('更新管理员信息失败:', error);
      message.error('网络错误，更新管理员信息失败');
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
        message.success('管理员创建成功');
        // 重新加载管理员数据
        await loadAdminUsers();
      } else {
        message.error(response.message || '创建管理员失败');
      }
    } catch (error) {
      console.error('创建管理员失败:', error);
      message.error('网络错误，创建管理员失败');
    } finally {
      setLoading(false);
    }
  }, [loadAdminUsers]);

  // 删除管理员
  const deleteAdmin = useCallback(async (adminId: string) => {
    try {
      setLoading(true);
      if (adminId === currentAdmin?.id) {
        message.error('不能删除自己的账户');
        return;
      }
      
      const response = await AdminAPI.deleteAdmin(adminId);
      if (response.success) {
        message.success('管理员删除成功');
        // 重新加载管理员数据
        await loadAdminUsers();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除管理员失败:', error);
      message.error('网络错误，删除失败');
    } finally {
      setLoading(false);
    }
  }, [currentAdmin, loadAdminUsers]);

  // 更新系统设置
  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    try {
      setLoading(true);
      // 转换类型以匹配API接口
      const apiSettings = {
        systemName: settings.siteName,
        systemLogo: undefined, // 可以扩展
        allowRegistration: undefined, // 可以扩展
        examDuration: undefined, // 可以扩展
        gradingDeadline: undefined, // 可以扩展
        maintenanceMode: settings.systemMaintenance,
        announcement: settings.maintenanceMessage
      };
      
      const response = await AdminAPI.updateSystemSettings(apiSettings);
      
      if (response.success) {
        message.success('系统设置更新成功');
        // 重新加载系统设置
        await loadSystemSettings();
      } else {
        message.error(response.message || '更新系统设置失败');
      }
    } catch (error) {
      console.error('更新系统设置失败:', error);
      message.error('网络错误，更新系统设置失败');
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
    loadExams,
    // 阅卷管理方法
    assignGradingTask,
    getGradingProgress,
    updateGradingProgress,
    loadGraders,
    loadGradingTasks,
    // 系统设置方法
    changeAdminPassword,
    updateAdminInfo,
    createAdmin,
    deleteAdmin,
    updateSystemSettings,
    loadAdminUsers,
    loadSystemSettings,
    uploadAvatar
  };
};