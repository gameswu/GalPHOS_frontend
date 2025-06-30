import React from 'react';
import { Result, Typography, Card, Space } from 'antd';
import { ExclamationCircleOutlined, ToolOutlined } from '@ant-design/icons';
import SystemAnnouncementCarousel from '../components/SystemAnnouncementCarousel';
import type { SystemSettings } from '../types/common';

const { Title, Paragraph } = Typography;

interface MaintenancePageProps {
  systemSettings: SystemSettings | null;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ systemSettings }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Card
        style={{
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Result
            icon={
              <div style={{ fontSize: '72px', color: '#faad14' }}>
                <ToolOutlined />
              </div>
            }
            title={
              <Title level={2} style={{ color: '#262626', marginBottom: 0 }}>
                系统维护中
              </Title>
            }
            subTitle={
              <div>
                <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: 0 }}>
                  {systemSettings?.maintenanceMessage || '系统正在维护中，请稍后再试...'}
                </Paragraph>
              </div>
            }
          />

          {/* 系统公告轮播 */}
          <SystemAnnouncementCarousel 
            systemSettings={systemSettings}
            visible={true}
          />

          <div style={{ textAlign: 'center' }}>
            <Paragraph type="secondary" style={{ fontSize: '14px' }}>
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
              维护期间给您带来的不便，敬请谅解
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: '12px', marginBottom: 0 }}>
              如有紧急问题，请联系系统管理员
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default MaintenancePage;
