// TODO: 在这里定义应用的TypeScript类型和接口

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email?: string;
  // 请根据需要添加更多字段
}

// 登录表单类型
export interface LoginForm {
  username: string;
  password: string;
}

// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}