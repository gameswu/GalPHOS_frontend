import { useState, useEffect } from 'react';
import { systemConfig } from '../utils/systemConfig';
import type { SystemSettings } from '../types/common';

export const useSystemConfig = () => {
  const [config, setConfig] = useState<Partial<SystemSettings>>(systemConfig.getConfig());

  useEffect(() => {
    // 监听系统配置变更
    const handleConfigChange = (newConfig: Partial<SystemSettings>) => {
      setConfig(newConfig);
    };

    systemConfig.addListener(handleConfigChange);

    // 组件卸载时移除监听器
    return () => {
      systemConfig.removeListener(handleConfigChange);
    };
  }, []);

  return {
    systemConfig: config,
    updateConfig: systemConfig.updateConfig.bind(systemConfig),
    isInMaintenanceMode: systemConfig.isInMaintenanceMode.bind(systemConfig),
    getMaintenanceMessage: systemConfig.getMaintenanceMessage.bind(systemConfig),
    getSystemAnnouncements: systemConfig.getSystemAnnouncements.bind(systemConfig),
    isAnnouncementEnabled: systemConfig.isAnnouncementEnabled.bind(systemConfig),
  };
};
