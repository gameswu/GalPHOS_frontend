import React from 'react';
import { 
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 教练菜单
export const getCoachMenuItems = () => [
  {
    key: 'account',
    icon: <SettingOutlined />,
    label: '账户设置',
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
    key: 'history-exams',
    icon: <HistoryOutlined />,
    label: '历史试题',
  },
];

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    account: '账户设置',
    students: '学生管理',
    'current-exam': '当前考试',
    'history-exams': '历史试题'
  };
  return titleMap[key as keyof typeof titleMap] || '教练仪表板';
};
