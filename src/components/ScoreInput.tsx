import React, { useState, useEffect, useRef } from 'react';
import { ScoreValidator, ScoreInputProps } from '../utils/scoreValidator';
import './ScoreInput.css';

const ScoreInput: React.FC<ScoreInputProps> = ({
  questionNumber,
  maxScore,
  minScore = 0,
  value,
  onChange,
  onValidationChange,
  placeholder,
  disabled = false,
  autoFocus = false
}) => {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 空值情况
    if (newValue === '') {
      setErrorMessage('');
      setIsValid(true);
      onValidationChange?.(true);
      return;
    }

    // 验证输入值
    const validation = ScoreValidator.validateScore(
      newValue,
      questionNumber,
      maxScore,
      minScore
    );

    setIsValid(validation.isValid);
    setErrorMessage(validation.errorMessage || '');
    
    // 通知父组件验证结果
    onValidationChange?.(validation.isValid, validation.errorMessage);

    // 如果验证通过，通知父组件分数变化
    if (validation.isValid && newValue !== '') {
      const numericValue = Number(newValue);
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') return;

    const numericValue = Number(inputValue);
    if (!isNaN(numericValue)) {
      // 自动格式化为1位小数
      const formattedValue = ScoreValidator.formatScore(numericValue, 1);
      setInputValue(formattedValue);
      
      // 重新验证
      const validation = ScoreValidator.validateScore(
        formattedValue,
        questionNumber,
        maxScore,
        minScore
      );
      
      if (validation.isValid) {
        onChange(Number(formattedValue));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 只允许数字、小数点、退格键
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }

    // 防止输入多个小数点
    if (e.key === '.' && inputValue.includes('.')) {
      e.preventDefault();
    }
  };

  const applySuggestedScore = () => {
    const validation = ScoreValidator.validateScore(
      inputValue,
      questionNumber,
      maxScore,
      minScore
    );

    if (validation.suggestedScore !== undefined) {
      const formattedScore = ScoreValidator.formatScore(validation.suggestedScore, 1);
      setInputValue(formattedScore);
      setErrorMessage('');
      setIsValid(true);
      onChange(validation.suggestedScore);
      onValidationChange?.(true);
    }
  };

  const inputRules = ScoreValidator.getScoreInputRules(questionNumber, maxScore, minScore);

  return (
    <div className={`score-input-container ${!isValid ? 'error' : ''}`}>
      <div className="score-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className={`score-input ${!isValid ? 'error' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          placeholder={placeholder || `0-${maxScore}`}
          disabled={disabled}
          title={inputRules}
        />
        <span className="score-max">/ {maxScore}</span>
      </div>
      
      {errorMessage && (
        <div className="score-error">
          <span className="error-message">{errorMessage}</span>
          {ScoreValidator.validateScore(inputValue, questionNumber, maxScore, minScore).suggestedScore !== undefined && (
            <button
              type="button"
              className="suggest-button"
              onClick={applySuggestedScore}
              title="应用建议分数"
            >
              应用建议
            </button>
          )}
        </div>
      )}
      
      <div className="score-rules">{inputRules}</div>
    </div>
  );
};

export default ScoreInput;
