import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Space, Table, message, Modal, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import AdminAPI from '../api/admin';
import { ScoreValidator } from '../utils/scoreValidator';
import { Question } from '../types/common';
import './QuestionScoreSettings.css';

interface QuestionScoreSettingsProps {
  examId: string;
  onClose?: () => void;
  onSave?: (questions: Question[]) => void;
}

const QuestionScoreSettings: React.FC<QuestionScoreSettingsProps> = ({
  examId,
  onClose,
  onSave
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadQuestionScores();
  }, [examId]);

  const loadQuestionScores = async () => {
    if (!examId) return;
    
    setLoading(true);
    try {
      const response = await AdminAPI.getQuestionScores(examId);
      if (response.success && response.data) {
        setQuestions(response.data.questions || []);
      }
    } catch (error) {
      console.error('加载题目分值失败:', error);
      message.error('加载题目分值失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      number: questions.length + 1,
      score: 0,
      content: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // 重新编号
    const reNumberedQuestions = newQuestions.map((q, i) => ({
      ...q,
      number: i + 1
    }));
    setQuestions(reNumberedQuestions);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const validateQuestions = (): boolean => {
    const errors: string[] = [];

    questions.forEach((question, index) => {
      if (question.score <= 0) {
        errors.push(`第${question.number}题分值必须大于0`);
      }
      if (question.score > 100) {
        errors.push(`第${question.number}题分值不能超过100分`);
      }
      // 检查小数位数
      const decimalPlaces = (question.score.toString().split('.')[1] || '').length;
      if (decimalPlaces > 1) {
        errors.push(`第${question.number}题分值最多保留1位小数`);
      }
    });

    if (errors.length > 0) {
      message.error(errors.join('; '));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateQuestions()) return;

    setSaving(true);
    try {
      const response = await AdminAPI.setQuestionScores(examId, questions);
      if (response.success) {
        message.success('题目分值设置成功');
        onSave?.(questions);
      } else {
        message.error(response.message || '设置失败');
      }
    } catch (error) {
      console.error('保存题目分值失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const response = await AdminAPI.importQuestionScores(examId, file);
      if (response.success) {
        message.success('导入成功');
        loadQuestionScores();
      } else {
        message.error(response.message || '导入失败');
      }
    } catch (error) {
      console.error('导入题目分值失败:', error);
      message.error('导入失败');
    } finally {
      setLoading(false);
    }
    return false; // 阻止默认上传
  };

  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);

  const columns = [
    {
      title: '题号',
      dataIndex: 'number',
      key: 'number',
      width: 80,
      render: (value: number, record: Question, index: number) => (
        <span>{value}</span>
      )
    },
    {
      title: '分值',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (value: number, record: Question, index: number) => (
        <InputNumber
          value={value}
          onChange={(newValue) => handleQuestionChange(index, 'score', newValue || 0)}
          min={0}
          max={100}
          step={0.1}
          precision={1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      key: 'content',
      render: (value: string, record: Question, index: number) => (
        <Input
          value={value}
          onChange={(e) => handleQuestionChange(index, 'content', e.target.value)}
          placeholder="可选，题目描述"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Question, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteQuestion(index)}
          title="删除题目"
        />
      )
    }
  ];

  return (
    <div className="question-score-settings">
      <div className="header">
        <h3>题目分值设置</h3>
        <Space>
          <Upload
            beforeUpload={handleImport}
            showUploadList={false}
            accept=".xlsx,.xls,.csv"
          >
            <Button icon={<UploadOutlined />}>导入分值</Button>
          </Upload>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddQuestion}
          >
            添加题目
          </Button>
        </Space>
      </div>

      <div className="content">
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="number"
          loading={loading}
          pagination={false}
          size="middle"
          scroll={{ y: 400 }}
        />

        <div className="summary">
          <div className="total-info">
            <span>题目总数：{questions.length}</span>
            <span>总分：{totalScore.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <Space>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            disabled={questions.length === 0}
          >
            保存设置
          </Button>
        </Space>
      </div>

      <div className="tips">
        <h4>使用说明：</h4>
        <ul>
          <li>每题分值必须大于0，最多保留1位小数</li>
          <li>可以导入Excel文件批量设置分值</li>
          <li>题目内容为可选项，用于描述题目</li>
          <li>保存后阅卷员将按此分值进行评分</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionScoreSettings;
