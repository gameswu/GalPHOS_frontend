// 统一的考试和评分相关类型定义
// 整合所有重复的类型定义，提供一致的数据结构

// ===================== 基础文件类型 =====================
export interface ExamFile {
  id: string;
  name: string;
  filename?: string;
  originalName?: string;
  url: string;
  size: number;
  uploadTime: string;
  uploadedAt?: string;
  mimetype?: string;
  type?: 'exam' | 'answer' | 'template' | 'question' | 'answerSheet';
}

// ===================== 考试相关类型 =====================
export interface BaseExam {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  createdAt: string;
  updatedAt: string;
  duration?: number; // 考试时长（分钟）
}

// 完整的考试信息（管理员视角）
export interface Exam extends BaseExam {
  questionFile?: ExamFile; // 试题文件
  answerFile?: ExamFile;   // 答案文件
  answerSheetFile?: ExamFile; // 答题卡文件
  createdBy: string;
  participants?: string[]; // 参与考试的用户ID
  totalQuestions?: number;
  maxScore?: number;
  subject?: string;
  instructions?: string;
}

// 带题目分值的考试（支持分值管理）
export interface ExamWithQuestions extends Exam {
  questions: Question[];
  totalScore: number; // 总分（所有题目分值之和）
}

// 阅卷员视角的考试（简化版）
export interface GraderExam extends BaseExam {
  maxScore: number;
  subject?: string;
  instructions?: string;
}

// 学生/教练视角的考试
export interface StudentExam extends BaseExam {
  questionFile?: ExamFile;
  answerFile?: ExamFile;
  answerSheetFile?: ExamFile;
  createdBy: string;
  participants?: string[];
  totalQuestions?: number;
}

// ===================== 题目相关类型 =====================
export interface Question {
  id?: string;
  number: number; // 题目编号
  score: number; // 题目分值
  maxScore?: number; // 最大可得分（通常等于score）
  imageUrl?: string; // 题目图片
}

// ===================== 答案相关类型 =====================
export interface ExamAnswer {
  questionId: string;
  questionNumber: number;
  answer: string | string[];
  score?: number;
  maxScore: number;
  comments?: string;
  annotations?: any[];
  imageUrl?: string;
  uploadTime?: string;
  graderId?: string;
  graderName?: string;
  gradedAt?: string;
}

// ===================== 答卷相关类型 =====================
export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentUsername?: string;
  answers: ExamAnswer[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  score?: number;
  maxScore: number;
  gradedBy?: string;
  gradedAt?: string;
  feedback?: string;
  generalComments?: string;
}

// ===================== 成绩相关类型 =====================
export interface QuestionScore {
  questionNumber: number;
  questionId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  comments?: string;
  graderId?: string;
  graderName?: string;
  gradedAt?: string;
}

export interface ExamScore {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  regionId?: string;
  regionName?: string;
  schoolId?: string;
  schoolName?: string;
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  questionScores: QuestionScore[];
  totalRank?: number;
  regionRank?: number;
  schoolRank?: number;
  totalParticipants?: number;
  regionParticipants?: number;
  schoolParticipants?: number;
  submittedAt: string;
  gradedAt?: string;
  status: 'submitted' | 'grading' | 'graded';
}

// ===================== 排名相关类型 =====================
export interface RankingInfo {
  totalParticipants: number;
  regionParticipants: number;
  schoolParticipants: number;
  totalRank: number;
  regionRank: number;
  schoolRank: number;
  percentile: number;
  regionPercentile: number;
  schoolPercentile: number;
}

// ===================== 阅卷相关类型 =====================
export interface GradingTask {
  id: string;
  examId: string;
  examTitle: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  questionNumber?: number;
  status: 'pending' | 'in_progress' | 'grading' | 'completed' | 'abandoned';
  score?: number;
  maxScore: number;
  feedback?: string;
  priority: 'high' | 'medium' | 'low';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  submittedAt?: string;
  submission?: ExamSubmission;
}

export interface GradingStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  abandonedTasks: number;
  gradingTasks?: number;
  averageScore: number;
  totalGradingTime: number;
  averageGradingTime: number;
  todayCompleted: number;
  weekCompleted: number;
  monthCompleted: number;
  efficiency?: number;
}

// ===================== 表单相关类型 =====================
export interface ExamFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  questionFile?: File;
  answerFile?: File;
  answerSheetFile?: File;
  shouldPublish: boolean;
  duration?: number;
  subject?: string;
  instructions?: string;
}

export interface QuestionScoreForm {
  examId: string;
  questions: {
    number: number;
    score: number;
    content?: string;
  }[];
}

// ===================== 验证相关类型 =====================
export interface ScoreValidation {
  isValid: boolean;
  errorMessage?: string;
  suggestedScore?: number;
}

export interface ScoreValidationResult {
  isValid: boolean;
  errorMessage?: string;
  suggestedScore?: number;
}

// ===================== API请求类型 =====================
export interface SetQuestionScoresRequest {
  examId: string;
  questions: {
    number: number;
    score: number;
    content?: string;
  }[];
}

export interface GetScoreDetailRequest {
  examId: string;
  studentId?: string;
  includeRanking?: boolean;
}

export interface UpdateQuestionScoreRequest {
  examId: string;
  studentId: string;
  questionNumber: number;
  score: number;
  comments?: string;
}

export interface SubmitGradingRequest {
  taskId: string;
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
}

// ===================== 组件Props类型 =====================
export interface ScoreInputProps {
  questionNumber: number;
  maxScore: number;
  minScore?: number;
  value?: number;
  onChange: (score: number) => void;
  onValidationChange?: (isValid: boolean, errorMessage?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface QuestionScoreConfig {
  questionNumber: number;
  maxScore: number;
  minScore: number;
  content?: string;
}

// ===================== 统计相关类型 =====================
export interface DashboardData {
  totalExams: number;
  ongoingExams: number;
  completedExams: number;
  totalSubmissions: number;
  pendingGrading: number;
  averageScore: number;
  recentExams: Exam[];
  examHistory: ExamSubmission[];
}

// ===================== 导出所有类型 =====================
export type {
  // 重新导出，保持向后兼容
  ExamFile as AdminExamFile,
  Exam as AdminExam,
  ExamFormData as AdminExamFormData,
  GraderExam as GraderExamType,
  StudentExam as StudentExamType,
}

// ===================== 管理员阅卷管理类型 =====================

// 管理员视角的阅卷任务（与阅卷员的GradingTask区分）
export interface AdminGradingTask {
  id: string;
  examId: string;
  examTitle: string;
  questionNumber: number; // 第几题
  graderId: string;
  graderName: string;
  totalPapers: number; // 总答卷数
  gradedPapers: number; // 已阅卷数
  avgScore: number; // 平均分
  avgTime: number; // 平均阅卷时间（秒）
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
}

// 阅卷分配
export interface GradingAssignment {
  id: string;
  examId: string;
  questionNumber: number;
  graderIds: string[];
  papers: GradingPaper[];
  status: 'pending' | 'assigned' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// 阅卷答卷
export interface GradingPaper {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  questionNumber: number;
  graderId?: string;
  score?: number;
  comments?: string;
  gradingTime?: number; // 阅卷耗时（秒）
  status: 'pending' | 'graded';
  gradedAt?: string;
}

// 阅卷员信息（简化版：仅包含阅卷者、状态、阅卷队列数、已完成数四项）
export interface GraderInfo {
  id: string;
  username: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentTasks: number;    // 阅卷队列数（当前待处理任务数）
  completedTasks: number;  // 已完成数（已完成的阅卷任务数）
}

// 阅卷进度
export interface GradingProgress {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  completedQuestions: number;
  totalPapers: number;
  gradedPapers: number;
  avgProgress: number;
  estimatedCompletionTime: string;
  graders: {
    graderId: string;
    graderName: string;
    questionNumbers: number[];
    progress: number;
    status: string;
  }[];
}

// ===================== 区域管理类型 =====================

// 省份信息
export interface Province {
  id: string;
  name: string;
  schools: School[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// 学校信息
export interface School {
  id: string;
  name: string;
  provinceId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// 区域表单数据
export interface RegionFormData {
  provinceName: string;
  schoolName: string;
}

// 区域变更请求
export interface RegionChangeRequest {
  id: string;
  userId: string;
  username: string;
  role: 'student' | 'grader' | 'coach';
  currentProvince?: string;
  currentSchool?: string;
  requestedProvince: string;
  requestedSchool: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// ===================== 系统管理类型 =====================

// 独立学生账号（可登录的真实用户）
export interface IndependentStudent {
  id: string;
  username: string;
  password: string; // 加密后的密码
  name?: string;
  phone?: string;
  province: string;
  school: string;
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
  examHistory?: string[]; // 参与的考试ID列表
}

// 教练管理的学生（非独立账号，仅作为团体成员）
export interface CoachManagedStudent {
  id: string;
  name: string; // 学生姓名（必需）
  username: string; // 用于标识，但不能登录
  coachId: string; // 所属教练ID
  coachUsername: string; // 所属教练用户名
  province: string; // 继承教练的省份
  school: string; // 继承教练的学校
  status: 'active' | 'inactive';
  createdAt: string;
  examParticipations?: Array<{
    examId: string;
    submittedAt?: string;
    score?: number;
    rank?: number;
  }>;
  // 注意：无密码、手机号、邮箱等登录相关字段
}

// 待审核用户（仅适用于独立账号）
export interface PendingUser {
  id: string;
  username: string;
  phone?: string;
  role: 'student' | 'coach' | 'grader';
  province: string;
  school: string;
  appliedAt: string;
  status: 'pending';
}

// 已审核用户（仅适用于独立账号）
export interface ApprovedUser {
  id: string;
  username: string;
  phone?: string;
  role: 'student' | 'coach' | 'grader';
  province: string;
  school: string;
  status: 'approved' | 'disabled';
  approvedAt: string;
  lastLoginAt?: string;
}

// 管理员用户（简化版）
export interface AdminUser {
  id: string;
  username: string;
  name?: string; // 显示名称
  avatar?: string; // 头像字段
  role: 'super_admin' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
}

// 系统设置（简化版 v1.3.0）
export interface SystemSettings {
  // 维护模式相关
  maintenanceMode: boolean;           // 维护模式开关
  maintenanceMessage: string;         // 维护模式消息
  
  // 系统公告
  systemAnnouncements: string[];      // 系统公告列表（轮播显示）
  announcementEnabled: boolean;       // 公告显示开关
  
  // 系统信息（只读，用于显示）
  systemName: string;                 // 系统名称
  version: string;                    // 系统版本
  buildTime: string;                  // 构建时间
}

// 密码修改数据
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 管理员创建数据（简化版）
export interface AdminCreateData {
  username: string;
  password: string;
  name?: string; // 显示名称
  role?: 'admin'; // 只能创建普通管理员
}

// 学生注册请求
export interface StudentRegistrationRequest {
  id: string;
  username: string;
  password: string;
  province: string;
  school: string;
  coachUsername: string; // 指导教师用户名
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}