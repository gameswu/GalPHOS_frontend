# GalPHOS 管理员API接口文档

## 概述
GalPHOS管理员面板API接口，提供用户管理、考试管理、阅卷管理、赛区管理等功能。所有接口都需要管理员身份的Bearer Token认证。

## 基础信息

### API基础URL
```
http://localhost:3001/api/admin
```

### 认证方式
所有请求需要在Header中包含：
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Token说明
- **Token类型**: JWT (JSON Web Token)
- **获取方式**: 通过管理员登录接口 `POST /api/auth/admin/login` 获取
- **有效期**: 24小时（可配置）
- **刷新机制**: Token过期后需要重新登录获取新Token
- **权限级别**: 
  - `super_admin`: 拥有所有权限
  - `admin`: 拥有除删除管理员外的所有权限

### 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

### 统一请求头
```typescript
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

---档

## 概述
GalPHOS管理员面板API接口，提供用户管理、考试管理、阅卷管理、赛区管理等功能。

---

## 基础信息

### 基础URL
```
http://localhost:3001/api
```

### 认证方式
- JWT Token认证（管理员权限）
- Header格式：`Authorization: Bearer <admin_token>`

---

## 1. 用户管理模块

### 1.1 获取待审核用户列表
**接口**: `GET /users/pending`

**描述**: 获取所有待审核的用户申请列表

**请求头**:
```typescript
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "user_001",
      username: "coach001",
      phone: "13800138001",
      role: "coach",
      province: "北京市",
      school: "北京第一中学",
      appliedAt: "2024-01-01T00:00:00.000Z",
      status: "pending"
    }
  ],
  message?: "获取成功"
}
```

### 1.2 审核用户申请
**接口**: `POST /users/approve`

**描述**: 审核用户注册申请，可以批准或拒绝

**请求体**:
```typescript
{
  userId: "user_001",
  action: "approve" | "reject",
  reason?: "拒绝理由（当action为reject时必填）"
}
```

**响应**:
```typescript
{
  success: true,
  message: "用户审核成功"
}
```

### 1.3 获取已审核用户列表
**接口**: `GET /users/approved`

**描述**: 获取已通过审核的用户列表，支持分页和筛选

**查询参数**:
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20
- `role?` (string): 角色筛选 coach | student | grader
- `status?` (string): 状态筛选 active | disabled
- `search?` (string): 搜索关键词（用户名）

**响应**:
```typescript
{
  success: true,
  data: {
    users: [
      {
        id: "user_001",
        username: "coach001",
        phone: "13800138001",
        role: "coach",
        province: "北京市",
        school: "北京第一中学",
        status: "active",
        approvedAt: "2024-01-01T08:00:00.000Z",
        lastLoginAt: "2024-01-15T10:30:00.000Z"
      }
    ],
    total: 50,
    page: 1,
    limit: 20
  }
}
```

### 1.4 启用/禁用用户
**接口**: `POST /users/status`

**描述**: 启用或禁用用户账户

**请求体**:
```typescript
{
  userId: "user_001",
  status: "active" | "disabled"
}
```

**响应**:
```typescript
{
  success: true,
  message: "用户状态更新成功"
}
```

### 1.5 删除用户
**接口**: `DELETE /users/{userId}`

**描述**: 删除指定用户（谨慎操作）

**路径参数**:
- `userId` (string): 用户ID

**响应**:
```typescript
{
  success: true,
  message: "用户删除成功"
}
```

## 2. 赛区管理模块

### 2.1 获取赛区列表
**接口**: `GET /regions`

**描述**: 获取所有省份及其下属学校列表

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "province_001",
      name: "北京市",
      schools: [
        {
          id: "school_001",
          name: "北京第一中学"
        },
        {
          id: "school_002", 
          name: "北京第二中学"
        }
      ]
    }
  ]
}
```

### 2.2 添加省份
**接口**: `POST /regions/provinces`

**描述**: 添加新的省份/直辖市

**请求体**:
```typescript
{
  name: "上海市"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "province_002",
    name: "上海市"
  },
  message: "省份添加成功"
}
```

### 2.3 添加学校
**接口**: `POST /regions/schools`

**描述**: 为指定省份添加学校

**请求体**:
```typescript
{
  provinceId: "province_001",
  name: "北京第三中学"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "school_003",
    name: "北京第三中学",
    provinceId: "province_001"
  },
  message: "学校添加成功"
}
```

### 2.4 更新学校

**接口路径：** `PUT /admin/regions/schools/{schoolId}`

**请求参数：**
```typescript
{
  name: string
}
```

### 2.5 删除学校

**接口路径：** `DELETE /admin/regions/schools/{schoolId}`

### 2.6 删除省份

**接口路径：** `DELETE /admin/regions/provinces/{provinceId}`

### 2.7 获取赛区变更申请

**接口路径：** `GET /admin/regions/change-requests`

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    userId: string,
    username: string,
    role: string,
    currentProvince: string,
    currentSchool: string,
    requestedProvince: string,
    requestedSchool: string,
    reason: string,
    status: 'pending' | 'approved' | 'rejected',
    createdAt: string
  }>
}
```

### 2.8 处理赛区变更申请

**接口路径：** `POST /admin/regions/change-requests/{requestId}`

**请求参数：**
```typescript
{
  action: 'approve' | 'reject',
  reason?: string
}
```

---

## 3. 考试管理模块

### 3.1 获取考试列表

**接口路径：** `GET /admin/exams`

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    title: string,
    description: string,
    questionFile?: ExamFile,
    answerFile?: ExamFile,
    answerSheetFile?: ExamFile,
    startTime: string,
    endTime: string,
    status: 'draft' | 'published' | 'ongoing' | 'grading' | 'completed',
    totalQuestions?: number,
    duration?: number,
    createdAt: string,
    createdBy: string
  }>
}
```

### 3.2 创建考试

**接口路径：** `POST /admin/exams`

**请求参数：**
```typescript
{
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  totalQuestions?: number,
  duration?: number
}
```

### 3.3 更新考试

**接口路径：** `PUT /admin/exams/{examId}`

**请求参数：**
```typescript
{
  title?: string,
  description?: string,
  startTime?: string,
  endTime?: string,
  totalQuestions?: number,
  duration?: number
}
```

### 3.4 发布考试

**接口路径：** `POST /admin/exams/{examId}/publish`

### 3.5 取消发布考试

**接口路径：** `POST /admin/exams/{examId}/unpublish`

### 3.6 删除考试

**接口路径：** `DELETE /admin/exams/{examId}`

### 3.7 上传考试文件

**接口路径：** `POST /admin/exams/{examId}/files`

**请求参数（FormData）：**
```typescript
{
  file: File,
  type: 'question' | 'answer' | 'answerSheet'
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    name: string,
    url: string,
    size: number,
    uploadTime: string
  }
}
```

---

## 4. 阅卷管理模块

### 4.1 获取阅卷者列表

**接口路径：** `GET /admin/graders`

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    username: string,
    status: 'active' | 'busy' | 'offline',
    assignedTasks: number,
    completedTasks: number,
    averageScore: number,
    lastActiveAt: string
  }>
}
```

### 4.2 获取阅卷任务列表

**接口路径：** `GET /admin/grading/tasks`

**请求参数（Query）：**
```typescript
{
  examId?: string,
  status?: 'pending' | 'assigned' | 'completed',
  graderId?: string
}
```

### 4.3 分配阅卷任务

**接口路径：** `POST /admin/grading/assign`

**请求参数：**
```typescript
{
  examId: string,
  questionNumber: number,
  graderIds: string[]
}
```

### 4.4 获取阅卷进度

**接口路径：** `GET /admin/grading/progress/{examId}`

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    examId: string,
    totalSubmissions: number,
    gradedSubmissions: number,
    progress: number,
    averageScore: number,
    questionProgress: Array<{
      questionNumber: number,
      totalTasks: number,
      completedTasks: number,
      progress: number
    }>
  }
}
```

---

## 5. 系统管理模块

### 5.1 获取系统设置

**接口路径：** `GET /admin/system/settings`

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    systemName: string,
    systemLogo: string,
    allowRegistration: boolean,
    examDuration: number,
    gradingDeadline: number,
    maintenanceMode: boolean,
    announcement: string
  }
}
```

### 5.2 更新系统设置

**接口路径：** `PUT /admin/system/settings`

**请求参数：**
```typescript
{
  systemName?: string,
  systemLogo?: string,
  allowRegistration?: boolean,
  examDuration?: number,
  gradingDeadline?: number,
  maintenanceMode?: boolean,
  announcement?: string
}
```

### 5.3 获取管理员列表

**接口路径：** `GET /admin/system/admins`

### 5.4 创建管理员

**接口路径：** `POST /admin/system/admins`

**请求参数：**
```typescript
{
  username: string,
  password: string,
  role: 'super_admin' | 'admin'
}
```

### 5.5 更新管理员信息

**接口路径：** `PUT /admin/system/admins/{adminId}`

**请求参数：**
```typescript
{
  username?: string,
  avatar?: string,
  role?: 'super_admin' | 'admin'
}
```

### 5.6 修改管理员密码

**接口路径：** `POST /admin/system/admins/{adminId}/password`

**请求参数：**
```typescript
{
  oldPassword: string,  // 哈希化
  newPassword: string   // 哈希化
}
```

### 5.7 删除管理员

**接口路径：** `DELETE /admin/system/admins/{adminId}`

### 5.8 上传头像

**接口路径：** `POST /admin/system/upload/avatar`

**请求参数（FormData）：**
```typescript
{
  file: File
}
```

---

## 6. 仪表盘统计模块

### 6.1 获取仪表盘数据

**接口路径：** `GET /admin/dashboard/stats`

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    users: {
      total: number,
      pending: number,
      active: number,
      students: number,
      coaches: number,
      graders: number
    },
    exams: {
      total: number,
      published: number,
      ongoing: number,
      completed: number
    },
    grading: {
      totalTasks: number,
      completedTasks: number,
      progress: number,
      activeGraders: number
    },
    regions: {
      provinces: number,
      schools: number
    },
    recent: {
      newUsers: Array<{
        username: string,
        role: string,
        appliedAt: string
      }>,
      recentExams: Array<{
        title: string,
        status: string,
        createdAt: string
      }>
    }
  }
}
```

---

## 错误处理

### 统一错误响应格式
```typescript
{
  success: false,
  message: "错误描述信息",
  error?: {
    code: "ERROR_CODE",
    details: "详细错误信息"
  }
}
```

### 常见HTTP状态码
| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误或格式不正确 |
| 401 | Unauthorized | Token无效、过期或未提供 |
| 403 | Forbidden | 权限不足（非管理员或权限级别不够） |
| 404 | Not Found | 请求的资源不存在 |
| 409 | Conflict | 资源冲突（如用户名重复） |
| 500 | Internal Server Error | 服务器内部错误 |

### 常见错误示例

#### Token相关错误
```typescript
// Token无效
{
  success: false,
  message: "Token无效，请重新登录",
  error: {
    code: "INVALID_TOKEN",
    details: "JWT token verification failed"
  }
}

// Token过期
{
  success: false,
  message: "登录已过期，请重新登录", 
  error: {
    code: "TOKEN_EXPIRED",
    details: "JWT token has expired"
  }
}
```

#### 权限相关错误
```typescript
// 权限不足
{
  success: false,
  message: "权限不足，仅超级管理员可操作",
  error: {
    code: "INSUFFICIENT_PERMISSION",
    details: "Operation requires super_admin role"
  }
}
```

#### 参数错误
```typescript
// 参数缺失
{
  success: false,
  message: "缺少必要参数：userId",
  error: {
    code: "MISSING_PARAMETER",
    details: "userId is required"
  }
}

// 参数格式错误
{
  success: false,
  message: "用户ID格式不正确",
  error: {
    code: "INVALID_PARAMETER_FORMAT", 
    details: "userId must be a valid ObjectId"
  }
}
```

---

## 权限说明

### 管理员角色权限
- **super_admin（超级管理员）**: 拥有所有权限，包括：
  - 用户管理（审核、启用/禁用、删除）
  - 考试管理（创建、编辑、删除、发布）
  - 阅卷管理（分配任务、查看进度）
  - 赛区管理（添加省份/学校、处理变更申请）
  - 系统设置（系统配置、管理员管理）
  - 仪表板查看

- **admin（普通管理员）**: 拥有除以下外的所有权限：
  - 删除其他管理员
  - 修改系统核心设置
  - 创建超级管理员

### 权限验证流程
1. 验证Token有效性
2. 检查用户角色是否为管理员
3. 对特殊操作检查具体权限级别
4. 记录操作日志

---

## 前端集成说明

### 1. Token管理
```typescript
// 存储Token
localStorage.setItem('adminToken', token);

// 获取Token
const token = localStorage.getItem('adminToken');

// 清除Token（退出登录）
localStorage.removeItem('adminToken');
```

### 2. 请求拦截器设置
```typescript
// 请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// 响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token过期，跳转到登录页
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. 文件上传处理
```typescript
// 文件上传特殊处理
const uploadFile = async (file: File, examId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'question');
  
  const response = await fetch(`/api/admin/exams/${examId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // 注意：文件上传时不要设置Content-Type，浏览器会自动设置
    },
    body: formData
  });
  
  return response.json();
};
```

### 4. 错误处理最佳实践
```typescript
const handleApiCall = async (apiFunction: () => Promise<any>) => {
  try {
    const result = await apiFunction();
    if (result.success) {
      return result.data;
    } else {
      // 显示错误信息
      message.error(result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('API调用失败:', error);
    message.error('操作失败，请稍后重试');
    throw error;
  }
};
```
