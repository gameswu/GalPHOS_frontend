import React from 'react';
import { 
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 教练菜单
export const getCoachMenuItems = () => [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表板',
  },
  {
    key: 'students',
    icon: <TeamOutlined />,
    label: '学生管理',
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
    students: '学生管理',
    'current-exam': '当前考试',
    'history-exam': '历史考试',
    'account-settings': '账户设置'
  };
  return titleMap[key as keyof typeof titleMap] || '教练面板';
};
