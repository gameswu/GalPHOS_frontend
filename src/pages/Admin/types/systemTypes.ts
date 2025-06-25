export interface AdminUser {
  id: string;
  username: string;
  password: string;
  avatar?: string; // 新增头像字段
  role: 'super_admin' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
  createdBy: string;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maxUploadSize: number; // MB
  allowedFileTypes: string[];
  systemMaintenance: boolean;
  maintenanceMessage: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminCreateData {
  username: string;
  password: string;
  avatar?: string; // 新增头像字段
  role: 'admin';
}