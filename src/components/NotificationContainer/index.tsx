import React, { useEffect, useState } from 'react';
import { useNotification, Notification } from '../../contexts/NotificationContext';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const [exitingNotifications, setExitingNotifications] = useState<Set<string>>(new Set());

  const handleClose = (id: string) => {
    setExitingNotifications(prev => new Set(prev).add(id));
    setTimeout(() => {
      removeNotification(id);
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // 动画持续时间
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      default:
        return '❌';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // 小于1分钟
      return '刚刚';
    } else if (diff < 3600000) { // 小于1小时
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前`;
    } else if (diff < 86400000) { // 小于1天
      const hours = Math.floor(diff / 3600000);
      return `${hours}小时前`;
    } else {
      return new Date(timestamp).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 限制显示的通知数量
  const visibleNotifications = notifications.slice(-8); // 最多显示8个

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {visibleNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isExiting={exitingNotifications.has(notification.id)}
          onClose={() => handleClose(notification.id)}
          getIcon={getIcon}
          formatTimestamp={formatTimestamp}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  isExiting: boolean;
  onClose: () => void;
  getIcon: (type: Notification['type']) => string;
  formatTimestamp: (timestamp: number) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isExiting,
  onClose,
  getIcon,
  formatTimestamp
}) => {
  const [progress, setProgress] = useState(100);

  // 进度条动画（如果有自动消失时间）
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const startTime = Date.now();
      const endTime = notification.timestamp + notification.duration;
      
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / (notification.duration as number)) * 100;
        
        setProgress(newProgress);
        
        if (newProgress > 0) {
          requestAnimationFrame(updateProgress);
        }
      };
      
      updateProgress();
    }
  }, [notification.duration, notification.timestamp]);

  return (
    <div 
      className={`notification-item ${notification.type} ${isExiting ? 'exiting' : ''}`}
      role="alert"
    >
      <div className="notification-header">
        <h4 className="notification-title">
          <span className={`notification-icon ${notification.type}`}>
            {getIcon(notification.type)}
          </span>
          {notification.title}
        </h4>
        <button 
          className="notification-close"
          onClick={onClose}
          aria-label="关闭通知"
          title="关闭"
        >
          ×
        </button>
      </div>
      
      <p className="notification-message">
        {notification.message}
      </p>
      
      <div className="notification-timestamp">
        {formatTimestamp(notification.timestamp)}
      </div>
      
      {notification.duration && notification.duration > 0 && (
        <div 
          className="notification-progress"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
};

export default NotificationContainer;
