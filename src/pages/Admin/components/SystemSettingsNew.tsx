import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Tabs,
  Switch,
  Divider,
  List,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Descriptions,
  Alert
} from 'antd';
import {
  SettingOutlined,
  ExclamationCircleOutlined,
  SoundOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { SystemSettings as SystemSettingsType } from '../../../types/common';
import './SystemSettings.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface SystemSettingsProps {
  systemSettings: SystemSettingsType | null;
  loading: boolean;
  onUpdateSystemSettings: (settings: Partial<SystemSettingsType>) => Promise<void>;
}

// 系统信息常量（硬编码）
const SYSTEM_INFO = {
  systemName: 'GalPHOS 考试管理系统',
  version: 'v1.3.0',
  buildTime: '2025-6-30 18:31:00',
  description: '基于微服务架构的现代化考试管理平台',
  features: [
    '多角色权限管理',
    '在线考试与阅卷',
    '智能成绩统计',
    '实时数据监控',
    '微服务架构',
    '响应式界面设计'
  ],
  technicalStack: {
    frontend: 'React 18 + TypeScript + Ant Design',
    backend: '微服务架构 (Node.js)',
    database: 'MongoDB + Redis',
    deployment: 'Docker + Kubernetes'
  }
};

const SystemSettings: React.FC<SystemSettingsProps> = ({
  systemSettings,
  loading,
  onUpdateSystemSettings
}) => {
  const [form] = Form.useForm();
  const [announcementForm] = Form.useForm();
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (systemSettings) {
      form.setFieldsValue({
        maintenanceMode: systemSettings.maintenanceMode,
        maintenanceMessage: systemSettings.maintenanceMessage,
        announcementEnabled: systemSettings.announcementEnabled
      });
    }
  }, [systemSettings, form]);

  // 保存维护设置
  const handleSaveMaintenanceSettings = async (values: any) => {
    try {
      await onUpdateSystemSettings({
        maintenanceMode: values.maintenanceMode,
        maintenanceMessage: values.maintenanceMessage,
        announcementEnabled: values.announcementEnabled
      });
      message.success('维护设置保存成功');
    } catch (error) {
      message.error('维护设置保存失败');
    }
  };

  // 添加/编辑公告
  const handleSaveAnnouncement = async (values: { content: string }) => {
    try {
      const currentAnnouncements = systemSettings?.systemAnnouncements || [];
      let newAnnouncements: string[];

      if (editingAnnouncement !== null) {
        // 编辑现有公告
        newAnnouncements = [...currentAnnouncements];
        newAnnouncements[editingAnnouncement] = values.content;
      } else {
        // 添加新公告
        newAnnouncements = [...currentAnnouncements, values.content];
      }

      await onUpdateSystemSettings({
        systemAnnouncements: newAnnouncements
      });

      message.success(editingAnnouncement !== null ? '公告修改成功' : '公告添加成功');
      setAnnouncementModalVisible(false);
      setEditingAnnouncement(null);
      announcementForm.resetFields();
    } catch (error) {
      message.error('公告保存失败');
    }
  };

  // 删除公告
  const handleDeleteAnnouncement = async (index: number) => {
    try {
      const currentAnnouncements = systemSettings?.systemAnnouncements || [];
      const newAnnouncements = currentAnnouncements.filter((_, i) => i !== index);

      await onUpdateSystemSettings({
        systemAnnouncements: newAnnouncements
      });

      message.success('公告删除成功');
    } catch (error) {
      message.error('公告删除失败');
    }
  };

  // 编辑公告
  const handleEditAnnouncement = (index: number) => {
    const announcement = systemSettings?.systemAnnouncements?.[index];
    if (announcement) {
      setEditingAnnouncement(index);
      announcementForm.setFieldsValue({ content: announcement });
      setAnnouncementModalVisible(true);
    }
  };

  // 添加公告
  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    announcementForm.resetFields();
    setAnnouncementModalVisible(true);
  };

  return (
    <div className="system-settings-simplified">
      <Tabs defaultActiveKey="maintenance" size="large">
        {/* 维护设置 */}
        <TabPane
          tab={
            <span>
              <ExclamationCircleOutlined />
              维护设置
            </span>
          }
          key="maintenance"
        >
          <Card>
            <Title level={4}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              系统维护设置
            </Title>
            <Paragraph type="secondary">
              当开启维护模式时，普通用户将无法访问系统，并显示维护消息和系统公告轮播。
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveMaintenanceSettings}
              initialValues={{
                maintenanceMode: false,
                maintenanceMessage: '系统正在维护中，请稍后再试...',
                announcementEnabled: true
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="维护模式"
                    name="maintenanceMode"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      onChange={(checked) => {
                        if (checked) {
                          Modal.confirm({
                            title: '确认开启维护模式？',
                            content: '开启后，除管理员外的所有用户将无法访问系统',
                            icon: <ExclamationCircleOutlined />,
                            okText: '确认开启',
                            cancelText: '取消',
                            onOk: () => {},
                            onCancel: () => {
                              form.setFieldsValue({ maintenanceMode: false });
                            }
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="公告显示"
                    name="announcementEnabled"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="维护消息"
                name="maintenanceMessage"
                rules={[
                  { required: true, message: '请输入维护消息' },
                  { max: 200, message: '维护消息不能超过200字符' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入系统维护时显示给用户的消息..."
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存维护设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* 系统公告 */}
        <TabPane
          tab={
            <span>
              <SoundOutlined />
              系统公告
            </span>
          }
          key="announcements"
        >
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                <SoundOutlined style={{ marginRight: 8 }} />
                系统公告管理
              </Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAnnouncement}>
                添加公告
              </Button>
            </div>

            <Alert
              message="公告说明"
              description="当维护模式开启或公告显示开启时，这些公告将在系统中轮播显示。公告将按添加顺序显示。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={systemSettings?.systemAnnouncements || []}
              renderItem={(announcement, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEditAnnouncement(index)}
                    >
                      编辑
                    </Button>,
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '确认删除此公告？',
                          content: '删除后无法恢复',
                          onOk: () => handleDeleteAnnouncement(index)
                        });
                      }}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Tag color="blue">#{index + 1}</Tag>}
                    description={announcement}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无系统公告' }}
            />
          </Card>
        </TabPane>

        {/* 系统信息 */}
        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              系统信息
            </span>
          }
          key="systeminfo"
        >
          <Card>
            <Title level={4}>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              系统信息
            </Title>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="系统名称">
                      {SYSTEM_INFO.systemName}
                    </Descriptions.Item>
                    <Descriptions.Item label="系统版本">
                      <Tag color="green">{SYSTEM_INFO.version}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="构建时间">
                      {SYSTEM_INFO.buildTime}
                    </Descriptions.Item>
                    <Descriptions.Item label="系统描述">
                      {SYSTEM_INFO.description}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small" title="技术架构">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="前端技术">
                      {SYSTEM_INFO.technicalStack.frontend}
                    </Descriptions.Item>
                    <Descriptions.Item label="后端技术">
                      {SYSTEM_INFO.technicalStack.backend}
                    </Descriptions.Item>
                    <Descriptions.Item label="数据库">
                      {SYSTEM_INFO.technicalStack.database}
                    </Descriptions.Item>
                    <Descriptions.Item label="部署方式">
                      {SYSTEM_INFO.technicalStack.deployment}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card size="small" title="系统特性">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SYSTEM_INFO.features.map((feature, index) => (
                      <Tag key={index} color="blue">{feature}</Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* 公告编辑模态框 */}
      <Modal
        title={editingAnnouncement !== null ? '编辑公告' : '添加公告'}
        open={announcementModalVisible}
        onCancel={() => {
          setAnnouncementModalVisible(false);
          setEditingAnnouncement(null);
          announcementForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleSaveAnnouncement}
        >
          <Form.Item
            label="公告内容"
            name="content"
            rules={[
              { required: true, message: '请输入公告内容' },
              { max: 500, message: '公告内容不能超过500字符' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请输入公告内容..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button
                onClick={() => {
                  setAnnouncementModalVisible(false);
                  setEditingAnnouncement(null);
                  announcementForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAnnouncement !== null ? '保存修改' : '添加公告'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemSettings;
