# 教练端API接口文档

## 概述
教练端API接口用于管理学生、参与考试、查看成绩等功能。所有接口都需要教练身份的Bearer Token认证。

## 基础信息

### API基础URL
```
http://localhost:3001/api/coach
```

### 认证方式
所有请求需要在Header中包含：
```
Authorization: Bearer <coach_token>
Content-Type: application/json
```

### Token说明
- **Token类型**: JWT (JSON Web Token)
- **获取方式**: 通过教练登录接口 `POST /api/auth/login` 获取（role为coach）
- **有效期**: 24小时（可配置）
- **刷新机制**: Token过期后需要重新登录获取新Token
- **权限范围**: 仅限教练功能，可管理自己的学生、参与考试等

### 统一请求头
```typescript
{
  "Authorization": "Bearer <coach_token>",
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

## 1. 学生管理模块

### 1.1 获取学生列表
**接口**: `GET /students`

**描述**: 获取当前教练管理的学生列表

**查询参数**:
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20
- `search?` (string): 搜索关键词（姓名、用户名）
- `status?` (string): 状态筛选 active | inactive
- `grade?` (string): 年级筛选

**响应**:
```typescript
{
  success: true,
  data: {
    students: [
      {
        id: "stu_001",
        name: "张三",
        username: "zhangsan001",
        phone: "13800138001",
        grade: "高一",
        province: "北京市",
        school: "北京第一中学",
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLoginAt?: "2024-01-15T10:30:00.000Z",
        examCount: 5,
        avgScore?: 85.5
      }
    ],
    total: 50,
    page: 1,
    limit: 20
  }
}
```

### 1.2 添加学生
**接口**: `POST /students`

**描述**: 为当前教练添加学生（学生需要预先注册）

**请求体**:
```typescript
{
  username: "zhangsan001", // 学生用户名
  grade: "高一"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "stu_001",
    message: "学生添加成功"
  }
}
```

### 1.3 更新学生信息
**接口**: `PUT /students/{studentId}`

**描述**: 更新学生信息（有限字段）

**请求体**:
```typescript
{
  grade?: "高二",
  status?: "inactive"
}
```

### 1.4 移除学生
**接口**: `DELETE /students/{studentId}`

**描述**: 从当前教练的管理列表中移除学生

---

## 2. 考试管理模块

### 2.1 获取考试列表
**接口**: `GET /exams`

**描述**: 获取可参与和历史考试列表

**查询参数**:
- `status?` (string): 状态筛选 published | ongoing | completed
- `timeRange?` (string): 时间范围 current | past | upcoming

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "exam_001",
      title: "2024年物理竞赛初赛",
      description: "全国中学生物理竞赛初赛",
      startTime: "2024-03-01T09:00:00.000Z",
      endTime: "2024-03-01T12:00:00.000Z",
      duration: 180, // 分钟
      status: "published",
      totalQuestions: 25,
      maxScore: 100,
      questionFile?: {
        id: "file_001",
        name: "初赛试题.pdf",
        url: "/files/exam_001/questions.pdf",
        size: 2048576
      },
      answerSheetFile?: {
        id: "file_002", 
        name: "答题卡.pdf",
        url: "/files/exam_001/answer_sheet.pdf",
        size: 1024000
      },
      createdAt: "2024-02-15T08:00:00.000Z",
      // 参与统计
      totalParticipants: 150,
      myStudentsParticipated: 8,
      myStudentsTotal: 10
    }
  ]
}
```

### 2.2 获取考试详情
**接口**: `GET /exams/{examId}`

**描述**: 获取考试详细信息和参与情况

**响应**:
```typescript
{
  success: true,
  data: {
    exam: {
      // 考试基本信息（同上）
    },
    participationStats: {
      totalStudents: 10,
      submittedStudents: 8,
      gradedStudents: 6,
      avgScore: 78.5,
      submissions: [
        {
          studentId: "stu_001",
          studentName: "张三",
          submittedAt: "2024-03-01T11:30:00.000Z",
          status: "graded",
          score: 85,
          rank: 12
        }
      ]
    }
  }
}
```

### 2.3 下载考试文件
**接口**: `GET /exams/{examId}/files/{fileType}`

**描述**: 下载考试相关文件

**路径参数**:
- `fileType`: question | answerSheet | result

---

## 3. 答题提交模块

### 3.1 代学生提交答案
**接口**: `POST /exams/{examId}/submissions`

**描述**: 教练代替学生提交考试答案（线下考试场景）

**请求体**:
```typescript
{
  studentUsername: "zhangsan001",
  answers: [
    {
      questionNumber: 1,
      imageUrl: "https://example.com/answer1.jpg",
      uploadTime: "2024-03-01T10:30:00.000Z"
    },
    {
      questionNumber: 2, 
      imageUrl: "https://example.com/answer2.jpg",
      uploadTime: "2024-03-01T10:45:00.000Z"
    }
  ]
}
```

### 3.2 上传答案图片
**接口**: `POST /exams/{examId}/upload-answer`

**描述**: 上传学生答案图片

**请求**: FormData
- `file`: 图片文件
- `questionNumber`: 题目编号
- `studentUsername`: 学生用户名

**响应**:
```typescript
{
  success: true,
  data: {
    imageUrl: "https://example.com/answer_uploaded.jpg",
    questionNumber: 1
  }
}
```

### 3.3 获取提交记录
**接口**: `GET /exams/{examId}/submissions`

**描述**: 获取学生提交记录

**查询参数**:
- `studentUsername?` (string): 特定学生

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "sub_001",
      examId: "exam_001",
      studentUsername: "zhangsan001",
      studentName: "张三",
      answers: [
        {
          questionNumber: 1,
          imageUrl: "https://example.com/answer1.jpg",
          uploadTime: "2024-03-01T10:30:00.000Z"
        }
      ],
      submittedAt: "2024-03-01T11:30:00.000Z",
      status: "graded",
      score: 85,
      rank: 12,
      feedback?: "整体答题思路清晰，计算部分需要加强"
    }
  ]
}
```

---

## 4. 成绩查询模块

### 4.1 获取学生成绩概览
**接口**: `GET /grades/overview`

**描述**: 获取学生成绩统计概览

**响应**:
```typescript
{
  success: true,
  data: {
    totalExams: 5,
    avgScore: 78.5,
    passRate: 85.5, // 及格率
    topStudents: [
      {
        studentName: "张三",
        avgScore: 92.5,
        examCount: 5
      }
    ],
    recentExams: [
      {
        examId: "exam_001",
        examTitle: "2024年物理竞赛初赛",
        avgScore: 75.2,
        participantCount: 8,
        date: "2024-03-01"
      }
    ]
  }
}
```

### 4.2 获取详细成绩
**接口**: `GET /grades/details`

**描述**: 获取学生详细成绩列表

**查询参数**:
- `examId?` (string): 特定考试
- `studentId?` (string): 特定学生
- `startDate?` (string): 开始日期
- `endDate?` (string): 结束日期

**响应**:
```typescript
{
  success: true,
  data: [
    {
      examId: "exam_001",
      examTitle: "2024年物理竞赛初赛",
      examDate: "2024-03-01",
      results: [
        {
          studentId: "stu_001",
          studentName: "张三",
          score: 85,
          maxScore: 100,
          rank: 12,
          totalParticipants: 150,
          details: [
            {
              questionNumber: 1,
              score: 8,
              maxScore: 10,
              feedback: "计算正确，步骤清晰"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. 个人设置模块

### 5.1 获取个人信息
**接口**: `GET /profile`

**描述**: 获取教练个人信息

**响应**:
```typescript
{
  success: true,
  data: {
    id: "coach_001",
    username: "coach001",
    name: "李老师",
    phone: "13800138000",
    province: "北京市",
    school: "北京第一中学",
    avatar?: "https://example.com/avatar.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastLoginAt: "2024-03-15T09:00:00.000Z",
    studentCount: 10,
    examCount: 5
  }
}
```

### 5.2 更新个人信息
**接口**: `PUT /profile`

**描述**: 更新教练个人信息

**请求体**:
```typescript
{
  name?: "李老师",
  phone?: "13800138001",
  avatar?: "https://example.com/new_avatar.jpg"
}
```

### 5.3 修改密码
**接口**: `POST /profile/change-password`

**描述**: 修改登录密码

**请求体**:
```typescript
{
  oldPassword: "hashed_old_password", // 前端SHA-256+盐值哈希
  newPassword: "hashed_new_password"  // 前端SHA-256+盐值哈希
}
```

### 5.4 申请赛区变更
**接口**: `POST /profile/change-region`

**描述**: 申请变更所属赛区

**请求体**:
```typescript
{
  province: "上海市",
  school: "上海中学",
  reason: "工作调动，需要变更赛区"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    requestId: "req_001",
    status: "pending",
    message: "赛区变更申请已提交，等待管理员审核"
  }
}
```

### 5.5 上传头像
**接口**: `POST /profile/upload-avatar`

**描述**: 上传头像图片

**请求**: FormData
- `file`: 图片文件

**响应**:
```typescript
{
  success: true,
  data: {
    avatarUrl: "https://example.com/avatar_new.jpg"
  }
}
```

---

## 6. 仪表板统计模块

### 6.1 获取仪表板数据
**接口**: `GET /dashboard/stats`

**描述**: 获取仪表板统计数据

**响应**:
```typescript
{
  success: true,
  data: {
    studentStats: {
      total: 10,
      active: 9,
      newThisMonth: 2
    },
    examStats: {
      total: 5,
      upcoming: 1,
      ongoing: 0,
      completed: 4
    },
    performanceStats: {
      avgScore: 78.5,
      passRate: 85.5,
      improvementRate: 12.3, // 与上次考试相比的提升率
      topScore: 95
    },
    recentActivities: [
      {
        type: "exam_completed",
        message: "张三完成了物理竞赛初赛",
        time: "2024-03-01T11:30:00.000Z"
      },
      {
        type: "student_added", 
        message: "新增学生李四",
        time: "2024-02-28T14:20:00.000Z"
      }
    ]
  }
}
```

---

## 错误处理

### 常见错误码
- `400`: 请求参数错误
- `401`: 未授权（token无效或过期）
- `403`: 权限不足（非教练角色）
- `404`: 资源不存在
- `409`: 冲突（如重复添加学生）
- `500`: 服务器内部错误

### 错误响应格式
```typescript
{
  success: false,
  message: "错误描述",
  error?: {
    code: "ERROR_CODE",
    details: "详细错误信息"
  }
}
```

---

## 前端集成说明

### 1. 认证处理
- 所有API调用前需要检查token的有效性
- token过期时自动跳转到登录页面
- 密码相关操作前端需要进行SHA-256+盐值哈希

### 2. 文件上传
- 支持拖拽上传和点击上传
- 图片格式限制：jpg, jpeg, png
- 单个文件大小限制：5MB
- 支持上传进度显示

### 3. 实时更新
- 考试状态变化时需要刷新数据
- 学生提交答案后需要更新统计数据
- 建议使用轮询或WebSocket获取实时更新

### 4. 缓存策略
- 学生列表和考试列表适合短期缓存
- 成绩数据实时性要求高，不建议缓存
- 用户个人信息可以在session期间缓存

### 5. 错误处理
- 网络错误时显示重试选项
- 操作失败时给出具体的错误提示
- 文件上传失败时允许重新上传
