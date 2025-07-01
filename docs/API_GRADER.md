# 阅卷者面板 API 文档

## 概述

本文档描述了阅卷者面板的完整API接口设计，包括阅卷任务管理、考试管理、统计分析等功能模块。

> **类型定义**: 本文档中的所有数据类型基于统一类型系统定义，详见 [API类型定义参考](./API_TYPES_REFERENCE.md)

## API 基础信息

- **认证方式**: Bearer Token
- **数据格式**: JSON
- **编码**: UTF-8

## 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

## 1. 阅卷任务管理模块

### 1.1 获取阅卷任务列表

**接口**: `GET /api/grader/tasks`

**参数**:
- `page`: 页码（可选，默认1）
- `limit`: 每页数量（可选，默认20）
- `examId`: 考试ID（可选）
- `status`: 任务状态（可选：pending, grading, completed）
- `priority`: 优先级（可选：low, medium, high）
- `search`: 搜索关键词（可选）

**响应**:
```typescript
// 使用统一类型：ApiResponse<{ tasks: GradingTask[], total: number, page: number, limit: number }>
{
  success: true,
  data: {
    tasks: GradingTask[],
    total: number,
    page: number,
    limit: number
  }
}
```

### 1.2 获取单个阅卷任务详情

**接口**: `GET /api/grader/tasks/{taskId}`

**响应**:
```typescript
// 使用统一类型：ApiResponse<GradingTask>
{
  success: true,
  data: GradingTask
}
```

### 1.3 开始阅卷任务

**接口**: `POST /api/grader/tasks/{taskId}/start`

**说明**: 将任务状态从"pending"更改为"grading"，并记录开始时间

### 1.4 提交阅卷结果

**接口**: `POST /api/grader/tasks/{taskId}/submit`

**请求体**:
```typescript
{
  score: number,           // 总分
  maxScore: number,        // 满分
  feedback?: string,       // 评语
  questionScores?: Array<{
    questionNumber: number,
    score: number,
    maxScore: number,
    feedback?: string
  }>
}
```

### 1.5 暂存阅卷进度

**接口**: `POST /api/grader/tasks/{taskId}/save-progress`

**请求体**:
```typescript
{
  score?: number,
  feedback?: string,
  questionScores?: Array<{
    questionNumber: number,
    score: number,
    maxScore: number,
    feedback?: string
  }>
}
```

### 1.6 放弃阅卷任务

**接口**: `POST /api/grader/tasks/{taskId}/abandon`

**请求体**:
```typescript
{
  reason?: string  // 放弃原因
}
```

## 2. 考试管理模块

### 2.1 获取可阅卷的考试列表

**接口**: `GET /api/grader/exams`

**参数**:
- `page`: 页码（可选）
- `limit`: 每页数量（可选）
- `status`: 考试状态（可选：grading, completed）
- `province`: 省份（可选）
- `subject`: 科目（可选）

### 2.2 获取考试详情

**接口**: `GET /api/grader/exams/{examId}`

### 2.3 获取考试的阅卷进度

**接口**: `GET /api/grader/exams/{examId}/progress`

**响应**:
```typescript
{
  success: true,
  data: {
    examId: string,
    examTitle: string,
    totalSubmissions: number,
    gradedSubmissions: number,
    pendingSubmissions: number,
    myCompletedTasks: number,
    progress: number  // 百分比
  }
}
```

## 3. 学生答卷管理模块

### 3.1 获取学生答卷详情

**接口**: `GET /api/grader/submissions/{submissionId}`

### 3.2 获取答案图片

**接口**: `GET /api/grader/images`

**参数**:
- `url`: 图片URL（必需）

**响应**:
```typescript
{
  success: true,
  data: {
    url: string,
    base64?: string  // 可选的base64编码
  }
}
```

## 4. 统计与报告模块

### 4.1 获取阅卷统计信息（简化版 v1.3.0）

**接口**: `GET /api/grader/statistics`

**参数**:
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `examId`: 考试ID（可选）

**响应**:
```typescript
{
  success: true,
  data: {
    totalTasks: number,        // 总任务数
    pendingTasks: number,      // 待阅卷数
    gradingTasks: number,      // 阅卷中数
    completedTasks: number,    // 已完成数
    todayCompleted: number,    // 今日完成数
    efficiency?: {
      tasksPerHour: number,           // 每小时任务数
      averageGradingTime: number      // 平均阅卷时间(分钟)
    }
  }
}
```

### 4.2 获取我的阅卷历史

**接口**: `GET /api/grader/history`

**参数**:
- `page`: 页码（可选）
- `limit`: 每页数量（可选）
- `examId`: 考试ID（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

## 5. 个人中心模块

### 5.1 获取个人信息

**接口**: `GET /api/grader/profile`

**响应**:
```typescript
{
  success: true,
  data: {
    id: string,
    username: string,
    name?: string,
    phone?: string,
    email?: string,
    avatar?: string,
    role: 'grader',
    province?: string,
    school?: string,
    bio?: string,          // 阅卷员简介
    expertise?: string[],  // 阅卷员专长
    subjects?: string[],
    certification?: {
      level: string,
      subjects: string[],
      validUntil: string
    },
    statistics: {
      totalGraded: number,    // 总阅卷数
      efficiency: number,     // 阅卷效率
      accuracy: number        // 阅卷准确性
    }
  }
}
```

### 5.2 更新个人信息

**接口**: `PUT /api/grader/profile`

**请求体**:
```typescript
{
  name?: string,
  phone?: string,
  email?: string,
  username?: string,
  avatar?: string,
  school?: string,
  bio?: string,          // 阅卷员简介
  expertise?: string[]   // 阅卷员专长
}
```

### 5.3 修改密码

**接口**: `PUT /api/grader/password`

**请求体**:
```typescript
{
  oldPassword: string,  // 哈希后的旧密码
  newPassword: string   // 哈希后的新密码
}
```

**响应**:
```typescript
{
  success: true,
  message: "密码修改成功"
}
```

### 5.4 注销账号

**接口**: `POST /api/grader/account/delete`

**描述**: 永久删除当前阅卷员账号及所有相关数据

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
- 请确保完成所有进行中的阅卷任务，否则可能影响考试评分流程

## 6. 文件处理模块

### 6.1 下载考试文件

**接口**: `GET /api/grader/files/{fileId}/download`

**参数**:
- `type`: 文件类型（必需：question, answer, answer_sheet）

**说明**: 直接返回文件流，用于下载

### 6.2 上传头像

**接口**: `POST /api/upload/avatar`

**请求**: 使用 FormData，字段名为 `avatar`

**响应**:
```typescript
{
  success: true,
  data: {
    avatarUrl: string
  }
}
```

## 6.5. 仪表板统计模块

### 6.5.1 获取阅卷员仪表板数据（简化版 v1.3.0）
**接口**: `GET /api/grader/dashboard/stats`

**描述**: 获取阅卷员仪表板统计数据，简化版不含平均分计算

**响应**:
```typescript
{
  success: true,
  data: {
    totalTasks: 5,              // 总任务数量
    completedTasks: 3,          // 已完成任务数量
    pendingTasks: 2,            // 待处理任务数量
    totalScores: 500,           // 总分值
    efficiency: 85.2,           // 阅卷效率(%)
    recentActivities: [         // 最近活动记录
      {
        type: "grading",
        description: "完成了《2024年春季物理竞赛》的阅卷",
        timestamp: "2024-03-18T15:30:00Z"
      },
      {
        type: "task",
        description: "领取了《2024年春季化学竞赛》的阅卷任务",
        timestamp: "2024-03-15T16:45:00Z"
      }
    ]
  },
  message: "获取仪表板数据成功"
}
```

---

## 7. 系统通知模块

### 7.1 获取通知列表

**接口**: `GET /api/grader/notifications`

**参数**:
- `page`: 页码（可选）
- `limit`: 每页数量（可选）
- `status`: 通知状态（可选：unread, read, all）

**响应**:
```typescript
{
  success: true,
  data: {
    notifications: Array<{
      id: string,
      title: string,
      content: string,
      type: 'system' | 'exam' | 'task' | 'warning',
      status: 'unread' | 'read',
      createdAt: string,
      data?: any
    }>,
    total: number,
    unreadCount: number
  }
}
```

### 7.2 标记通知为已读

**接口**: `POST /api/grader/notifications/{notificationId}/read`

### 7.3 标记所有通知为已读

**接口**: `POST /api/grader/notifications/read-all`

## 数据模型

### GradingTask（阅卷任务）

```typescript
interface GradingTask {
  id: string,
  examId: string,
  examTitle: string,
  submissionId: string,
  studentName: string,
  studentUsername: string,
  studentSchool?: string,
  studentProvince?: string,
  submittedAt: string,
  status: 'pending' | 'grading' | 'completed',
  score?: number,
  maxScore?: number,
  graderId?: string,
  graderName?: string,
  assignedAt?: string,
  startedAt?: string,
  completedAt?: string,
  feedback?: string,
  submission: ExamSubmission,
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}
```

### Exam（考试）

```typescript
interface Exam {
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
  maxScore?: number,
  province?: string,
  grade?: string,
  subject?: string
}
```

### ExamSubmission（考试提交）

```typescript
interface ExamSubmission {
  id: string,
  examId: string,
  studentId: string,
  studentName: string,
  studentUsername: string,
  studentSchool?: string,
  studentProvince?: string,
  answers: ExamAnswer[],
  submittedAt: string,
  status: 'submitted' | 'grading' | 'graded',
  score?: number,
  gradedBy?: string,
  gradedAt?: string,
  feedback?: string
}
```

## 错误码说明

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证或token过期
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如任务已被其他人领取）
- `500`: 服务器内部错误

## 使用示例

### 获取阅卷任务列表

```javascript
const response = await GraderAPI.getGradingTasks({
  page: 1,
  limit: 20,
  status: 'pending'
});

if (response.success) {
  console.log('任务列表:', response.data.tasks);
} else {
  console.error('获取失败:', response.message);
}
```

### 提交阅卷结果

```javascript
const result = await GraderAPI.submitGrading('task-123', {
  score: 85,
  maxScore: 100,
  feedback: '作答较好，但第3题有小错误'
});

if (result.success) {
  console.log('提交成功');
} else {
  console.error('提交失败:', result.message);
}
```

## 注意事项

1. **认证**: 所有API请求都需要在Header中包含有效的Bearer Token
2. **权限**: 阅卷员只能操作分配给自己的任务
3. **并发**: 同一个阅卷任务同时只能被一个阅卷员操作
4. **文件访问**: 考试文件需要通过专用的下载接口获取
5. **数据安全**: 敏感信息（如密码）需要在前端进行哈希处理
6. **缓存**: 建议对统计数据和考试列表进行适当缓存
7. **错误处理**: 前端需要对各种错误状态进行适当的用户提示

## 版本历史

- v1.0.0: 初始版本，包含基础的阅卷任务管理功能
- v1.2.0: 微服务架构升级，全局错误通知系统，API路径规范化
- v1.1.0: 增加统计分析和通知功能
- v1.2.0: 增加文件处理和个人中心功能
