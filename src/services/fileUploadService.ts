// 文件上传工具类
import { ApiResponse, BaseAPI } from '../types/api';
import { microserviceRouter } from '../services/microserviceRouter';

export interface FileUploadOptions {
  // 文件分类
  category: 'avatar' | 'answer-image' | 'exam-file' | 'document' | 'other';
  // 关联的业务ID（考试ID、用户ID等）
  relatedId?: string;
  // 文件类型（针对考试文件）
  fileType?: 'question' | 'answer' | 'answer_sheet';
  // 题号（针对答题图片）
  questionNumber?: number;
  // 学生用户名（教练代理上传时使用）
  studentUsername?: string;
  // 最大文件大小（字节），默认10MB
  maxSize?: number;
  // 允许的文件类型
  allowedTypes?: string[];
  // 是否显示上传进度
  showProgress?: boolean;
  // 上传进度回调
  onProgress?: (progress: number) => void;
}

export interface FileUploadResult {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
}

export class FileUploadService extends BaseAPI {
  // 默认配置
  private static defaultConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  };

  /**
   * 通用文件上传方法
   * @param file 要上传的文件
   * @param options 上传选项
   */
  static async uploadFile(file: File, options: FileUploadOptions): Promise<ApiResponse<FileUploadResult>> {
    try {
      // 1. 文件验证
      this.validateFile(file, options);

      // 2. 构建上传路径
      const uploadPath = this.buildUploadPath(options);

      // 3. 准备FormData
      const formData = this.buildFormData(file, options);

      // 4. 执行上传
      return await this.performUpload(uploadPath, formData, options);

    } catch (error) {
      return this.handleApiError(error, '文件上传');
    }
  }

  /**
   * 学生上传答题图片
   */
  static async uploadAnswerImage(
    file: File, 
    examId: string, 
    questionNumber: number,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResult>> {
    return this.uploadFile(file, {
      category: 'answer-image',
      relatedId: examId,
      questionNumber,
      allowedTypes: this.defaultConfig.allowedImageTypes,
      onProgress
    });
  }

  /**
   * 用户上传头像 - 通过各角色profile API内部处理（后端会自动调用文件服务）
   * 此方法仅用于文件验证和编码为base64字符串，实际上传由各角色API处理
   */
  static async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResult>> {
    console.log('头像上传请求开始 - 验证文件并转为base64，交由对应角色profile API处理');
    
    try {
      // 验证文件
      this.validateFile(file, {
        category: 'avatar',
        allowedTypes: this.defaultConfig.allowedImageTypes,
        maxSize: 5 * 1024 * 1024, // 头像限制5MB
      });
      
      // 读取文件为base64字符串
      const base64Data = await this.readFileAsBase64(file);
      
      // 返回base64格式，由角色API调用处理具体上传
      return {
        success: true,
        data: {
          fileId: '',
          fileName: file.name,
          fileUrl: base64Data,
          fileSize: file.size,
          fileType: file.type,
          uploadTime: new Date().toISOString()
        },
        message: '头像文件处理成功'
      };
    } catch (error) {
      console.error('头像处理错误:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '头像处理失败',
        data: undefined
      };
    }
  }
  
  /**
   * 将文件转换为base64编码字符串
   */
  private static readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * 教练代理上传答题图片
   */
  static async uploadAnswerImageByCoach(
    file: File,
    examId: string,
    questionNumber: number,
    studentUsername: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResult>> {
    return this.uploadFile(file, {
      category: 'answer-image',
      relatedId: examId,
      questionNumber,
      studentUsername,
      allowedTypes: this.defaultConfig.allowedImageTypes,
      onProgress
    });
  }

  /**
   * 管理员上传单个考试文件
   */
  static async uploadExamFile(
    file: File,
    examId: string,
    type: 'question' | 'answer' | 'answerSheet',
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResult>> {
    return this.uploadFile(file, {
      category: 'exam-file',
      relatedId: examId,
      fileType: type === 'answerSheet' ? 'answer_sheet' : type, // 转换为后端期望的格式
      allowedTypes: [...this.defaultConfig.allowedImageTypes, ...this.defaultConfig.allowedDocumentTypes],
      maxSize: 50 * 1024 * 1024, // 考试文件限制50MB
      onProgress
    });
  }

  /**
   * 管理员批量上传考试文件
   */
  static async uploadExamFiles(
    files: FileList,
    examId: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResult[]>> {
    try {
      const uploadPromises = Array.from(files).map(file =>
        this.uploadFile(file, {
          category: 'exam-file',
          relatedId: examId,
          allowedTypes: [...this.defaultConfig.allowedImageTypes, ...this.defaultConfig.allowedDocumentTypes],
          maxSize: 50 * 1024 * 1024, // 考试文件限制50MB
          onProgress
        })
      );

      const results = await Promise.all(uploadPromises);
      
      // 检查是否有失败的上传
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        throw new Error(`有 ${failedUploads.length} 个文件上传失败`);
      }

      return {
        success: true,
        data: results.map(result => result.data!),
        message: '文件上传成功'
      };
    } catch (error) {
      return this.handleApiError(error, '批量文件上传');
    }
  }

  /**
   * 文件验证
   */
  private static validateFile(file: File, options: FileUploadOptions): void {
    if (!file) {
      throw new Error('请选择要上传的文件');
    }

    // 文件大小验证
    const maxSize = options.maxSize || this.defaultConfig.maxSize;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(`文件大小不能超过 ${maxSizeMB}MB`);
    }

    // 文件类型验证
    const allowedTypes = options.allowedTypes || this.getDefaultAllowedTypes(options.category);
    if (!allowedTypes.includes(file.type)) {
      const typeNames = this.getTypeNames(allowedTypes);
      throw new Error(`只支持 ${typeNames} 格式的文件`);
    }

    // 文件名验证
    if (file.name.length > 255) {
      throw new Error('文件名过长，请重命名后上传');
    }
  }

  /**
   * 构建上传路径
   */
  private static buildUploadPath(options: FileUploadOptions): string {
    const { category, relatedId, questionNumber, studentUsername } = options;

    switch (category) {
      case 'avatar':
        // 头像上传已调整为通过各角色profile API处理
        // 此路径实际已不直接使用，仅保留用于兼容处理
        console.log('警告: 头像上传应使用角色profile API而非直接上传路径');
        return '/api/upload/file'; // 返回通用上传路径作为兼容
        
      case 'answer-image':
        if (studentUsername) {
          // 教练代理上传
          return `/api/coach/exams/${relatedId}/upload-answer`;
        } else {
          // 学生上传（统一路由格式）
          return `/api/student/exams/${relatedId}/upload-answer`;
        }
      case 'exam-file':
        return `/api/admin/exams/${relatedId}/upload`;
      case 'document':
        return '/api/upload/document';
      default:
        return '/api/upload/file';
    }
  }

  /**
   * 构建FormData
   */
  private static buildFormData(file: File, options: FileUploadOptions): FormData {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', options.category);

    if (options.relatedId) {
      formData.append('relatedId', options.relatedId);
    }

    if (options.fileType) {
      formData.append('type', options.fileType); // 后端期望的字段名是 'type'
    }

    if (options.questionNumber) {
      formData.append('questionNumber', options.questionNumber.toString());
    }

    if (options.studentUsername) {
      formData.append('studentUsername', options.studentUsername);
    }

    // 添加时间戳，避免浏览器缓存问题
    // 注意：后端FileStorageService当前未明确处理此字段，但前端保留用于确保上传请求唯一性和避免缓存
    // 建议：如后端无需此字段，可在后续版本中考虑移除
    formData.append('timestamp', Date.now().toString());

    return formData;
  }

  /**
   * 执行上传
   */
  private static async performUpload(
    uploadPath: string,
    formData: FormData,
    options: FileUploadOptions
  ): Promise<ApiResponse<FileUploadResult>> {
    // 通过微服务路由器获取完整URL
    const url = microserviceRouter.buildApiUrl(uploadPath);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 设置上传进度监听
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            options.onProgress!(progress);
          }
        });
      }

      // 设置响应处理
      xhr.addEventListener('load', () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        } catch (error) {
          reject(new Error('响应解析失败'));
        }
      });

      // 设置错误处理
      xhr.addEventListener('error', () => {
        reject(new Error('网络连接失败'));
      });

      // 设置超时处理
      xhr.addEventListener('timeout', () => {
        reject(new Error('上传超时'));
      });

      // 配置请求
      xhr.open('POST', url);
      xhr.timeout = 5 * 60 * 1000; // 5分钟超时

      // 添加认证头
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      } else {
        console.warn('FileUploadService: 未找到有效的认证token，请确保用户已登录');
      }

      // 发送请求
      xhr.send(formData);
    });
  }

  /**
   * 获取当前用户的认证token
   * 支持多种角色的token存储方式
   */
  private static getAuthToken(): string | null {
    // 按优先级检查不同角色的token
    const tokens = [
      localStorage.getItem('adminToken'),    // 管理员token
      localStorage.getItem('coachToken'),    // 教练token
      localStorage.getItem('studentToken'),  // 学生token
      localStorage.getItem('graderToken'),   // 阅卷员token
      localStorage.getItem('token')          // 通用token（兼容旧版本）
    ];

    // 返回第一个非空的token
    return tokens.find(token => token !== null && token !== 'null' && token !== '') || null;
  }

  /**
   * 获取默认允许的文件类型
   */
  private static getDefaultAllowedTypes(category: string): string[] {
    switch (category) {
      case 'avatar':
      case 'answer-image':
        return this.defaultConfig.allowedImageTypes;
      case 'exam-file':
        return [...this.defaultConfig.allowedImageTypes, ...this.defaultConfig.allowedDocumentTypes];
      case 'document':
        return this.defaultConfig.allowedDocumentTypes;
      default:
        return [...this.defaultConfig.allowedImageTypes, ...this.defaultConfig.allowedDocumentTypes];
    }
  }

  /**
   * 获取文件类型的友好名称
   */
  private static getTypeNames(types: string[]): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'JPG',
      'image/jpg': 'JPG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'image/webp': 'WebP',
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'text/plain': 'TXT'
    };

    const names = types.map(type => typeMap[type] || type).filter(Boolean);
    return names.join('、');
  }

  /**
   * 下载文件
   */
  static async downloadFile(fileId: string, fileName?: string): Promise<void> {
    try {
      const url = microserviceRouter.buildApiUrl(`/api/files/${fileId}/download`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || `file_${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(fileId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/api/files/${fileId}`,
      { method: 'DELETE' },
      '删除文件'
    );
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(fileId: string): Promise<ApiResponse<FileUploadResult>> {
    return this.makeRequest<FileUploadResult>(
      `/api/files/${fileId}`,
      { method: 'GET' },
      '获取文件信息'
    );
  }
}

export default FileUploadService;
