// 题目和分值相关类型定义
export interface Question {
  id: string;
  number: number; // 题目编号
  content: string; // 题目内容
  score: number; // 题目分值
  maxScore?: number; // 最大可得分
  minScore?: number; // 最小可得分（通常为0）
}

// 扩展考试接口，支持题目分值设置
export interface ExamWithQuestions {
  id: string;
  title: string;
  description: string;
  questionFile?: ExamFile;
  answerFile?: ExamFile;
  answerSheetFile?: ExamFile;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants?: string[];
  totalQuestions: number;
  duration?: number;
  questions: Question[]; // 题目列表及分值
  totalScore: number; // 总分
}

export interface ExamFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: string;
}

// 成绩相关类型定义
export interface QuestionScore {
  questionNumber: number;
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
  questionScores: QuestionScore[]; // 每题得分详情
  totalRank?: number; // 总排名
  regionRank?: number; // 赛区排名
  schoolRank?: number; // 校内排名
  submittedAt: string;
  gradedAt?: string;
  status: 'submitted' | 'grading' | 'graded';
}

// 排名统计
export interface RankingInfo {
  totalParticipants: number;
  regionParticipants: number;
  schoolParticipants: number;
  totalRank: number;
  regionRank: number;
  schoolRank: number;
  percentile: number; // 百分位
  regionPercentile: number;
  schoolPercentile: number;
}

// 阅卷任务扩展
export interface ExtendedGradingTask {
  id: string;
  examId: string;
  examTitle: string;
  questionNumber: number;
  questionScore: number; // 该题的满分
  graderId: string;
  graderName: string;
  totalPapers: number;
  gradedPapers: number;
  avgScore: number;
  avgTime: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
}

// 阅卷答案扩展
export interface ExtendedGradingAnswer {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  questionNumber: number;
  questionScore: number; // 该题满分
  currentScore?: number; // 当前得分
  maxScore: number; // 最大可得分
  minScore: number; // 最小可得分（通常为0）
  answerContent?: string;
  imageUrl?: string;
  uploadTime: string;
  comments?: string;
  status: 'pending' | 'graded';
  gradedAt?: string;
  graderId?: string;
}

// 分值输入验证
export interface ScoreValidation {
  isValid: boolean;
  errorMessage?: string;
  suggestedScore?: number;
}

// 题目分值设置表单
export interface QuestionScoreForm {
  examId: string;
  questions: {
    number: number;
    score: number;
    content?: string;
  }[];
}

// API请求类型
export interface SetQuestionScoresRequest {
  examId: string;
  questions: {
    number: number;
    score: number;
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
