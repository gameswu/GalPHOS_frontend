import React from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag
} from 'antd';
import { 
  HistoryOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title } = Typography;

interface ExamFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  questionFile?: ExamFile;
  answerFile?: ExamFile;
  answerSheetFile?: ExamFile;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed';
  totalQuestions?: number;
  duration?: number;
}

interface ExamSubmission {
  id: string;
  examId: string;
  studentUsername: string;
  answers: any[];
  submittedAt: string;
  status: 'submitted' | 'grading' | 'graded';
  score?: number;
}

interface HistoryExamPageProps {
  exams: Exam[];
  loading: boolean;
  downloadFile: (fileUrl: string, fileName: string) => void;
  getExamSubmission: (examId: string, studentUsername?: string) => ExamSubmission | null;
  userRole: 'student' | 'coach';
  students?: any[];
}

const HistoryExamPage: React.FC<HistoryExamPageProps> = ({ 
  exams, 
  loading, 
  downloadFile,
  getExamSubmission,
  userRole,
  students = []
}) => {
  // 历史考试：已结束的考试
  const historyExams = exams.filter(exam => 
    exam.status === 'completed' || new Date(exam.endTime) < new Date()
  );

  const columns = [
    {
      title: '考试名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '考试时间',
      key: 'examTime',
      render: (_: any, record: Exam) => (
        <div>
          <div>开始：{new Date(record.startTime).toLocaleString()}</div>
          <div>结束：{new Date(record.endTime).toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: '题目数量',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      render: (count: number) => `${count || 0} 题`,
    },
    {
      title: '我的成绩',
      key: 'myScore',
      render: (_: any, record: Exam) => {
        if (userRole === 'student') {
          const submission = getExamSubmission(record.id);
          if (submission && submission.score !== undefined) {
            return <Tag color="gold">{submission.score} 分</Tag>;
          } else if (submission) {
            return <Tag color="processing">阅卷中</Tag>;
          } else {
            return <Tag color="default">未参加</Tag>;
          }
        } else {
          // 教练视角：显示参与学生数
          const participatedCount = students.filter(student => 
            getExamSubmission(record.id, student.username)
          ).length;
          return <Tag color={participatedCount > 0 ? "blue" : "default"}>
            {participatedCount}/{students.length} 人参与
          </Tag>;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small" wrap>
          {/* 试题下载 */}
          {record.questionFile && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record.questionFile!.url, record.questionFile!.name)}
            >
              试题
            </Button>
          )}

          {/* 答案下载 */}
          {record.answerFile && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record.answerFile!.url, record.answerFile!.name)}
            >
              答案
            </Button>
          )}

          {/* 答题卡下载 */}
          {record.answerSheetFile && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record.answerSheetFile!.url, record.answerSheetFile!.name)}
            >
              答题卡
            </Button>
          )}

          {/* 查看详情 */}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => console.log('查看考试详情', record.id)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>
          <HistoryOutlined style={{ marginRight: 8 }} />
          历史考试
        </Title>
      </div>
      
      <Table
        columns={columns}
        dataSource={historyExams}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default HistoryExamPage;
