import React, { useState, useEffect } from 'react';
import { Alert, Carousel, Typography } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import type { SystemSettings } from '../types/common';

const { Text } = Typography;

interface SystemAnnouncementCarouselProps {
  systemSettings: SystemSettings | null;
  visible?: boolean;
}

const SystemAnnouncementCarousel: React.FC<SystemAnnouncementCarouselProps> = ({
  systemSettings,
  visible = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 获取有效的公告列表
  const announcements = systemSettings?.systemAnnouncements?.filter(Boolean) || [];
  const shouldShow = visible && 
                    systemSettings?.announcementEnabled && 
                    announcements.length > 0;

  // 自动轮播逻辑
  useEffect(() => {
    if (!shouldShow || announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= announcements.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 每5秒切换一次

    return () => clearInterval(timer);
  }, [shouldShow, announcements.length]);

  if (!shouldShow) {
    return null;
  }

  // 单条公告直接显示
  if (announcements.length === 1) {
    return (
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Text strong>系统公告</Text>
          </div>
        }
        description={announcements[0]}
        type="info"
        showIcon={false}
        style={{
          margin: '16px 0',
          borderRadius: '8px',
          border: '1px solid #d9d9d9'
        }}
      />
    );
  }

  // 多条公告轮播显示
  return (
    <div style={{ margin: '16px 0' }}>
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong>系统公告</Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentIndex + 1} / {announcements.length}
            </Text>
          </div>
        }
        description={
          <Carousel
            autoplay
            autoplaySpeed={5000}
            dots={false}
            effect="fade"
            beforeChange={(from, to) => setCurrentIndex(to)}
          >
            {announcements.map((announcement: string, index: number) => (
              <div key={index}>
                <div style={{ padding: '8px 0' }}>
                  {announcement}
                </div>
              </div>
            ))}
          </Carousel>
        }
        type="info"
        showIcon={false}
        style={{
          borderRadius: '8px',
          border: '1px solid #d9d9d9'
        }}
      />
    </div>
  );
};

export default SystemAnnouncementCarousel;
