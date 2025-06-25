import React from 'react';
import { 
  DashboardOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 阅卷者菜单
export const getGraderMenuItems = () => [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'grading-queue',
    icon: <EditOutlined />,
    label: '阅卷队列',
  },
  {
    key: 'account',
    icon: <SettingOutlined />,
    label: '账户设置',
  },
];

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    dashboard: '仪表盘',
    'grading-queue': '阅卷队列',
    account: '账户设置'
  };
  return titleMap[key as keyof typeof titleMap] || '阅卷者面板';
};
