# GalPHOS 学生面板API接口文档

## 概述
GalPHOS系统的学生面板API接口，提供学生用户的考试管理、个人资料管理、赛区变更申请等功能。

> **类型定义**: 本文档中的所有数据类型基于统一类型系统定义，详见 [API类型定义参考](./API_TYPES_REFERENCE.md)

## 基础信息

### 认证要求
所有学生面板API接口都需要携带有效的JWT Token，且用户角色必须为 `student`。

### 统一请求头
```typescript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

---

## 1. 考试管理

### 1.1 获取考试列表
**接口**: `GET /api/student/exams`

**描述**: 获取当前学生可参与的考试列表

**请求参数**: 无

**响应**:
```typescript
// 使用统一类型：ApiResponse<StudentExam[]>
{
  success: true,
  data: [
    {
      id: "exam001",
      title: "2024年春季数学竞赛",
      description: "面向高中生的数学竞赛考试",
      questionFile: {
        id: "file001",
        name: "数学竞赛试题.pdf",
        url: "https://example.com/files/exam001_questions.pdf",
        size: 2048576,
        uploadTime: "2024-03-15T09:00:00Z"
      },
      answerSheetFile: {
        id: "file002", 
        name: "答题卡.pdf",
        url: "https://example.com/files/exam001_sheet.pdf",
        size: 1024000,
        uploadTime: "2024-03-15T09:00:00Z"
      },
      startTime: "2024-03-20T09:00:00Z",
      endTime: "2024-03-20T12:00:00Z",
      status: "published",
      totalQuestions: 20,
      duration: 180
    }
  ],
  message: "获取考试列表成功"
}
```

### 1.2 获取考试详情
**接口**: `GET /api/student/exams/{examId}`

**描述**: 获取指定考试的详细信息

**路径参数**:
- `examId` (string): 考试ID

**响应**:
```typescript
{
  success: true,
  data: {
    id: "exam001",
    title: "2024年春季数学竞赛",
    description: "面向高中生的数学竞赛考试",
    questionFile: {
      id: "file001",
      name: "数学竞赛试题.pdf",
      url: "https://example.com/files/exam001_questions.pdf",
      size: 2048576,
      uploadTime: "2024-03-15T09:00:00Z"
    },
    answerFile: {
      id: "file003",
      name: "参考答案.pdf", 
      url: "https://example.com/files/exam001_answers.pdf",
      size: 512000,
      uploadTime: "2024-03-20T15:00:00Z"
    },
    answerSheetFile: {
      id: "file002",
      name: "答题卡.pdf",
      url: "https://example.com/files/exam001_sheet.pdf", 
      size: 1024000,
      uploadTime: "2024-03-15T09:00:00Z"
    },
    startTime: "2024-03-20T09:00:00Z",
    endTime: "2024-03-20T12:00:00Z",
    status: "completed",
    createdAt: "2024-03-15T08:00:00Z",
    updatedAt: "2024-03-20T15:30:00Z",
    createdBy: "coach001",
    participants: ["student001", "student002", "student003"],
    totalQuestions: 20,
    duration: 180
  },
  message: "获取考试详情成功"
}
```

### 1.3 提交考试答案
**接口**: `POST /api/student/exams/{examId}/submit`

**描述**: 提交或更新考试答案

**路径参数**:
- `examId` (string): 考试ID

**请求体**:
```typescript
{
  answers: [
    {
      questionNumber: 1,
      imageUrl: "https://example.com/uploads/answer1.jpg",
      uploadTime: "2024-03-20T10:30:00Z"
    },
    {
      questionNumber: 2,
      imageUrl: "https://example.com/uploads/answer2.jpg",
      uploadTime: "2024-03-20T10:35:00Z"
    }
  ]
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "submission001",
    examId: "exam001",
    studentUsername: "student001",
    answers: [
      {
        questionNumber: 1,
        imageUrl: "https://example.com/uploads/answer1.jpg",
        uploadTime: "2024-03-20T10:30:00Z"
      },
      {
        questionNumber: 2,
        imageUrl: "https://example.com/uploads/answer2.jpg",
        uploadTime: "2024-03-20T10:35:00Z"
      }
    ],
    submittedAt: "2024-03-20T11:45:00Z",
    status: "submitted"
  },
  message: "答案提交成功"
}
```

### 1.4 获取考试提交记录
**接口**: `GET /api/student/exams/{examId}/submission`

**描述**: 获取当前学生在指定考试中的提交记录

**路径参数**:
- `examId` (string): 考试ID

**响应**:
```typescript
{
  success: true,
  data: {
    id: "submission001",
    examId: "exam001", 
    studentUsername: "student001",
    answers: [
      {
        questionNumber: 1,
        imageUrl: "https://example.com/uploads/answer1.jpg",
        uploadTime: "2024-03-20T10:30:00Z"
      },
      {
        questionNumber: 2,
        imageUrl: "https://example.com/uploads/answer2.jpg",
        uploadTime: "2024-03-20T10:35:00Z"
      }
    ],
    submittedAt: "2024-03-20T11:45:00Z",
    status: "graded",
    score: 85
  },
  message: "获取提交记录成功"
}
```

### 1.5 上传答题图片
**接口**: `POST /api/upload/answer-image`

**描述**: 上传答题图片文件

**请求类型**: `multipart/form-data`

**请求参数**:
- `file` (File): 图片文件（支持 jpg, jpeg, png, gif 格式）
- `examId` (string): 考试ID
- `questionNumber` (number): 题目编号

**响应**:
```typescript
{
  success: true,
  data: {
    imageUrl: "https://example.com/uploads/answer_student001_exam001_q1.jpg",
    fileName: "answer_student001_exam001_q1.jpg",
    fileSize: 1024000,
    uploadTime: "2024-03-20T10:30:00Z"
  },
  message: "图片上传成功"
}
```

---

## 2. 个人资料管理

### 2.1 获取个人资料
**接口**: `GET /api/student/profile`

**描述**: 获取学生个人资料信息

**响应**:
```typescript
{
  success: true,
  data: {
    username: "student001",
    name: "张三",
    phone: "13812345678", 
    email: "zhangsan@example.com",
    role: "student",
    province: "北京市",
    school: "清华大学",
    avatar: "https://example.com/avatars/avatar.jpg"
  },
  message: "获取个人资料成功"
}
```

### 2.2 更新个人资料
**接口**: `PUT /api/student/profile`

**描述**: 更新学生个人资料信息

**请求体**:
```typescript
{
  name?: "张三",
  phone?: "13812345678",
  email?: "zhangsan@example.com", 
  username?: "new_username",
  avatar?: "https://example.com/avatars/new_avatar.jpg"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    username: "new_username",
    name: "张三",
    phone: "13812345678",
    email: "zhangsan@example.com",
    role: "student",
    province: "北京市",
    school: "清华大学",
    avatar: "https://example.com/avatars/new_avatar.jpg"
  },
  message: "个人资料更新成功"
}
```

### 2.3 修改密码
**接口**: `PUT /api/student/password`

**描述**: 修改登录密码

**请求体**:
```typescript
{
  oldPassword: "hashed_old_password",    // SHA-256+盐值哈希后的旧密码
  newPassword: "hashed_new_password"     // SHA-256+盐值哈希后的新密码
}
```

**响应**:
```typescript
{
  success: true,
  message: "密码修改成功"
}
```

### 2.4 上传头像
**接口**: `POST /api/upload/avatar`

**描述**: 上传用户头像

**请求类型**: `multipart/form-data`

**请求参数**:
- `avatar` (File): 头像文件（支持 jpg, jpeg, png 格式，大小限制2MB）

**响应**:
```typescript
{
  success: true,
  data: {
    avatarUrl: "https://example.com/avatars/student001_avatar.jpg",
    fileName: "student001_avatar.jpg",
    fileSize: 512000,
    uploadTime: "2024-03-20T14:30:00Z"
  },
  message: "头像上传成功"
}
```

### 2.5 注销账号
**接口**: `POST /api/student/account/delete`

**描述**: 永久删除当前学生账号及所有相关数据

**请求体**: 无需额外参数

**响应**:
```typescript
{
  success: true,
  message: "账号已成功注销"
}
```

**注意**:
- 此操作不可撤销，将永久删除用户所有数据
- 操作执行后会立即登出用户
- 账号一旦注销无法恢复

---

## 3. 赛区管理

### 3.1 申请赛区变更
**接口**: `POST /api/student/region-change`

**描述**: 提交赛区变更申请

**请求体**:
```typescript
{
  province: "上海市",
  school: "上海交通大学",
  reason: "因工作调动需要变更到上海赛区"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "request001",
    username: "student001",
    role: "student",
    currentProvince: "北京市",
    currentSchool: "清华大学",
    requestedProvince: "上海市",
    requestedSchool: "上海交通大学", 
    reason: "因工作调动需要变更到上海赛区",
    status: "pending",
    createdAt: "2024-03-20T16:00:00Z"
  },
  message: "赛区变更申请已提交，等待管理员审核"
}
```

### 3.2 获取赛区变更申请状态
**接口**: `GET /api/student/region-change/status`

**描述**: 查询当前用户的赛区变更申请状态

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "request001",
      username: "student001",
      role: "student",
      currentProvince: "北京市",
      currentSchool: "清华大学",
      requestedProvince: "上海市",
      requestedSchool: "上海交通大学",
      reason: "因工作调动需要变更到上海赛区",
      status: "approved",
      createdAt: "2024-03-20T16:00:00Z",
      processedAt: "2024-03-21T09:30:00Z",
      processedBy: "admin001",
      adminComment: "申请已通过，赛区信息已更新"
    }
  ],
  message: "获取申请状态成功"
}
```

---

## 4. 文件下载

### 4.1 下载考试文件
**接口**: `GET /api/student/files/download/{fileId}`

**描述**: 下载考试相关文件（试题、答案、答题卡等）

**路径参数**:
- `fileId` (string): 文件ID

**响应**: 直接返回文件流，或重定向到文件下载链接

**示例**:
```bash
GET /api/student/files/download/file001
# 返回文件流或重定向到下载链接
```

---

## 5. 统计数据

### 5.1 获取学生仪表板数据
**接口**: `GET /api/student/dashboard/stats`

**描述**: 获取学生仪表板统计数据

**响应**:
```typescript
{
  success: true,
  data: {
    totalExams: 5,              // 总考试数量
    completedExams: 3,          // 已完成考试数量
    ongoingExams: 1,            // 进行中考试数量
    upcomingExams: 1,           // 即将开始考试数量
    averageScore: 78.5,         // 平均分数
    lastExamScore: 85,          // 最近一次考试分数
    recentExams: [              // 最近考试记录
      {
        id: "exam003",
        title: "2024年春季物理竞赛",
        submittedAt: "2024-03-18T15:30:00Z",
        status: "graded",
        score: 85
      },
      {
        id: "exam002", 
        title: "2024年春季化学竞赛",
        submittedAt: "2024-03-15T16:45:00Z",
        status: "graded",
        score: 72
      }
    ]
  },
  message: "获取仪表板数据成功"
}
```

---

## 错误处理

### 错误响应格式
```typescript
{
  success: false,
  message: "错误描述",
  error?: {
    code: "ERROR_CODE",
    details?: any
  }
}
```

### 常见错误码

#### 认证相关错误
- `AUTH_REQUIRED`: 需要认证
- `INVALID_TOKEN`: Token无效
- `TOKEN_EXPIRED`: Token已过期
- `INSUFFICIENT_PERMISSION`: 权限不足

#### 考试相关错误  
- `EXAM_NOT_FOUND`: 考试不存在
- `EXAM_NOT_STARTED`: 考试尚未开始
- `EXAM_ENDED`: 考试已结束
- `EXAM_NOT_ACCESSIBLE`: 考试不可访问
- `SUBMISSION_NOT_FOUND`: 提交记录不存在

#### 文件相关错误
- `FILE_NOT_FOUND`: 文件不存在
- `FILE_TOO_LARGE`: 文件过大
- `INVALID_FILE_FORMAT`: 文件格式不支持
- `UPLOAD_FAILED`: 文件上传失败

#### 数据验证错误
- `INVALID_REQUEST`: 请求数据无效
- `MISSING_REQUIRED_FIELD`: 缺少必填字段
- `INVALID_PASSWORD`: 密码验证失败

### HTTP状态码说明
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 注意事项

1. **时间格式**: 所有时间字段使用ISO 8601格式（UTC时区）
2. **文件大小限制**: 
   - 头像文件：最大2MB
   - 答题图片：最大10MB
3. **图片格式支持**: jpg, jpeg, png, gif
4. **Token有效期**: 24小时，过期后需要重新登录
5. **考试状态**: 只有在考试进行时间内才能提交答案
6. **并发提交**: 支持多次提交，以最后一次提交为准
7. **数据安全**: 所有敏感数据传输使用HTTPS加密

---

## 更新日志

### v1.0.0 (2024-03-26)
- 初始版本发布
- 包含考试管理、个人资料管理、赛区变更等核心功能
- 支持文件上传下载
- 提供完整的仪表板统计数据
