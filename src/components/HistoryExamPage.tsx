import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag,
  Modal,
  Descriptions,
  List,
  Avatar,
  Statistic,
  Row,
  Col,
  message
} from 'antd';
import { 
  HistoryOutlined,
  DownloadOutlined,
  EyeOutlined,
  ExportOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  UserOutlined
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

interface ScoreDetail {
  id: string;
  studentId: string;
  studentName: string;
  username: string; // 用户名
  totalScore: number;
  submittedAt: string;
  gradedAt?: string;
  status: 'submitted' | 'grading' | 'graded';
  questionScores?: Array<{
    questionNumber: number;
    score: number;
    maxScore: number;
  }>;
  totalRank?: number; // 总排名
  regionRank?: number; // 赛区排名
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
  // 新增获取成绩详情的方法
  getScoreDetails?: (examId: string, studentUsername?: string) => Promise<ScoreDetail[]>;
  exportScores?: (examId: string, format?: 'excel' | 'pdf') => Promise<void>;
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
  getExamSubmission,
  getScoreDetails,
  exportScores
}) => {
  // 教练成绩统计状态
  const [examStats, setExamStats] = useState<{ [examId: string]: {
    totalStudents: number;
    submittedStudents: number;
    averageScore: number;
  } }>({});

  // 成绩详情模态框状态
  const [scoreDetailVisible, setScoreDetailVisible] = useState(false);
  const [currentExamForScore, setCurrentExamForScore] = useState<Exam | null>(null);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [scoreLoading, setScoreLoading] = useState(false);

  // 考试详情模态框状态
  const [examDetailVisible, setExamDetailVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

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
          // 新API返回的是ExamScore[]数组，需要计算统计数据
          const scores = response.data;
          const totalStudents = scores.length;
          const submittedStudents = scores.filter(s => s.status === 'graded').length;
          const averageScore = scores.length > 0 ? 
            scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length : 0;
          
          stats[exam.id] = {
            totalStudents,
            submittedStudents,
            averageScore
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

  // 查看成绩详情
  const handleViewScores = async (exam: Exam) => {
    if (!getScoreDetails) {
      message.error('获取成绩详情功能不可用');
      return;
    }

    setCurrentExamForScore(exam);
    setScoreDetailVisible(true);
    setScoreLoading(true);

    try {
      const details = await getScoreDetails(exam.id);
      setScoreDetails(details || []);
    } catch (error) {
      console.error('获取成绩详情失败:', error);
      message.error('获取成绩详情失败');
      setScoreDetails([]);
    } finally {
      setScoreLoading(false);
    }
  };

  // 导出成绩
  const handleExportScores = async (examId: string, format: 'excel' | 'pdf' = 'excel') => {
    if (!exportScores) {
      message.error('导出功能不可用');
      return;
    }

    try {
      await exportScores(examId, format);
      message.success(`成绩导出成功（${format.toUpperCase()}格式）`);
    } catch (error) {
      console.error('导出成绩失败:', error);
      message.error('导出成绩失败');
    }
  };

  // 查看考试详情
  const handleViewExamDetail = (exam: Exam) => {
    setSelectedExam(exam);
    setExamDetailVisible(true);
  };

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
      title: '成绩管理',
      key: 'scoreActions',
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewScores(record)}
          >
            查看
          </Button>
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={() => handleExportScores(record.id)}
          >
            导出
          </Button>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small">
          {/* 详情按钮 */}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewExamDetail(record)}
          >
            详情
          </Button>

          {/* 试题文件下载 */}
          {record.questionFile && (
            <Button 
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
              试题
            </Button>
          )}

          {/* 答题卡文件下载 */}
          {record.answerSheetFile && (
            <Button 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => {
                if (onDownloadFile) {
                  onDownloadFile(record.answerSheetFile!);
                } else if (downloadFile) {
                  downloadFile(record.answerSheetFile!.url, record.answerSheetFile!.name);
                }
              }}
            >
              答题卡
            </Button>
          )}

          {/* 答案文件下载 */}
          {record.answerFile && (
            <Button 
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

      {/* 成绩详情模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
            <span>成绩详情 - {currentExamForScore?.title}</span>
          </div>
        }
        open={scoreDetailVisible}
        onCancel={() => {
          setScoreDetailVisible(false);
          setCurrentExamForScore(null);
          setScoreDetails([]);
        }}
        width={900}
        footer={[
          <Button 
            key="export-excel" 
            icon={<ExportOutlined />}
            onClick={() => currentExamForScore && handleExportScores(currentExamForScore.id, 'excel')}
          >
            导出Excel
          </Button>,
          <Button 
            key="export-pdf" 
            icon={<ExportOutlined />}
            onClick={() => currentExamForScore && handleExportScores(currentExamForScore.id, 'pdf')}
          >
            导出PDF
          </Button>,
          <Button key="close" onClick={() => setScoreDetailVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentExamForScore && (
          <div>
            {/* 考试基本信息 */}
            <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="考试名称" value={currentExamForScore.title} />
                </Col>
                <Col span={8}>
                  <Statistic title="题目数量" value={currentExamForScore.totalQuestions || 0} suffix="题" />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="参与人数" 
                    value={userRole === 'student' ? 1 : scoreDetails.length} 
                    suffix="人" 
                  />
                </Col>
              </Row>
            </Card>

            {/* 成绩列表 */}
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {scoreLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Typography.Text type="secondary">加载成绩数据中...</Typography.Text>
                </div>
              ) : scoreDetails.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={scoreDetails}
                  renderItem={(item, index) => (
                    <List.Item
                      style={{
                        background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                        padding: '12px 16px',
                        marginBottom: 8,
                        borderRadius: 6,
                        border: '1px solid #f0f0f0'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<UserOutlined />} 
                            style={{ 
                              backgroundColor: item.status === 'graded' ? '#52c41a' : 
                                             item.status === 'grading' ? '#faad14' : '#d9d9d9' 
                            }} 
                          />
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                              <strong>{item.studentName}</strong> ({item.username})
                            </span>
                            <div>
                              {item.status === 'graded' ? (
                                <Space>
                                  <Tag color="success" style={{ fontSize: '14px', padding: '4px 8px' }}>
                                    总分: {item.totalScore}
                                  </Tag>
                                  {item.totalRank && (
                                    <Tag color="blue">
                                      总排名: {item.totalRank}
                                    </Tag>
                                  )}
                                  {item.regionRank && (
                                    <Tag color="purple">
                                      赛区排名: {item.regionRank}
                                    </Tag>
                                  )}
                                </Space>
                              ) : item.status === 'grading' ? (
                                <Tag color="processing">阅卷中</Tag>
                              ) : (
                                <Tag color="default">已提交</Tag>
                              )}
                            </div>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 4 }}>
                              <Typography.Text type="secondary">
                                提交时间: {new Date(item.submittedAt).toLocaleString()}
                              </Typography.Text>
                            </div>
                            {item.gradedAt && (
                              <div style={{ marginBottom: 4 }}>
                                <Typography.Text type="secondary">
                                  阅卷时间: {new Date(item.gradedAt).toLocaleString()}
                                </Typography.Text>
                              </div>
                            )}
                            {item.questionScores && item.questionScores.length > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <Typography.Text strong style={{ marginRight: 8 }}>题目得分:</Typography.Text>
                                <Space wrap>
                                  {item.questionScores.map((q, qIndex) => {
                                    const percentage = q.maxScore > 0 ? (q.score / q.maxScore) * 100 : 0;
                                    return (
                                      <Tag 
                                        key={qIndex}
                                        color={percentage >= 80 ? 'green' : percentage >= 60 ? 'orange' : 'red'}
                                      >
                                        第{q.questionNumber}题: {q.score}/{q.maxScore}
                                      </Tag>
                                    );
                                  })}
                                </Space>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Typography.Text type="secondary">暂无成绩数据</Typography.Text>
                </div>
              )}
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
              <Tag color="blue" style={{ marginLeft: 8 }}>
                已结束
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
              <Typography.Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                📋 基本信息
              </Typography.Title>
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
                  <Tag color="red">已结束</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 详细描述 */}
            {selectedExam.description && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <Typography.Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                  📄 详细信息
                </Typography.Title>
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
              <Typography.Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                📁 考试文件
              </Typography.Title>
              <Row gutter={16}>
                {/* 试题文件 */}
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
                      <Typography.Text strong>试题文件</Typography.Text>
                      {selectedExam.questionFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.questionFile.name}
                          </Typography.Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            style={{ padding: '4px 0' }}
                            onClick={() => {
                              if (onDownloadFile) {
                                onDownloadFile(selectedExam.questionFile!);
                              } else if (downloadFile) {
                                downloadFile(selectedExam.questionFile!.url, selectedExam.questionFile!.name);
                              }
                            }}
                          >
                            下载文件
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>未上传</Typography.Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* 答题卡文件 */}
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
                      <Typography.Text strong>答题卡文件</Typography.Text>
                      {selectedExam.answerSheetFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.answerSheetFile.name}
                          </Typography.Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            style={{ padding: '4px 0' }}
                            onClick={() => {
                              if (onDownloadFile) {
                                onDownloadFile(selectedExam.answerSheetFile!);
                              } else if (downloadFile) {
                                downloadFile(selectedExam.answerSheetFile!.url, selectedExam.answerSheetFile!.name);
                              }
                            }}
                          >
                            下载文件
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>未上传</Typography.Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* 答案文件 */}
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
                      <Typography.Text strong>答案文件</Typography.Text>
                      {selectedExam.answerFile ? (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                            {selectedExam.answerFile.name}
                          </Typography.Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            style={{ padding: '4px 0' }}
                            onClick={() => {
                              if (onDownloadFile) {
                                onDownloadFile(selectedExam.answerFile!);
                              } else if (downloadFile) {
                                downloadFile(selectedExam.answerFile!.url, selectedExam.answerFile!.name);
                              }
                            }}
                          >
                            下载文件
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>未上传</Typography.Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryExamPage;
