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

export interface RegionChangeRequest {
  id: string;
  username: string;
  role: 'student' | 'grader' | 'coach';
  currentProvince?: string;
  currentSchool?: string;
  requestedProvince: string;
  requestedSchool: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface StudentRegistrationRequest {
  id: string;
  username: string;
  password: string;
  province: string;
  school: string;
  grade: string;
  coachUsername: string; // 提交申请的教练
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}