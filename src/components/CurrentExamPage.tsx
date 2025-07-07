import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Select,
  Descriptions,
  Steps,
  Image,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
  PictureOutlined
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
  
  // 考试详情模态框状态
  const [examDetailVisible, setExamDetailVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  // 提交答案页面状态
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const [answerFilePreviews, setAnswerFilePreviews] = useState<{ [questionNumber: number]: string }>({});

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
  }, [userRole]); // 移除函数依赖，避免无限循环

  // 本地提交统计回退方案
  const getLocalSubmissionStats = useCallback((examId: string) => {
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
  }, [students.length]);

  // 加载教练的提交状态统计
  const loadSubmissionStats = useCallback(async () => {
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
  }, [userRole, exams, students.length, getLocalSubmissionStats]);

  // 加载学生的提交状态
  const loadStudentSubmissions = useCallback(async () => {
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
  }, [exams, getExamSubmission]);

  // 检查考试提交状态
  const checkSubmissionStatus = useCallback(async (examId: string, studentUsername?: string) => {
    try {
      const submission = await getExamSubmission(examId, studentUsername);
      return !!submission;
    } catch (error) {
      return false;
    }
  }, [getExamSubmission]);

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
  }, [exams.length, userRole]); // 使用exams.length而非exams数组避免引用变化

  // 当前考试：已发布且未结束的考试
  const currentTime = new Date();
  const currentExams = exams.filter(exam => 
    (exam.status === 'published' || exam.status === 'ongoing') && new Date(exam.endTime) > currentTime
  );

  // 检查考试是否已开始
  const isExamStarted = useCallback((exam: Exam) => {
    return new Date() >= new Date(exam.startTime);
  }, []);

  // 检查考试是否可以提交答案
  const canSubmitAnswers = useCallback((exam: Exam) => {
    const now = new Date();
    return now >= new Date(exam.startTime) && now <= new Date(exam.endTime);
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback((questionNumber: number, file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件');
      return false;
    }
    
    // 验证文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error('图片大小不能超过10MB');
      return false;
    }
    
    // 设置文件
    setAnswerFiles(prev => ({
      ...prev,
      [questionNumber]: file
    }));
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setAnswerFilePreviews(prev => ({
      ...prev,
      [questionNumber]: previewUrl
    }));
    
    return false; // 阻止自动上传
  }, []);

  // 删除已上传的文件
  const handleRemoveFile = useCallback((questionNumber: number) => {
    setAnswerFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[questionNumber];
      return newFiles;
    });
    
    // 清理预览URL
    const previewUrl = answerFilePreviews[questionNumber];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setAnswerFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[questionNumber];
        return newPreviews;
      });
    }
  }, [answerFilePreviews]);

  // 提交答案
  const handleSubmitAnswers = useCallback(async () => {
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
  }, [currentExam, userRole, selectedStudent, answerFiles, submitExamAnswers]);

  // 打开提交界面
  const openSubmissionModal = useCallback((exam: Exam) => {
    setCurrentExam(exam);
    setSubmissionModalVisible(true);
    setAnswerFiles({});
    setAnswerFilePreviews({});
    setSelectedStudent('');
    setCurrentQuestionPage(1);
  }, []);

  const columns = [
    {
      title: '考试名称',
      dataIndex: 'title',
      key: 'title',
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
            {/* 详情按钮 */}
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedExam(record);
                setExamDetailVisible(true);
              }}
            >
              详情
            </Button>

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
        onCancel={() => {
          setSubmissionModalVisible(false);
          setCurrentExam(null);
          setAnswerFiles({});
          setAnswerFilePreviews({});
          setSelectedStudent('');
          setCurrentQuestionPage(1);
        }}
        width={900}
        footer={null}
      >
        {currentExam && (
          <div>
            {/* 考试信息 */}
            <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div><strong>考试名称：</strong>{currentExam.title}</div>
                </Col>
                <Col span={8}>
                  <div><strong>题目数量：</strong>{currentExam.totalQuestions || 0} 题</div>
                </Col>
                <Col span={8}>
                  <div><strong>结束时间：</strong>{new Date(currentExam.endTime).toLocaleString()}</div>
                </Col>
              </Row>
            </Card>

            {/* 教练模式：选择学生 */}
            {userRole === 'coach' && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                  <Col span={6}>
                    <Typography.Text strong>选择学生：</Typography.Text>
                  </Col>
                  <Col span={18}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="请选择要提交答案的学生"
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                    >
                      {students.map(student => (
                        <Select.Option key={student.username} value={student.username}>
                          {student.username}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Card>
            )}

            {/* 进度条 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Progress 
                percent={Math.round((Object.keys(answerFiles).length / (currentExam.totalQuestions || 1)) * 100)}
                format={(percent) => `已上传 ${Object.keys(answerFiles).length}/${currentExam.totalQuestions || 0} 题`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </Card>

            {/* 题目步骤条 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Steps 
                current={currentQuestionPage - 1} 
                size="small"
                style={{ marginBottom: 16 }}
              >
                {Array.from({ length: currentExam.totalQuestions || 0 }, (_, index) => {
                  const questionNumber = index + 1;
                  const hasFile = answerFiles[questionNumber];
                  return (
                    <Steps.Step 
                      key={questionNumber}
                      title={`第${questionNumber}题`}
                      status={hasFile ? 'finish' : currentQuestionPage === questionNumber ? 'process' : 'wait'}
                      icon={hasFile ? <CheckCircleOutlined /> : <PictureOutlined />}
                    />
                  );
                })}
              </Steps>
            </Card>

            {/* 当前题目内容 */}
            <Card 
              size="small" 
              style={{ marginBottom: 16, minHeight: 400 }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    第 {currentQuestionPage} 题
                    {answerFiles[currentQuestionPage] && (
                      <Tag color="success" style={{ marginLeft: 8 }}>
                        <CheckCircleOutlined /> 已上传
                      </Tag>
                    )}
                  </Typography.Title>
                  <Space>
                    <Button
                      size="small"
                      icon={<LeftOutlined />}
                      disabled={currentQuestionPage === 1}
                      onClick={() => setCurrentQuestionPage(prev => prev - 1)}
                    >
                      上一题
                    </Button>
                    <Button
                      size="small"
                      icon={<RightOutlined />}
                      disabled={currentQuestionPage === (currentExam.totalQuestions || 0)}
                      onClick={() => setCurrentQuestionPage(prev => prev + 1)}
                    >
                      下一题
                    </Button>
                  </Space>
                </div>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Typography.Title level={5} style={{ marginBottom: 16 }}>
                      📷 上传答案图片
                    </Typography.Title>
                    
                    {!answerFiles[currentQuestionPage] ? (
                      <Upload.Dragger
                        accept="image/*"
                        beforeUpload={(file) => handleFileUpload(currentQuestionPage, file)}
                        showUploadList={false}
                        style={{ marginBottom: 16 }}
                      >
                        <p className="ant-upload-drag-icon">
                          <PictureOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                        <p className="ant-upload-hint">
                          支持单个文件上传，文件大小不超过10MB
                        </p>
                      </Upload.Dragger>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Typography.Text type="success" style={{ display: 'block', marginBottom: 8 }}>
                          <CheckCircleOutlined /> 已上传文件：{answerFiles[currentQuestionPage].name}
                        </Typography.Text>
                        <Space>
                          <Upload
                            accept="image/*"
                            beforeUpload={(file) => handleFileUpload(currentQuestionPage, file)}
                            showUploadList={false}
                          >
                            <Button icon={<UploadOutlined />}>重新上传</Button>
                          </Upload>
                          <Button 
                            icon={<DeleteOutlined />} 
                            danger
                            onClick={() => handleRemoveFile(currentQuestionPage)}
                          >
                            删除
                          </Button>
                        </Space>
                      </div>
                    )}
                  </div>
                </Col>
                
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Typography.Title level={5} style={{ marginBottom: 16 }}>
                      🔍 图片预览
                    </Typography.Title>
                    
                    {answerFilePreviews[currentQuestionPage] ? (
                      <div style={{ 
                        border: '2px dashed #d9d9d9', 
                        borderRadius: 6, 
                        padding: 16,
                        minHeight: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Image
                          src={answerFilePreviews[currentQuestionPage]}
                          alt={`第${currentQuestionPage}题答案预览`}
                          style={{ maxWidth: '100%', maxHeight: 300 }}
                          preview={{
                            mask: '点击预览'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        border: '2px dashed #d9d9d9', 
                        borderRadius: 6, 
                        padding: 40,
                        textAlign: 'center',
                        color: '#999',
                        minHeight: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}>
                        <PictureOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <Typography.Text type="secondary">暂无图片预览</Typography.Text>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 快速跳转 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Typography.Text strong style={{ marginRight: 16 }}>快速跳转：</Typography.Text>
              <Space wrap>
                {Array.from({ length: currentExam.totalQuestions || 0 }, (_, index) => {
                  const questionNumber = index + 1;
                  const hasFile = answerFiles[questionNumber];
                  return (
                    <Button
                      key={questionNumber}
                      size="small"
                      type={currentQuestionPage === questionNumber ? 'primary' : 'default'}
                      onClick={() => setCurrentQuestionPage(questionNumber)}
                      style={{
                        background: hasFile ? '#f6ffed' : undefined,
                        borderColor: hasFile ? '#b7eb8f' : undefined,
                        color: hasFile && currentQuestionPage !== questionNumber ? '#52c41a' : undefined
                      }}
                    >
                      {questionNumber}
                      {hasFile && <CheckCircleOutlined style={{ marginLeft: 4 }} />}
                    </Button>
                  );
                })}
              </Space>
            </Card>

            {/* 操作按钮 */}
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={() => {
                    setSubmissionModalVisible(false);
                    setCurrentExam(null);
                    setAnswerFiles({});
                    setAnswerFilePreviews({});
                    setSelectedStudent('');
                    setCurrentQuestionPage(1);
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  loading={submitting}
                  onClick={handleSubmitAnswers}
                  disabled={
                    !currentExam || 
                    Object.keys(answerFiles).length !== (currentExam?.totalQuestions || 0) ||
                    (userRole === 'coach' && !selectedStudent)
                  }
                >
                  提交答案 ({Object.keys(answerFiles).length}/{currentExam.totalQuestions || 0})
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 考试详情模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>考试详情</span>
            {selectedExam && (
              <Tag color={
                selectedExam.status === 'published' ? 'green' : 
                selectedExam.status === 'ongoing' ? 'orange' : 
                selectedExam.status === 'completed' ? 'blue' : 'default'
              } style={{ marginLeft: 8 }}>
                {selectedExam.status === 'published' ? '已发布' : 
                 selectedExam.status === 'ongoing' ? '进行中' : 
                 selectedExam.status === 'completed' ? '已完成' : '草稿'}
              </Tag>
            )}
          </div>
        }
        open={examDetailVisible}
        onCancel={() => setExamDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExamDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedExam && (
          <div>
            {/* 基本信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                📋 基本信息
              </Title>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="考试标题" span={2}>
                  <Typography.Text strong style={{ fontSize: '16px' }}>{selectedExam.title}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="考试时间" span={2}>
                  <Space>
                    <CalendarOutlined />
                    <Typography.Text>
                      {new Date(selectedExam.startTime).toLocaleString()} 
                      <Typography.Text type="secondary"> 至 </Typography.Text>
                      {new Date(selectedExam.endTime).toLocaleString()}
                    </Typography.Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="考试时长">
                  <Tag color="blue">⏱️ {selectedExam.duration || 0} 分钟</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="题目数量">
                  <Tag color="cyan">📝 {selectedExam.totalQuestions || 0} 题</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="考试状态">
                  <Tag color={
                    selectedExam.status === 'published' ? 'green' : 
                    selectedExam.status === 'ongoing' ? 'orange' : 
                    selectedExam.status === 'completed' ? 'blue' : 'default'
                  }>
                    {selectedExam.status === 'published' ? '已发布' : 
                     selectedExam.status === 'ongoing' ? '进行中' : 
                     selectedExam.status === 'completed' ? '已完成' : '草稿'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 详细描述 */}
            {selectedExam.description && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                  📄 详细信息
                </Title>
                <Typography.Paragraph style={{ 
                  background: '#fafafa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  margin: 0,
                  minHeight: '60px'
                }}>
                  {selectedExam.description}
                </Typography.Paragraph>
              </Card>
            )}

            {/* 考试文件 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                📁 考试文件
              </Title>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {/* 试题文件 */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center',
                      border: selectedExam.questionFile ? '1px solid #d9f7be' : '1px solid #f0f0f0',
                      background: selectedExam.questionFile ? '#f6ffed' : '#fafafa'
                    }}
                  >
                    <FileTextOutlined 
                      style={{ 
                        fontSize: 32, 
                        color: selectedExam.questionFile ? '#52c41a' : '#d9d9d9',
                        marginBottom: 8
                      }} 
                    />
                    <div>
                      <Typography.Text strong>试题文件</Typography.Text>
                      {selectedExam.questionFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.questionFile.name}
                          </Typography.Text>
                          {isExamStarted(selectedExam) && (
                            <Button 
                              type="link" 
                              size="small" 
                              icon={<DownloadOutlined />}
                              style={{ padding: '4px 0' }}
                              onClick={() => downloadFile(selectedExam.questionFile!.url, selectedExam.questionFile!.name)}
                            >
                              下载文件
                            </Button>
                          )}
                          {!isExamStarted(selectedExam) && (
                            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                              考试开始后可下载
                            </Typography.Text>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>未上传</Typography.Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* 答题卡文件 */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center',
                      border: selectedExam.answerSheetFile ? '1px solid #d9f7be' : '1px solid #f0f0f0',
                      background: selectedExam.answerSheetFile ? '#f6ffed' : '#fafafa'
                    }}
                  >
                    <FileTextOutlined 
                      style={{ 
                        fontSize: 32, 
                        color: selectedExam.answerSheetFile ? '#52c41a' : '#d9d9d9',
                        marginBottom: 8
                      }} 
                    />
                    <div>
                      <Typography.Text strong>答题卡文件</Typography.Text>
                      {selectedExam.answerSheetFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.answerSheetFile.name}
                          </Typography.Text>
                          {new Date() <= new Date(selectedExam.endTime) && (
                            <Button 
                              type="link" 
                              size="small" 
                              icon={<DownloadOutlined />}
                              style={{ padding: '4px 0' }}
                              onClick={() => downloadFile(selectedExam.answerSheetFile!.url, selectedExam.answerSheetFile!.name)}
                            >
                              下载文件
                            </Button>
                          )}
                          {new Date() > new Date(selectedExam.endTime) && (
                            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                              考试结束后不可下载
                            </Typography.Text>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>未上传</Typography.Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CurrentExamPage;
