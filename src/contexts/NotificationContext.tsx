import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';

interface NotificationContextType {
  // 便捷方法
  showError: (message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // 配置全局通知样式和位置
  useEffect(() => {
    // 设置通知从左上角弹出
    notification.config({
      placement: 'topLeft' as NotificationPlacement,
      top: 24,
      duration: 4.5, // 默认显示时长
      maxCount: 3, // 最多同时显示3个通知
      rtl: false,
    });
  }, []);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    console.log('NotificationContext.showError调用:', message, title); // 调试信息
    notification.error({
      message: title || '错误',
      description: message,
      duration: duration ?? 4.5,
      placement: 'topLeft',
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    // 成功消息不显示通知
    // 可以在这里添加console.log用于调试
    // console.log('Success:', message);
  }, []);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    notification.warning({
      message: title || '警告',
      description: message,
      duration: duration ?? 4.5,
      placement: 'topLeft',
    });
  }, []);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    notification.info({
      message: title || '信息',
      description: message,
      duration: duration ?? 4.5,
      placement: 'topLeft',
    });
  }, []);

  const value: NotificationContextType = {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
