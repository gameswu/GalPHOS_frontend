import React from 'react';
import { 
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 学生菜单
export const getStudentMenuItems = () => [
  {
    key: 'account',
    icon: <SettingOutlined />,
    label: '账户设置',
  },
  {
    key: 'current-exam',
    icon: <FileTextOutlined />,
    label: '当前考试',
  },
  {
    key: 'history-exams',
    icon: <HistoryOutlined />,
    label: '历史试题',
  },
];

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    account: '账户设置',
    'current-exam': '当前考试',
    'history-exams': '历史试题'
  };
  return titleMap[key as keyof typeof titleMap] || '学生仪表板';
};
