import React from 'react';
import { Button, Space, Tag, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PendingUser } from '../hooks/useAdminLogic';

// 角色映射
const getRoleTag = (role: string) => {
  const roleMap = {
    coach: { color: 'blue', text: '教练' },
    student: { color: 'green', text: '学生' },
    grader: { color: 'purple', text: '阅卷者' }
  };
  const roleInfo = roleMap[role as keyof typeof roleMap];
  return <Tag color={roleInfo?.color}>{roleInfo?.text}</Tag>;
};

// 状态映射
const getStatusTag = (status: string) => {
  const statusMap = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' }
  };
  const statusInfo = statusMap[status as keyof typeof statusMap];
  return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
};

// 表格列配置
export const createColumns = (
  onApprove: (user: PendingUser) => void,
  onReject: (user: PendingUser) => void
): ColumnsType<PendingUser> => [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120,
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 100,
    render: (role: string) => getRoleTag(role),
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 130,
  },
  {
    title: '省份',
    dataIndex: 'province',
    key: 'province',
    width: 100,
    render: (province: string) => province || '-',
  },
  {
    title: '学校',
    dataIndex: 'school',
    key: 'school',
    width: 150,
    render: (school: string) => school || '-',
  },
  {
    title: '申请时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    render: (text: string) => new Date(text).toLocaleString(),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => getStatusTag(status),
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    render: (_: any, record: PendingUser) => (
      record.status === 'pending' ? (
        <Space size="small">
          <Popconfirm
            title="确定要通过这个用户的注册申请吗？"
            onConfirm={() => onApprove(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" size="small">
              通过
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定要拒绝这个用户的注册申请吗？"
            onConfirm={() => onReject(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small">
              拒绝
            </Button>
          </Popconfirm>
        </Space>
      ) : null
    ),
  },
];