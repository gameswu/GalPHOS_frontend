import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Typography,
  Row,
  Col,
  Progress,
  Tabs,
  Checkbox,
  InputNumber,
  Descriptions,
  Avatar,
  Statistic,
  List,
  Empty
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Exam, AdminGradingTask, GraderInfo, GradingProgress } from '../../../types/common';
import '../../../styles/responsive.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface GradingManagementProps {
  exams: Exam[];
  graders: GraderInfo[];
  gradingTasks: AdminGradingTask[];
  loading: boolean;
  onAssignGradingTask: (examId: string, questionNumber: number, graderIds: string[]) => Promise<void>;
  onGetGradingProgress: (examId: string) => GradingProgress | null;
  onUpdateGradingProgress: (taskId: string) => Promise<void>;
}

const GradingManagement: React.FC<GradingManagementProps> = ({
  exams,
  graders,
  gradingTasks,
  loading,
  onAssignGradingTask,
  onGetGradingProgress,
  onUpdateGradingProgress
}) => {
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<GradingProgress | null>(null);
  const [form] = Form.useForm();

  // 阅卷状态映射 - 支持后端大写状态
  const taskStatusMap = {
    // 前端小写状态
    pending: { text: '待开始', color: 'default' },
    assigned: { text: '已分配', color: 'processing' },
    in_progress: { text: '进行中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    // 后端大写状态映射
    PENDING: { text: '待分配', color: 'default' },
    ASSIGNED: { text: '已分配', color: 'processing' },
    IN_PROGRESS: { text: '进行中', color: 'processing' },
    COMPLETED: { text: '已完成', color: 'success' }
  };

  // 状态转换函数 - 将后端大写状态转换为前端小写状态
  const normalizeStatus = (status: string): string => {
    const statusMapping: { [key: string]: string } = {
      'PENDING': 'pending',
      'ASSIGNED': 'assigned',
      'IN_PROGRESS': 'in_progress', 
      'COMPLETED': 'completed'
    };
    return statusMapping[status] || status.toLowerCase();
  };

  const graderStatusMap = {
    available: { text: '空闲', color: 'success' },
    busy: { text: '忙碌', color: 'warning' },
    offline: { text: '离线', color: 'default' }
  };

  // 获取可分配阅卷的考试（阅卷中状态）
  const gradingExams = exams.filter(exam => exam.status === 'grading');

  // 阅卷者表格列（简化版：仅包含阅卷者、状态、阅卷队列数、已完成数四项）
  const graderColumns = [
    {
      title: '阅卷者',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: GraderInfo) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.phone}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = graderStatusMap[status as keyof typeof graderStatusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
      },
    },
    {
      title: '阅卷队列数',
      dataIndex: 'currentTasks',
      key: 'currentTasks',
      render: (count: number) => (
        <Tag color={count > 0 ? 'orange' : 'green'}>{count} 个</Tag>
      ),
    },
    {
      title: '已完成数',
      dataIndex: 'completedTasks',
      key: 'completedTasks',
      render: (count: number) => (
        <Tag color="blue">{count} 个</Tag>
      ),
    },
  ];

  // 阅卷任务表格列
  const taskColumns = [
    {
      title: '考试',
      dataIndex: 'examTitle',
      key: 'examTitle',
      render: (text: string, record: AdminGradingTask) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            第 {record.questionNumber} 题
          </Text>
        </Space>
      ),
    },
    {
      title: '阅卷者',
      dataIndex: 'graderName',
      key: 'graderName',
      className: 'mobile-hidden',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: any, record: AdminGradingTask) => {
        const progress = (record.gradedPapers / record.totalPapers) * 100;
        return (
          <div style={{ width: 120 }}>
            <Progress 
              percent={progress} 
              size="small" 
              status={record.status === 'completed' ? 'success' : 'active'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.gradedPapers}/{record.totalPapers}
            </Text>
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = taskStatusMap[status as keyof typeof taskStatusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
      },
    },
    {
      title: '平均分',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score: number) => (
        <Text>{score > 0 ? score.toFixed(1) : '-'} 分</Text>
      ),
    },
    {
      title: '平均时间',
      dataIndex: 'avgTime',
      key: 'avgTime',
      render: (time: number) => (
        <Text>{time > 0 ? time : '-'} 秒</Text>
      ),
    },
    {
      title: '分配时间',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (time: string) => (
        <Text type="secondary">
          {dayjs(time).format('MM-DD HH:mm')}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AdminGradingTask) => (
        <Space size="small">
          {record.status === 'in_progress' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => onUpdateGradingProgress(record.id)}
              loading={loading}
            >
              更新进度
            </Button>
          )}
          {normalizeStatus(record.status) === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => onUpdateGradingProgress(record.id)}
              loading={loading}
            >
              开始阅卷
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 处理分配阅卷任务
  const handleAssignTask = (exam: Exam) => {
    setSelectedExam(exam);
    setAssignModalVisible(true);
    form.resetFields();
  };

  // 处理查看进度
  const handleViewProgress = (exam: Exam) => {
    const progress = onGetGradingProgress(exam.id);
    setSelectedProgress(progress);
    setProgressModalVisible(true);
  };

  // 提交分配表单
  const handleAssignSubmit = async (values: any) => {
    if (!selectedExam) return;

    try {
      await onAssignGradingTask(
        selectedExam.id,
        values.questionNumber,
        values.graderIds
      );
      setAssignModalVisible(false);
      form.resetFields();
      setSelectedExam(null);
    } catch (error) {
      console.error('分配失败:', error);
    }
  };

  // 统计数据 - 使用状态转换函数处理后端状态
  const stats = {
    totalGraders: graders?.length || 0,
    availableGraders: graders?.filter(g => g.status === 'available').length || 0,
    busyGraders: graders?.filter(g => g.status === 'busy').length || 0,
    totalTasks: gradingTasks?.length || 0,
    pendingTasks: gradingTasks?.filter(t => normalizeStatus(t.status) === 'pending').length || 0,
    inProgressTasks: gradingTasks?.filter(t => normalizeStatus(t.status) === 'in_progress').length || 0,
    completedTasks: gradingTasks?.filter(t => normalizeStatus(t.status) === 'completed').length || 0
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="阅卷者总数"
              value={stats.totalGraders}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="空闲阅卷者"
              value={stats.availableGraders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="忙碌阅卷者"
              value={stats.busyGraders}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={stats.inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="assign">
        <TabPane tab="任务分配" key="assign">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                阅卷任务分配
              </Title>
            </div>

            {gradingExams.length > 0 ? (
              <List
                dataSource={gradingExams}
                renderItem={(exam) => {
                  const examTasks = gradingTasks?.filter(task => task.examId === exam.id) || [];
                  // 只计算那些已分配的任务（状态不为PENDING）
                  const assignedTasks = examTasks.filter(task => normalizeStatus(task.status) !== 'pending');
                  const assignedQuestions = Array.from(new Set(assignedTasks.map(task => task.questionNumber)));

                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="assign"
                          type="primary"
                          onClick={() => handleAssignTask(exam)}
                        >
                          分配阅卷
                        </Button>,
                        <Button
                          key="progress"
                          onClick={() => handleViewProgress(exam)}
                        >
                          查看进度
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        title={exam.title}
                        description={
                          <div>
                            <Text type="secondary">
                              总题数: {exam.totalQuestions || 0} 题
                            </Text>
                            <br />
                            <Text type="secondary">
                              已分配: {assignedQuestions.length} 题 
                              {assignedQuestions.length > 0 && (
                                <span>（第 {assignedQuestions.sort().join(', ')} 题）</span>
                              )}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="暂无需要分配阅卷的考试" />
            )}
          </Card>
        </TabPane>

        <TabPane tab="阅卷者管理" key="graders">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>
                <TeamOutlined style={{ marginRight: 8 }} />
                阅卷者管理
              </Title>
            </div>
            <div className="responsive-table-wrapper">
              <Table
                columns={graderColumns}
                dataSource={graders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="small"
                className="responsive-table"
                scroll={{ x: 800 }}
              />
            </div>
          </Card>
        </TabPane>

        <TabPane tab="任务进度" key="progress">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>
                <BarChartOutlined style={{ marginRight: 8 }} />
                阅卷任务进度
              </Title>
            </div>
            <div className="responsive-table-wrapper">
              <Table
                columns={taskColumns}
                dataSource={gradingTasks}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="small"
                className="responsive-table"
                scroll={{ x: 800 }}
              />
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 分配阅卷任务模态框 */}
      <Modal
        title={`分配阅卷任务 - ${selectedExam?.title}`}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignSubmit}
        >
          <Form.Item
            label="选择题目"
            name="questionNumber"
            rules={[{ required: true, message: '请选择要分配的题目' }]}
          >
            <Select placeholder="请选择第几题">
              {Array.from({ length: selectedExam?.totalQuestions || 0 }, (_, i) => (
                <Option key={i + 1} value={i + 1}>
                  第 {i + 1} 题
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="选择阅卷者"
            name="graderIds"
            rules={[
              { required: true, message: '请选择阅卷者' },
              { type: 'array', min: 1, message: '至少选择一个阅卷者' }
            ]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                {graders.map(grader => (
                  <Col span={12} key={grader.id} style={{ marginBottom: 8 }}>
                    <Checkbox value={grader.id}>
                      <Space>
                        <Avatar icon={<UserOutlined />} size="small" />
                        <div>
                          <Text strong>{grader.username}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            当前任务: {grader.currentTasks} 个
                          </Text>
                        </div>
                        <Tag color={graderStatusMap[grader.status]?.color}>
                          {graderStatusMap[grader.status]?.text}
                        </Tag>
                      </Space>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAssignModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                分配任务
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 阅卷进度模态框 */}
      <Modal
        title="阅卷进度详情"
        open={progressModalVisible}
        onCancel={() => setProgressModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setProgressModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedProgress && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="总体进度"
                    value={selectedProgress.avgProgress}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="已完成题目"
                    value={selectedProgress.completedQuestions}
                    suffix={`/ ${selectedProgress.totalQuestions}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="已阅答卷"
                    value={selectedProgress.gradedPapers}
                    suffix={`/ ${selectedProgress.totalPapers}`}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="参与阅卷者"
                    value={selectedProgress.graders.length}
                    suffix="人"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            <Title level={5}>阅卷者进度</Title>
            <List
              dataSource={selectedProgress.graders}
              renderItem={(grader) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={grader.graderName}
                    description={
                      <div>
                        <Text type="secondary">
                          负责题目: 第 {grader.questionNumbers.join(', ')} 题
                        </Text>
                        <br />
                        <Progress 
                          percent={grader.progress} 
                          size="small"
                          status={grader.status === 'completed' ? 'success' : 'active'}
                        />
                      </div>
                    }
                  />
                  <Tag color={taskStatusMap[grader.status as keyof typeof taskStatusMap]?.color}>
                    {taskStatusMap[grader.status as keyof typeof taskStatusMap]?.text}
                  </Tag>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GradingManagement;