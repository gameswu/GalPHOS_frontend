# GalPHOS 认证API接口文档

## 概述
GalPHOS系统的认证API接口，提供用户登录、注册、管理员登录、Token验证等功能。所有密码在前端使用SHA-256+盐值进行哈希化处理后发送。

---

## API接口列表
> [!NOTE]
> 所有接口路径均为 `/api` 前缀。

### 1. 用户登录

**接口路径：** `POST /auth/login`

**请求参数：**
```typescript
{
  role: 'coach' | 'student' | 'grader',  // 用户角色
  username: string,                      // 用户名
  password: string                       // 哈希化密码
}
```

**响应格式：**
```typescript
{
  success: boolean,                      // 请求是否成功
  data?: {                              // 用户信息
    username: string,
    role: string,
    province?: string,
    school?: string,
    // ... 其他用户信息
  },
  message?: string,                      // 响应消息
  token?: string                         // JWT令牌
}
```

**示例：**
```json
// 请求
{
  "role": "student",
  "username": "student001",
  "password": "hashed_password_string"
}

// 响应
{
  "success": true,
  "data": {
    "username": "student001",
    "role": "student",
    "province": "北京市",
    "school": "清华大学"
  },
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. 用户注册

**接口路径：** `POST /auth/register`

**请求参数：**
```typescript
{
  role: 'coach' | 'student' | 'grader',  // 用户角色
  username: string,                      // 用户名
  phone: string,                         // 手机号
  password: string,                      // 哈希化密码
  confirmPassword: string,               // 哈希化确认密码
  province?: string,                     // 省份ID（阅卷者可选）
  school?: string                        // 学校ID（阅卷者可选）
}
```

**响应格式：**
```typescript
{
  success: boolean,                      // 请求是否成功
  data?: any,                           // 注册结果数据
  message?: string                       // 响应消息
}
```

**示例：**
```json
// 请求
{
  "role": "student",
  "username": "newstudent",
  "phone": "13800138000",
  "password": "hashed_password_string",
  "confirmPassword": "hashed_password_string",
  "province": "1",
  "school": "1-1"
}

// 响应
{
  "success": true,
  "message": "注册申请已提交，等待管理员审核"
}
```

---

### 3. 管理员登录

**接口路径：** `POST /auth/admin-login`

**请求参数：**
```typescript
{
  username: string,                      // 管理员用户名
  password: string                       // 哈希化密码
}
```

**响应格式：**
```typescript
{
  success: boolean,                      // 请求是否成功
  data?: {                              // 管理员信息
    username: string,
    type: 'admin',
    // ... 其他管理员信息
  },
  message?: string,                      // 响应消息
  token?: string                         // JWT令牌
}
```

**示例：**
```json
// 请求
{
  "username": "admin",
  "password": "hashed_admin_password"
}

// 响应
{
  "success": true,
  "data": {
    "username": "admin",
    "type": "admin"
  },
  "message": "管理员登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Token验证

**接口路径：** `GET /auth/validate`

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**响应格式：**
```typescript
{
  success: boolean,                      // Token是否有效
  data?: {                              // 用户信息
    username: string,
    role?: string,
    type?: string,
    // ... 其他用户信息
  },
  message?: string                       // 响应消息
}
```

**示例：**
```json
// 响应
{
  "success": true,
  "data": {
    "username": "student001",
    "role": "student"
  },
  "message": "Token有效"
}
```

---

### 5. 用户登出

**接口路径：** `POST /auth/logout`

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**响应格式：**
```typescript
{
  success: boolean,                      // 登出是否成功
  message?: string                       // 响应消息
}
```

**示例：**
```json
// 响应
{
  "success": true,
  "message": "登出成功"
}
```

---

### 6. 获取省份学校数据

**接口路径：** `GET /regions/provinces-schools`

**响应格式：**
```typescript
{
  success: boolean,                      // 请求是否成功
  data?: Array<{                        // 省份学校数据
    id: string,                         // 省份ID
    name: string,                       // 省份名称
    schools: Array<{                    // 学校列表
      id: string,                       // 学校ID
      name: string                      // 学校名称
    }>
  }>,
  message?: string                       // 响应消息
}
```

**示例：**
```json
// 响应
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "北京市",
      "schools": [
        {
          "id": "1-1",
          "name": "清华大学"
        },
        {
          "id": "1-2",
          "name": "北京大学"
        }
      ]
    }
  ]
}
```

---

## 错误响应

所有接口在发生错误时返回统一格式：

```typescript
{
  success: false,
  message: string,                       // 错误信息
  data?: any                            // 可选的错误详情
}
```

**常见错误码：**
- `400` - 请求参数错误
- `401` - 未授权/Token无效
- `403` - 权限不足
- `404` - 接口不存在
- `500` - 服务器内部错误

---

## 前端集成说明

### 1. 环境配置
在`.env`文件中配置API基础URL：
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### 2. 使用示例
```typescript
import AuthAPI from '../api/auth';

// 用户登录
const loginResult = await AuthAPI.login({
  role: 'student',
  username: 'test',
  password: 'password123'  // 前端自动哈希化
});

// 管理员登录
const adminResult = await AuthAPI.adminLogin({
  username: 'admin',
  password: 'admin123'     // 前端自动哈希化
});
```