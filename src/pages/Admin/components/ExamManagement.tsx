import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Typography,
  Popconfirm,
  Row,
  Col,
  Tabs,
  Select,
  Descriptions,
  Progress,
  Switch,
  InputNumber,
  message,
  Steps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Exam, ExamFile } from '../../../types/common';
import { 
  ExamCreationStepEnum, 
  ExamBasicInfoForm, 
  ExamScoreSettingsForm, 
  ExamPublishSettingsForm, 
  CreateExamRequest 
} from '../../../types/exam';
import '../../../styles/responsive.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Step } = Steps;

// 分值设置Tab组件
interface ScoreSettingsTabProps {
  examId?: string;
  onSetQuestionScores: (examId: string, questions: { number: number; score: number }[]) => Promise<any>;
  onGetQuestionScores: (examId: string) => Promise<any>;
  onUpdateSingleQuestionScore: (examId: string, questionNumber: number, score: number) => Promise<any>;
}

const ScoreSettingsTab: React.FC<ScoreSettingsTabProps> = ({
  examId,
  onSetQuestionScores,
  onGetQuestionScores,
  onUpdateSingleQuestionScore
}) => {
  const [scoreForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questionScores, setQuestionScores] = useState<{ number: number; score: number }[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(1);

  // 添加新题目
  const addQuestion = () => {
    const newQuestions = [...questionScores, { number: questionScores.length + 1, score: 5 }];
    setQuestionScores(newQuestions);
    setTotalQuestions(newQuestions.length);
  };

  // 删除题目
  const removeQuestion = (index: number) => {
    const newQuestions = questionScores.filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, number: i + 1 }));
    setQuestionScores(newQuestions);
    setTotalQuestions(newQuestions.length);
  };

  // 更新题目分值
  const updateQuestionScore = (index: number, score: number) => {
    const newQuestions = [...questionScores];
    newQuestions[index].score = score;
    setQuestionScores(newQuestions);
  };

  // 批量设置相同分值
  const setBatchScore = async (values: { questionCount: number; defaultScore: number }) => {
    const questions = Array.from({ length: values.questionCount }, (_, index) => ({
      number: index + 1,
      score: values.defaultScore
    }));
    setQuestionScores(questions);
    setTotalQuestions(values.questionCount);
    message.success(`已生成${values.questionCount}道题目，每题${values.defaultScore}分`);
  };

  // 保存分值设置
  const saveScores = async () => {
    if (!examId) {
      message.error('请先保存考试基本信息');
      return;
    }

    if (questionScores.length === 0) {
      message.error('请至少设置一道题目的分值');
      return;
    }

    try {
      setLoading(true);
      await onSetQuestionScores(examId, questionScores);
      const totalScore = questionScores.reduce((sum, q) => sum + q.score, 0);
      message.success(`分值设置成功！共${questionScores.length}道题，总分${totalScore}分`);
    } catch (error) {
      message.error('分值设置失败');
    } finally {
      setLoading(false);
    }
  };

  if (!examId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">
          请先在"基本信息"标签页保存考试信息，然后再设置分值
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
        <Text type="secondary">
          💡 简化流程：为每道题目单独设置分值，无需填写题干内容
        </Text>
      </Card>
      
      <Form
        form={scoreForm}
        layout="vertical"
        onFinish={saveScores}
      >
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
            📝 批量设置题目
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="题目数量" rules={[{ required: true, message: '请输入题目数量' }]}>
                <InputNumber
                  min={1}
                  max={200}
                  value={totalQuestions}
                  onChange={(value) => setTotalQuestions(value || 1)}
                  placeholder="例如：20"
                  style={{ width: '100%' }}
                  addonAfter="题"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="默认分值">
                <Space>
                  <InputNumber
                    min={0.5}
                    max={50}
                    step={0.5}
                    defaultValue={5}
                    placeholder="例如：5"
                    addonAfter="分"
                  />
                  <Button 
                    type="dashed"
                    onClick={() => {
                      const questions = Array.from({ length: totalQuestions }, (_, index) => ({
                        number: index + 1,
                        score: 5
                      }));
                      setQuestionScores(questions);
                    }}
                  >
                    生成题目
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {questionScores.length > 0 && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
              📋 题目分值设置
            </Title>
            {questionScores.map((question, index) => (
              <Row key={index} gutter={16} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Text>第 {question.number} 题</Text>
                </Col>
                <Col span={8}>
                  <InputNumber
                    min={0.5}
                    max={50}
                    step={0.5}
                    value={question.score}
                    onChange={(value) => updateQuestionScore(index, value || 0)}
                    addonAfter="分"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    onClick={() => removeQuestion(index)}
                  >
                    删除
                  </Button>
                </Col>
              </Row>
            ))}
            
            <div style={{ textAlign: 'center', marginTop: 16, padding: '16px 0', border: '1px dashed #d9d9d9', borderRadius: '6px' }}>
              <Button type="dashed" onClick={addQuestion}>
                + 添加题目
              </Button>
            </div>
            
            <div style={{ textAlign: 'right', marginTop: 16, padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
              <Text strong>
                总题数：{questionScores.length} 题，总分：{questionScores.reduce((sum, q) => sum + q.score, 0)} 分
              </Text>
            </div>
          </Card>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
          <Space>
            <Button onClick={() => setQuestionScores([])}>
              清空
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存分值设置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

// 主要组件接口
interface ExamManagementProps {
  exams: Exam[];
  loading: boolean;
  onCreateExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  onUpdateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  onDeleteExam: (id: string) => Promise<void>;
  onPublishExam: (id: string) => Promise<void>;
  onUnpublishExam: (id: string) => Promise<void>;
  onUploadFile: (file: File, type: 'question' | 'answer' | 'answerSheet') => Promise<ExamFile>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onSetQuestionScores: (examId: string, questions: { number: number; score: number }[]) => Promise<any>;
  onGetQuestionScores: (examId: string) => Promise<any>;
  onUpdateSingleQuestionScore: (examId: string, questionNumber: number, score: number) => Promise<any>;
}

// 状态映射
const statusMap = {
  draft: { text: '未发布', color: 'default' },
  published: { text: '已发布', color: 'blue' },
  ongoing: { text: '考试中', color: 'orange' },
  grading: { text: '阅卷中', color: 'purple' },
  completed: { text: '已结束', color: 'green' }
};

const ExamManagement: React.FC<ExamManagementProps> = ({
  exams,
  loading,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
  onPublishExam,
  onUnpublishExam,
  onUploadFile,
  onDeleteFile,
  onSetQuestionScores,
  onGetQuestionScores,
  onUpdateSingleQuestionScore
}) => {
  const [form] = Form.useForm();
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [examDetailVisible, setExamDetailVisible] = useState(false);
  const [scoreSettingsVisible, setScoreSettingsVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploading, setUploading] = useState<{
    question: boolean;
    answer: boolean;
    answerSheet: boolean;
  }>({ question: false, answer: false, answerSheet: false });
  const [uploadedFiles, setUploadedFiles] = useState<{
    questionFile?: ExamFile;
    answerFile?: ExamFile;
    answerSheetFile?: ExamFile;
  }>({});
  // 创建考试相关状态
  const [currentStep, setCurrentStep] = useState<ExamCreationStepEnum>(ExamCreationStepEnum.BasicInfo);
  const [basicInfoForm] = Form.useForm<ExamBasicInfoForm>();
  const [scoreSettingsForm] = Form.useForm<ExamScoreSettingsForm>();
  const [publishSettingsForm] = Form.useForm<ExamPublishSettingsForm>();
  const [examCreationVisible, setExamCreationVisible] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<{number: number; score: number}[]>([]);

  // 步骤变更处理函数
  const handleStepChange = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step as ExamCreationStepEnum);
      return;
    }

    if (currentStep === ExamCreationStepEnum.BasicInfo) {
      basicInfoForm.validateFields().then(values => {
        // 创建题目数量的空数组
        const questions = Array.from({ length: values.totalQuestions }, (_, idx) => ({
          number: idx + 1,
          score: Math.round(values.totalScore / values.totalQuestions * 10) / 10 // 平均分配分数，保留一位小数
        }));
        setGeneratedQuestions(questions);
        scoreSettingsForm.setFieldsValue({ questions });
        setCurrentStep(ExamCreationStepEnum.ScoreSettings);
      }).catch(err => {
        console.error('表单验证失败:', err);
      });
    } else if (currentStep === ExamCreationStepEnum.ScoreSettings) {
      scoreSettingsForm.validateFields().then(() => {
        // 默认不立即发布
        publishSettingsForm.setFieldsValue({ shouldPublish: false });
        setCurrentStep(ExamCreationStepEnum.PublishSettings);
      }).catch(err => {
        console.error('分值设置验证失败:', err);
      });
    }
  };

  // 打开创建考试模态框
  const openExamCreation = () => {
    setCurrentStep(ExamCreationStepEnum.BasicInfo);
    basicInfoForm.resetFields();
    scoreSettingsForm.resetFields();
    publishSettingsForm.resetFields();
    setGeneratedQuestions([]);
    setExamCreationVisible(true);
  };

  // 关闭创建考试模态框
  const closeExamCreation = () => {
    setExamCreationVisible(false);
  };

  // 创建考试提交处理
  const handleExamCreationSubmit = async () => {
    try {
      const basicInfo = await basicInfoForm.validateFields();
      const scoreSettings = await scoreSettingsForm.validateFields();
      const publishSettings = await publishSettingsForm.validateFields();
      
      const examRequest: CreateExamRequest = {
        title: basicInfo.title,
        description: basicInfo.description,
        totalQuestions: basicInfo.totalQuestions,
        totalScore: basicInfo.totalScore,
        duration: basicInfo.duration,
        startTime: basicInfo.examTime[0].toISOString(),
        endTime: basicInfo.examTime[1].toISOString(),
        questions: scoreSettings.questions.map(q => ({ number: q.number, score: q.score })),
        status: publishSettings.shouldPublish ? 'published' : 'draft'
      };
      
      await onCreateExam({
        ...examRequest,
        participants: []
      });
      
      message.success('考试创建成功');
      closeExamCreation();
    } catch (error) {
      console.error('创建考试失败:', error);
      message.error('创建考试失败，请检查表单数据');
    }
  };

  // 分数输入变化处理
  const handleScoreChange = (value: number | null, index: number) => {
    const questions = scoreSettingsForm.getFieldValue('questions');
    if (questions && value !== null) {
      questions[index].score = value;
      scoreSettingsForm.setFieldsValue({ questions });
      
      // 计算总分
      const totalScore = questions.reduce((sum: number, q: {number: number; score: number}) => sum + (q.score || 0), 0);
      // 更新基本信息中的总分
      basicInfoForm.setFieldValue('totalScore', totalScore);
    }
  };

  // 计算当前设置分数的总和
  const calculateTotalSetScore = () => {
    const questions = scoreSettingsForm.getFieldValue('questions') || [];
    return questions.reduce((sum: number, q: {number: number; score: number}) => sum + (q.score || 0), 0);
  };
  
  // 表格列定义
  const examColumns = [
    {
      title: '考试标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Exam) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description && record.description.length > 50 
              ? `${record.description.substring(0, 50)}...` 
              : record.description || '暂无描述'
            }
          </Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={statusMap[status as keyof typeof statusMap]?.color}>
          {statusMap[status as keyof typeof statusMap]?.text}
        </Tag>
      ),
    },
    {
      title: '考试时间',
      key: 'examTime',
      width: 160,
      render: (_: any, record: Exam) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {dayjs(record.startTime).format('MM-DD HH:mm')}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            至 {dayjs(record.endTime).format('MM-DD HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '题目数',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      width: 70,
      render: (count: number) => (
        <Tag color="cyan">{count || 0}题</Tag>
      ),
    },
    {
      title: '参与人数',
      key: 'participants',
      width: 80,
      render: (_: any, record: Exam) => (
        <Tag color="green">{record.participants?.length || 0}人</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => dayjs(text).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Exam) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewExam(record)}
          >
            详情
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditExam(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleScoreSettings(record)}
            style={{ color: '#1890ff' }}
          >
            分值设置
          </Button>
          {record.status === 'draft' ? (
            <Popconfirm
              title="确定要发布这个考试吗？"
              onConfirm={() => onPublishExam(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                style={{ color: '#52c41a' }}
              >
                发布
              </Button>
            </Popconfirm>
          ) : record.status === 'published' ? (
            <Popconfirm
              title="确定要撤回这个考试吗？"
              onConfirm={() => onUnpublishExam(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<StopOutlined />}
                style={{ color: '#fa8c16' }}
              >
                撤回
              </Button>
            </Popconfirm>
          ) : null}
          {(record.status === 'draft' || record.status === 'published') && (
            <Popconfirm
              title="确定要删除这个考试吗？"
              description="删除后将无法恢复"
              onConfirm={() => onDeleteExam(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 处理创建考试
  const handleCreateExam = () => {
    openExamCreation();
  };

  // 处理编辑考试
  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamModalVisible(true);
    setUploadedFiles({
      questionFile: exam.questionFile,
      answerFile: exam.answerFile,
      answerSheetFile: exam.answerSheetFile
    });
    form.setFieldsValue({
      title: exam.title,
      description: exam.description,
      examTime: [dayjs(exam.startTime), dayjs(exam.endTime)],
      totalQuestions: exam.totalQuestions,
      duration: exam.duration,
      shouldPublish: exam.status === 'published',
      questionFile: exam.questionFile,
      answerFile: exam.answerFile,
      answerSheetFile: exam.answerSheetFile
    });
  };

  // 处理查看考试详情
  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam);
    setExamDetailVisible(true);
  };

  // 文件上传处理
  const handleFileUpload = async (file: File, type: 'question' | 'answer' | 'answerSheet') => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const uploadedFile = await onUploadFile(file, type);
      const fieldName = `${type}File` as 'questionFile' | 'answerFile' | 'answerSheetFile';
      
      // 更新表单和本地状态
      form.setFieldsValue({ [fieldName]: uploadedFile });
      setUploadedFiles(prev => ({ ...prev, [fieldName]: uploadedFile }));
      
      const typeNames = {
        question: '试题',
        answer: '答案',
        answerSheet: '答题卡'
      };
      
      message.success(`${typeNames[type]}文件上传成功`);
      return uploadedFile;
    } catch (error) {
      message.error('文件上传失败');
      throw error;
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };
  
  // 表单提交处理
  const handleExamSubmit = async (values: any) => {
    const examTime = values.examTime;
    const status: 'draft' | 'published' = values.shouldPublish ? 'published' : 'draft';
    
    const examData = {
      title: values.title,
      description: values.description,
      startTime: examTime[0].toISOString(),
      endTime: examTime[1].toISOString(),
      totalQuestions: values.totalQuestions,
      duration: values.duration,
      status,
      questionFile: values.questionFile,
      answerFile: values.answerFile,
      answerSheetFile: values.answerSheetFile
    };
    
    try {
      if (editingExam) {
        await onUpdateExam(editingExam.id, examData);
      } else {
        const createExamData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
          ...examData,
          participants: []
        };
        await onCreateExam(createExamData);
      }
      
      setExamModalVisible(false);
    } catch (error) {
      console.error('提交失败:', error);
      message.error('考试保存失败，请重试');
    }
  };
  
  // 删除上传的文件
  const handleDeleteFile = async (fieldName: 'questionFile' | 'answerFile' | 'answerSheetFile') => {
    const file = form.getFieldValue(fieldName);
    if (!file || !file.id) return;
    
    try {
      // 调用API删除文件
      await onDeleteFile(file.id);
      
      // 清除表单和本地状态
      form.setFieldsValue({ [fieldName]: undefined });
      setUploadedFiles(prev => ({ ...prev, [fieldName]: undefined }));
      
      const fileTypeMap = {
        questionFile: '试题',
        answerFile: '答案',
        answerSheetFile: '答题卡'
      };
      
      message.success(`${fileTypeMap[fieldName]}文件已删除`);
    } catch (error) {
      message.error('文件删除失败');
      console.error('文件删除失败:', error);
    }
  };

  // 处理分值设置
  const handleScoreSettings = (exam: Exam) => {
    setSelectedExam(exam);
    setScoreSettingsVisible(true);
  };

  // 设置分值：每题单独填写
  const handleSetQuestionScores = async (totalQuestions: number, defaultScore: number) => {
    if (!selectedExam) return;
    
    try {
      // 生成题目数组，每题单独设置分值
      const questions = Array.from({ length: totalQuestions }, (_, index) => ({
        number: index + 1,
        score: defaultScore
      }));
      
      await onSetQuestionScores(selectedExam.id, questions);
      message.success(`已为考试《${selectedExam.title}》设置${totalQuestions}道题目，每题${defaultScore}分`);
      setScoreSettingsVisible(false);
    } catch (error) {
      message.error('分值设置失败');
    }
  };

  // 过滤考试数据
  const getFilteredExams = () => {
    return exams.filter(exam => {
      return statusFilter === 'all' || exam.status === statusFilter;
    });
  };

  // 统计数据
  const examStats = {
    total: exams.length,
    draft: exams.filter(e => e.status === 'draft').length,
    published: exams.filter(e => e.status === 'published').length,
    ongoing: exams.filter(e => e.status === 'ongoing').length,
    completed: exams.filter(e => e.status === 'completed').length
  };

  return (
    <div>
      {/* 统计卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <Card size="small" style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {examStats.total}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>考试总数</Text>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#8c8c8c' }}>
            {examStats.draft}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>未发布</Text>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {examStats.published}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>已发布</Text>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>
            {examStats.ongoing}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>考试中</Text>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
            {examStats.completed}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>已结束</Text>
        </Card>
      </div>

      {/* 考试管理 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Title level={4}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              考试管理
            </Title>
            <Select
              placeholder="筛选状态"
              style={{ width: 120 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="draft">未发布</Select.Option>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="ongoing">考试中</Select.Option>
              <Select.Option value="grading">阅卷中</Select.Option>
              <Select.Option value="completed">已结束</Select.Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateExam}>
            创建考试
          </Button>
        </div>
        
        <div className="responsive-table-wrapper">
          <Table
            columns={examColumns}
            dataSource={getFilteredExams()}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="small"
            className="responsive-table"
            scroll={{ x: 720 }}
          />
        </div>
      </Card>

      {/* 创建/编辑考试模态框 */}
      <Modal
        title={editingExam ? '编辑考试' : '创建考试'}
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExamSubmit}
        >
          <Form.Item
            label="考试标题"
            name="title"
            rules={[
              { required: true, message: '请输入考试标题' },
              { min: 2, max: 100, message: '考试标题长度应在2-100个字符之间' }
            ]}
          >
            <Input placeholder="请输入考试标题" />
          </Form.Item>

          <Form.Item
            label="详细信息"
            name="description"
            rules={[
              { required: true, message: '请输入考试详细信息' },
              { min: 10, max: 1000, message: '详细信息长度应在10-1000个字符之间' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入考试的详细信息，包括考试内容、注意事项等"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="题目数量"
                name="totalQuestions"
                rules={[{ required: true, message: '请输入题目数量' }]}
              >
                <Input type="number" placeholder="请输入题目数量" min={1} max={200} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="考试时长（分钟）"
                name="duration"
                rules={[{ required: true, message: '请输入考试时长' }]}
              >
                <Input type="number" placeholder="请输入考试时长" min={30} max={600} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="考试时间"
            name="examTime"
            rules={[{ required: true, message: '请选择考试时间' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder={['开始时间', '结束时间']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* 文件上传区域 */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="试题文件" name="questionFile">
                <div>
                  <Upload
                    accept=".pdf,.doc,.docx"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleFileUpload(file, 'question');
                      return false;
                    }}
                  >
                    <Button 
                      icon={<CloudUploadOutlined />} 
                      loading={uploading.question}
                      block
                    >
                      上传试题文件
                    </Button>
                  </Upload>
                  {form.getFieldValue('questionFile') && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="success" style={{ fontSize: '12px' }}>
                          📄 {form.getFieldValue('questionFile').name}
                        </Text>
                        <Button 
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleDeleteFile('questionFile')}
                          style={{ marginLeft: 8, padding: '0 4px' }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="答案文件" name="answerFile">
                <div>
                  <Upload
                    accept=".pdf,.doc,.docx"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleFileUpload(file, 'answer');
                      return false;
                    }}
                  >
                    <Button 
                      icon={<CloudUploadOutlined />} 
                      loading={uploading.answer}
                      block
                    >
                      上传答案文件
                    </Button>
                  </Upload>
                  {form.getFieldValue('answerFile') && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="success" style={{ fontSize: '12px' }}>
                          📄 {form.getFieldValue('answerFile').name}
                        </Text>
                        <Button 
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleDeleteFile('answerFile')}
                          style={{ marginLeft: 8, padding: '0 4px' }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="答题卡文件" name="answerSheetFile">
                <div>
                  <Upload
                    accept=".pdf,.doc,.docx"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleFileUpload(file, 'answerSheet');
                      return false;
                    }}
                  >
                    <Button 
                      icon={<CloudUploadOutlined />} 
                      loading={uploading.answerSheet}
                      block
                    >
                      上传答题卡
                    </Button>
                  </Upload>
                  {form.getFieldValue('answerSheetFile') && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="success" style={{ fontSize: '12px' }}>
                          📄 {form.getFieldValue('answerSheetFile').name}
                        </Text>
                        <Button 
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleDeleteFile('answerSheetFile')}
                          style={{ marginLeft: 8, padding: '0 4px' }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="shouldPublish" valuePropName="checked">
            <Space>
              <Switch />
              <Text>创建后立即发布考试</Text>
            </Space>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setExamModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingExam ? '更新考试' : '创建考试'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 考试详情模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>考试详情</span>
            {selectedExam && (
              <Tag color={statusMap[selectedExam.status]?.color} style={{ marginLeft: 8 }}>
                {statusMap[selectedExam.status]?.text}
              </Tag>
            )}
          </div>
        }
        open={examDetailVisible}
        onCancel={() => setExamDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExamDetailVisible(false)}>
            关闭
          </Button>,
          selectedExam && (
            <Button 
              key="edit" 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                setExamDetailVisible(false);
                handleEditExam(selectedExam);
              }}
            >
              编辑考试
            </Button>
          )
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
                  <Text strong style={{ fontSize: '16px' }}>{selectedExam.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="考试时间" span={2}>
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {dayjs(selectedExam.startTime).format('YYYY年MM月DD日 HH:mm')} 
                      <Text type="secondary"> 至 </Text>
                      {dayjs(selectedExam.endTime).format('MM月DD日 HH:mm')}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="考试时长">
                  <Tag color="blue" icon="⏱️">{selectedExam.duration || 0} 分钟</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="题目数量">
                  <Tag color="cyan" icon="📝">{selectedExam.totalQuestions || 0} 题</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="参与人数">
                  <Tag color="green" icon="👥">{selectedExam.participants?.length || 0} 人</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="考试状态">
                  <Tag color={statusMap[selectedExam.status]?.color}>
                    {statusMap[selectedExam.status]?.text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 详细描述 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                📄 详细信息
              </Title>
              <Paragraph style={{ 
                background: '#fafafa', 
                padding: '12px', 
                borderRadius: '6px',
                margin: 0,
                minHeight: '60px'
              }}>
                {selectedExam.description || '暂无详细信息'}
              </Paragraph>
            </Card>

            {/* 考试文件 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                📁 考试文件
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
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
                      <Text strong>试题文件</Text>
                      {selectedExam.questionFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.questionFile.name}
                          </Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            style={{ padding: '4px 0' }}
                          >
                            下载文件
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>未上传</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center',
                      border: selectedExam.answerFile ? '1px solid #d9f7be' : '1px solid #f0f0f0',
                      background: selectedExam.answerFile ? '#f6ffed' : '#fafafa'
                    }}
                  >
                    <FileTextOutlined 
                      style={{ 
                        fontSize: 32, 
                        color: selectedExam.answerFile ? '#52c41a' : '#d9d9d9',
                        marginBottom: 8
                      }} 
                    />
                    <div>
                      <Text strong>答案文件</Text>
                      {selectedExam.answerFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.answerFile.name}
                          </Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            style={{ padding: '4px 0' }}
                          >
                            下载文件
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>未上传</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
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
                      <Text strong>答题卡文件</Text>
                      {selectedExam.answerSheetFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.answerSheetFile.name}
                          </Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            style={{ padding: '4px 0' }}
                          >
                            下载文件
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>未上传</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* 时间信息 */}
            <Card size="small">
              <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                🕐 时间记录
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>创建时间</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>{dayjs(selectedExam.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f0f2ff', borderRadius: '6px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>最后更新</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>{dayjs(selectedExam.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      {/* 分值设置模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>题目分值设置</span>
            {selectedExam && (
              <Text type="secondary" style={{ marginLeft: 16, fontSize: '14px' }}>
                - {selectedExam.title}
              </Text>
            )}
          </div>
        }
        open={scoreSettingsVisible}
        onCancel={() => setScoreSettingsVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedExam && (
          <div>
            <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
              <Text type="secondary">
                💡 简化流程：输入题目总数和每题分值，无需填写题干内容，题目均已包含在试题文件中
              </Text>
            </Card>
            
            <Form
              layout="vertical"
              onFinish={(values) => handleSetQuestionScores(values.totalQuestions, values.defaultScore)}
              initialValues={{ defaultScore: 5, totalQuestions: selectedExam.totalQuestions }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="题目总数"
                    name="totalQuestions"
                    rules={[
                      { required: true, message: '请输入题目总数' },
                      { type: 'number', min: 1, max: 200, message: '题目数量应在1-200之间' }
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={200}
                      placeholder="例如：20"
                      style={{ width: '100%' }}
                      addonAfter="题"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="每题分值"
                    name="defaultScore"
                    rules={[
                      { required: true, message: '请输入每题分值' },
                      { type: 'number', min: 0.5, max: 50, message: '分值应在0.5-50之间' }
                    ]}
                  >
                    <InputNumber
                      min={0.5}
                      max={50}
                      step={0.5}
                      placeholder="例如：5"
                      style={{ width: '100%' }}
                      addonAfter="分"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                <Space>
                  <Button onClick={() => setScoreSettingsVisible(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    设置分值
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 三步创建考试的模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PlusOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>创建新考试</span>
          </div>
        }
        open={examCreationVisible}
        onCancel={closeExamCreation}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ marginBottom: 24 }}>
          <Steps current={currentStep} onChange={handleStepChange}>
            <Step title="基本信息" description="设置考试基本信息" />
            <Step title="分值设置" description="设置各题分数" />
            <Step title="发布设置" description="选择是否立即发布" />
          </Steps>
        </div>

        {/* 步骤1: 基本信息 */}
        {currentStep === ExamCreationStepEnum.BasicInfo && (
          <Form
            form={basicInfoForm}
            layout="vertical"
            requiredMark="optional"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="考试标题"
                  rules={[{ required: true, message: '请输入考试标题' }]}
                >
                  <Input placeholder="请输入考试标题" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="考试描述"
                  rules={[{ required: true, message: '请输入考试描述' }]}
                >
                  <TextArea rows={4} placeholder="请输入考试描述" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="totalQuestions"
                  label="题目数量"
                  rules={[{ required: true, message: '请输入题目数量' }]}
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="请输入题目数量" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalScore"
                  label="总分值"
                  rules={[{ required: true, message: '请输入总分值' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入总分值" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="duration"
                  label="考试时长(分钟)"
                  rules={[{ required: true, message: '请输入考试时长' }]}
                >
                  <InputNumber min={1} max={600} style={{ width: '100%' }} placeholder="请输入考试时长（分钟）" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="examTime"
                  label="考试时间段"
                  rules={[{ required: true, message: '请选择考试时间段' }]}
                >
                  <RangePicker 
                    showTime 
                    format="YYYY-MM-DD HH:mm:ss" 
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button type="primary" onClick={() => handleStepChange(currentStep + 1)}>
                下一步
              </Button>
            </div>
          </Form>
        )}

        {/* 步骤2: 分值设置 */}
        {currentStep === ExamCreationStepEnum.ScoreSettings && (
          <Form
            form={scoreSettingsForm}
            layout="vertical"
            requiredMark="optional"
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>题目分值设置</Title>
              <div>
                <Text>总分: </Text>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {calculateTotalSetScore()} / {basicInfoForm.getFieldValue('totalScore')}
                </Text>
              </div>
            </div>

            <Form.List name="questions">
              {(fields) => (
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 10px' }}>
                  {fields.map((field, index) => (
                    <Row key={field.key} gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={4}>
                        <Text strong>第 {index + 1} 题</Text>
                      </Col>
                      <Col span={20}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'score']}
                          rules={[{ required: true, message: '请输入分值' }]}
                        >
                          <InputNumber
                            min={0}
                            step={0.5}
                            style={{ width: '100%' }}
                            placeholder="分值"
                            onChange={(value) => handleScoreChange(value, index)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button onClick={() => setCurrentStep(ExamCreationStepEnum.BasicInfo)}>
                上一步
              </Button>
              <Button type="primary" onClick={() => handleStepChange(currentStep + 1)}>
                下一步
              </Button>
            </div>
          </Form>
        )}

        {/* 步骤3: 发布设置 */}
        {currentStep === ExamCreationStepEnum.PublishSettings && (
          <Form
            form={publishSettingsForm}
            layout="vertical"
            requiredMark="optional"
          >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Title level={4} style={{ marginBottom: 24 }}>考试创建完成!</Title>
              <Paragraph>
                您已成功设置了考试的基本信息和题目分值。现在，您可以选择是否要立即发布这个考试。
              </Paragraph>
              
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', margin: '24px 0', textAlign: 'left' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="考试标题" span={2}>
                    {basicInfoForm.getFieldValue('title')}
                  </Descriptions.Item>
                  <Descriptions.Item label="考试时间" span={2}>
                    {basicInfoForm.getFieldValue('examTime')?.[0]?.format('YYYY-MM-DD HH:mm:ss')} 至 {basicInfoForm.getFieldValue('examTime')?.[1]?.format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="题目数量">
                    {basicInfoForm.getFieldValue('totalQuestions')} 题
                  </Descriptions.Item>
                  <Descriptions.Item label="总分值">
                    {calculateTotalSetScore()} 分
                  </Descriptions.Item>
                  <Descriptions.Item label="考试时长">
                    {basicInfoForm.getFieldValue('duration')} 分钟
                  </Descriptions.Item>
                </Descriptions>
              </div>
              
              <Form.Item
                name="shouldPublish"
                valuePropName="checked"
              >
                <Switch checkedChildren="立即发布" unCheckedChildren="保存为草稿" />
              </Form.Item>
              <Text type="secondary">
                {publishSettingsForm.getFieldValue('shouldPublish') 
                  ? '考试将被立即发布，学生将能够看到并参加考试。' 
                  : '考试将被保存为草稿，您可以稍后再发布。'}
              </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button onClick={() => setCurrentStep(ExamCreationStepEnum.ScoreSettings)}>
                上一步
              </Button>
              <Button type="primary" onClick={handleExamCreationSubmit}>
                完成创建
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ExamManagement;