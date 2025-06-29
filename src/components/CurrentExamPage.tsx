import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal,
  Upload,
  Form,
  message,
  Progress,
  Select
} from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined
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
  id: string;
  name: string;
  username: string;
}

interface CurrentExamPageProps {
  exams: Exam[];
  loading: boolean;
  submitExamAnswers: (examId: string, answers: ExamAnswer[], studentUsername?: string) => Promise<void>;
  getExamSubmission: (examId: string, studentUsername?: string) => Promise<ExamSubmission | null>;
  downloadFile: (fileUrl: string, fileName: string) => void;
  userRole: 'student' | 'coach';
  students?: Student[]; // 仅教练角色需要
}

const CurrentExamPage: React.FC<CurrentExamPageProps> = ({ 
  exams, 
  loading, 
  submitExamAnswers, 
  getExamSubmission,
  downloadFile,
  userRole,
  students = []
}) => {
  // 提交状态
  const [submissionStates, setSubmissionStates] = useState<{ [examId: string]: ExamSubmission | null }>({});
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerFiles, setAnswerFiles] = useState<{ [questionNumber: number]: File }>({});
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [form] = Form.useForm();

  // 教练提交状态统计
  const [submissionStats, setSubmissionStats] = useState<{ [examId: string]: {
    submittedCount: number;
    totalCount: number;
  } }>({});

  // 加载提交状态统计
  useEffect(() => {
    if (userRole === 'coach') {
      loadSubmissionStats();
    } else {
      loadStudentSubmissions();
    }
  }, [userRole, exams, students]);

  // 加载教练的提交状态统计
  const loadSubmissionStats = async () => {
    if (userRole !== 'coach') return;

    const stats: { [examId: string]: any } = {};

    for (const exam of exams) {
      try {
        // 通过API获取提交统计
        const response = await CoachAPI.getSubmissions(exam.id);
        if (response.success && response.data) {
          const submissions = Array.isArray(response.data) ? response.data : [];
          stats[exam.id] = {
            submittedCount: submissions.length,
            totalCount: students.length
          };
        }
      } catch (error) {
        console.error(`获取考试${exam.id}提交统计失败:`, error);
        // 回退到本地统计
        const localStats = getLocalSubmissionStats(exam.id);
        stats[exam.id] = localStats;
      }
    }

    setSubmissionStats(stats);
  };

  // 本地提交统计回退方案
  const getLocalSubmissionStats = (examId: string) => {
    try {
      const submissions = JSON.parse(localStorage.getItem('examSubmissions') || '{}');
      const examSubmissions = submissions[examId] || [];
      
      return {
        submittedCount: examSubmissions.length,
        totalCount: students.length
      };
    } catch {
      return {
        submittedCount: 0,
        totalCount: students.length
      };
    }
  };

  // 加载学生的提交状态
  const loadStudentSubmissions = async () => {
    for (const exam of exams) {
      try {
        const submission = await getExamSubmission(exam.id);
        setSubmissionStates(prev => ({
          ...prev,
          [exam.id]: submission
        }));
      } catch (error) {
        console.error(`获取考试${exam.id}提交状态失败:`, error);
      }
    }
  };

  // 检查考试提交状态
  const checkSubmissionStatus = async (examId: string, studentUsername?: string) => {
    try {
      const submission = await getExamSubmission(examId, studentUsername);
      return !!submission;
    } catch (error) {
      return false;
    }
  };

  // 初始化提交状态
  React.useEffect(() => {
    const loadSubmissionStates = async () => {
      const states: { [examId: string]: ExamSubmission | null } = {};
      for (const exam of exams) {
        if (userRole === 'student') {
          try {
            const submission = await getExamSubmission(exam.id);
            states[exam.id] = submission;
          } catch (error) {
            console.error(`获取考试${exam.id}提交状态失败:`, error);
            states[exam.id] = null;
          }
        }
      }
      setSubmissionStates(states);
    };

    if (exams.length > 0) {
      loadSubmissionStates();
    }
  }, [exams, userRole]);

  // 当前考试：已发布且未结束的考试
  const currentTime = new Date();
  const currentExams = exams.filter(exam => 
    (exam.status === 'published' || exam.status === 'ongoing') && new Date(exam.endTime) > currentTime
  );

  // 检查考试是否已开始
  const isExamStarted = (exam: Exam) => {
    return new Date() >= new Date(exam.startTime);
  };

  // 检查考试是否可以提交答案
  const canSubmitAnswers = (exam: Exam) => {
    const now = new Date();
    return now >= new Date(exam.startTime) && now <= new Date(exam.endTime);
  };

  // 处理文件上传
  const handleFileUpload = (questionNumber: number, file: File) => {
    setAnswerFiles(prev => ({
      ...prev,
      [questionNumber]: file
    }));
    return false; // 阻止自动上传
  };

  // 提交答案
  const handleSubmitAnswers = async () => {
    if (!currentExam) return;

    // 教练模式下需要选择学生
    if (userRole === 'coach' && !selectedStudent) {
      message.error('请选择要提交答案的学生');
      return;
    }

    const answers: ExamAnswer[] = [];
    const totalQuestions = currentExam.totalQuestions || 0;

    // 检查是否所有题目都已上传答案
    for (let i = 1; i <= totalQuestions; i++) {
      const file = answerFiles[i];
      if (!file) {
        message.error(`请上传第${i}题的答案`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // 先上传所有答案图片，获取真实的文件URL
      const FileUploadService = await import('../services/fileUploadService');
      
      for (let i = 1; i <= totalQuestions; i++) {
        const file = answerFiles[i];
        
        // 根据用户角色选择不同的上传方法
        let uploadResult;
        if (userRole === 'coach') {
          // 教练代理上传
          uploadResult = await FileUploadService.default.uploadAnswerImageByCoach(
            file,
            currentExam.id,
            i,
            selectedStudent
          );
        } else {
          // 学生自主上传
          uploadResult = await FileUploadService.default.uploadAnswerImage(
            file,
            currentExam.id,
            i
          );
        }
        
        if (!uploadResult.success) {
          throw new Error(`第${i}题答案上传失败: ${uploadResult.message}`);
        }
        
        answers.push({
          questionId: `q_${currentExam.id}_${i}`,
          questionNumber: i,
          answer: '',
          maxScore: 100,
          imageUrl: uploadResult.data!.fileUrl, // 使用真实的文件URL
          uploadTime: uploadResult.data!.uploadTime
        });
      }
      
      // 提交答案
      await submitExamAnswers(currentExam.id, answers, userRole === 'coach' ? selectedStudent : undefined);
      setSubmissionModalVisible(false);
      setCurrentExam(null);
      setAnswerFiles({});
      setSelectedStudent('');
    } catch (error) {
      console.error('答案提交失败:', error);
      message.error('答案提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 打开提交界面
  const openSubmissionModal = (exam: Exam) => {
    setCurrentExam(exam);
    setSubmissionModalVisible(true);
    setAnswerFiles({});
    setSelectedStudent('');
  };

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
      title: '状态',
      key: 'examStatus',
      render: (_: any, record: Exam) => {
        const now = new Date();
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        
        if (now < startTime) {
          return <Tag color="blue">未开始</Tag>;
        } else if (now >= startTime && now <= endTime) {
          return <Tag color="green">进行中</Tag>;
        } else {
          return <Tag color="red">已结束</Tag>;
        }
      },
    },
    {
      title: '提交状态',
      key: 'submission',
      render: (_: any, record: Exam) => {
        if (userRole === 'student') {
          const isSubmitted = submissionStates[record.id];
          if (isSubmitted) {
            return <Tag color="success" icon={<CheckCircleOutlined />}>已提交</Tag>;
          }
          return <Tag color="default">未提交</Tag>;
        } else {
          // 教练视图：显示已提交的学生数量
          const { submittedCount, totalCount } = submissionStats[record.id] || { submittedCount: 0, totalCount: 0 };
          return (
            <span>
              <Tag color="success">{submittedCount}</Tag> / <Tag>{totalCount}</Tag>
            </span>
          );
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => {
        const canDownloadQuestions = isExamStarted(record);
        const canSubmit = canSubmitAnswers(record);

        return (
          <Space size="small" wrap>
            {/* 答题卡下载 - 始终可用 */}
            {record.answerSheetFile && (
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadFile(record.answerSheetFile!.url, record.answerSheetFile!.name)}
              >
                答题卡
              </Button>
            )}

            {/* 试题下载 - 考试开始后可用 */}
            {record.questionFile && canDownloadQuestions && (
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadFile(record.questionFile!.url, record.questionFile!.name)}
              >
                试题
              </Button>
            )}

            {/* 提交答案 - 考试期间可用 */}
            {canSubmit && (
              <Button
                size="small"
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => openSubmissionModal(record)}
              >
                提交答案
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            当前考试
          </Title>
        </div>
        
        <Table
          columns={columns}
          dataSource={currentExams}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 提交答案模态框 */}
      <Modal
        title={`提交答案 - ${currentExam?.title}`}
        open={submissionModalVisible}
        onOk={handleSubmitAnswers}
        onCancel={() => {
          setSubmissionModalVisible(false);
          setCurrentExam(null);
          setAnswerFiles({});
          setSelectedStudent('');
        }}
        confirmLoading={submitting}
        okText="提交答案"
        cancelText="取消"
        width={800}
        okButtonProps={{ 
          disabled: !currentExam || 
                   Object.keys(answerFiles).length !== (currentExam?.totalQuestions || 0) ||
                   (userRole === 'coach' && !selectedStudent)
        }}
      >
        {currentExam && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f6f8fa', borderRadius: 6 }}>
              <div><strong>考试名称：</strong>{currentExam.title}</div>
              <div><strong>题目数量：</strong>{currentExam.totalQuestions || 0} 题</div>
              <div><strong>结束时间：</strong>{new Date(currentExam.endTime).toLocaleString()}</div>
            </div>

            {/* 教练模式：选择学生 */}
            {userRole === 'coach' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>选择学生：</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择要提交答案的学生"
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                >
                  {students.map(student => (
                    <Select.Option key={student.username} value={student.username}>
                      {student.name} ({student.username})
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <Progress 
                percent={Math.round((Object.keys(answerFiles).length / (currentExam.totalQuestions || 1)) * 100)}
                format={(percent) => `${Object.keys(answerFiles).length}/${currentExam.totalQuestions || 0} 题`}
              />
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {Array.from({ length: currentExam.totalQuestions || 0 }, (_, index) => {
                const questionNumber = index + 1;
                const hasFile = answerFiles[questionNumber];
                
                return (
                  <div key={questionNumber} style={{ marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                      第 {questionNumber} 题
                      {hasFile && <Tag color="success" style={{ marginLeft: 8 }}>已上传</Tag>}
                    </div>
                    <Upload
                      accept="image/*"
                      beforeUpload={(file) => handleFileUpload(questionNumber, file)}
                      showUploadList={false}
                      maxCount={1}
                    >
                      <Button 
                        icon={<UploadOutlined />}
                        type={hasFile ? "default" : "dashed"}
                        style={{ width: '100%' }}
                      >
                        {hasFile ? `重新上传 (${hasFile.name})` : '上传答案图片'}
                      </Button>
                    </Upload>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CurrentExamPage;
