# GalPHOS 管理员API接口文档

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

## API接口列表

## 1. 用户管理模块

### 1.1 获取待审核用户列表

**接口路径：** `GET /admin/users/pending`

**请求头：**
```
Authorization: Bearer <admin_token>
```

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    username: string,
    phone: string,
    role: 'coach' | 'student' | 'grader',
    province?: string,
    school?: string,
    appliedAt: string,
    status: 'pending'
  }>,
  message?: string
}
```

### 1.2 审核用户申请

**接口路径：** `POST /admin/users/approve`

**请求参数：**
```typescript
{
  userId: string,
  action: 'approve' | 'reject',
  reason?: string  // 拒绝理由（可选）
}
```

**响应格式：**
```typescript
{
  success: boolean,
  message: string
}
```

### 1.3 获取已审核用户列表

**接口路径：** `GET /admin/users/approved`

**请求参数（Query）：**
```typescript
{
  page?: number,
  limit?: number,
  role?: 'coach' | 'student' | 'grader',
  status?: 'active' | 'disabled',
  search?: string
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    users: Array<{
      id: string,
      username: string,
      phone: string,
      role: 'coach' | 'student' | 'grader',
      province?: string,
      school?: string,
      status: 'active' | 'disabled',
      approvedAt: string,
      lastLoginAt?: string
    }>,
    total: number,
    page: number,
    limit: number
  },
  message?: string
}
```

### 1.4 启用/禁用用户

**接口路径：** `POST /admin/users/status`

**请求参数：**
```typescript
{
  userId: string,
  status: 'active' | 'disabled'
}
```

### 1.5 删除用户

**接口路径：** `DELETE /admin/users/{userId}`

---

## 2. 赛区管理模块

### 2.1 获取赛区列表

**接口路径：** `GET /admin/regions`

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    name: string,
    schools: Array<{
      id: string,
      name: string
    }>
  }>,
  message?: string
}
```

### 2.2 添加省份

**接口路径：** `POST /admin/regions/provinces`

**请求参数：**
```typescript
{
  name: string
}
```

### 2.3 添加学校

**接口路径：** `POST /admin/regions/schools`

**请求参数：**
```typescript
{
  provinceId: string,
  name: string
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

## 错误响应

所有接口在发生错误时返回统一格式：

```typescript
{
  success: false,
  message: string,
  data?: any
}
```

**常见错误码：**
- `400` - 请求参数错误
- `401` - 未授权/Token无效
- `403` - 权限不足（非管理员）
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 权限说明

- **super_admin**: 拥有所有权限
- **admin**: 拥有除删除管理员外的所有权限

需要特殊权限的接口：
- 删除管理员：仅 `super_admin`
- 系统设置：仅 `super_admin`
- 创建管理员：仅 `super_admin`
