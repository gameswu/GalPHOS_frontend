import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  const loadPendingUsers = useCallback(() => {
    const users = initializePendingUsers();
    setPendingUsers(users);
  }, []);

  // 加载已审核用户
  const loadApprovedUsers = useCallback(() => {
    const users = initializeApprovedUsers();
    setApprovedUsers(users);
  }, []);

  // 加载赛区数据
  const loadRegions = useCallback(() => {
    const regionData = initializeRegionData();
    setRegions(regionData);
  }, []);

  // 加载考试数据
  const loadExams = useCallback(() => {
    const examData = initializeExamData();
    setExams(examData);
  }, []);

  // 加载阅卷者数据
  const loadGraders = useCallback(() => {
    const graderData = initializeGraderData();
    setGraders(graderData);
  }, []);

  // 加载阅卷任务数据
  const loadGradingTasks = useCallback(() => {
    const taskData = initializeGradingTasks();
    setGradingTasks(taskData);
  }, []);

  // 审核通过
  const handleApprove = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userIndex = pendingUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        message.error('用户不存在');
        return;
      }
      
      const user = pendingUsers[userIndex];
      const approvedUser: ApprovedUser = {
        ...user,
        status: 'approved',
        approvedAt: new Date().toISOString()
      };
      
      const updatedPendingUsers = [...pendingUsers];
      updatedPendingUsers.splice(userIndex, 1);
      
      const updatedApprovedUsers = [...approvedUsers, approvedUser];
      
      localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
      localStorage.setItem('approvedUsers', JSON.stringify(updatedApprovedUsers));
      
      setPendingUsers(updatedPendingUsers);
      setApprovedUsers(updatedApprovedUsers);
      message.success('用户审核通过');
    } catch (error) {
      message.error('审核失败');
    } finally {
      setLoading(false);
    }
  }, [pendingUsers, approvedUsers]);

  // 审核拒绝
  const handleReject = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPendingUsers = pendingUsers.map(u => 
        u.id === userId ? { ...u, status: 'rejected' as const } : u
      );
      
      localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
      setPendingUsers(updatedPendingUsers);
      message.success('用户审核拒绝');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  }, [pendingUsers]);

  // 禁用用户
  const handleDisableUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedApprovedUsers = approvedUsers.map(u => 
        u.id === userId ? { ...u, status: 'disabled' as const } : u
      );
      
      localStorage.setItem('approvedUsers', JSON.stringify(updatedApprovedUsers));
      setApprovedUsers(updatedApprovedUsers);
      message.success('用户已禁用');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  }, [approvedUsers]);

  // 启用用户
  const handleEnableUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedApprovedUsers = approvedUsers.map(u => 
        u.id === userId ? { ...u, status: 'approved' as const } : u
      );
      
      localStorage.setItem('approvedUsers', JSON.stringify(updatedApprovedUsers));
      setApprovedUsers(updatedApprovedUsers);
      message.success('用户已启用');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  }, [approvedUsers]);

  // 删除用户
  const handleDeleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedApprovedUsers = approvedUsers.filter(u => u.id !== userId);
      
      localStorage.setItem('approvedUsers', JSON.stringify(updatedApprovedUsers));
      setApprovedUsers(updatedApprovedUsers);
      message.success('用户已删除');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  }, [approvedUsers]);

  // 添加省份
  const addProvince = useCallback(async (provinceName: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProvince: Province = {
        id: Date.now().toString(),
        name: provinceName,
        schools: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedRegions = [...regions, newProvince];
      setRegions(updatedRegions);
      localStorage.setItem('regionData', JSON.stringify(updatedRegions));
      
      message.success('省份添加成功');
    } catch (error) {
      message.error('添加省份失败');
    } finally {
      setLoading(false);
    }
  }, [regions]);

  // 添加学校
  const addSchool = useCallback(async (provinceId: string, schoolName: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSchool: School = {
        id: `${provinceId}-${Date.now()}`,
        name: schoolName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedRegions = regions.map(region => {
        if (region.id === provinceId) {
          return {
            ...region,
            schools: [...region.schools, newSchool],
            updatedAt: new Date().toISOString()
          };
        }
        return region;
      });
      
      setRegions(updatedRegions);
      localStorage.setItem('regionData', JSON.stringify(updatedRegions));
      
      message.success('学校添加成功');
    } catch (error) {
      message.error('添加学校失败');
    } finally {
      setLoading(false);
    }
  }, [regions]);

  // 更新学校
  const updateSchool = useCallback(async (provinceId: string, schoolId: string, schoolName: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRegions = regions.map(region => {
        if (region.id === provinceId) {
          return {
            ...region,
            schools: region.schools.map(school => 
              school.id === schoolId 
                ? { ...school, name: schoolName, updatedAt: new Date().toISOString() }
                : school
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return region;
      });
      
      setRegions(updatedRegions);
      localStorage.setItem('regionData', JSON.stringify(updatedRegions));
      
      message.success('学校更新成功');
    } catch (error) {
      message.error('更新学校失败');
    } finally {
      setLoading(false);
    }
  }, [regions]);

  // 删除学校
  const deleteSchool = useCallback(async (provinceId: string, schoolId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRegions = regions.map(region => {
        if (region.id === provinceId) {
          return {
            ...region,
            schools: region.schools.filter(school => school.id !== schoolId),
            updatedAt: new Date().toISOString()
          };
        }
        return region;
      });
      
      setRegions(updatedRegions);
      localStorage.setItem('regionData', JSON.stringify(updatedRegions));
      
      message.success('学校删除成功');
    } catch (error) {
      message.error('删除学校失败');
    } finally {
      setLoading(false);
    }
  }, [regions]);

  // 删除省份
  const deleteProvince = useCallback(async (provinceId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRegions = regions.filter(region => region.id !== provinceId);
      setRegions(updatedRegions);
      localStorage.setItem('regionData', JSON.stringify(updatedRegions));
      
      message.success('省份删除成功');
    } catch (error) {
      message.error('删除省份失败');
    } finally {
      setLoading(false);
    }
  }, [regions]);

  // 创建考试
  const createExam = useCallback(async (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newExam: Exam = {
        ...examData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentAdmin?.username || 'admin',
        participants: []
      };
      
      const updatedExams = [...exams, newExam];
      setExams(updatedExams);
      localStorage.setItem('examData', JSON.stringify(updatedExams));
      
      message.success('考试创建成功');
      return newExam.id;
    } catch (error) {
      message.error('创建考试失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [exams, currentAdmin]);

  // 更新考试
  const updateExam = useCallback(async (examId: string, examData: Partial<Exam>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedExams = exams.map(exam => 
        exam.id === examId 
          ? { ...exam, ...examData, updatedAt: new Date().toISOString() }
          : exam
      );
      
      setExams(updatedExams);
      localStorage.setItem('examData', JSON.stringify(updatedExams));
      
      message.success('考试更新成功');
    } catch (error) {
      message.error('更新考试失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [exams]);

  // 发布考试
  const publishExam = useCallback(async (examId: string) => {
    await updateExam(examId, { status: 'published' });
    message.success('考试已发布');
  }, [updateExam]);

  // 撤回考试
  const unpublishExam = useCallback(async (examId: string) => {
    await updateExam(examId, { status: 'draft' });
    message.success('考试已撤回');
  }, [updateExam]);

  // 删除考试
  const deleteExam = useCallback(async (examId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedExams = exams.filter(exam => exam.id !== examId);
      setExams(updatedExams);
      localStorage.setItem('examData', JSON.stringify(updatedExams));
      
      message.success('考试删除成功');
    } catch (error) {
      message.error('删除考试失败');
    } finally {
      setLoading(false);
    }
  }, [exams]);

  // 文件上传
  const uploadFile = useCallback(async (file: File, type: 'question' | 'answer' | 'answerSheet'): Promise<ExamFile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const examFile: ExamFile = {
          id: `${type}_${Date.now()}`,
          name: file.name,
          url: `/files/${file.name}`,
          size: file.size,
          uploadTime: new Date().toISOString()
        };
        resolve(examFile);
      }, 1000);
    });
  }, []);

  // 菜单点击处理
  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    setSelectedKey(key);
  }, []);

  // 退出登录
  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    message.success('退出登录成功');
    navigate('/admin-login');
  }, [navigate]);

  // 分配阅卷任务
  const assignGradingTask = useCallback(async (
    examId: string, 
    questionNumber: number, 
    graderIds: string[]
  ) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exam = exams.find(e => e.id === examId);
      if (!exam) {
        message.error('考试不存在');
        return;
      }

      const totalPapers = Math.floor(Math.random() * 100) + 50;
      const papersPerGrader = Math.ceil(totalPapers / graderIds.length);

      const newTasks: GradingTask[] = graderIds.map((graderId, index) => {
        const grader = graders.find(g => g.id === graderId);
        const assignedPapers = index === graderIds.length - 1 
          ? totalPapers - (papersPerGrader * index)
          : papersPerGrader;

        return {
          id: `task_${Date.now()}_${index}`,
          examId,
          examTitle: exam.title,
          questionNumber,
          graderId,
          graderName: grader?.username || '未知阅卷者',
          totalPapers: assignedPapers,
          gradedPapers: 0,
          avgScore: 0,
          avgTime: 0,
          status: 'pending',
          assignedAt: new Date().toISOString()
        };
      });

      const updatedTasks = [...gradingTasks, ...newTasks];
      setGradingTasks(updatedTasks);
      localStorage.setItem('gradingTasks', JSON.stringify(updatedTasks));

      const updatedGraders = graders.map(grader => {
        if (graderIds.includes(grader.id)) {
          return {
            ...grader,
            currentTasks: grader.currentTasks + 1,
            status: 'busy' as const
          };
        }
        return grader;
      });
      setGraders(updatedGraders);
      localStorage.setItem('graderData', JSON.stringify(updatedGraders));

      message.success(`已成功分配第${questionNumber}题给${graderIds.length}位阅卷者`);
    } catch (error) {
      message.error('分配阅卷任务失败');
    } finally {
      setLoading(false);
    }
  }, [exams, graders, gradingTasks]);

  // 获取阅卷进度
  const getGradingProgress = useCallback((examId: string): GradingProgress | null => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return null;

    const examTasks = gradingTasks.filter(task => task.examId === examId);
    const totalPapers = examTasks.reduce((sum, task) => sum + task.totalPapers, 0);
    const gradedPapers = examTasks.reduce((sum, task) => sum + task.gradedPapers, 0);
    
    const questionsWithTasks = Array.from(new Set(examTasks.map(task => task.questionNumber)));
    const completedQuestions = questionsWithTasks.filter(qNum => {
      const questionTasks = examTasks.filter(task => task.questionNumber === qNum);
      return questionTasks.every(task => task.status === 'completed');
    }).length;

    const graderProgress = examTasks.reduce((acc, task) => {
      const existing = acc.find(g => g.graderId === task.graderId);
      if (existing) {
        existing.questionNumbers.push(task.questionNumber);
        existing.progress = (existing.progress + (task.gradedPapers / task.totalPapers * 100)) / 2;
      } else {
        acc.push({
          graderId: task.graderId,
          graderName: task.graderName,
          questionNumbers: [task.questionNumber],
          progress: task.gradedPapers / task.totalPapers * 100,
          status: task.status
        });
      }
      return acc;
    }, [] as GradingProgress['graders']);

    return {
      examId,
      examTitle: exam.title,
      totalQuestions: exam.totalQuestions || 0,
      completedQuestions,
      totalPapers,
      gradedPapers,
      avgProgress: totalPapers > 0 ? (gradedPapers / totalPapers * 100) : 0,
      estimatedCompletionTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      graders: graderProgress
    };
  }, [exams, gradingTasks]);

  // 更新阅卷进度
  const updateGradingProgress = useCallback(async (taskId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTasks = gradingTasks.map(task => {
        if (task.id === taskId && task.status === 'pending') {
          return {
            ...task,
            status: 'in_progress' as const,
            startedAt: new Date().toISOString(),
            gradedPapers: Math.floor(Math.random() * task.totalPapers * 0.3)
          };
        } else if (task.id === taskId && task.status === 'in_progress') {
          const newGradedPapers = Math.min(
            task.totalPapers,
            task.gradedPapers + Math.floor(Math.random() * 10) + 1
          );
          const isCompleted = newGradedPapers >= task.totalPapers;
          
          return {
            ...task,
            gradedPapers: newGradedPapers,
            status: isCompleted ? 'completed' as const : 'in_progress' as const,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
            avgScore: 75 + Math.random() * 20,
            avgTime: 90 + Math.random() * 60
          };
        }
        return task;
      });

      setGradingTasks(updatedTasks);
      localStorage.setItem('gradingTasks', JSON.stringify(updatedTasks));
      
      message.success('阅卷进度已更新');
    } catch (error) {
      message.error('更新进度失败');
    } finally {
      setLoading(false);
    }
  }, [gradingTasks]);

  // 加载管理员数据
  const loadAdminUsers = useCallback(() => {
    const adminData = initializeAdminUsers();
    setAdminUsers(adminData);
  }, []);

  // 加载系统设置
  const loadSystemSettings = useCallback(() => {
    const settingsData = initializeSystemSettings();
    setSystemSettings(settingsData);
  }, []);

  // 加载当前管理员信息
  const loadCurrentAdmin = useCallback(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      const adminData = initializeAdminUsers();
      const currentAdminData = adminData.find(admin => admin.username === user.username);
      setCurrentAdmin(currentAdminData || null);
    }
  }, []);

  // 更改管理员密码
  const changeAdminPassword = useCallback(async (passwordData: PasswordChangeData) => {
    if (!currentAdmin) {
      message.error('当前用户信息不存在');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (currentAdmin.password !== passwordData.currentPassword) {
        message.error('当前密码错误');
        return;
      }

      const updatedAdmins = adminUsers.map(admin => 
        admin.id === currentAdmin.id 
          ? { ...admin, password: passwordData.newPassword }
          : admin
      );

      setAdminUsers(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
      
      const updatedCurrentAdmin = { ...currentAdmin, password: passwordData.newPassword };
      setCurrentAdmin(updatedCurrentAdmin);

      message.success('密码修改成功');
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  }, [currentAdmin, adminUsers]);

  // 更新管理员信息
  const updateAdminInfo = useCallback(async (adminId: string, updateData: Partial<AdminUser>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedAdmins = adminUsers.map(admin => 
        admin.id === adminId 
          ? { ...admin, ...updateData }
          : admin
      );

      setAdminUsers(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

      if (currentAdmin && currentAdmin.id === adminId) {
        setCurrentAdmin({ ...currentAdmin, ...updateData });
      }

      message.success('管理员信息更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  }, [adminUsers, currentAdmin]);

  // 创建新管理员
  const createAdmin = useCallback(async (adminData: AdminCreateData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (adminUsers.some(admin => admin.username === adminData.username)) {
        message.error('用户名已存在');
        return;
      }

      const newAdmin: AdminUser = {
        id: `admin_${Date.now()}`,
        ...adminData,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin?.username || 'system'
      };

      const updatedAdmins = [...adminUsers, newAdmin];
      setAdminUsers(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

      message.success('管理员创建成功');
    } catch (error) {
      message.error('创建管理员失败');
    } finally {
      setLoading(false);
    }
  }, [adminUsers, currentAdmin]);

  // 删除管理员
  const deleteAdmin = useCallback(async (adminId: string) => {
    if (!currentAdmin) return;

    if (adminId === currentAdmin.id) {
      message.error('不能删除自己的账号');
      return;
    }

    const targetAdmin = adminUsers.find(admin => admin.id === adminId);
    if (targetAdmin?.role === 'super_admin') {
      message.error('不能删除超级管理员');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedAdmins = adminUsers.filter(admin => admin.id !== adminId);
      setAdminUsers(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

      message.success('管理员删除成功');
    } catch (error) {
      message.error('删除管理员失败');
    } finally {
      setLoading(false);
    }
  }, [adminUsers, currentAdmin]);

  // 更新系统设置
  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    if (!systemSettings) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedSettings = { ...systemSettings, ...settings };
      setSystemSettings(updatedSettings);
      localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));

      message.success('系统设置更新成功');
    } catch (error) {
      message.error('更新系统设置失败');
    } finally {
      setLoading(false);
    }
  }, [systemSettings]);

  // 上传头像文件
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTimeout(() => {
          resolve(result);
        }, 1000);
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsDataURL(file);
    });
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