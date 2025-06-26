import React, { useState } from 'react';
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
import { 
  StudentExam as Exam,
  ExamFile,
  ExamAnswer,
  ExamSubmission
} from '../types/common';

const { Title } = Typography;

interface Student {
  username: string;
  name: string;
}

interface HistoryExamPageProps {
  exams: Exam[];
  loading: boolean;
  downloadFile: (fileUrl: string, fileName: string) => void;
  getExamSubmission: (examId: string, studentUsername?: string) => Promise<ExamSubmission | null>;
  userRole: 'student' | 'coach';
  students?: Student[];
}

const HistoryExamPage: React.FC<HistoryExamPageProps> = ({ 
  exams, 
  loading, 
  downloadFile,
  getExamSubmission,
  userRole,
  students = []
}) => {
  const [submissionStates, setSubmissionStates] = useState<Record<string, ExamSubmission | null>>({});

  // 初始化提交状态
  React.useEffect(() => {
    const loadSubmissionStates = async () => {
      const states: Record<string, ExamSubmission | null> = {};
      for (const exam of exams) {
        if (userRole === 'student') {
          const submission = await getExamSubmission(exam.id);
          states[exam.id] = submission;
        }
      }
      setSubmissionStates(states);
    };

    if (exams.length > 0) {
      loadSubmissionStates();
    }
  }, [exams, userRole, getExamSubmission]);

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
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => new Date(time).toLocaleString(),
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
          const submission = submissionStates[record.id];
          if (submission && submission.score !== undefined) {
            return <Tag color="gold">{submission.score} 分</Tag>;
          } else if (submission) {
            return <Tag color="processing">阅卷中</Tag>;
          } else {
            return <Tag color="default">未参加</Tag>;
          }
        } else {
          // 教练视角：显示参与学生数
          // TODO: 实现教练视图的成绩统计
          return <Tag color="default">统计中...</Tag>;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small">
          {record.questionFile && (
            <Button 
              type="text" 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record.questionFile!.url, record.questionFile!.name)}
            >
              题目
            </Button>
          )}
          {record.answerFile && (
            <Button 
              type="text" 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record.answerFile!.url, record.answerFile!.name)}
            >
              答案
            </Button>
          )}
          {userRole === 'student' && (
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
            >
              查看提交
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>
        <HistoryOutlined style={{ marginRight: 8 }} />
        历史考试
      </Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={historyExams}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      </Card>
    </div>
  );
};

export default HistoryExamPage;
