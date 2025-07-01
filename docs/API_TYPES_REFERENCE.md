# GalPHOS API 类型定义参考

> 本文档提供了所有API接口中使用的统一类型定义，基于 `src/types/common.ts`

## 基础类型

### 通用响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

### 文件类型
```typescript
interface ExamFile {
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
```

## 考试相关类型

### 基础考试类型
```typescript
interface BaseExam {
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
```

### 完整考试信息（管理员视角）
```typescript
interface Exam extends BaseExam {
  questionFile?: ExamFile;     // 试题文件
  answerFile?: ExamFile;       // 答案文件
  answerSheetFile?: ExamFile;  // 答题卡文件
  createdBy: string;
  participants?: string[];     // 参与考试的用户ID
  totalQuestions?: number;
  maxScore?: number;
  subject?: string;
  instructions?: string;
}
```

### 学生视角考试信息
```typescript
interface StudentExam extends BaseExam {
  questionFile?: ExamFile;
  answerFile?: ExamFile;
  answerSheetFile?: ExamFile;
  createdBy: string;
  participants?: string[];
  totalQuestions?: number;
}
```

### 阅卷员视角考试信息
```typescript
interface GraderExam extends BaseExam {
  maxScore: number;
  subject?: string;
  instructions?: string;
}
```

### 带题目分值的考试
```typescript
interface ExamWithQuestions extends Exam {
  questions: Question[];
  totalScore: number; // 总分（所有题目分值之和）
}
```

## 题目相关类型

### 题目信息
```typescript
interface Question {
  id: string;                   // 题目ID
  number: number;               // 题目编号
  score: number;                // 题目分值
  maxScore?: number;            // 最大可得分
  imageUrl?: string;            // 题目图片
}
```

### 题目得分
```typescript
interface QuestionScore {
  questionNumber: number;
  score: number;
  maxScore: number;
  feedback?: string;
}
```

## 答案和提交相关类型

### 考试答案
```typescript
interface ExamAnswer {
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
```

### 考试提交记录
```typescript
interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentUsername: string;
  studentName?: string;
  answers: ExamAnswer[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  totalScore?: number;
  maxScore?: number;
  gradedAt?: string;
  gradedBy?: string;
  feedback?: string;
}
```

## 成绩相关类型

### 考试成绩
```typescript
interface ExamScore {
  id: string;
  examId: string;
  studentId: string;
  studentUsername: string;
  studentName?: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionScores: QuestionScore[];
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
  rank?: number;
  feedback?: string;
}
```

### 排名信息
```typescript
interface RankingInfo {
  examId: string;
  examTitle: string;
  rankings: Array<{
    rank: number;
    studentId: string;
    studentUsername: string;
    studentName?: string;
    score: number;
    maxScore: number;
    percentage: number;
    submittedAt: string;
  }>;
  statistics: {
    totalParticipants: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}
```

## 阅卷相关类型

### 阅卷任务（阅卷员视角）
```typescript
interface GradingTask {
  id: string;
  examId: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  questionNumber: number;
  maxScore: number;
  currentScore?: number;
  status: 'pending' | 'grading' | 'completed';
  assignedAt: string;
  gradedAt?: string;
  graderId: string;
  priority: 'low' | 'medium' | 'high';
  imageUrl?: string;
  comments?: string;
}
```

### 管理员阅卷任务
```typescript
interface AdminGradingTask {
  id: string;
  examId: string;
  examTitle: string;
  questionNumber: number;
  graderId: string;
  graderName: string;
  totalPapers: number;
  gradedPapers: number;
  progress: number; // 0-100
  status: 'assigned' | 'in_progress' | 'completed';
  assignedAt: string;
  deadline?: string;
  completedAt?: string;
}
```

### 阅卷统计类型（简化版 v1.3.0）
```typescript
interface GradingStatistics {
  totalTasks: number;        // 总任务数
  pendingTasks: number;      // 待阅卷数
  gradingTasks: number;      // 阅卷中数
  completedTasks: number;    // 已完成数
  todayCompleted: number;    // 今日完成数
  efficiency?: {
    tasksPerHour: number;     // 每小时任务数
    averageGradingTime: number  // 平均阅卷时间(分钟)
  }
}
```

## 用户相关类型

### 学生类型说明

> **重要区分**: 系统中存在两种不同性质的学生类型，具有完全不同的使用场景和权限模型。

#### 独立学生账号
```typescript
interface IndependentStudent {
  id: string;
  username: string;
  password: string;               // 加密后的密码
  name?: string;
  phone?: string;
  province: string;
  school: string;
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
  examHistory?: string[];         // 参与的考试ID列表
}
```

**特点**:
- 拥有完整的登录凭据（用户名、密码）
- 可以独立登录系统
- 可以自主提交答题卡
- 具有完整的个人资料管理权限
- 需要通过注册审核流程

#### 教练管理的学生
```typescript
interface CoachManagedStudent {
  id: string;
  name: string;                   // 学生姓名（必需）
  username: string;               // 用于标识，但不能登录
  coachId: string;                // 所属教练ID
  coachUsername: string;          // 所属教练用户名
  province: string;               // 继承教练的省份
  school: string;                 // 继承教练的学校
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
```

**特点**:
- **无登录能力**：没有密码、手机号等登录凭据
- **教练代理操作**：所有操作（提交答题卡、查看成绩等）都通过教练进行
- **团体归属**：属于特定教练的管理范围
- **简化管理**：只需用户名和姓名即可创建，无需审核流程
- **区域继承**：自动继承教练的省份和学校信息

### 待审核用户
```typescript
interface PendingUser {
  id: string;
  username: string;
  phone?: string;
  role: 'student' | 'coach' | 'grader';
  province: string;
  school: string;
  appliedAt: string;
  status: 'pending';
}
```

### 已审核用户
```typescript
interface ApprovedUser {
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
```

### 管理员用户
```typescript
interface AdminUser {
  id: string;
  username: string;
  password: string;
  avatar?: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
  createdBy: string;
}
```

## 区域管理类型

### 省份信息
```typescript
interface Province {
  id: string;
  name: string;
  schools: School[];
  createdAt: string;
  updatedAt: string;
}
```

### 学校信息
```typescript
interface School {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

### 区域变更请求
```typescript
interface RegionChangeRequest {
  id: string;
  username: string;
  role: 'student' | 'grader' | 'coach';
  currentProvince?: string;
  currentSchool?: string;
  requestedProvince: string;
  requestedSchool: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}
```

## 系统管理类型

### 系统设置（简化版 v1.3.1）
```typescript
interface SystemSettings {
  // 系统公告
  systemAnnouncements: string[];      // 系统公告列表（轮播显示）
  announcementEnabled: boolean;       // 公告显示开关
  
  // 系统信息（只读，用于显示）
  systemName: string;                 // 系统名称
  version: string;                    // 系统版本
  buildTime: string;                  // 构建时间
}
```

### 学生注册请求
```typescript
interface StudentRegistrationRequest {
  id: string;
  username: string;
  password: string;
  province: string;
  school: string;
  coachUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}
```

### 密码修改数据
```typescript
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### 管理员创建数据
```typescript
interface AdminCreateData {
  username: string;
  password: string;
  avatar?: string;
  role: 'admin';
}
```

## 使用说明

### 1. 类型引用
在API文档中引用类型时，请使用以下格式：
```typescript
// 响应示例
type ExamListResponse = ApiResponse<Exam[]>;
type ExamDetailResponse = ApiResponse<Exam>;
```

### 2. 类型一致性
所有API接口的请求和响应数据必须严格遵循上述类型定义，确保前后端数据结构的一致性。

### 3. 类型扩展
如需新增类型定义，请在 `src/types/common.ts` 中添加，并同步更新本文档。

---

**文档版本**: v2.2  
**更新日期**: 2025年6月26日  
**基于**: 统一类型系统 (`src/types/common.ts`)  
**主要变更**: 删除所有邮件字段和题目类型字段，简化数据模型
