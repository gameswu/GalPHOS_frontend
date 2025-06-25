import React from 'react';
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 学生菜单
export const getStudentMenuItems = () => [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表板',
  },
  {
    key: 'current-exam',
    icon: <FileTextOutlined />,
    label: '当前考试',
  },
  {
    key: 'history-exam',
    icon: <HistoryOutlined />,
    label: '历史考试',
  },
  {
    key: 'account-settings',
    icon: <SettingOutlined />,
    label: '账户设置',
  },
];

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    dashboard: '仪表板',
    'current-exam': '当前考试',
    'history-exam': '历史考试',
    'account-settings': '账户设置',
  };
  return titleMap[key as keyof typeof titleMap] || '学生面板';
};
