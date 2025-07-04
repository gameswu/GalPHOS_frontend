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
  Steps,
  Divider,
  Dropdown,
  Menu
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
  SettingOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Exam, ExamFile } from '../../../types/common';
import { 
  ExamCreationStepEnum,
  ExamBasicInfoForm, 
  ExamScoreSettingsForm, 
  ExamPublishSettingsForm 
} from '../../../types/exam';
import { CreateExamRequest, ensureISOString, validateTimeRange } from '../../../types/api';
import '../../../styles/responsive.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Step } = Steps;


// 分值计算辅助函数
const calculateTotalSetScore = (form: any): number => {
  const questionsData = form.getFieldsValue();
  const totalQuestions = questionsData.questionCount || 0;
  const scorePerQuestion = questionsData.defaultScore || 0;
  const total = totalQuestions * scorePerQuestion;
  return Math.round(total * 10) / 10; // 保留一位小数
};

const calculateEditTotalSetScore = (questions: { number: number; score: number }[]): number => {
  const total = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  return Math.round(total * 10) / 10; // 保留一位小数
};

// 分值输入变化处理
const handleScoreChange = (value: number | null, form: any, setTotalScore: (score: number) => void) => {
  if (value !== null) {
    const roundedValue = Math.round(value * 10) / 10;
    setTotalScore(calculateTotalSetScore(form));
  }
};

const handleEditScoreChange = (questions: { number: number; score: number }[], setTotalScore: (score: number) => void) => {
  const validQuestions = questions.map(q => ({
    ...q,
    score: Math.round((q.score || 0) * 10) / 10
  }));
  setTotalScore(calculateEditTotalSetScore(validQuestions));
};

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
      message.success(`分值设置成功！共${questionScores.length}道题，总分${totalScore.toFixed(1)}分`);
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
                    precision={1}
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
                    precision={1}
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
                总题数：{questionScores.length} 题，总分：{questionScores.reduce((sum, q) => sum + q.score, 0).toFixed(1)} 分
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
  onUploadFile: (file: File, type: 'question' | 'answer' | 'answerSheet', examId?: string) => Promise<ExamFile>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onSetQuestionScores: (examId: string, questions: { number: number; score: number }[]) => Promise<any>;
  onGetQuestionScores: (examId: string) => Promise<any>;
  onUpdateSingleQuestionScore: (examId: string, questionNumber: number, score: number) => Promise<any>;
  onReserveExamId: () => Promise<string>;
  onDeleteReservedExamId: (examId: string) => Promise<void>;
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
  onUpdateSingleQuestionScore,
  onReserveExamId,
  onDeleteReservedExamId
}) => {
  const [form] = Form.useForm();
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [examDetailVisible, setExamDetailVisible] = useState(false);
  const [scoreSettingsVisible, setScoreSettingsVisible] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('basicInfo');
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
  
  // 编辑考试状态 - 使用与创建考试相同的表单结构
  const [editCurrentStep, setEditCurrentStep] = useState<ExamCreationStepEnum>(ExamCreationStepEnum.BasicInfo);
  const [editBasicInfoForm] = Form.useForm<ExamBasicInfoForm>();
  const [editScoreSettingsForm] = Form.useForm<ExamScoreSettingsForm>();
  const [editPublishSettingsForm] = Form.useForm<ExamPublishSettingsForm>();
  const [editGeneratedQuestions, setEditGeneratedQuestions] = useState<{number: number; score: number}[]>([]);

  // 预获取ID相关状态
  const [reservedExamId, setReservedExamId] = useState<string | null>(null);
  const [reservingId, setReservingId] = useState(false);

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

  // 编辑考试步骤变更处理函数
  const handleEditStepChange = (step: number) => {
    if (step < editCurrentStep) {
      setEditCurrentStep(step as ExamCreationStepEnum);
      return;
    }

    if (editCurrentStep === ExamCreationStepEnum.BasicInfo) {
      editBasicInfoForm.validateFields().then(values => {
        // 创建题目数量的空数组或使用现有分值设置
        const questions = editGeneratedQuestions.length > 0 
          ? editGeneratedQuestions
          : Array.from({ length: values.totalQuestions }, (_, idx) => ({
              number: idx + 1,
              score: Math.round(values.totalScore / values.totalQuestions * 10) / 10
            }));
        setEditGeneratedQuestions(questions);
        editScoreSettingsForm.setFieldsValue({ questions });
        setEditCurrentStep(ExamCreationStepEnum.ScoreSettings);
      }).catch(err => {
        console.error('表单验证失败:', err);
      });
    } else if (editCurrentStep === ExamCreationStepEnum.ScoreSettings) {
      editScoreSettingsForm.validateFields().then(() => {
        // 设置当前发布状态
        editPublishSettingsForm.setFieldsValue({ 
          shouldPublish: editingExam?.status === 'published' 
        });
        setEditCurrentStep(ExamCreationStepEnum.PublishSettings);
      }).catch(err => {
        console.error('分值设置验证失败:', err);
      });
    }
  };

  // 打开创建考试模态框
  const openExamCreation = async () => {
    setCurrentStep(ExamCreationStepEnum.BasicInfo);
    basicInfoForm.resetFields();
    scoreSettingsForm.resetFields();
    publishSettingsForm.resetFields();
    setGeneratedQuestions([]);
    // 重置上传文件状态
    setUploadedFiles({});
    
    // 预获取考试ID
    try {
      setReservingId(true);
      const id = await onReserveExamId();
      setReservedExamId(id);
      message.success('已预分配考试ID');
    } catch (error) {
      console.error('预获取考试ID失败:', error);
      message.error('预获取考试ID失败');
      return;
    } finally {
      setReservingId(false);
    }
    
    setExamCreationVisible(true);
  };

  // 关闭创建考试模态框
  const closeExamCreation = async () => {
    // 如果有预获取的ID且未完成创建，则删除预获取的ID
    if (reservedExamId) {
      try {
        await onDeleteReservedExamId(reservedExamId);
        setReservedExamId(null);
        message.info('已取消预分配的考试ID');
      } catch (error) {
        console.error('删除预获取ID失败:', error);
        // 不显示错误信息，避免打扰用户
      }
    }
    setExamCreationVisible(false);
  };

  // 创建考试提交处理
  const handleExamCreationSubmit = async () => {
    try {
      const basicInfo = await basicInfoForm.validateFields();
      const scoreSettings = await scoreSettingsForm.validateFields();
      const publishSettings = await publishSettingsForm.validateFields();
      
      // 验证考试时间
      const timeValidation = validateTimeRange(basicInfo.examTime[0], basicInfo.examTime[1]);
      if (!timeValidation.isValid) {
        message.error(timeValidation.message);
        return;
      }
      
      // 确保使用正确的ISO日期格式（包含时区信息）
      let startTime: string, endTime: string;
      try {
        startTime = ensureISOString(basicInfo.examTime[0]);
        endTime = ensureISOString(basicInfo.examTime[1]);
        console.log('考试时间ISO格式（含时区）:', { startTime, endTime });
      } catch (error) {
        console.error('时间格式转换失败:', error);
        message.error('时间格式转换失败，请重新选择考试时间');
        return;
      }
      
      const examRequest: CreateExamRequest = {
        title: basicInfo.title,
        description: basicInfo.description, // 表单验证确保不为空
        totalQuestions: basicInfo.totalQuestions,
        totalScore: basicInfo.totalScore,
        duration: basicInfo.duration,
        startTime: startTime,
        endTime: endTime,
        questions: scoreSettings.questions.map(q => ({ number: q.number, score: q.score })),
        status: publishSettings.shouldPublish ? 'published' : 'draft'
      };
      
      // 创建考试基本信息
      const examId = await onCreateExam({
        ...examRequest,
        participants: []
      });
      
      // 上传相关文件
      try {
        // 上传考试文件
        if (uploadedFiles.questionFile) {
          console.log('关联试题文件到考试:', uploadedFiles.questionFile);
          // 此处需要API支持关联文件到考试ID
        }
        
        if (uploadedFiles.answerFile) {
          console.log('关联答案文件到考试:', uploadedFiles.answerFile);
          // 此处需要API支持关联文件到考试ID
        }
        
        if (uploadedFiles.answerSheetFile) {
          console.log('关联答题卡文件到考试:', uploadedFiles.answerSheetFile);
          // 此处需要API支持关联文件到考试ID
        }
      } catch (fileError) {
        console.error('文件关联失败:', fileError);
        message.warning('考试创建成功，但部分文件关联失败，请在编辑考试中重新上传');
      }
      
      message.success('考试创建成功');
      
      // 清除预获取的ID状态（创建成功后不需要删除服务器端ID）
      setReservedExamId(null);
      
      closeExamCreation();
    } catch (error) {
      console.error('创建考试失败:', error);
      message.error('创建考试失败，请检查表单数据');
    }
  };

  // 编辑考试提交处理
  const handleEditExamSubmit = async () => {
    try {
      const basicInfo = await editBasicInfoForm.validateFields();
      const scoreSettings = await editScoreSettingsForm.validateFields();
      const publishSettings = await editPublishSettingsForm.validateFields();
      
      if (!editingExam) {
        message.error('未找到要编辑的考试');
        return;
      }
      
      // 验证考试时间
      const timeValidation = validateTimeRange(basicInfo.examTime[0], basicInfo.examTime[1]);
      if (!timeValidation.isValid) {
        message.error(timeValidation.message);
        return;
      }
      
      // 确保使用正确的ISO日期格式（包含时区信息）
      let startTime: string, endTime: string;
      try {
        startTime = ensureISOString(basicInfo.examTime[0]);
        endTime = ensureISOString(basicInfo.examTime[1]);
        console.log('编辑考试时间ISO格式（含时区）:', { startTime, endTime });
      } catch (error) {
        console.error('时间格式转换失败:', error);
        message.error('时间格式转换失败，请重新选择考试时间');
        return;
      }
      
      const status: 'draft' | 'published' = publishSettings.shouldPublish ? 'published' : 'draft';
      
      const examData = {
        title: basicInfo.title,
        description: basicInfo.description,
        totalQuestions: basicInfo.totalQuestions,
        maxScore: basicInfo.totalScore, // 使用 maxScore 字段
        duration: basicInfo.duration,
        startTime: startTime,
        endTime: endTime,
        status: status,
        questionFile: uploadedFiles.questionFile,
        answerFile: uploadedFiles.answerFile,
        answerSheetFile: uploadedFiles.answerSheetFile
      };
      
      // 更新考试基本信息
      await onUpdateExam(editingExam.id, examData);
      
      // 设置题目分值
      if (scoreSettings.questions && scoreSettings.questions.length > 0) {
        try {
          await onSetQuestionScores(editingExam.id, scoreSettings.questions);
          console.log('分值设置成功');
        } catch (scoreError) {
          console.error('分值设置失败:', scoreError);
          message.warning('考试更新成功，但分值设置失败，请重新设置');
        }
      }
      
      message.success('考试更新成功');
      setExamModalVisible(false);
      
      // 重置编辑状态
      setEditingExam(null);
      setEditCurrentStep(ExamCreationStepEnum.BasicInfo);
      setEditGeneratedQuestions([]);
      
    } catch (error) {
      console.error('更新考试失败:', error);
      message.error('更新考试失败，请检查表单数据');
    }
  };

  // 分数输入变化处理函数
  const handleScoreChange = (value: number | null, index: number) => {
    const questions = scoreSettingsForm.getFieldValue('questions');
    if (questions && value !== null) {
      questions[index].score = value;
      scoreSettingsForm.setFieldsValue({ questions });
      
      // 计算总分
      const totalScore = questions.reduce((sum: number, q: {number: number; score: number}) => sum + (q.score || 0), 0);
      // 更新基本信息中的总分，保留一位小数
      basicInfoForm.setFieldValue('totalScore', Math.round(totalScore * 10) / 10);
    }
  };

  // 计算当前设置分数的总和
  const calculateTotalSetScore = () => {
    const questions = scoreSettingsForm.getFieldValue('questions') || [];
    const total = questions.reduce((sum: number, q: {number: number; score: number}) => sum + (q.score || 0), 0);
    return Math.round(total * 10) / 10; // 保留一位小数
  };
  
  // 计算编辑模式下当前设置分数的总和
  const calculateEditTotalSetScore = () => {
    const questions = editScoreSettingsForm.getFieldValue('questions') || [];
    const total = questions.reduce((sum: number, q: {number: number; score: number}) => sum + (q.score || 0), 0);
    return Math.round(total * 10) / 10; // 保留一位小数
  };
  
  // 编辑模式下分数输入变化处理
  const handleEditScoreChange = (value: number | null, index: number) => {
    const questions = editScoreSettingsForm.getFieldValue('questions');
    if (questions && value !== null) {
      questions[index].score = value;
      editScoreSettingsForm.setFieldsValue({ questions });
      
      // 计算总分
      const totalScore = questions.reduce((sum: number, q: {number: number; score: number}) => sum + (q.score || 0), 0);
      // 更新基本信息中的总分，保留一位小数
      editBasicInfoForm.setFieldValue('totalScore', Math.round(totalScore * 10) / 10);
    }
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
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Exam) => (
        <Space size={4}>
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
            onClick={() => handleEditExam(record, true)}
          >
            编辑
          </Button>
          {record.status === 'draft' ? (
            <Popconfirm
              title="发布考试"
              description="确定要发布这个考试吗？"
              onConfirm={() => onPublishExam(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                style={{ color: '#52c41a' }}
              />
            </Popconfirm>
          ) : record.status === 'published' ? (
            <Popconfirm
              title="撤回考试"
              description="确定要撤回这个考试吗？"
              onConfirm={() => onUnpublishExam(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<StopOutlined />}
                style={{ color: '#fa8c16' }}
              />
            </Popconfirm>
          ) : null}
          {(record.status === 'draft' || record.status === 'published') && (
            <Popconfirm
              title="删除考试"
              description="删除后将无法恢复，确定要删除吗？"
              onConfirm={() => onDeleteExam(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
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
  const handleEditExam = (exam: Exam, showScoreSettings = false) => {
    setEditingExam(exam);
    setSelectedExam(exam);
    
    // 重置编辑步骤和表单
    setEditCurrentStep(showScoreSettings ? ExamCreationStepEnum.ScoreSettings : ExamCreationStepEnum.BasicInfo);
    
    // 设置基本信息表单
    editBasicInfoForm.setFieldsValue({
      title: exam.title,
      description: exam.description,
      examTime: [dayjs(exam.startTime), dayjs(exam.endTime)],
      totalQuestions: exam.totalQuestions,
      totalScore: exam.maxScore || 100, // 使用 maxScore 或默认值
      duration: exam.duration
    });
    
    // 设置发布状态表单
    editPublishSettingsForm.setFieldsValue({
      shouldPublish: exam.status === 'published'
    });
    
    // 设置上传文件状态
    setUploadedFiles({
      questionFile: exam.questionFile,
      answerFile: exam.answerFile,
      answerSheetFile: exam.answerSheetFile
    });
    
    // 加载或初始化分值设置
    if (exam.totalQuestions && exam.totalQuestions > 0) {
      // 这里可以调用API获取实际的分值设置，现在先用默认值
      const totalQuestions = exam.totalQuestions || 1; // 确保不为undefined
      const questions = Array.from({ length: totalQuestions }, (_, idx) => ({
        number: idx + 1,
        score: Math.round((exam.maxScore || 100) / totalQuestions * 10) / 10
      }));
      setEditGeneratedQuestions(questions);
      editScoreSettingsForm.setFieldsValue({ questions });
    }
    
    setExamModalVisible(true);
  };

  // 处理查看考试详情
  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam);
    setExamDetailVisible(true);
  };

  // 文件上传处理
  const handleFileUpload = async (file: File, type: 'question' | 'answer' | 'answerSheet', examId?: string) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      // 在创建考试时使用预申请的ID，在编辑考试时使用现有的考试ID
      const uploadExamId = examId || reservedExamId || (editingExam?.id);
      const uploadedFile = await onUploadFile(file, type, uploadExamId);
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
    
    // 验证考试时间
    const timeValidation = validateTimeRange(examTime[0], examTime[1]);
    if (!timeValidation.isValid) {
      message.error(timeValidation.message);
      return;
    }
    
    let startTimeISO: string, endTimeISO: string;
    try {
      startTimeISO = ensureISOString(examTime[0]);
      endTimeISO = ensureISOString(examTime[1]);
    } catch (error) {
      console.error('时间格式转换失败:', error);
      message.error('时间格式转换失败，请重新选择考试时间');
      return;
    }
    
    const examData = {
      title: values.title,
      description: values.description,
      startTime: startTimeISO,
      endTime: endTimeISO,
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
      message.success(`已为考试《${selectedExam.title}》设置${totalQuestions}道题目，每题${defaultScore.toFixed(1)}分`);
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
            scroll={{ x: 800 }}
          />
        </div>
      </Card>

      {/* 创建考试三步模态框 */}
      <Modal
        title="创建考试"
        open={examCreationVisible}
        onCancel={closeExamCreation}
        footer={null}
        width={800}
      >
        <div>
          <Steps
            current={currentStep}
            onChange={handleStepChange}
            style={{ marginBottom: 24 }}
          >
            <Step title="基本信息" description="填写考试基本信息" />
            <Step title="分值设置" description="设置题目分数" />
            <Step title="发布设置" description="设置发布状态" />
          </Steps>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.BasicInfo ? 'block' : 'none' }}>
            <Form
              form={basicInfoForm}
              layout="vertical"
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
                    initialValue={20}
                  >
                    <InputNumber
                      min={1}
                      max={200}
                      style={{ width: '100%' }}
                      placeholder="请输入题目数量"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="总分值"
                    name="totalScore"
                    rules={[{ required: true, message: '请输入考试总分值' }]}
                    initialValue={100}
                  >
                    <InputNumber
                      min={10}
                      max={1000}
                      style={{ width: '100%' }}
                      placeholder="请输入考试总分值"
                      precision={1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="考试时长（分钟）"
                    name="duration"
                    rules={[{ required: true, message: '请输入考试时长' }]}
                    initialValue={120}
                  >
                    <InputNumber
                      min={30}
                      max={600}
                      style={{ width: '100%' }}
                      placeholder="请输入考试时长（分钟）"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="考试时间"
                    name="examTime"
                    rules={[
                      { required: true, message: '请选择考试时间' },
                      {
                        validator: (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.reject(new Error('请选择完整的考试时间段'));
                          }
                          const timeValidation = validateTimeRange(value[0], value[1]);
                          if (!timeValidation.isValid) {
                            return Promise.reject(new Error(timeValidation.message));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['开始时间', '结束时间']}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 文件上传区域 */}
              <Divider orientation="left">考试文件</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="试题文件">
                    <div>
                      {uploadedFiles.questionFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                                                           {uploadedFiles.questionFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.questionFile?.id) {
                                  onDeleteFile(uploadedFiles.questionFile.id);
                                  setUploadedFiles(prev => ({ ...prev, questionFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'question').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, questionFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答案文件">
                    <div>
                      {uploadedFiles.answerFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerFile?.id) {
                                  onDeleteFile(uploadedFiles.answerFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answer').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答题卡文件">
                    <div>
                      {uploadedFiles.answerSheetFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerSheetFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerSheetFile?.id) {
                                  onDeleteFile(uploadedFiles.answerSheetFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerSheetFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answerSheet').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerSheetFile: uploadedFile }));
                            });
                            return false;
                          }}
                        >
                          <Button 
                            icon={<CloudUploadOutlined />} 
                            loading={uploading.answerSheet}
                            block
                          >
                            上传答题卡文件
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={closeExamCreation}>取消</Button>
                <Button type="primary" onClick={() => handleStepChange(ExamCreationStepEnum.ScoreSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.ScoreSettings ? 'block' : 'none' }}>
            <Form
              form={scoreSettingsForm}
              layout="vertical"
              initialValues={{ questions: generatedQuestions }}
            >
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
                <Text type="secondary">
                  💡 提示：可以调整每道题的分值，总分应与基本信息中设置的总分保持一致
                </Text>
              </Card>
              
              <Form.List name="questions">
                {(fields) => (
                  <>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 10px' }}>
                      {fields.map(({ key, name }) => (
                        <Row key={key} gutter={16} style={{ marginBottom: 8, alignItems: 'center' }}>
                          <Col span={8}>
                            <Text>第 {name + 1} 题</Text>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              name={[name, 'score']}
                              noStyle
                            >
                              <InputNumber
                                min={0.5}
                                max={100}
                                step={0.5}
                                onChange={(value) => handleScoreChange(value, name)}
                                addonAfter="分"
                                style={{ width: '100%' }}
                                precision={1}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: 16, padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
                      <Text strong>
                        总题数：{scoreSettingsForm.getFieldValue('questions')?.length || 0} 题，
                        总分：{calculateTotalSetScore().toFixed(1)} 分，
                        基本信息设置总分：{(basicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分
                      </Text>
                    </div>
                  </>
                )}
              </Form.List>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(ExamCreationStepEnum.BasicInfo)}>上一步</Button>
                <Button type="primary" onClick={() => handleStepChange(ExamCreationStepEnum.PublishSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.PublishSettings ? 'block' : 'none' }}>
            <Form
              form={publishSettingsForm}
              layout="vertical"
              initialValues={{ shouldPublish: false }}
            >
              <Card size="small" style={{ marginBottom: 16, background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Text>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  考试创建完成后，您可以选择立即发布或保存为草稿。发布后，学生将能够看到此考试。
                </Text>
              </Card>
              
              <Form.Item name="shouldPublish" valuePropName="checked">
                <Switch checkedChildren="发布" unCheckedChildren="草稿" />
                <Text style={{ marginLeft: 8 }}>
                  创建后立即发布考试
                </Text>
              </Form.Item>
              
              <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                <Title level={5}>考试信息确认</Title>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="考试标题">{basicInfoForm.getFieldValue('title')}</Descriptions.Item>
                  <Descriptions.Item label="详细信息">{basicInfoForm.getFieldValue('description')}</Descriptions.Item>
                  <Descriptions.Item label="题目数量">{basicInfoForm.getFieldValue('totalQuestions')} 题</Descriptions.Item>
                  <Descriptions.Item label="总分值">{(basicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分</Descriptions.Item>
                  <Descriptions.Item label="考试时长">{basicInfoForm.getFieldValue('duration')} 分钟</Descriptions.Item>
                  <Descriptions.Item label="考试时间">
                    {basicInfoForm.getFieldValue('examTime') ? 
                      `${dayjs(basicInfoForm.getFieldValue('examTime')[0]).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(basicInfoForm.getFieldValue('examTime')[1]).format('YYYY-MM-DD HH:mm')}` :
                      '未设置'}
                  </Descriptions.Item>
                  <Descriptions.Item label="考试文件">
                    {uploadedFiles.questionFile ? <Tag color="success">已上传试题</Tag> : <Tag color="warning">未上传试题</Tag>}
                    {uploadedFiles.answerFile ? <Tag color="success">已上传答案</Tag> : <Tag color="warning">未上传答案</Tag>}
                    {uploadedFiles.answerSheetFile ? <Tag color="success">已上传答题卡</Tag> : <Tag color="warning">未上传答题卡</Tag>}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(ExamCreationStepEnum.ScoreSettings)}>上一步</Button>
                <Button type="primary" onClick={handleExamCreationSubmit} loading={loading}>
                  创建考试
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* 编辑考试模态框 - 三步流程 */}
      <Modal
        title="编辑考试"
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <Steps
            current={editCurrentStep}
            onChange={handleEditStepChange}
            style={{ marginBottom: 24 }}
          >
            <Step title="基本信息" description="编辑考试基本信息" />
            <Step title="分值设置" description="设置题目分数" />
            <Step title="发布设置" description="设置发布状态" />
          </Steps>
          
          <div style={{ display: editCurrentStep === ExamCreationStepEnum.BasicInfo ? 'block' : 'none' }}>
            <Form
              form={editBasicInfoForm}
              layout="vertical"
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
                    <InputNumber
                      min={1}
                      max={200}
                      style={{ width: '100%' }}
                      placeholder="请输入题目数量"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="总分值"
                    name="totalScore"
                    rules={[{ required: true, message: '请输入考试总分值' }]}
                  >
                    <InputNumber
                      min={10}
                      max={1000}
                      style={{ width: '100%' }}
                      placeholder="请输入考试总分值"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="考试时长（分钟）"
                    name="duration"
                    rules={[{ required: true, message: '请输入考试时长' }]}
                  >
                    <InputNumber
                      min={30}
                      max={600}
                      style={{ width: '100%' }}
                      placeholder="请输入考试时长（分钟）"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="考试时间"
                    name="examTime"
                    rules={[
                      { required: true, message: '请选择考试时间' },
                      {
                        validator: (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.reject(new Error('请选择完整的考试时间段'));
                          }
                          const timeValidation = validateTimeRange(value[0], value[1]);
                          if (!timeValidation.isValid) {
                            return Promise.reject(new Error(timeValidation.message));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['开始时间', '结束时间']}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 文件上传区域 */}
              <Divider orientation="left">考试文件</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="试题文件">
                    <div>
                      {uploadedFiles.questionFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                                                           {uploadedFiles.questionFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.questionFile?.id) {
                                  onDeleteFile(uploadedFiles.questionFile.id);
                                  setUploadedFiles(prev => ({ ...prev, questionFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'question').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, questionFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答案文件">
                    <div>
                      {uploadedFiles.answerFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerFile?.id) {
                                  onDeleteFile(uploadedFiles.answerFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answer').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答题卡文件">
                    <div>
                      {uploadedFiles.answerSheetFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerSheetFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerSheetFile?.id) {
                                  onDeleteFile(uploadedFiles.answerSheetFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerSheetFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answerSheet').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerSheetFile: uploadedFile }));
                            });
                            return false;
                          }}
                        >
                          <Button 
                            icon={<CloudUploadOutlined />} 
                            loading={uploading.answerSheet}
                            block
                          >
                            上传答题卡文件
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={closeExamCreation}>取消</Button>
                <Button type="primary" onClick={() => handleStepChange(ExamCreationStepEnum.ScoreSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.ScoreSettings ? 'block' : 'none' }}>
            <Form
              form={scoreSettingsForm}
              layout="vertical"
              initialValues={{ questions: generatedQuestions }}
            >
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
                <Text type="secondary">
                  💡 提示：可以调整每道题的分值，总分应与基本信息中设置的总分保持一致
                </Text>
              </Card>
              
              <Form.List name="questions">
                {(fields) => (
                  <>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 10px' }}>
                      {fields.map(({ key, name }) => (
                        <Row key={key} gutter={16} style={{ marginBottom: 8, alignItems: 'center' }}>
                          <Col span={8}>
                            <Text>第 {name + 1} 题</Text>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              name={[name, 'score']}
                              noStyle
                            >
                              <InputNumber
                                min={0.5}
                                max={100}
                                step={0.5}
                                onChange={(value) => handleScoreChange(value, name)}
                                addonAfter="分"
                                style={{ width: '100%' }}
                                precision={1}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: 16, padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
                      <Text strong>
                        总题数：{scoreSettingsForm.getFieldValue('questions')?.length || 0} 题，
                        总分：{calculateTotalSetScore().toFixed(1)} 分，
                        基本信息设置总分：{(basicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分
                      </Text>
                    </div>
                  </>
                )}
              </Form.List>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(ExamCreationStepEnum.BasicInfo)}>上一步</Button>
                <Button type="primary" onClick={() => handleStepChange(ExamCreationStepEnum.PublishSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.PublishSettings ? 'block' : 'none' }}>
            <Form
              form={publishSettingsForm}
              layout="vertical"
              initialValues={{ shouldPublish: false }}
            >
              <Card size="small" style={{ marginBottom: 16, background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Text>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  考试创建完成后，您可以选择立即发布或保存为草稿。发布后，学生将能够看到此考试。
                </Text>
              </Card>
              
              <Form.Item name="shouldPublish" valuePropName="checked">
                <Switch checkedChildren="发布" unCheckedChildren="草稿" />
                <Text style={{ marginLeft: 8 }}>
                  创建后立即发布考试
                </Text>
              </Form.Item>
              
              <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                <Title level={5}>考试信息确认</Title>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="考试标题">{basicInfoForm.getFieldValue('title')}</Descriptions.Item>
                  <Descriptions.Item label="详细信息">{basicInfoForm.getFieldValue('description')}</Descriptions.Item>
                  <Descriptions.Item label="题目数量">{basicInfoForm.getFieldValue('totalQuestions')} 题</Descriptions.Item>
                  <Descriptions.Item label="总分值">{(basicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分</Descriptions.Item>
                  <Descriptions.Item label="考试时长">{basicInfoForm.getFieldValue('duration')} 分钟</Descriptions.Item>
                  <Descriptions.Item label="考试时间">
                    {basicInfoForm.getFieldValue('examTime') ? 
                      `${dayjs(basicInfoForm.getFieldValue('examTime')[0]).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(basicInfoForm.getFieldValue('examTime')[1]).format('YYYY-MM-DD HH:mm')}` :
                      '未设置'}
                  </Descriptions.Item>
                  <Descriptions.Item label="考试文件">
                    {uploadedFiles.questionFile ? <Tag color="success">已上传试题</Tag> : <Tag color="warning">未上传试题</Tag>}
                    {uploadedFiles.answerFile ? <Tag color="success">已上传答案</Tag> : <Tag color="warning">未上传答案</Tag>}
                    {uploadedFiles.answerSheetFile ? <Tag color="success">已上传答题卡</Tag> : <Tag color="warning">未上传答题卡</Tag>}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(ExamCreationStepEnum.ScoreSettings)}>上一步</Button>
                <Button type="primary" onClick={handleExamCreationSubmit} loading={loading}>
                  创建考试
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* 编辑考试模态框 - 三步流程 */}
      <Modal
        title="编辑考试"
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <Steps
            current={editCurrentStep}
            onChange={handleEditStepChange}
            style={{ marginBottom: 24 }}
          >
            <Step title="基本信息" description="编辑考试基本信息" />
            <Step title="分值设置" description="设置题目分数" />
            <Step title="发布设置" description="设置发布状态" />
          </Steps>
          
          <div style={{ display: editCurrentStep === ExamCreationStepEnum.BasicInfo ? 'block' : 'none' }}>
            <Form
              form={editBasicInfoForm}
              layout="vertical"
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
                    <InputNumber
                      min={1}
                      max={200}
                      style={{ width: '100%' }}
                      placeholder="请输入题目数量"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="总分值"
                    name="totalScore"
                    rules={[{ required: true, message: '请输入考试总分值' }]}
                  >
                    <InputNumber
                      min={10}
                      max={1000}
                      style={{ width: '100%' }}
                      placeholder="请输入考试总分值"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="考试时长（分钟）"
                    name="duration"
                    rules={[{ required: true, message: '请输入考试时长' }]}
                  >
                    <InputNumber
                      min={30}
                      max={600}
                      style={{ width: '100%' }}
                      placeholder="请输入考试时长（分钟）"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="考试时间"
                    name="examTime"
                    rules={[
                      { required: true, message: '请选择考试时间' },
                      {
                        validator: (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.reject(new Error('请选择完整的考试时间段'));
                          }
                          const timeValidation = validateTimeRange(value[0], value[1]);
                          if (!timeValidation.isValid) {
                            return Promise.reject(new Error(timeValidation.message));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['开始时间', '结束时间']}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 文件上传区域 */}
              <Divider orientation="left">考试文件</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="试题文件">
                    <div>
                      {uploadedFiles.questionFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                                                           {uploadedFiles.questionFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.questionFile?.id) {
                                  onDeleteFile(uploadedFiles.questionFile.id);
                                  setUploadedFiles(prev => ({ ...prev, questionFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'question').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, questionFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答案文件">
                    <div>
                      {uploadedFiles.answerFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerFile?.id) {
                                  onDeleteFile(uploadedFiles.answerFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answer').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答题卡文件">
                    <div>
                      {uploadedFiles.answerSheetFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerSheetFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerSheetFile?.id) {
                                  onDeleteFile(uploadedFiles.answerSheetFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerSheetFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answerSheet').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerSheetFile: uploadedFile }));
                            });
                            return false;
                          }}
                        >
                          <Button 
                            icon={<CloudUploadOutlined />} 
                            loading={uploading.answerSheet}
                            block
                          >
                            上传答题卡文件
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={closeExamCreation}>取消</Button>
                <Button type="primary" onClick={() => handleStepChange(ExamCreationStepEnum.ScoreSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.ScoreSettings ? 'block' : 'none' }}>
            <Form
              form={scoreSettingsForm}
              layout="vertical"
              initialValues={{ questions: generatedQuestions }}
            >
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
                <Text type="secondary">
                  💡 提示：可以调整每道题的分值，总分应与基本信息中设置的总分保持一致
                </Text>
              </Card>
              
              <Form.List name="questions">
                {(fields) => (
                  <>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 10px' }}>
                      {fields.map(({ key, name }) => (
                        <Row key={key} gutter={16} style={{ marginBottom: 8, alignItems: 'center' }}>
                          <Col span={8}>
                            <Text>第 {name + 1} 题</Text>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              name={[name, 'score']}
                              noStyle
                            >
                              <InputNumber
                                min={0.5}
                                max={100}
                                step={0.5}
                                onChange={(value) => handleScoreChange(value, name)}
                                addonAfter="分"
                                style={{ width: '100%' }}
                                precision={1}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: 16, padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
                      <Text strong>
                        总题数：{scoreSettingsForm.getFieldValue('questions')?.length || 0} 题，
                        总分：{calculateTotalSetScore().toFixed(1)} 分，
                        基本信息设置总分：{(basicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分
                      </Text>
                    </div>
                  </>
                )}
              </Form.List>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(ExamCreationStepEnum.BasicInfo)}>上一步</Button>
                <Button type="primary" onClick={() => handleStepChange(ExamCreationStepEnum.PublishSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: currentStep === ExamCreationStepEnum.PublishSettings ? 'block' : 'none' }}>
            <Form
              form={publishSettingsForm}
              layout="vertical"
              initialValues={{ shouldPublish: false }}
            >
              <Card size="small" style={{ marginBottom: 16, background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Text>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  考试创建完成后，您可以选择立即发布或保存为草稿。发布后，学生将能够看到此考试。
                </Text>
              </Card>
              
              <Form.Item name="shouldPublish" valuePropName="checked">
                <Switch checkedChildren="发布" unCheckedChildren="草稿" />
                <Text style={{ marginLeft: 8 }}>
                  创建后立即发布考试
                </Text>
              </Form.Item>
              
              <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                <Title level={5}>考试信息确认</Title>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="考试标题">{basicInfoForm.getFieldValue('title')}</Descriptions.Item>
                  <Descriptions.Item label="详细信息">{basicInfoForm.getFieldValue('description')}</Descriptions.Item>
                  <Descriptions.Item label="题目数量">{basicInfoForm.getFieldValue('totalQuestions')} 题</Descriptions.Item>
                  <Descriptions.Item label="总分值">{(basicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分</Descriptions.Item>
                  <Descriptions.Item label="考试时长">{basicInfoForm.getFieldValue('duration')} 分钟</Descriptions.Item>
                  <Descriptions.Item label="考试时间">
                    {basicInfoForm.getFieldValue('examTime') ? 
                      `${dayjs(basicInfoForm.getFieldValue('examTime')[0]).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(basicInfoForm.getFieldValue('examTime')[1]).format('YYYY-MM-DD HH:mm')}` :
                      '未设置'}
                  </Descriptions.Item>
                  <Descriptions.Item label="考试文件">
                    {uploadedFiles.questionFile ? <Tag color="success">已上传试题</Tag> : <Tag color="warning">未上传试题</Tag>}
                    {uploadedFiles.answerFile ? <Tag color="success">已上传答案</Tag> : <Tag color="warning">未上传答案</Tag>}
                    {uploadedFiles.answerSheetFile ? <Tag color="success">已上传答题卡</Tag> : <Tag color="warning">未上传答题卡</Tag>}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(ExamCreationStepEnum.ScoreSettings)}>上一步</Button>
                <Button type="primary" onClick={handleExamCreationSubmit} loading={loading}>
                  创建考试
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* 编辑考试模态框 - 三步流程 */}
      <Modal
        title="编辑考试"
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <Steps
            current={editCurrentStep}
            onChange={handleEditStepChange}
            style={{ marginBottom: 24 }}
          >
            <Step title="基本信息" description="编辑考试基本信息" />
            <Step title="分值设置" description="设置题目分数" />
            <Step title="发布设置" description="设置发布状态" />
          </Steps>
          
          <div style={{ display: editCurrentStep === ExamCreationStepEnum.BasicInfo ? 'block' : 'none' }}>
            <Form
              form={editBasicInfoForm}
              layout="vertical"
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
                    <InputNumber
                      min={1}
                      max={200}
                      style={{ width: '100%' }}
                      placeholder="请输入题目数量"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="总分值"
                    name="totalScore"
                    rules={[{ required: true, message: '请输入考试总分值' }]}
                  >
                    <InputNumber
                      min={10}
                      max={1000}
                      style={{ width: '100%' }}
                      placeholder="请输入考试总分值"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="考试时长（分钟）"
                    name="duration"
                    rules={[{ required: true, message: '请输入考试时长' }]}
                  >
                    <InputNumber
                      min={30}
                      max={600}
                      style={{ width: '100%' }}
                      placeholder="请输入考试时长（分钟）"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="考试时间"
                    name="examTime"
                    rules={[
                      { required: true, message: '请选择考试时间' },
                      {
                        validator: (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.reject(new Error('请选择完整的考试时间段'));
                          }
                          const timeValidation = validateTimeRange(value[0], value[1]);
                          if (!timeValidation.isValid) {
                            return Promise.reject(new Error(timeValidation.message));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['开始时间', '结束时间']}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 文件上传区域 */}
              <Divider orientation="left">考试文件</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="试题文件">
                    <div>
                      {uploadedFiles.questionFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                                                           {uploadedFiles.questionFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.questionFile?.id) {
                                  onDeleteFile(uploadedFiles.questionFile.id);
                                  setUploadedFiles(prev => ({ ...prev, questionFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'question').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, questionFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答案文件">
                    <div>
                      {uploadedFiles.answerFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerFile?.id) {
                                  onDeleteFile(uploadedFiles.answerFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answer').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerFile: uploadedFile }));
                            });
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
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="答题卡文件">
                    <div>
                      {uploadedFiles.answerSheetFile ? (
                        <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text ellipsis style={{ maxWidth: '70%' }}>
                              <FilePdfOutlined style={{ marginRight: 8 }} />
                              {uploadedFiles.answerSheetFile.filename}
                            </Text>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => {
                                if (uploadedFiles.answerSheetFile?.id) {
                                  onDeleteFile(uploadedFiles.answerSheetFile.id);
                                  setUploadedFiles(prev => ({ ...prev, answerSheetFile: undefined }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Upload
                          accept=".pdf,.doc,.docx"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleFileUpload(file, 'answerSheet').then(uploadedFile => {
                              setUploadedFiles(prev => ({ ...prev, answerSheetFile: uploadedFile }));
                            });
                            return false;
                          }}
                        >
                          <Button 
                            icon={<CloudUploadOutlined />} 
                            loading={uploading.answerSheet}
                            block
                          >
                            上传答题卡文件
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={closeExamCreation}>取消</Button>
                <Button type="primary" onClick={() => handleEditStepChange(ExamCreationStepEnum.ScoreSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: editCurrentStep === ExamCreationStepEnum.ScoreSettings ? 'block' : 'none' }}>
            <Form
              form={editScoreSettingsForm}
              layout="vertical"
              initialValues={{ questions: editGeneratedQuestions }}
            >
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
                <Text type="secondary">
                  💡 提示：可以调整每道题的分值，总分应与基本信息中设置的总分保持一致
                </Text>
              </Card>
              
              <Form.List name="questions">
                {(fields) => (
                  <>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 10px' }}>
                      {fields.map(({ key, name }) => (
                        <Row key={key} gutter={16} style={{ marginBottom: 8, alignItems: 'center' }}>
                          <Col span={8}>
                            <Text>第 {name + 1} 题</Text>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              name={[name, 'score']}
                              noStyle
                            >
                              <InputNumber
                                min={0.5}
                                max={100}
                                step={0.5}
                                onChange={(value) => handleEditScoreChange(value, name)}
                                addonAfter="分"
                                style={{ width: '100%' }}
                                precision={1}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: 16, padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
                      <Text strong>
                        总题数：{editScoreSettingsForm.getFieldValue('questions')?.length || 0} 题，
                        总分：{calculateEditTotalSetScore().toFixed(1)} 分，
                        基本信息设置总分：{(editBasicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分
                      </Text>
                    </div>
                  </>
                )}
              </Form.List>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setEditCurrentStep(ExamCreationStepEnum.BasicInfo)}>上一步</Button>
                <Button type="primary" onClick={() => handleEditStepChange(ExamCreationStepEnum.PublishSettings)}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
          
          <div style={{ display: editCurrentStep === ExamCreationStepEnum.PublishSettings ? 'block' : 'none' }}>
            <Form
              form={editPublishSettingsForm}
              layout="vertical"
              initialValues={{ 
                shouldPublish: editingExam?.status === 'published' 
              }}
            >
              <Card size="small" style={{ marginBottom: 16, background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Text>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  编辑完成后，您可以选择发布或保存为草稿。发布后，学生将能够看到此考试。
                </Text>
              </Card>
              
              <Form.Item name="shouldPublish" valuePropName="checked">
                <Switch checkedChildren="发布" unCheckedChildren="草稿" />
                <Text style={{ marginLeft: 8 }}>
                  更新后发布考试
                </Text>
              </Form.Item>
              
              <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                <Title level={5}>考试信息确认</Title>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="考试标题">{editBasicInfoForm.getFieldValue('title')}</Descriptions.Item>
                  <Descriptions.Item label="详细信息">{editBasicInfoForm.getFieldValue('description')}</Descriptions.Item>
                  <Descriptions.Item label="题目数量">{editBasicInfoForm.getFieldValue('totalQuestions')} 题</Descriptions.Item>
                  <Descriptions.Item label="总分值">{(editBasicInfoForm.getFieldValue('totalScore') || 0).toFixed(1)} 分</Descriptions.Item>
                  <Descriptions.Item label="考试时长">{editBasicInfoForm.getFieldValue('duration')} 分钟</Descriptions.Item>
                  <Descriptions.Item label="考试时间">
                    {editBasicInfoForm.getFieldValue('examTime') ? 
                      `${dayjs(editBasicInfoForm.getFieldValue('examTime')[0]).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(editBasicInfoForm.getFieldValue('examTime')[1]).format('YYYY-MM-DD HH:mm')}` :
                      '未设置'}
                  </Descriptions.Item>
                  <Descriptions.Item label="考试文件">
                    {uploadedFiles.questionFile ? <Tag color="success">已上传试题</Tag> : <Tag color="warning">未上传试题</Tag>}
                    {uploadedFiles.answerFile ? <Tag color="success">已上传答案</Tag> : <Tag color="warning">未上传答案</Tag>}
                    {uploadedFiles.answerSheetFile ? <Tag color="success">已上传答题卡</Tag> : <Tag color="warning">未上传答题卡</Tag>}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Form>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setEditCurrentStep(ExamCreationStepEnum.ScoreSettings)}>上一步</Button>
                <Button type="primary" onClick={handleEditExamSubmit} loading={loading}>
                  更新考试
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Modal>

      {/* 考试详情模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>考试详情</span>
            {selectedExam && (
              <Tag color={statusMap[selectedExam.status]?.color || 'default'} style={{ marginLeft: 8 }}>
                {statusMap[selectedExam.status]?.text || '未知状态'}
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
                selectedExam && handleEditExam(selectedExam);
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
                  <Text strong style={{ fontSize: '16px' }}>{selectedExam?.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="考试时间" span={2}>
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {selectedExam && selectedExam.startTime && dayjs(selectedExam.startTime).format('YYYY年MM月DD日 HH:mm')} 
                      <Text type="secondary"> 至 </Text>
                      {selectedExam && selectedExam.endTime && dayjs(selectedExam.endTime).format('MM月DD日 HH:mm')}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="考试时长">
                  <Tag color="blue" icon="⏱️">{selectedExam?.duration || 0} 分钟</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="题目数量">
                  <Tag color="cyan" icon="📝">{selectedExam?.totalQuestions ||  0} 题</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="参与人数">
                  <Tag color="green" icon="👥">{selectedExam?.participants?.length || 0} 人</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="考试状态">
                  <Tag color={selectedExam && selectedExam.status ? statusMap[selectedExam.status]?.color : 'default'}>
                    {selectedExam && selectedExam.status ? statusMap[selectedExam.status]?.text : '未知状态'}
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
            <span>题目分值设置</span>              {selectedExam ? (
              <Text type="secondary" style={{ marginLeft: 16, fontSize: '14px' }}>
                - {selectedExam.title}
              </Text>
            ) : null}
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
              onFinish={(values) => {
                if (editingExam) {
                  handleSetQuestionScores(values.totalQuestions, values.defaultScore);
                }
                setExamModalVisible(false);
              }}
              initialValues={{ 
                defaultScore: 5, 
                totalQuestions: editingExam?.totalQuestions || 0 
              }}
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
                      precision={1}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                <Space>
                  <Button onClick={() => setActiveTabKey('basicInfo')}>
                    返回基本信息
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
    </div>
  );
};

export default ExamManagement;