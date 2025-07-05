import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Row, Col, message, Spin, Modal, Input } from 'antd';
import { CheckOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import ScoreInput from './ScoreInput';
import GraderAPI from '../api/grader';
import { ScoreValidator } from '../utils/scoreValidator';
import { 
  Question as BaseQuestion,
  GradingQuestionScore,
  ExamSubmission
} from '../types/common';
import './GradingInterface.css';

// 阅卷界面专用的题目类型
interface GradingQuestion {
  questionNumber: number; // 题目编号
  questionId: string; // 题目ID
  content?: string; // 题目内容
  score: number; // 题目分值
  maxScore?: number; // 最大可得分
  answerContent?: string; // 答案内容
  imageUrl?: string; // 题目图片
}

interface GradingInterfaceProps {
  taskId: string;
  examId: string;
  submissionId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const GradingInterface: React.FC<GradingInterfaceProps> = ({
  taskId,
  examId,
  submissionId,
  onComplete,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<GradingQuestion[]>([]);
  const [questionScores, setQuestionScores] = useState<GradingQuestionScore[]>([]);
  const [generalComments, setGeneralComments] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [submissionData, setSubmissionData] = useState<any>(null);

  useEffect(() => {
    loadGradingData();
  }, [taskId, examId, submissionId]);

  const loadGradingData = async () => {
    setLoading(true);
    try {
      // 并行加载任务详情、题目分值配置和答卷内容
      const [taskResponse, questionScoresResponse, submissionResponse] = await Promise.all([
        GraderAPI.getGradingTaskDetail(taskId),
        GraderAPI.getExamQuestionScores(examId),
        GraderAPI.getSubmissionDetail(submissionId)
      ]);

      if (taskResponse.success && taskResponse.data) {
        // 处理任务数据
      }

      if (questionScoresResponse.success && questionScoresResponse.data) {
        const questionsData = questionScoresResponse.data.questions || [];
        setQuestions(questionsData);
        
        // 初始化分数数组
        const initialScores = questionsData.map((q: any) => ({
          questionNumber: q.number,
          score: 0,
          comments: ''
        }));
        setQuestionScores(initialScores);
      }

      if (submissionResponse.success && submissionResponse.data) {
        setSubmissionData(submissionResponse.data);
      }
    } catch (error) {
      console.error('加载阅卷数据失败:', error);
      message.error('加载阅卷数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (questionNumber: number, score: number) => {
    setQuestionScores(prev => 
      prev.map(item => 
        item.questionNumber === questionNumber 
          ? { ...item, score }
          : item
      )
    );
  };

  const handleCommentsChange = (questionNumber: number, comments: string) => {
    setQuestionScores(prev => 
      prev.map(item => 
        item.questionNumber === questionNumber 
          ? { ...item, comments }
          : item
      )
    );
  };

  const handleScoreValidation = (questionNumber: number, isValid: boolean, errorMessage?: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (isValid) {
        delete newErrors[questionNumber];
      } else {
        newErrors[questionNumber] = errorMessage || '';
      }
      return newErrors;
    });
  };

  const validateAllScores = (): boolean => {
    const validationData = questions.map(q => {
      const scoreItem = questionScores.find(s => s.questionNumber === q.questionNumber);
      return {
        questionNumber: q.questionNumber,
        score: scoreItem?.score || 0,
        maxScore: q.maxScore || q.score || 100 // 使用maxScore，如果没有则使用score，最后默认100
      };
    });

    const validation = ScoreValidator.validateQuestionScores(validationData);
    
    if (!validation.isValid) {
      const errorMap: Record<number, string> = {};
      validation.errors.forEach(error => {
        errorMap[error.questionNumber] = error.errorMessage;
      });
      setValidationErrors(errorMap);
      
      const errorMessages = validation.errors.map(e => e.errorMessage).join('; ');
      message.error(`分数验证失败: ${errorMessages}`);
      return false;
    }

    return true;
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      const progressData = {
        questionScores: questionScores.map(item => {
          const question = questions.find(q => q.questionNumber === item.questionNumber);
          return {
            questionId: question?.questionId || `question_${item.questionNumber}`,
            score: item.score,
            comments: item.comments
          };
        }),
        currentQuestionIndex: 0,
        lastSaveTime: new Date().toISOString()
      };

      const response = await GraderAPI.saveGradingProgress(taskId, progressData);
      if (response.success) {
        message.success('进度已保存');
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存进度失败:', error);
      message.error('保存进度失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateAllScores()) {
      return;
    }

    // 二次确认
    Modal.confirm({
      title: '确认提交',
      content: '提交后将无法修改，请确认分数无误。',
      onOk: async () => {
        setSaving(true);
        try {
          const totalScore = questionScores.reduce((sum, item) => sum + item.score, 0);
          const maxTotalScore = questions.reduce((sum, q) => sum + (q.maxScore || q.score || 100), 0);

          const gradingData = {
            questionScores: questionScores.map(item => {
              const question = questions.find(q => q.questionNumber === item.questionNumber);
              return {
                questionId: question?.questionId || `question_${item.questionNumber}`,
                questionNumber: item.questionNumber,
                score: item.score,
                maxScore: question?.maxScore || question?.score || 100,
                comments: item.comments
              };
            }),
            totalScore,
            maxTotalScore,
            generalComments,
            submissionTime: new Date().toISOString()
          };

          const response = await GraderAPI.submitGradingResult(taskId, gradingData);
          if (response.success) {
            message.success('阅卷结果提交成功');
            onComplete?.();
          } else {
            message.error(response.message || '提交失败');
          }
        } catch (error) {
          console.error('提交阅卷结果失败:', error);
          message.error('提交失败');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const getTotalScore = () => {
    return questionScores.reduce((sum, item) => sum + item.score, 0);
  };

  const getMaxTotalScore = () => {
    return questions.reduce((sum, q) => sum + (q.maxScore || q.score || 100), 0);
  };

  const hasValidationErrors = () => {
    return Object.keys(validationErrors).length > 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载阅卷数据中...</p>
      </div>
    );
  }

  return (
    <div className="grading-interface">
      {/* 头部信息 */}
      <Card title="阅卷评分" className="header-card" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <span>总分: <strong>{getTotalScore().toFixed(1)} / {getMaxTotalScore()}</strong></span>
              <span>题目数: {questions.length}</span>
              {submissionData && (
                <span>学生: {submissionData.studentName}</span>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSaveProgress}
                loading={saving}
              >
                保存进度
              </Button>
              <Button 
                icon={<CloseOutlined />} 
                onClick={onCancel}
              >
                取消
              </Button>
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
                loading={saving}
                disabled={hasValidationErrors()}
              >
                提交阅卷
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 题目评分列表 */}
      <div className="questions-list">
        {questions.map((question, index) => {
          const scoreItem = questionScores.find(s => s.questionNumber === question.questionNumber);
          return (
            <Card 
              key={question.questionNumber}
              title={`第 ${question.questionNumber} 题 (${question.maxScore}分)`}
              className="question-card"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <div className="question-content">
                    <h4>题目内容:</h4>
                    <div className="content-display">
                      {question.content || '暂无题目内容'}
                    </div>
                  </div>
                  
                  {question.imageUrl && (
                    <div className="question-image">
                      <h4>题目图片:</h4>
                      <img 
                        src={question.imageUrl} 
                        alt={`第${question.questionNumber}题`}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                  )}
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="answer-content">
                    <h4>学生答案:</h4>
                    <div className="content-display">
                      {question.answerContent || '暂无答案内容'}
                    </div>
                  </div>
                  
                  <div className="scoring-section">
                    <h4>评分:</h4>
                    <ScoreInput
                      questionNumber={question.questionNumber}
                      maxScore={question.maxScore || question.score || 100}
                      value={scoreItem?.score}
                      onChange={(score) => handleScoreChange(question.questionNumber, score)}
                      onValidationChange={(isValid, errorMessage) => 
                        handleScoreValidation(question.questionNumber, isValid, errorMessage)
                      }
                      autoFocus={index === 0}
                    />
                    
                    <div style={{ marginTop: 12 }}>
                      <Input.TextArea
                        placeholder="评语 (可选)"
                        value={scoreItem?.comments}
                        onChange={(e) => handleCommentsChange(question.questionNumber, e.target.value)}
                        rows={3}
                        maxLength={500}
                        showCount
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}
      </div>

      {/* 总评 */}
      <Card title="总评" style={{ marginTop: 16 }}>
        <Input.TextArea
          placeholder="整体评语 (可选)"
          value={generalComments}
          onChange={(e) => setGeneralComments(e.target.value)}
          rows={4}
          maxLength={1000}
          showCount
        />
      </Card>
    </div>
  );
};

export default GradingInterface;
