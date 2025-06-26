import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Collapse,
  Typography,
  Popconfirm,
  Row,
  Col,
  List
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  BankOutlined
} from '@ant-design/icons';
import type { Province, School } from '../../../types/common';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface RegionManagementProps {
  regions: Province[];
  loading: boolean;
  onAddProvince: (name: string) => void;
  onAddSchool: (provinceId: string, schoolName: string) => void;
  onUpdateSchool: (provinceId: string, schoolId: string, schoolName: string) => void;
  onDeleteSchool: (provinceId: string, schoolId: string) => void;
  onDeleteProvince: (provinceId: string) => void;
}

const RegionManagement: React.FC<RegionManagementProps> = ({
  regions,
  loading,
  onAddProvince,
  onAddSchool,
  onUpdateSchool,
  onDeleteSchool,
  onDeleteProvince
}) => {
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [schoolModalVisible, setSchoolModalVisible] = useState(false);
  const [editingSchool, setEditingSchool] = useState<{ province: Province; school: School } | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [provinceForm] = Form.useForm();
  const [schoolForm] = Form.useForm();

  // 省份表格列配置
  const provinceColumns = [
    {
      title: '省份名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '学校数量',
      dataIndex: 'schools',
      key: 'schoolCount',
      render: (schools: School[]) => (
        <Tag color="green">{schools.length} 所</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Province) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddSchool(record)}
          >
            添加学校
          </Button>
          <Popconfirm
            title="确定要删除这个省份吗？"
            description="删除省份将同时删除其下所有学校"
            onConfirm={() => onDeleteProvince(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理添加省份
  const handleAddProvince = () => {
    setProvinceModalVisible(true);
    provinceForm.resetFields();
  };

  // 处理添加学校
  const handleAddSchool = (province: Province) => {
    setSelectedProvince(province);
    setEditingSchool(null);
    setSchoolModalVisible(true);
    schoolForm.resetFields();
  };

  // 处理编辑学校
  const handleEditSchool = (province: Province, school: School) => {
    setSelectedProvince(province);
    setEditingSchool({ province, school });
    setSchoolModalVisible(true);
    schoolForm.setFieldsValue({ name: school.name });
  };

  // 提交省份表单
  const handleProvinceSubmit = async (values: { name: string }) => {
    await onAddProvince(values.name);
    setProvinceModalVisible(false);
    provinceForm.resetFields();
  };

  // 提交学校表单
  const handleSchoolSubmit = async (values: { name: string }) => {
    if (!selectedProvince) return;

    if (editingSchool) {
      await onUpdateSchool(selectedProvince.id, editingSchool.school.id, values.name);
    } else {
      await onAddSchool(selectedProvince.id, values.name);
    }

    setSchoolModalVisible(false);
    schoolForm.resetFields();
    setSelectedProvince(null);
    setEditingSchool(null);
  };

  // 获取所有学校列表
  const allSchools = regions.flatMap(region => region.schools);

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                {regions.length}
              </Title>
              <Text type="secondary">省份总数</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                {allSchools.length}
              </Title>
              <Text type="secondary">学校总数</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                {regions.reduce((max, region) => Math.max(max, region.schools.length), 0)}
              </Title>
              <Text type="secondary">最多学校数</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 省份管理 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            省份管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProvince}>
            添加省份
          </Button>
        </div>
        <Table
          columns={provinceColumns}
          dataSource={regions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* 学校管理 */}
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          <BankOutlined style={{ marginRight: 8 }} />
          学校管理
        </Title>
        <Collapse>
          {regions.map(province => (
            <Panel 
              header={
                <div style={{ display: 'flex', justifyContent: 'Space-between', alignItems: 'center' }}>
                  <Space>
                    <Text strong>{province.name}</Text>
                    <Tag color="blue">{province.schools.length} 所学校</Tag>
                  </Space>
                </div>
              } 
              key={province.id}
            >
              <List
                dataSource={province.schools}
                renderItem={(school) => (
                  <List.Item
                    actions={[
                      <Button
                        key="edit"
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSchool(province, school)}
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="确定要删除这所学校吗？"
                        onConfirm={() => onDeleteSchool(province.id, school.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<BankOutlined style={{ color: '#52c41a' }} />}
                      title={school.name}
                      description={`创建时间：${new Date(school.createdAt).toLocaleDateString()}`}
                    />
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* 添加省份模态框 */}
      <Modal
        title="添加省份"
        open={provinceModalVisible}
        onCancel={() => setProvinceModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={provinceForm}
          layout="vertical"
          onFinish={handleProvinceSubmit}
        >
          <Form.Item
            label="省份名称"
            name="name"
            rules={[
              { required: true, message: '请输入省份名称' },
              { min: 2, max: 20, message: '省份名称长度应在2-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入省份名称，如：北京市" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setProvinceModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加/编辑学校模态框 */}
      <Modal
        title={editingSchool ? '编辑学校' : `在 ${selectedProvince?.name} 添加学校`}
        open={schoolModalVisible}
        onCancel={() => setSchoolModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={schoolForm}
          layout="vertical"
          onFinish={handleSchoolSubmit}
        >
          <Form.Item
            label="学校名称"
            name="name"
            rules={[
              { required: true, message: '请输入学校名称' },
              { min: 2, max: 50, message: '学校名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入学校名称，如：清华大学" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setSchoolModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegionManagement;