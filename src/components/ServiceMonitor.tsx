import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Tooltip, Modal, Table, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { microserviceRouter, MICROSERVICE_CONFIG, type MicroserviceConfig } from '../services/microserviceRouter';

interface ServiceStatus {
  name: string;
  description: string;
  baseUrl: string;
  port: number;
  isHealthy: boolean;
  lastCheck?: Date;
}

const ServiceMonitor: React.FC = () => {
  const [servicesStatus, setServicesStatus] = useState<ServiceStatus[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // 获取服务状态
  const refreshStatus = async () => {
    setLoading(true);
    try {
      const statusMap = microserviceRouter.getServicesStatus();
      const services: ServiceStatus[] = Object.entries(MICROSERVICE_CONFIG).map(([key, config]: [string, MicroserviceConfig]) => ({
        name: config.name,
        description: config.description,
        baseUrl: config.baseUrl,
        port: config.port,
        isHealthy: statusMap[key] !== false,
        lastCheck: new Date()
      }));
      setServicesStatus(services);
    } catch (error) {
      console.error('获取服务状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    
    // 每30秒自动刷新
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = servicesStatus.filter(s => s.isHealthy).length;
  const totalCount = servicesStatus.length;

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '地址',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      render: (url: string, record: ServiceStatus) => `${url}:${record.port}`,
    },
    {
      title: '状态',
      dataIndex: 'isHealthy',
      key: 'status',
      render: (isHealthy: boolean) => (
        <Badge
          status={isHealthy ? 'success' : 'error'}
          text={isHealthy ? '正常' : '异常'}
        />
      ),
    },
    {
      title: '最后检查',
      dataIndex: 'lastCheck',
      key: 'lastCheck',
      render: (date: Date) => date?.toLocaleTimeString(),
    },
  ];

  return (
    <>
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>服务状态</span>
            <Badge count={`${healthyCount}/${totalCount}`} style={{ backgroundColor: healthyCount === totalCount ? '#52c41a' : '#ff4d4f' }} />
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title="刷新状态">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                loading={loading}
                onClick={refreshStatus}
              />
            </Tooltip>
            <Tooltip title="查看详情">
              <Button
                icon={<InfoCircleOutlined />}
                size="small"
                onClick={() => setShowDetails(true)}
              />
            </Tooltip>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {servicesStatus.slice(0, 6).map((service) => (
            <Tooltip key={service.name} title={`${service.description} - ${service.baseUrl}:${service.port}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {service.isHealthy ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                )}
                <span style={{ fontSize: '12px' }}>{service.name}</span>
              </div>
            </Tooltip>
          ))}
          {servicesStatus.length > 6 && (
            <span style={{ fontSize: '12px', color: '#666' }}>...</span>
          )}
        </div>
        
        {healthyCount < totalCount && (
          <Alert
            message="部分微服务不可用"
            description="系统已自动启用故障转移机制，功能可能受到影响"
            type="warning"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </Card>

      <Modal
        title="微服务状态详情"
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={refreshStatus} loading={loading}>
            刷新
          </Button>,
          <Button key="close" onClick={() => setShowDetails(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={columns}
          dataSource={servicesStatus}
          rowKey="name"
          size="small"
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default ServiceMonitor;
