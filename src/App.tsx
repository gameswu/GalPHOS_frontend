import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import Student from './pages/Student';
import Grader from './pages/Grader';
import Coach from './pages/Coach';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { BaseAPI } from './types/api';
import { systemConfig } from './utils/systemConfig';
import './App.css';

// App内容组件（需要在NotificationProvider内部使用通知）
const AppContent: React.FC = () => {
  const notification = useNotification();

  // 初始化全局通知方法和系统配置
  useEffect(() => {
    console.log('设置全局通知方法...'); // 调试信息
    BaseAPI.setGlobalNotificationMethods({
      showError: notification.showError,
      showSuccess: notification.showSuccess,
      showWarning: notification.showWarning,
      showInfo: notification.showInfo,
    });
    console.log('全局通知方法设置完成'); // 调试信息

    // 初始化系统配置（应用默认值）
    // 这会设置默认的网站名称 "GalPHOS" 和描述
    systemConfig.updateConfig({});
  }, [notification]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <Student />
            </ProtectedRoute>
          } />
          <Route path="/grader" element={
            <ProtectedRoute requiredRole="grader">
              <Grader />
            </ProtectedRoute>
          } />
          <Route path="/coach" element={
            <ProtectedRoute requiredRole="coach">
              <Coach />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;