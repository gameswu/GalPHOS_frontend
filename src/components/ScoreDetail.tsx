import React, { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Badge, Descriptions, Tag, Spin, message } from 'antd';
import { TrophyOutlined, RiseOutlined } from '@ant-design/icons';
import StudentAPI from '../api/student';
import CoachAPI from '../api/coach';
import { 
  QuestionScore,
  ExamScore
} from '../types/common';

interface ScoreDetailProps {
  examId: string;
  studentId?: string; // 如果是教练查看，需要传入学生ID
  userType: 'student' | 'coach';
}

const ScoreDetailSimplified: React.FC<ScoreDetailProps> = ({ examId, studentId, userType }) => {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<ExamScore | null>(null);

  useEffect(() => {
    loadScoreData();
  }, [examId, studentId, userType]);

  const loadScoreData = async () => {
    try {
      setLoading(true);
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

  const columns = [
    {
      title: '题号',
      dataIndex: 'questionNumber',
      key: 'questionNumber',
      width: 80,
      render: (num: number) => <strong>第{num}题</strong>
    },
    {
      title: '得分',
      key: 'score',
      width: 120,
      render: (record: QuestionScore) => (
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {record.score}
          </span>
          <span style={{ color: '#666', marginLeft: 4 }}>
            / {record.maxScore}
          </span>
        </div>
      )
    },
    {
      title: '得分率',
      key: 'percentage',
      width: 100,
      render: (record: QuestionScore) => {
        const percentage = record.maxScore > 0 ? (record.score / record.maxScore) * 100 : 0;
        return (
          <Tag color={percentage >= 80 ? 'green' : percentage >= 60 ? 'orange' : 'red'}>
            {percentage.toFixed(1)}%
          </Tag>
        );
      }
    }
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
          <Descriptions.Item label="用户名">{scoreData.username}</Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {new Date(scoreData.submittedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="阅卷状态">
            {getStatusBadge(scoreData.status)}
          </Descriptions.Item>
          {scoreData.gradedAt && (
            <Descriptions.Item label="阅卷时间">
              {new Date(scoreData.gradedAt).toLocaleString()}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 成绩统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总分"
              value={scoreData.totalScore}
              precision={0}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总排名"
              value={scoreData.totalRank || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => scoreData.totalRank ? `第 ${scoreData.totalRank} 名` : '暂无'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="赛区排名"
              value={scoreData.regionRank || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => scoreData.regionRank ? `第 ${scoreData.regionRank} 名` : '暂无'}
            />
          </Card>
        </Col>
      </Row>

      {/* 题目得分详情 */}
      <Card title="题目得分详情">
        <Table
          columns={columns}
          dataSource={scoreData.questionScores}
          rowKey="questionNumber"
          pagination={false}
          size="small"
        />

        {/* 总分显示 */}
        <div style={{ 
          marginTop: 16, 
          padding: 16, 
          background: '#f6f8fa', 
          borderRadius: 6,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
            总分: {scoreData.totalScore}
          </div>
          <div style={{ marginTop: 8, color: '#666' }}>
            {scoreData.totalRank && `总排名: 第 ${scoreData.totalRank} 名`}
            {scoreData.regionRank && ` | 赛区排名: 第 ${scoreData.regionRank} 名`}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScoreDetailSimplified;
