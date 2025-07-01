import React from 'react';
import { 
  Card, 
  Typography, 
  Statistic, 
  Row, 
  Col, 
  List, 
  Tag, 
  Progress,
  Space
} from 'antd';
import { 
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import type { Exam, GradingTask, GradingStatistics } from '../hooks/useGraderLogic';

const { Title, Text } = Typography;

interface GraderDashboardProps {
  loading: boolean;
  exams: Exam[];
  gradingTasks: GradingTask[];
  statistics?: GradingStatistics;
  loadAllGradingTasks: () => void;
}

const GraderDashboard: React.FC<GraderDashboardProps> = ({
  loading,
  exams,
  gradingTasks,
  statistics,
  loadAllGradingTasks
}) => {
  React.useEffect(() => {
    loadAllGradingTasks();
  }, [loadAllGradingTasks]);

  // 优先使用API返回的统计数据，如果没有则计算本地数据
  const totalTasks = statistics?.totalTasks ?? gradingTasks.length;
  const completedTasks = statistics?.completedTasks ?? gradingTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = statistics?.pendingTasks ?? gradingTasks.filter(task => task.status === 'pending').length;
  const gradingTasks_ = statistics?.gradingTasks ?? gradingTasks.filter(task => task.status === 'grading').length;
  const todayCompleted = statistics?.todayCompleted ?? 0;
  const efficiency = statistics?.efficiency;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 考试统计
  const gradingExams = exams.filter(exam => exam.status === 'grading');
  const completedExams = exams.filter(exam => exam.status === 'completed');

  // 最近的阅卷任务
  const recentTasks = gradingTasks
    .filter(task => task.submittedAt) // 过滤掉没有提交时间的任务
    .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
    .slice(0, 5);

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="总阅卷任务"
              value={totalTasks}
              suffix="份"
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="待阅卷"
              value={pendingTasks}
              suffix="份"
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="已完成"
              value={completedTasks}
              suffix="份"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 阅卷进度 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <EditOutlined />
                <span>阅卷进度</span>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong>总体完成率</Text>
              <Progress 
                percent={Math.round(completionRate)} 
                status={completionRate === 100 ? 'success' : 'active'}
                style={{ marginBottom: 8 }}
              />
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary">待阅卷: {pendingTasks}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">进行中: {gradingTasks_}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">已完成: {completedTasks}</Text>
                </Col>
              </Row>
            </div>

            {/* 考试分类统计 */}
            <div>
              <Text strong>考试状态分布</Text>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="阅卷中考试"
                      value={gradingExams.length}
                      suffix="场"
                      valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="已完成考试"
                      value={completedExams.length}
                      suffix="场"
                      valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* 最近任务 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>最近阅卷任务</span>
              </Space>
            }
          >
            {recentTasks.length > 0 ? (
              <List
                dataSource={recentTasks}
                renderItem={(task) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{task.studentName}</Text>
                          <Tag color={task.status === 'completed' ? 'green' : task.status === 'grading' ? 'blue' : 'orange'}>
                            {task.status === 'completed' ? '已完成' : task.status === 'grading' ? '阅卷中' : '待阅卷'}
                          </Tag>
                          {task.score !== undefined && (
                            <Tag color="purple">{task.score}分</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {task.examTitle}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            提交时间: {task.submittedAt ? new Date(task.submittedAt).toLocaleString() : '未知'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">暂无阅卷任务</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 快速统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>今日阅卷概览</span>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {pendingTasks}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>待处理任务</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {completedTasks}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>今日已完成</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {Math.round(completionRate)}%
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>完成率</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GraderDashboard;
