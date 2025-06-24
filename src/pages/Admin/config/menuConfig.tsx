import React from 'react';
import { 
  UserOutlined, 
  BookOutlined, 
  GlobalOutlined 
} from '@ant-design/icons';

// 菜单项配置
export const menuItems = [
  {
    key: 'region',
    icon: <GlobalOutlined />,
    label: '赛区管理',
  },
  {
    key: 'exam',
    icon: <BookOutlined />,
    label: '考试管理',
  },
  {
    key: 'user',
    icon: <UserOutlined />,
    label: '用户管理',
  },
];

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    region: '赛区管理',
    exam: '考试管理',
    user: '用户管理'
  };
  return titleMap[key as keyof typeof titleMap] || '用户管理';
};