import React from 'react';
import AdminLoginUI from './AdminLoginUI';
import { useAdminLogin } from './useAdminLogin';

const AdminLogin: React.FC = () => {
  const {
    form,
    loading,
    handleAdminLogin,
    handleBackToUserLogin
  } = useAdminLogin();

  return (
    <AdminLoginUI
      form={form}
      loading={loading}
      onAdminLogin={handleAdminLogin}
      onBackToUserLogin={handleBackToUserLogin}
    />
  );
};

export default AdminLogin;