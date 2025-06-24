import React from 'react';
import { 
  UserOutlined, 
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  EditOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 教练菜单
const coachMenuItems = [
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
    key: 'history-exams',
    icon: <HistoryOutlined />,
    label: '历史试题',
  },
  {
    key: 'current-exam',
    icon: <FileTextOutlined />,
    label: '当前考试',
  },
];

// 学生菜单
const studentMenuItems = [
  {
    key: 'account',
    icon: <SettingOutlined />,
    label: '账户设置',
  },
  {
    key: 'history-exams',
    icon: <HistoryOutlined />,
    label: '历史试题',
  },
  {
    key: 'current-exam',
    icon: <FileTextOutlined />,
    label: '当前考试',
  },
];

// 阅卷者菜单
const graderMenuItems = [
  {
    key: 'account',
    icon: <SettingOutlined />,
    label: '账户设置',
  },
  {
    key: 'grading-tasks',
    icon: <EditOutlined />,
    label: '阅卷任务',
  },
];

// 根据角色获取菜单项
export const getMenuItemsByRole = (role: 'coach' | 'student' | 'grader') => {
  switch (role) {
    case 'coach':
      return coachMenuItems;
    case 'student':
      return studentMenuItems;
    case 'grader':
      return graderMenuItems;
    default:
      return [];
  }
};

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    account: '账户设置',
    students: '学生管理',
    'history-exams': '历史试题',
    'current-exam': '当前考试',
    'grading-tasks': '阅卷任务'
  };
  return titleMap[key as keyof typeof titleMap] || '仪表板';
};