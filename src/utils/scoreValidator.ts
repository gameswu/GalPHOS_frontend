// 分值验证工具类
export class ScoreValidator {
  /**
   * 验证分数输入是否有效
   * @param score 输入的分数
   * @param questionNumber 题目编号
   * @param maxScore 题目满分
   * @param minScore 题目最低分（默认为0）
   * @returns 验证结果
   */
  static validateScore(
    score: any,
    questionNumber: number,
    maxScore: number,
    minScore: number = 0
  ): {
    isValid: boolean;
    errorMessage?: string;
    suggestedScore?: number;
  } {
    // 检查是否为空值
    if (score === null || score === undefined || score === '') {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数不能为空`
      };
    }

    // 转换为数字
    const numScore = Number(score);

    // 检查是否为有效数字
    if (isNaN(numScore)) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数必须是有效数字`
      };
    }

    // 检查是否为负数
    if (numScore < minScore) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数不能低于${minScore}分`,
        suggestedScore: minScore
      };
    }

    // 检查是否超过最大值
    if (numScore > maxScore) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数不能超过${maxScore}分`,
        suggestedScore: maxScore
      };
    }

    // 检查小数位数（通常限制为1位小数）
    const decimalPlaces = (numScore.toString().split('.')[1] || '').length;
    if (decimalPlaces > 1) {
      return {
        isValid: false,
        errorMessage: `第${questionNumber}题分数最多保留1位小数`,
        suggestedScore: Math.round(numScore * 10) / 10
      };
    }

    return { isValid: true };
  }

  /**
   * 批量验证题目分数
   * @param questionScores 题目分数数组
   * @returns 验证结果
   */
  static validateQuestionScores(questionScores: Array<{
    questionNumber: number;
    score: any;
    maxScore: number;
    minScore?: number;
  }>): {
    isValid: boolean;
    errors: Array<{
      questionNumber: number;
      errorMessage: string;
      suggestedScore?: number;
    }>;
  } {
    const errors: Array<{
      questionNumber: number;
      errorMessage: string;
      suggestedScore?: number;
    }> = [];

    questionScores.forEach((question) => {
      const validation = this.validateScore(
        question.score,
        question.questionNumber,
        question.maxScore,
        question.minScore || 0
      );

      if (!validation.isValid) {
        errors.push({
          questionNumber: question.questionNumber,
          errorMessage: validation.errorMessage!,
          suggestedScore: validation.suggestedScore
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 格式化分数显示
   * @param score 分数
   * @param precision 小数位数（默认1位）
   * @returns 格式化后的分数字符串
   */
  static formatScore(score: number, precision: number = 1): string {
    if (isNaN(score)) return '0';
    return score.toFixed(precision);
  }

  /**
   * 计算百分比
   * @param score 得分
   * @param maxScore 满分
   * @param precision 小数位数（默认1位）
   * @returns 百分比字符串
   */
  static calculatePercentage(score: number, maxScore: number, precision: number = 1): string {
    if (maxScore === 0) return '0%';
    const percentage = (score / maxScore) * 100;
    return `${percentage.toFixed(precision)}%`;
  }

  /**
   * 验证总分是否与各题得分之和一致
   * @param questionScores 各题得分
   * @param totalScore 总分
   * @param tolerance 容差（默认0.01）
   * @returns 验证结果
   */
  static validateTotalScore(
    questionScores: number[],
    totalScore: number,
    tolerance: number = 0.01
  ): {
    isValid: boolean;
    errorMessage?: string;
    calculatedTotal: number;
  } {
    const calculatedTotal = questionScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
    const difference = Math.abs(calculatedTotal - totalScore);

    if (difference > tolerance) {
      return {
        isValid: false,
        errorMessage: `总分(${totalScore})与各题得分之和(${calculatedTotal})不一致`,
        calculatedTotal
      };
    }

    return {
      isValid: true,
      calculatedTotal
    };
  }

  /**
   * 获取分数输入的建议值
   * @param score 当前输入值
   * @param maxScore 最大分值
   * @param minScore 最小分值
   * @returns 建议的分数值
   */
  static getSuggestedScore(
    score: any,
    maxScore: number,
    minScore: number = 0
  ): number {
    const numScore = Number(score);
    
    if (isNaN(numScore)) return minScore;
    if (numScore < minScore) return minScore;
    if (numScore > maxScore) return maxScore;
    
    // 保留1位小数
    return Math.round(numScore * 10) / 10;
  }

  /**
   * 生成分数输入规则文本
   * @param questionNumber 题目编号
   * @param maxScore 最大分值
   * @param minScore 最小分值
   * @returns 规则文本
   */
  static getScoreInputRules(
    questionNumber: number,
    maxScore: number,
    minScore: number = 0
  ): string {
    return `第${questionNumber}题分数范围：${minScore}~${maxScore}分，最多保留1位小数`;
  }
}

// 分数输入组件的属性接口
export interface ScoreInputProps {
  questionNumber: number;
  maxScore: number;
  minScore?: number;
  value?: number;
  onChange: (score: number) => void;
  onValidationChange?: (isValid: boolean, errorMessage?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// 分数验证结果接口
export interface ScoreValidationResult {
  isValid: boolean;
  errorMessage?: string;
  suggestedScore?: number;
}

// 题目分数配置接口
export interface QuestionScoreConfig {
  questionNumber: number;
  maxScore: number;
  minScore: number;
  content?: string;
}

export default ScoreValidator;
