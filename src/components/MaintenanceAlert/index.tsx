import React from 'react';
import { Alert } from 'antd';
import Marquee from 'react-fast-marquee';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import './MaintenanceAlert.css';

const MaintenanceAlert: React.FC = () => {
  const { systemConfig } = useSystemConfig();

  // 如果不是维护模式，不显示公告
  if (!systemConfig.maintenanceMode) {
    return null;
  }

  // 获取维护公告内容，如果没有则使用默认消息
  const announcementText = systemConfig.announcement || '系统正在维护中，请稍后再试。';

  return (
    <div className="maintenance-alert-container">
      <Alert
        banner
        type="warning"
        showIcon={false}
        className="maintenance-alert"
        message={
          <Marquee 
            pauseOnHover 
            gradient={false}
            speed={50}
            className="maintenance-marquee"
          >
            <span className="maintenance-text">
              🔧 系统维护通知：{announcementText}
            </span>
          </Marquee>
        }
      />
    </div>
  );
};

export default MaintenanceAlert;
