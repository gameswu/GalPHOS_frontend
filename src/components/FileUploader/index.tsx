// 文件上传组件
import React, { useState, useRef } from 'react';
import FileUploadService, { FileUploadOptions, FileUploadResult } from '../../services/fileUploadService';
import './FileUploader.css';

interface FileUploaderProps {
  // 上传选项
  options: FileUploadOptions;
  // 上传成功回调
  onSuccess?: (result: FileUploadResult) => void;
  // 上传失败回调
  onError?: (error: string) => void;
  // 是否支持多文件上传
  multiple?: boolean;
  // 自定义样式类名
  className?: string;
  // 是否禁用
  disabled?: boolean;
  // 占位文本
  placeholder?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  options,
  onSuccess,
  onError,
  multiple = false,
  className = '',
  disabled = false,
  placeholder = '点击或拖拽文件到此处上传'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      if (multiple && files.length > 1) {
        // 批量上传
        await FileUploadService.uploadExamFiles(files, options.relatedId || '', setProgress);
        onSuccess?.({} as FileUploadResult); // 批量上传的返回结果需要特殊处理
      } else {
        // 单文件上传
        const file = files[0];
        const result = await FileUploadService.uploadFile(file, {
          ...options,
          onProgress: setProgress
        });

        if (result.success && result.data) {
          onSuccess?.(result.data);
        } else {
          throw new Error(result.message || '上传失败');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const getAcceptTypes = () => {
    if (options.allowedTypes) {
      return options.allowedTypes.join(',');
    }
    return options.category === 'avatar' || options.category === 'answer-image' 
      ? 'image/*' 
      : '*';
  };

  return (
    <div 
      className={`file-uploader ${className} ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={getAcceptTypes()}
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      {uploading ? (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      ) : (
        <div className="upload-placeholder">
          <div className="upload-icon">📁</div>
          <div className="upload-text">{placeholder}</div>
          {options.category === 'avatar' && (
            <div className="upload-hint">支持 JPG、PNG 格式，大小不超过 5MB</div>
          )}
          {options.category === 'answer-image' && (
            <div className="upload-hint">支持 JPG、PNG、GIF 格式，大小不超过 10MB</div>
          )}
          {options.category === 'exam-file' && (
            <div className="upload-hint">支持图片、PDF、Word、Excel 格式，大小不超过 50MB</div>
          )}
        </div>
      )}
    </div>
  );
};

// 头像上传组件
export const AvatarUploader: React.FC<{
  onSuccess?: (result: FileUploadResult) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}> = ({ onSuccess, onError, disabled }) => {
  return (
    <FileUploader
      options={{ category: 'avatar' }}
      onSuccess={onSuccess}
      onError={onError}
      disabled={disabled}
      placeholder="上传头像"
      className="avatar-uploader"
    />
  );
};

// 答题图片上传组件
export const AnswerImageUploader: React.FC<{
  examId: string;
  questionNumber: number;
  studentUsername?: string; // 教练代理上传时使用
  onSuccess?: (result: FileUploadResult) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}> = ({ examId, questionNumber, studentUsername, onSuccess, onError, disabled }) => {
  return (
    <FileUploader
      options={{
        category: 'answer-image',
        relatedId: examId,
        questionNumber,
        studentUsername
      }}
      onSuccess={onSuccess}
      onError={onError}
      disabled={disabled}
      placeholder="上传答题图片"
      className="answer-image-uploader"
    />
  );
};

// 考试文件上传组件
export const ExamFileUploader: React.FC<{
  examId: string;
  onSuccess?: (results: FileUploadResult[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}> = ({ examId, onSuccess, onError, disabled }) => {
  return (
    <FileUploader
      options={{
        category: 'exam-file',
        relatedId: examId
      }}
      onSuccess={(result) => onSuccess?.([result])}
      onError={onError}
      disabled={disabled}
      multiple={true}
      placeholder="上传考试文件（支持多文件）"
      className="exam-file-uploader"
    />
  );
};

export default FileUploader;
