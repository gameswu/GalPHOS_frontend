import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag,
  message
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
import CoachAPI from '../api/coach';

const { Title } = Typography;

interface Student {
  username: string;
  name: string;
}

interface HistoryExamPageProps {
  exams: Exam[];
  loading?: boolean;
  userRole: 'student' | 'coach';
  // 教练端的props
  students?: Student[];
  downloadFile?: (fileUrl: string, fileName: string) => void;
  getExamSubmission?: (examId: string, studentUsername?: string) => Promise<ExamSubmission | null>;
  // 学生端的props  
  submissionStates?: { [examId: string]: ExamSubmission | null };
  onViewSubmission?: (examId: string) => void;
  onDownloadFile?: (file: ExamFile) => void;
}

const HistoryExamPage: React.FC<HistoryExamPageProps> = ({ 
  exams, 
  loading = false,
  students = [],
  userRole,
  submissionStates = {},
  onViewSubmission,
  onDownloadFile,
  downloadFile,
  getExamSubmission
}) => {
  // 教练成绩统计状态
  const [examStats, setExamStats] = useState<{ [examId: string]: {
    totalStudents: number;
    submittedStudents: number;
    averageScore: number;
  } }>({});

  // 加载教练的考试统计数据
  useEffect(() => {
    if (userRole === 'coach') {
      loadCoachExamStats();
    }
  }, [userRole, exams]);

  const loadCoachExamStats = async () => {
    if (userRole !== 'coach') return;
    
    const stats: { [examId: string]: any } = {};
    
    for (const exam of exams) {
      try {
        const response = await CoachAPI.getExamScoreStatistics(exam.id);
        if (response.success && response.data) {
          stats[exam.id] = {
            totalStudents: response.data.totalStudents,
            submittedStudents: response.data.submittedStudents,
            averageScore: response.data.averageScore
          };
        }
      } catch (error) {
        console.error(`获取考试${exam.id}统计失败:`, error);
        // 回退到本地统计
        const localStats = getLocalExamStats(exam.id);
        stats[exam.id] = localStats;
      }
    }
    
    setExamStats(stats);
  };

  // 本地统计回退方案
  const getLocalExamStats = (examId: string) => {
    try {
      // 从localStorage获取提交记录
      const submissions = JSON.parse(localStorage.getItem('examSubmissions') || '{}');
      const examSubmissions = submissions[examId] || [];
      
      return {
        totalStudents: students.length,
        submittedStudents: examSubmissions.length,
        averageScore: examSubmissions.length > 0 
          ? examSubmissions.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) / examSubmissions.length 
          : 0
      };
    } catch {
      return {
        totalStudents: students.length,
        submittedStudents: 0,
        averageScore: 0
      };
    }
  };

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
          const stats = examStats[record.id];
          const submittedCount = stats ? stats.submittedStudents : 0;
          const totalCount = stats ? stats.totalStudents : students.length;
          const averageScore = stats ? stats.averageScore : 0;

          return (
            <div>
              <div>
                <Tag color="blue">{submittedCount} 提交</Tag>
                <Tag color="green">{totalCount} 总数</Tag>
              </div>
              <div>
                平均分: <strong>{averageScore.toFixed(1)} 分</strong>
              </div>
            </div>
          );
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
              onClick={() => {
                if (onDownloadFile) {
                  onDownloadFile(record.questionFile!);
                } else if (downloadFile) {
                  downloadFile(record.questionFile!.url, record.questionFile!.name);
                }
              }}
            >
              题目
            </Button>
          )}
          {record.answerFile && (
            <Button 
              type="text" 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => {
                if (onDownloadFile) {
                  onDownloadFile(record.answerFile!);
                } else if (downloadFile) {
                  downloadFile(record.answerFile!.url, record.answerFile!.name);
                }
              }}
            >
              答案
            </Button>
          )}
          {userRole === 'student' && onViewSubmission && (
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => onViewSubmission!(record.id)}
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
          loading={false}
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
