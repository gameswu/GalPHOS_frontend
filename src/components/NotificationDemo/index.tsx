import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationDemo: React.FC = () => {
  const notification = useNotification();

  const handleShowError = () => {
    notification.showError('这是一个错误通知示例', '网络错误');
  };

  const handleShowApiError = () => {
    // 模拟API错误（这会触发全局错误通知）
    notification.showError('网络连接失败，请检查网络设置', 'API错误', 0);
  };

  const handleShowLongError = () => {
    notification.showError('这是一个很长的错误消息，用来测试通知组件在处理长文本时的表现。错误消息应该能够正确换行并且保持良好的可读性。', '长文本错误', 5000);
  };

  const handleClearAll = () => {
    notification.clearAllNotifications();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>错误通知系统演示</h2>
      <p>点击下面的按钮来测试错误通知：</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={handleShowError}
          style={{ 
            padding: '10px', 
            backgroundColor: '#f5222d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          显示错误通知 (不自动消失)
        </button>
        
        <button 
          onClick={handleShowApiError}
          style={{ 
            padding: '10px', 
            backgroundColor: '#722ed1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          模拟API错误通知
        </button>

        <button 
          onClick={handleShowLongError}
          style={{ 
            padding: '10px', 
            backgroundColor: '#d46b08', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          显示长文本错误 (5秒后自动消失)
        </button>
        
        <button 
          onClick={handleClearAll}
          style={{ 
            padding: '10px', 
            backgroundColor: '#8c8c8c', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          清除所有通知
        </button>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>使用说明：</h3>
        <ul>
          <li><strong>错误通知</strong>：红色边框，默认不自动消失（需手动关闭）</li>
          <li>可设置自动消失时间（duration参数）</li>
          <li>支持长文本自动换行</li>
        </ul>
        
        <h3>API集成：</h3>
        <p>
          系统已自动集成到所有API调用中。当API返回错误时，会自动显示错误通知。
          错误消息会从API响应中提取，并显示在右上角的气泡中。
        </p>
        
        <h3>特性：</h3>
        <ul>
          <li>右上角滑入动画</li>
          <li>红色边框和❌图标</li>
          <li>可设置自动消失时间</li>
          <li>手动关闭功能</li>
          <li>响应式设计，移动端适配</li>
          <li>最多显示8个通知，超出会自动隐藏旧的</li>
          <li>带有时间戳显示</li>
          <li>进度条显示自动消失倒计时（如果设置了duration）</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
