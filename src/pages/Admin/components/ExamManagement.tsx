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
  message
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
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Exam, ExamFile } from '../../../types/common';
import '../../../styles/responsive.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface ExamManagementProps {
  exams: Exam[];
  loading: boolean;
  onCreateExam: (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  onUpdateExam: (examId: string, examData: Partial<Exam>) => Promise<void>;
  onPublishExam: (examId: string) => Promise<void>;
  onUnpublishExam: (examId: string) => Promise<void>;
  onDeleteExam: (examId: string) => Promise<void>;
  onUploadFile: (file: File, type: 'question' | 'answer' | 'answerSheet') => Promise<ExamFile>;
}

const ExamManagement: React.FC<ExamManagementProps> = ({
  exams,
  loading,
  onCreateExam,
  onUpdateExam,
  onPublishExam,
  onUnpublishExam,
  onDeleteExam,
  onUploadFile
}) => {
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [examDetailVisible, setExamDetailVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploading, setUploading] = useState({
    question: false,
    answer: false,
    answerSheet: false
  });
  const [form] = Form.useForm();
  const [uploadedFiles, setUploadedFiles] = useState<{
    questionFile?: ExamFile;
    answerFile?: ExamFile;
    answerSheetFile?: ExamFile;
  }>({});

  // 监听表单值变化，更新文件显示状态
  const watchFiles = Form.useWatch(['questionFile', 'answerFile', 'answerSheetFile'], form);

  // 考试状态映射
  const statusMap = {
    draft: { text: '未发布', color: 'default' },
    published: { text: '已发布', color: 'blue' },
    ongoing: { text: '考试中', color: 'orange' },
    grading: { text: '阅卷中', color: 'purple' },
    completed: { text: '已结束', color: 'green' }
  };

  // 考试表格列配置（简化版）
  const examColumns = [
    {
      title: '考试信息',
      key: 'examInfo',
      width: 300,
      render: (_: any, record: Exam) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
            🕐 {dayjs(record.startTime).format('MM-DD HH:mm')} - {dayjs(record.endTime).format('MM-DD HH:mm')}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            📝 {record.totalQuestions || 0}题 | ⏱️ {record.duration || 0}分钟 | 👥 {record.participants?.length || 0}人
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
      },
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
    setEditingExam(null);
    setExamModalVisible(true);
    setUploadedFiles({});
    form.resetFields();
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

  // 提交考试表单
  const handleExamSubmit = async (values: any) => {
    try {
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

      if (editingExam) {
        await onUpdateExam(editingExam.id, examData);
      } else {
        // 对于创建考试，需要确保类型完整
        const createExamData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
          ...examData,
          participants: []
        };
        await onCreateExam(createExamData);
      }

      setExamModalVisible(false);
      form.resetFields();
      setEditingExam(null);
    } catch (error) {
      console.error('提交失败:', error);
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
                      <Text type="success" style={{ fontSize: '12px' }}>
                        📄 {form.getFieldValue('questionFile').name}
                      </Text>
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
                      <Text type="success" style={{ fontSize: '12px' }}>
                        📄 {form.getFieldValue('answerFile').name}
                      </Text>
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
                      <Text type="success" style={{ fontSize: '12px' }}>
                        📄 {form.getFieldValue('answerSheetFile').name}
                      </Text>
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
    </div>
  );
};

export default ExamManagement;