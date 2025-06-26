import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Select, 
  List, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Row, 
  Col,
  Pagination,
  Switch,
  Modal,
  Form,
  InputNumber,
  message,
  Input,
  Empty
} from 'antd';
import { 
  LeftOutlined,
  RightOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SaveOutlined,
  StopOutlined
} from '@ant-design/icons';
import type { Exam, GradingTask, ExamAnswer } from '../hooks/useGraderLogic';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface GradingQueueProps {
  loading: boolean;
  exams: Exam[];
  gradingTasks: GradingTask[];
  loadExams: () => void;
  loadGradingTasksByExam: (examId: string) => void;
  completeGrading: (taskId: string, score: number, feedback?: string) => void;
  startGrading?: (taskId: string) => Promise<boolean>;
  saveProgress?: (taskId: string, progressData: { score?: number; feedback?: string }) => Promise<boolean>;
  abandonTask?: (taskId: string, reason?: string) => Promise<boolean>;
}

const GradingQueue: React.FC<GradingQueueProps> = ({
  loading,
  exams,
  gradingTasks,
  loadExams,
  loadGradingTasksByExam,
  completeGrading,
  startGrading,
  saveProgress,
  abandonTask
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('list');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [gradingModalVisible, setGradingModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExamId) {
      loadGradingTasksByExam(selectedExamId);
      setCurrentTaskIndex(0);
    }
  }, [selectedExamId, loadGradingTasksByExam]);

  // 筛选出状态为'grading'的考试
  const gradingExams = exams.filter(exam => exam.status === 'grading');

  // 处理考试选择
  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
  };

  // 处理视图模式切换
  const handleViewModeChange = (checked: boolean) => {
    setViewMode(checked ? 'thumbnail' : 'list');
  };

  // 处理任务导航
  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < gradingTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  // 打开阅卷评分对话框
  const handleOpenGradingModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setGradingModalVisible(true);
  };

  // 提交评分
  const handleSubmitGrading = async (values: { score: number; feedback?: string }) => {
    if (!selectedTaskId) return;
    
    try {
      await completeGrading(selectedTaskId, values.score, values.feedback);
      setGradingModalVisible(false);
      setSelectedTaskId(undefined);
      form.resetFields();
    } catch (error) {
      message.error('提交评分失败');
    }
  };

  // 开始阅卷任务
  const handleStartGrading = async (taskId: string) => {
    if (startGrading) {
      const success = await startGrading(taskId);
      if (success) {
        // 刷新任务列表
        if (selectedExamId) {
          loadGradingTasksByExam(selectedExamId);
        }
      }
    }
  };

  // 保存阅卷进度
  const handleSaveProgress = async (taskId: string, score?: number, feedback?: string) => {
    if (saveProgress) {
      const success = await saveProgress(taskId, { score, feedback });
      if (success) {
        // 刷新任务列表
        if (selectedExamId) {
          loadGradingTasksByExam(selectedExamId);
        }
      }
    }
  };

  // 放弃阅卷任务
  const handleAbandonTask = async (taskId: string, reason?: string) => {
    if (abandonTask) {
      const success = await abandonTask(taskId, reason);
      if (success) {
        // 刷新任务列表
        if (selectedExamId) {
          loadGradingTasksByExam(selectedExamId);
        }
      }
    }
  };

  // 列表视图
  const renderListView = () => (
    <List
      dataSource={gradingTasks}
      loading={loading}
      renderItem={(task) => (
        <List.Item
          actions={[
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {/* 查看详情 */}}
            >
              查看
            </Button>,
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenGradingModal(task.id)}
              disabled={task.status === 'completed'}
            >
              {task.status === 'completed' ? '已完成' : '开始阅卷'}
            </Button>
          ]}
        >
          <List.Item.Meta
            title={
              <Space>
                <Text strong>{task.studentName}</Text>
                <Tag color={task.status === 'completed' ? 'green' : 'blue'}>
                  {task.status === 'completed' ? '已完成' : '待阅卷'}
                </Tag>
                {task.score !== undefined && (
                  <Tag color="orange">得分: {task.score}</Tag>
                )}
              </Space>
            }
            description={
              <Space direction="vertical" size={4}>
                <Text type="secondary">
                  提交时间: {task.submittedAt ? new Date(task.submittedAt).toLocaleString() : '未知'}
                </Text>
                <Text type="secondary">
                  答题数量: {task.submission?.answers?.length || 0} 题
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  // 缩略图视图
  const renderThumbnailView = () => {
    if (gradingTasks.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary">暂无阅卷任务</Text>
        </div>
      );
    }

    const currentTask = gradingTasks[currentTaskIndex];
    
    return (
      <div>
        {/* 任务信息 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space direction="vertical">
                <Title level={4} style={{ margin: 0 }}>
                  {currentTask.studentName} - {currentTask.examTitle}
                </Title>
                <Space>
                  <Tag color={currentTask.status === 'completed' ? 'green' : 'blue'}>
                    {currentTask.status === 'completed' ? '已完成' : '待阅卷'}
                  </Tag>
                  {currentTask.score !== undefined && (
                    <Tag color="orange">得分: {currentTask.score}</Tag>
                  )}
                  <Text type="secondary">
                    提交时间: {currentTask.submittedAt ? new Date(currentTask.submittedAt).toLocaleString() : '未知'}
                  </Text>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevTask}
                  disabled={currentTaskIndex === 0}
                >
                  上一份
                </Button>
                <Text>
                  {currentTaskIndex + 1} / {gradingTasks.length}
                </Text>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextTask}
                  disabled={currentTaskIndex === gradingTasks.length - 1}
                >
                  下一份
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenGradingModal(currentTask.id)}
                  disabled={currentTask.status === 'completed'}
                >
                  {currentTask.status === 'completed' ? '已完成' : '开始阅卷'}
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 答题图片展示 */}
        <Card title="学生答题">
          <Row gutter={[16, 16]}>
            {currentTask.submission?.answers?.map((answer: ExamAnswer, index: number) => (
              <Col key={answer.questionNumber || index} xs={24} sm={12} md={8} lg={6}>
                <Card
                  size="small"
                  title={`第 ${answer.questionNumber || index + 1} 题`}
                  extra={
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {answer.uploadTime ? new Date(answer.uploadTime).toLocaleString() : '未知时间'}
                    </Text>
                  }
                >
                  <Image
                    src={answer.imageUrl || '/placeholder.png'}
                    alt={`第${answer.questionNumber || index + 1}题答案`}
                    style={{ width: '100%' }}
                    placeholder={
                      <div style={{ 
                        height: '200px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: '#f5f5f5'
                      }}>
                        加载中...
                      </div>
                    }
                  />
                </Card>
              </Col>
            )) || (
              <Col span={24}>
                <Empty description="暂无答题数据" />
              </Col>
            )}
          </Row>
        </Card>
      </div>
    );
  };

  return (
    <div>
      {/* 控制面板 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>选择考试：</Text>
          </Col>
          <Col flex="auto">
            <Select
              style={{ width: '100%', minWidth: 200 }}
              placeholder="请选择要阅卷的考试"
              value={selectedExamId}
              onChange={handleExamChange}
              loading={loading}
            >
              {gradingExams.map(exam => (
                <Option key={exam.id} value={exam.id}>
                  {exam.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Space align="center">
              <UnorderedListOutlined />
              <Switch
                checked={viewMode === 'thumbnail'}
                onChange={handleViewModeChange}
                size="small"
              />
              <AppstoreOutlined />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 阅卷任务内容 */}
      {selectedExamId ? (
        <Card
          title={
            <Space>
              <Text>阅卷队列</Text>
              <Tag color="blue">{gradingTasks.length} 份待阅卷</Tag>
            </Space>
          }
        >
          {viewMode === 'list' ? renderListView() : renderThumbnailView()}
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text type="secondary">请先选择要阅卷的考试</Text>
          </div>
        </Card>
      )}

      {/* 阅卷评分对话框 */}
      <Modal
        title="提交评分"
        open={gradingModalVisible}
        onCancel={() => {
          setGradingModalVisible(false);
          setSelectedTaskId(undefined);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitGrading}
        >
          <Form.Item
            name="score"
            label="分数"
            rules={[
              { required: true, message: '请输入分数' },
              { type: 'number', min: 0, max: 100, message: '分数范围为0-100' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入分数"
              min={0}
              max={100}
              precision={1}
            />
          </Form.Item>
          
          <Form.Item
            name="feedback"
            label="评语（可选）"
          >
            <TextArea
              placeholder="请输入评语或建议"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交评分
              </Button>
              <Button onClick={() => {
                const values = form.getFieldsValue();
                if (selectedTaskId && (values.score || values.feedback)) {
                  handleSaveProgress(selectedTaskId, values.score, values.feedback);
                }
              }}>
                <SaveOutlined />
                暂存
              </Button>
              <Button onClick={() => {
                if (selectedTaskId) {
                  Modal.confirm({
                    title: '确认放弃阅卷？',
                    content: '放弃后该任务将重新分配给其他阅卷员',
                    onOk: () => handleAbandonTask(selectedTaskId, '阅卷员主动放弃'),
                  });
                }
              }}>
                <StopOutlined />
                放弃
              </Button>
              <Button onClick={() => {
                setGradingModalVisible(false);
                setSelectedTaskId(undefined);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GradingQueue;
