import React, { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Badge, Descriptions, Tag, Spin, message } from 'antd';
import { TrophyOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StudentAPI from '../api/student';
import CoachAPI from '../api/coach';
import { ScoreValidator } from '../utils/scoreValidator';
import { 
  QuestionScore,
  ExamScore
} from '../types/common';
import './ScoreDetail.css';

interface ScoreDetailData {
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  regionName?: string;
  schoolName?: string;
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  questionScores: QuestionScore[];
  totalRank?: number;
  regionRank?: number;
  schoolRank?: number;
  totalParticipants?: number;
  regionParticipants?: number;
  schoolParticipants?: number;
  submittedAt: string;
  gradedAt?: string;
  status: 'submitted' | 'grading' | 'graded';
}

interface ScoreDetailProps {
  examId: string;
  studentId?: string; // 如果是教练查看，需要传入学生ID
  userType: 'student' | 'coach';
}

const ScoreDetail: React.FC<ScoreDetailProps> = ({ examId, studentId, userType }) => {
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreDetailData | null>(null);

  useEffect(() => {
    loadScoreDetail();
  }, [examId, studentId]);

  const loadScoreDetail = async () => {
    setLoading(true);
    try {
      let response;
      if (userType === 'student') {
        response = await StudentAPI.getScoreDetail(examId);
      } else {
        // 教练查看学生成绩
        if (!studentId) {
          message.error('缺少学生ID');
          return;
        }
        response = await CoachAPI.getStudentScoreDetail(studentId, examId);
      }

      if (response.success && response.data) {
        setScoreData(response.data);
      } else {
        message.error(response.message || '加载成绩详情失败');
      }
    } catch (error) {
      console.error('加载成绩详情失败:', error);
      message.error('加载成绩详情失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'submitted': { status: 'processing', text: '已提交' },
      'grading': { status: 'warning', text: '阅卷中' },
      'graded': { status: 'success', text: '已阅卷' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { status: 'default', text: '未知' };
    return <Badge status={config.status as any} text={config.text} />;
  };

  const getRankDisplay = (rank?: number, total?: number) => {
    if (!rank || !total) return '-';
    const percentage = ((total - rank + 1) / total * 100).toFixed(1);
    return (
      <span>
        第 <strong>{rank}</strong> 名 / {total}人
        <br />
        <small style={{ color: '#666' }}>超过 {percentage}% 的参与者</small>
      </span>
    );
  };

  const questionColumns = [
    {
      title: '题号',
      dataIndex: 'questionNumber',
      key: 'questionNumber',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '得分',
      key: 'score',
      width: 100,
      align: 'center' as const,
      render: (record: QuestionScore) => (
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {record.score} / {record.maxScore}
        </span>
      ),
    },
    {
      title: '得分率',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 100,
      align: 'center' as const,
      render: (percentage: number) => (
        <Tag color={percentage >= 80 ? 'green' : percentage >= 60 ? 'orange' : 'red'}>
          {percentage.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: '评语',
      dataIndex: 'comments',
      key: 'comments',
      render: (comments: string) => comments || '-',
    },
    {
      title: '阅卷信息',
      key: 'graderInfo',
      width: 150,
      render: (record: QuestionScore) => (
        <div>
          {record.graderName && <div>阅卷员: {record.graderName}</div>}
          {record.gradedAt && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(record.gradedAt).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>暂无成绩数据</p>
      </div>
    );
  }

  return (
    <div className="score-detail">
      {/* 基本信息 */}
      <Card title="考试信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="考试名称">{scoreData.examTitle}</Descriptions.Item>
          <Descriptions.Item label="学生姓名">{scoreData.studentName}</Descriptions.Item>
          <Descriptions.Item label="所属赛区">{scoreData.regionName || '-'}</Descriptions.Item>
          <Descriptions.Item label="所属学校">{scoreData.schoolName || '-'}</Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {new Date(scoreData.submittedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="阅卷状态">
            {getStatusBadge(scoreData.status)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 成绩统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总分"
              value={scoreData.totalScore}
              suffix={`/ ${scoreData.maxTotalScore}`}
              precision={1}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="blue" style={{ fontSize: '14px' }}>
                {scoreData.percentage.toFixed(1)}%
              </Tag>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总排名"
              value={scoreData.totalRank || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => getRankDisplay(scoreData.totalRank, scoreData.totalParticipants)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="赛区排名"
              value={scoreData.regionRank || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => getRankDisplay(scoreData.regionRank, scoreData.regionParticipants)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="校内排名"
              value={scoreData.schoolRank || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => getRankDisplay(scoreData.schoolRank, scoreData.schoolParticipants)}
            />
          </Card>
        </Col>
      </Row>

      {/* 各题得分详情 */}
      <Card title="各题得分详情" style={{ marginBottom: 16 }}>
        <Table
          columns={questionColumns}
          dataSource={scoreData.questionScores}
          rowKey="questionNumber"
          pagination={false}
          size="middle"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 成绩分析 */}
      <Card title="成绩分析">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div className="analysis-item">
              <h4>得分分布</h4>
              <div className="score-breakdown">
                {scoreData.questionScores.map((q) => (
                  <div key={q.questionNumber} className="question-bar">
                    <span className="question-label">第{q.questionNumber}题</span>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${q.percentage}%`,
                          backgroundColor: q.percentage >= 80 ? '#52c41a' : q.percentage >= 60 ? '#faad14' : '#ff4d4f'
                        }}
                      />
                    </div>
                    <span className="score-text">
                      {q.score}/{q.maxScore} ({q.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="analysis-item">
              <h4>排名情况</h4>
              <div className="rank-info">
                <div className="rank-item">
                  <span className="rank-label">总体排名:</span>
                  <span className="rank-value">
                    {scoreData.totalRank ? `${scoreData.totalRank}/${scoreData.totalParticipants}` : '暂无'}
                  </span>
                </div>
                <div className="rank-item">
                  <span className="rank-label">赛区排名:</span>
                  <span className="rank-value">
                    {scoreData.regionRank ? `${scoreData.regionRank}/${scoreData.regionParticipants}` : '暂无'}
                  </span>
                </div>
                <div className="rank-item">
                  <span className="rank-label">校内排名:</span>
                  <span className="rank-value">
                    {scoreData.schoolRank ? `${scoreData.schoolRank}/${scoreData.schoolParticipants}` : '暂无'}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ScoreDetail;
