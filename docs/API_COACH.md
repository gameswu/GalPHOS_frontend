# 教练端API接口文档

## 概述
教练端API接口用于管理学生、参与考试、查看成绩等功能。所有接口都需要教练身份的Bearer Token认证。

> **类型定义**: 本文档中的所有数据类型基于统一类型系统定义，详见 [API类型定义参考](./API_TYPES_REFERENCE.md)

## 重要场景说明

### 团体-个人模式
本系统采用**团体-个人区分模式**，存在两种不同性质的学生：

1. **独立学生账号**：
   - 拥有完整的登录凭据（用户名、密码、手机号等）
   - 可以独立登录系统
   - 自主管理个人资料和考试参与
   - 通过独立的学生面板进行操作

2. **教练管理的学生**（本文档涉及的主要对象）：
   - **无登录能力**：没有密码、手机号等登录凭据
   - **非独立账号**：仅作为教练管理的团体成员存在
   - **教练代理操作**：所有操作（答题提交、成绩查看等）都通过教练进行
   - **简化管理**：只需姓名和用户名即可创建，无需审核流程
   - **区域继承**：自动继承教练的省份和学校信息

### 适用场景
- 线下集体考试，教练统一管理答题卡收集和提交
- 培训班或竞赛团队的统一管理
- 不具备独立上网条件的学生群体
- 需要教练全程指导和监督的教学场景

> ⚠️ **注意**：教练管理的学生与独立学生账号在系统中是完全不同的实体，不能相互转换。

## 基础信息

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

> **重要说明**: 教练管理的学生与独立学生账号有本质区别。教练管理的学生**不是实际的登录账号**，无法独立登录系统，只能通过教练代理进行各种操作。这是一种团体-个人的管理模式。

### 1.1 获取教练管理的学生列表
**接口**: `GET /api/coach/students`

**描述**: 获取当前教练管理的学生列表（非独立账号）

**查询参数**:
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20
- `search?` (string): 搜索关键词（姓名、用户名）
- `status?` (string): 状态筛选 active | inactive

**响应**:
```typescript
// 使用统一类型：ApiResponse<{ students: CoachManagedStudent[], total: number, page: number, limit: number }>
{
  success: true,
  data: {
    students: [
      {
        id: "managed_stu_001",
        username: "zhangsan001",        // 用户名，也作为显示名称
        coachId: "coach_001",
        coachUsername: "coach001",
        province: "北京市",              // 继承教练的省份
        school: "北京第一中学",          // 继承教练的学校
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        examParticipations: [
          {
            examId: "exam_001",
            submittedAt: "2024-03-01T11:30:00.000Z",
            score: 85,
            rank: 12
          }
        ]
        // 注意：无password、phone、name等字段
        // username既是标识符也是显示名称
      }
    ],
    total: 50,
    page: 1,
    limit: 20
  }
}
```

### 1.2 添加教练管理的学生
**接口**: `POST /api/coach/students`

**描述**: 为当前教练添加新的管理学生（创建学生注册申请）

**重要说明**: 此操作会创建一个学生注册申请，需要管理员审核通过后学生才会正式加入教练管理范围。

**请求体**:
```typescript
{
  username: "zhangsan001"             // 用于标识的用户名（必需，审核通过后不能登录）
  // 注意：无需name、password、phone等字段
  // province和school自动继承教练的信息
  // 学生显示名称默认使用username
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "reg_001",
    message: "学生注册申请已提交，等待管理员审核"
  }
}
```

**审核流程**:
1. 教练提交学生添加申请
2. 管理员在后台审核申请
3. 审核通过后，学生正式加入教练管理范围
4. 学生无法独立登录，所有操作需通过教练账号进行

### 1.3 更新教练管理学生信息
**接口**: `PUT /api/coach/students/{studentId}`

**描述**: 更新教练管理学生的信息

**请求体**:
```typescript
{
  status?: "inactive"
  // 注意：无法修改username、省份、学校等关键信息
  // 不支持修改学生显示名称（username固定）
}
```

### 1.4 移除教练管理的学生
**接口**: `DELETE /api/coach/students/{studentId}`

**描述**: 从当前教练的管理列表中移除学生（删除非独立账号）

**说明**: 
- 此操作会完全删除该学生记录
- 该学生的所有考试记录和成绩也会被删除
- 请谨慎操作

---

## 2. 考试管理模块

### 2.1 获取考试列表
**接口**: `GET /api/coach/exams`

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
**接口**: `GET /api/coach/exams/{examId}`

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
          studentUsername: "zhangsan001",
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

### 2.4 获取考试成绩统计
**接口**: `GET /exams/{examId}/score-stats`

**描述**: 获取指定考试的成绩统计信息，用于历史考试页面的教练视图

**响应**:
```typescript
{
  success: true,
  data: {
    totalStudents: 10,
    submittedStudents: 8,
    averageScore: 75.2,
    scores: [
      {
        studentId: "student001",
        studentName: "李学生",
        score: 85,
        submittedAt: "2025-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

## 3. 答题提交模块

> **核心特性**: 由于教练管理的学生无法独立登录，所有答题相关操作都必须通过教练账号代理完成。

### 3.1 代学生提交答案
**接口**: `POST /exams/{examId}/submissions`

**描述**: 教练代替管理学生提交考试答案（这是唯一的提交方式）

**请求体**:
```typescript
{
  studentUsername: "zhangsan001",     // 教练管理的学生用户名
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

**说明**:
- 只能为当前教练管理的学生提交答案
- 学生本人无法直接操作此接口
- 提交记录会关联到教练账号

### 3.2 代学生上传答案图片
**接口**: `POST /exams/{examId}/upload-answer`

**描述**: 教练代替学生上传答案图片

**请求**: FormData
- `file`: 图片文件
- `questionNumber`: 题目编号
- `studentUsername`: 教练管理的学生用户名

**响应**:
```typescript
{
  success: true,
  data: {
    imageUrl: "https://example.com/answer_uploaded.jpg",
    questionNumber: 1,
    studentUsername: "zhangsan001"
  }
}
```

### 3.3 获取学生提交记录
**接口**: `GET /exams/{examId}/submissions`

**描述**: 获取教练管理学生的提交记录

**查询参数**:
- `studentUsername?` (string): 特定学生用户名
- `status?` (string): 提交状态筛选

**响应**:
```typescript
// 使用统一类型：ApiResponse<ExamSubmission[]>
{
  success: true,
  data: [
    {
      id: "sub_001",
      examId: "exam_001",
      studentId: "managed_stu_001",
      studentUsername: "zhangsan001",
      answers: [
        {
          questionId: "q1",
          questionNumber: 1,
          answer: "",
          maxScore: 10,
          imageUrl: "https://example.com/answer1.jpg",
          uploadTime: "2024-03-01T10:30:00.000Z"
        }
      ],
      submittedAt: "2024-03-01T11:30:00.000Z",
      status: "graded",
      totalScore: 85,
      maxScore: 100,
      feedback: "整体答题思路清晰，计算部分需要加强"
    }
  ]
}
```

**说明**:
- 所有提交都是通过教练代理完成
- 学生无法查看自己的提交记录，只能通过教练查看

---

## 4. 成绩查询模块

> **权限说明**: 教练可以查看所有管理学生的成绩，学生本人无法直接查看，需要通过教练获取成绩信息。

### 4.1 获取学生成绩概览
**接口**: `GET /api/coach/grades/overview`

**描述**: 获取教练管理学生的成绩统计概览

**响应**:
```typescript
{
  success: true,
  data: {
    totalExams: 5,                    // 参与的考试总数
    totalStudents: 10,                // 管理的学生总数
    avgScore: 78.5,                   // 平均分
    passRate: 85.5,                   // 及格率（%）
    topStudents: [                    // 优秀学生（教练管理的学生中）
      {
        studentId: "managed_stu_001",
        studentUsername: "zhangsan001",
        avgScore: 92.5,
        examCount: 5,
        lastExamDate: "2024-03-01"
      }
    ],
    recentExams: [                    // 最近考试统计
      {
        examId: "exam_001",
        examTitle: "2024年物理竞赛初赛",
        avgScore: 75.2,               // 教练管理学生的平均分
        participantCount: 8,          // 参与的学生数量
        totalCount: 10,               // 教练管理的学生总数
        date: "2024-03-01"
      }
    ]
  }
}
```

### 4.2 获取详细成绩
**接口**: `GET /api/coach/grades/details`

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
          studentUsername: "zhangsan001",
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

### 4.3 获取学生排名
**接口**: `GET /api/coach/grades/ranking/{examId}`

**描述**: 获取指定考试中学生的排名信息

**路径参数**:
- `examId` (string): 考试ID

**查询参数**:
- `studentId?` (string): 特定学生ID（可选）

**响应**:
```typescript
{
  success: true,
  data: {
    examId: "exam_001",
    examTitle: "2024年物理竞赛初赛",
    totalParticipants: 150,
    rankings: [
      {
        rank: 1,
        studentId: "managed_stu_001",
        studentUsername: "zhangsan001",
        score: 95,
        percentage: 95.0
      },
      {
        rank: 12,
        studentId: "managed_stu_002", 
        studentUsername: "lisi002",
        score: 85,
        percentage: 85.0
      }
    ],
    coachStudentStats: {
      highestRank: 1,
      lowestRank: 45,
      averageRank: 23.5,
      topPercentage: 15.3  // 教练学生在前xx%
    }
  }
}
```

### 4.4 导出成绩报告
**接口**: `GET /api/coach/grades/export/{examId}`

**描述**: 导出考试成绩报告（Excel或PDF格式）

**路径参数**:
- `examId` (string): 考试ID

**查询参数**:
- `format?` (string): 导出格式 excel | pdf，默认excel

**响应**:
```typescript
{
  success: true,
  data: {
    downloadUrl: "https://example.com/reports/exam_001_scores.xlsx",
    filename: "2024年物理竞赛初赛_成绩报告.xlsx",
    fileSize: 102400,
    expiresAt: "2024-03-02T00:00:00.000Z"
  }
}
```

### 4.5 获取学生详细成绩
**接口**: `GET /api/coach/grades/student/{studentId}/exam/{examId}`

**描述**: 获取特定学生在特定考试中的详细成绩

**路径参数**:
- `studentId` (string): 学生ID
- `examId` (string): 考试ID

**响应**:
```typescript
{
  success: true,
  data: {
    studentInfo: {
      id: "managed_stu_001",
      username: "zhangsan001"
    },
    examInfo: {
      id: "exam_001",
      title: "2024年物理竞赛初赛",
      date: "2024-03-01"
    },
    scoreDetails: {
      totalScore: 85,
      maxScore: 100,
      percentage: 85.0,
      rank: 12,
      totalParticipants: 150,
      questionScores: [
        {
          questionNumber: 1,
          score: 8,
          maxScore: 10,
          feedback: "计算正确，步骤清晰"
        },
        {
          questionNumber: 2,
          score: 6,
          maxScore: 10,
          feedback: "方法正确，但计算有误"
        }
      ]
    }
  }
}
```

### 4.6 批量获取学生成绩
**接口**: `GET /api/coach/grades/batch`

**描述**: 批量获取多个学生的成绩信息

**查询参数**:
- `examId?` (string): 特定考试ID
- `studentIds?` (string): 学生ID列表，逗号分隔
- `sortBy?` (string): 排序字段 score | rank | name
- `order?` (string): 排序方向 asc | desc

**响应**:
```typescript
{
  success: true,
  data: {
    examId: "exam_001",
    students: [
      {
        studentId: "managed_stu_001",
        studentUsername: "zhangsan001",
        score: 85,
        rank: 12,
        submittedAt: "2024-03-01T11:30:00.000Z"
      }
    ],
    summary: {
      totalStudents: 10,
      averageScore: 78.5,
      highestScore: 95,
      lowestScore: 62
    }
  }
}
```

---

## 5. 个人设置模块

### 5.1 获取个人信息
**接口**: `GET /api/coach/profile`

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
    email: "li.teacher@example.com",
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
**接口**: `PUT /api/coach/profile`

**描述**: 更新教练个人信息

**请求体**:
```typescript
{
  name?: "李老师",
  phone?: "13800138001",
  email?: "li.teacher@example.com",
  avatar?: "https://example.com/new_avatar.jpg"
}
```

### 5.3 修改密码
**接口**: `PUT /api/coach/password`

**描述**: 修改登录密码

**请求体**:
```typescript
{
  oldPassword: "hashed_old_password", // 前端SHA-256+盐值哈希
  newPassword: "hashed_new_password"  // 前端SHA-256+盐值哈希
**响应**:
```typescript
{
  success: true,
  message: "密码修改成功"
}
```

### 5.4 申请赛区变更
**接口**: `POST /api/coach/region-change`

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

### 5.5 获取我的赛区变更申请
**接口**: `GET /api/coach/region-change/status`

**描述**: 获取当前教练的赛区变更申请记录

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "req_001",
      currentProvince: "北京市",
      currentSchool: "北京第一中学",
      requestedProvince: "上海市",
      requestedSchool: "上海中学",
      reason: "工作调动，需要变更赛区",
      status: "pending",
      createdAt: "2024-01-01T00:00:00.000Z",
      reviewedAt?: "2024-01-02T00:00:00.000Z",
      reviewNote?: "审核备注"
    }
  ]
}
```

### 5.6 上传头像
### 5.6 上传头像
**接口**: `POST /api/upload/avatar`

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

### 5.7 注销账号
**接口**: `POST /api/coach/account/delete`

**描述**: 永久删除当前教练账号及所有相关数据

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
- 教练管理的所有学生关联信息将一并删除

---

## 6. 仪表板统计模块

### 6.1 获取仪表板数据
**接口**: `GET /api/coach/dashboard/stats`

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
        message: "zhangsan001完成了物理竞赛初赛",
        time: "2024-03-01T11:30:00.000Z"
      },
      {
        type: "student_added", 
        message: "新增学生lisi002",
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
