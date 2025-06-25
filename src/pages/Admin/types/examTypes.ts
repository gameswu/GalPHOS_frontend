export interface ExamFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questionFile?: ExamFile; // 试题文件
  answerFile?: ExamFile;   // 答案文件
  answerSheetFile?: ExamFile; // 答题卡文件
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants?: string[]; // 参与考试的用户ID
  totalQuestions?: number;
  duration?: number; // 考试时长（分钟）
}

export interface ExamFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  questionFile?: File;
  answerFile?: File;
  answerSheetFile?: File;
  shouldPublish: boolean;
}