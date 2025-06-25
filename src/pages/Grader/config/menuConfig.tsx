import React from 'react';
import { 
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 阅卷者菜单
export const getGraderMenuItems = () => [
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

// 页面标题映射
export const getTitleByKey = (key: string): string => {
  const titleMap = {
    account: '账户设置',
    'grading-tasks': '阅卷任务'
  };
  return titleMap[key as keyof typeof titleMap] || '阅卷者仪表板';
};
