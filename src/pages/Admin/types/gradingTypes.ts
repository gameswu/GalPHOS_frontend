export interface GradingTask {
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

export interface GraderInfo {
  id: string;
  username: string;
  phone: string;
  currentTasks: number;
  completedTasks: number;
  totalPapers: number;
  avgScore: number;
  avgGradingTime: number;
  status: 'available' | 'busy' | 'offline';
  lastActiveAt: string;
}

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