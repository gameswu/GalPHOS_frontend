import React from 'react';
import { 
  UserAddOutlined, 
  DashboardOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  FileTextOutlined,
  EditOutlined,
  SwapOutlined
} from '@ant-design/icons';

// 菜单项配置
export const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'user-management',
    icon: <UserAddOutlined />,
    label: '用户管理',
  },
  {
    key: 'region-management', // 新增赛区管理
    icon: <EnvironmentOutlined />,
    label: '赛区管理',
  },
  {
    key: 'region-change-requests',
    icon: <SwapOutlined />,
    label: '赛区变更申请',
  },
  {
    key: 'exam-management',
    icon: <FileTextOutlined />,
    label: '考试管理',
  },
  {
    key: 'grading-management',
    icon: <EditOutlined />,
    label: '阅卷管理',
  },
  {
    key: 'system-settings',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
];

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    dashboard: '仪表盘',
    'user-management': '用户管理',
    'region-management': '赛区管理',
    'region-change-requests': '赛区变更申请',
    'exam-management': '考试管理',
    'grading-management': '阅卷管理',
    'system-settings': '系统配置'
  };
  return titleMap[key as keyof typeof titleMap] || '管理后台';
};