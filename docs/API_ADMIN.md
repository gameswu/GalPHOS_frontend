# GalPHOS 管理员API接口文档

## 概述
GalPHOS管理员面板API接口，提供用户管理、考试管理、阅卷管理、赛区管理等功能。所有接口都需要管理员身份的Bearer Token认证。

> **类型定义**: 本文档中的所有数据类型基于统一类型系统定义，详见 [API类型定义参考](./API_TYPES_REFERENCE.md)

## 基础信息

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

---

## 1. 用户管理模块

### 1.1 获取待审核用户列表
**接口**: `GET /api/admin/users/pending`

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
// 使用统一类型：ApiResponse<PendingUser[]>
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
  message: "获取成功"
}
```

### 1.2 审核用户申请
**接口**: `POST /api/admin/users/approve`

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
**接口**: `GET /api/admin/users/approved`

**描述**: 获取已通过审核的用户列表，支持分页和筛选

**查询参数**:
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20
- `role?` (string): 角色筛选 coach | student | grader
- `status?` (string): 状态筛选 active | disabled
- `search?` (string): 搜索关键词（用户名）

**响应**:
```typescript
// 使用统一类型：ApiResponse<{ users: ApprovedUser[], total: number, page: number, limit: number }>
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
        status: "approved",
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
**接口**: `POST /api/admin/users/status`

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
**接口**: `DELETE /api/admin/users/{userId}`

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

### 1.6 获取教练学生关系统计
**接口**: `GET /api/admin/coach-students/stats`

**描述**: 获取教练管理的学生统计信息

**响应**:
```typescript
{
  success: true,
  data: {
    totalCoaches: 25,
    totalManagedStudents: 150,
    averageStudentsPerCoach: 6
  }
}
```

### 1.7 获取教练学生关系列表
**接口**: `GET /api/admin/coach-students`

**描述**: 获取教练-学生关系的详细列表

**查询参数**:
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20
- `coachId?` (string): 特定教练ID筛选

**响应**:
```typescript
{
  success: true,
  data: {
    relationships: [
      {
        id: "rel_001",
        coachId: "coach_001",
        coachUsername: "coach001",
        coachName: "李老师",
        studentId: "managed_stu_001",
        studentUsername: "zhangsan001",
        studentName: "张三",
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ],
    total: 150,
    page: 1,
    limit: 20
  }
}
```

### 1.8 创建教练学生关系
**接口**: `POST /api/admin/coach-students`

**描述**: 创建教练与学生的管理关系

**请求体**:
```typescript
{
  coachId: "coach_001",
  studentUsername: "zhangsan001",
  studentName: "张三"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "rel_001",
    message: "教练学生关系创建成功"
  }
}
```

### 1.9 删除教练学生关系
**接口**: `DELETE /api/admin/coach-students/{relationshipId}`

**描述**: 删除教练与学生的管理关系

**路径参数**:
- `relationshipId` (string): 关系ID

**响应**:
```typescript
{
  success: true,
  message: "教练学生关系删除成功"
}
```

### 1.10 获取学生注册申请列表
**接口**: `GET /api/admin/student-registrations`

**描述**: 获取学生注册申请列表

**查询参数**:
- `status?` (string): 状态筛选 pending | approved | rejected
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20

**响应**:
```typescript
{
  success: true,
  data: {
    requests: [
      {
        id: "reg_001",
        username: "student001",
        province: "北京市",
        school: "北京第一中学",
        coachUsername: "coach001",
        status: "pending",
        reason?: "申请理由",
        createdAt: "2024-01-01T00:00:00.000Z",
        reviewedBy?: "admin001",
        reviewedAt?: "2024-01-02T00:00:00.000Z",
        reviewNote?: "审核备注"
      }
    ],
    total: 50,
    page: 1,
    limit: 20
  }
}
```

### 1.11 处理学生注册申请
**接口**: `POST /api/admin/student-registrations/{requestId}/review`

**描述**: 审核学生注册申请

**路径参数**:
- `requestId` (string): 申请ID

**请求体**:
```typescript
{
  action: "approve" | "reject",
  note?: "审核备注"
}
```

**响应**:
```typescript
{
  success: true,
  message: "学生注册申请审核完成"
}
```

### 1.12 创建学生注册申请
**接口**: `POST /api/admin/student-registrations`

**描述**: 创建新的学生注册申请（通常由教练或学生发起）

**请求体**:
```typescript
{
  username: "student001",
  password: "hashedPassword",
  province: "北京市",
  school: "北京第一中学",
  coachUsername: "coach001",
  reason?: "申请理由"
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

## 2. 赛区管理模块

### 2.1 获取赛区列表
**接口**: `GET /api/admin/regions`

**描述**: 获取所有省份及其下属学校列表

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "province_001",
      name: "北京市",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
      createdBy: "admin001",
      schools: [
        {
          id: "school_001",
          name: "北京第一中学",
          provinceId: "province_001",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-10T08:15:00.000Z",
          createdBy: "admin001"
        },
        {
          id: "school_002", 
          name: "北京第二中学",
          provinceId: "province_001",
          createdAt: "2024-01-03T00:00:00.000Z",
          updatedAt: "2024-01-03T00:00:00.000Z",
          createdBy: "admin001"
        }
      ]
    }
  ]
}
```

### 2.2 添加省份
**接口**: `POST /api/admin/regions/provinces`

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
    name: "上海市",
    createdAt: "2024-01-20T10:30:00.000Z",
    updatedAt: "2024-01-20T10:30:00.000Z",
    createdBy: "admin001"
  },
  message: "省份添加成功"
}
```

### 2.2 获取省份列表

**接口路径：** `GET /api/admin/regions/provinces`

**描述**: 获取所有省份列表（不包含学校信息）

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string
  }>
}
```

### 2.3 添加省份
**接口**: `POST /api/admin/regions/provinces`

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
    name: "上海市",
    createdAt: "2024-01-20T10:30:00.000Z",
    updatedAt: "2024-01-20T10:30:00.000Z",
    createdBy: "admin001"
  },
  message: "省份添加成功"
}
```

### 2.4 获取省份下的学校列表

**接口路径：** `GET /api/admin/regions/schools`

**描述**: 获取指定省份下的学校列表

**查询参数**:
- `provinceId` (string): 省份ID

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    name: string,
    provinceId: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string
  }>
}
```

### 2.5 添加学校
**接口**: `POST /api/admin/regions/schools`

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
    provinceId: "province_001",
    createdAt: "2024-01-20T14:45:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
    createdBy: "admin001"
  },
  message: "学校添加成功"
}
```

### 2.6 更新学校

**接口路径：** `PUT /api/admin/regions/schools/{schoolId}`

**描述**: 更新学校信息

**路径参数**:
- `schoolId` (string): 学校ID

**请求参数：**
```typescript
{
  name: string
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    name: string,
    provinceId: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string
  },
  message: "学校信息更新成功"
}
```

### 2.7 删除学校

**接口路径：** `DELETE /api/admin/regions/schools/{schoolId}`

**描述**: 删除指定学校

**路径参数**:
- `schoolId` (string): 学校ID

**响应格式：**
```typescript
{
  success: boolean,
  message: "学校删除成功"
}
```

### 2.8 删除省份

**接口路径：** `DELETE /api/admin/regions/provinces/{provinceId}`

**描述**: 删除指定省份（注意：删除省份会同时删除该省份下的所有学校）

**路径参数**:
- `provinceId` (string): 省份ID

**响应格式：**
```typescript
{
  success: boolean,
  message: "省份删除成功"
}
```

### 2.9 获取赛区变更申请

**接口路径：** `GET /api/admin/regions/change-requests`

**描述**: 获取所有赛区变更申请列表

**查询参数**:
- `status?` (string): 状态筛选 pending | approved | rejected
- `page?` (number): 页码，默认1
- `limit?` (number): 每页数量，默认20

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    requests: Array<{
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
      createdAt: string,
      updatedAt: string,
      reviewedBy?: string,
      reviewedAt?: string,
      reviewNote?: string
    }>,
    total: number,
    page: number,
    limit: number
  }
}
```

### 2.10 处理赛区变更申请

**接口路径：** `POST /api/admin/regions/change-requests/{requestId}`

**描述**: 审核赛区变更申请

**路径参数**:
- `requestId` (string): 申请ID

**请求参数：**
```typescript
{
  action: 'approve' | 'reject',
  reason?: string
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    reviewedAt: string,
    reviewNote?: string
  },
  message: "赛区变更申请处理完成"
}
```

---

## 3. 考试管理模块

### 3.1 获取考试列表

**接口路径：** `GET /api/admin/exams`

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

### 3.2 三步创建考试流程

**步骤1: 创建考试基本信息**

**接口路径：** `POST /api/admin/exams`

**描述**: 创建新考试的基本信息（第一步）

**请求参数：**
```typescript
{
  title: string,                    // 考试标题
  description: string,              // 考试描述
  startTime: string,               // 开始时间（ISO格式）
  endTime: string,                 // 结束时间（ISO格式）
  totalQuestions: number,          // 题目总数
  duration: number,                // 考试时长（分钟）
  status: 'draft'                  // 状态：草稿
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    totalQuestions: number,
    duration: number,
    status: 'draft',
    createdAt: string,
    createdBy: string
  },
  message: "考试基本信息创建成功"
}
```

**步骤2: 设置题目分值**

**接口路径：** `POST /api/admin/exams/{examId}/question-scores`

**描述**: 为考试设置题目分值（第二步）

**请求参数：**
```typescript
{
  questions: Array<{               // 题目分值设置
    number: number,                // 题目序号
    score: number                  // 分值
  }>
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    examId: string,
    totalQuestions: number,
    totalScore: number,            // 计算的总分值
    questions: Array<{
      id: string,
      number: number,
      score: number
    }>
  },
  message: "题目分值设置成功"
}
```

**步骤3: 上传考试文件并发布考试**

**上传文件接口路径：** `POST /api/upload/exam-files`

**发布考试接口路径：** `POST /api/admin/exams/{examId}/publish`

**描述**: 上传考试相关文件并发布考试（第三步）

**上传文件请求类型**: `multipart/form-data`

**发布考试请求参数：**
```typescript
{
  questionFileId?: string,        // 题目文件ID
  answerFileId?: string,          // 答案文件ID
  answerSheetFileId?: string      // 答题卡文件ID
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    title: string,
    status: 'published',
    publishedAt: string
  },
  message: "考试发布成功"
}
```

### 3.3 更新考试（优化版）

**接口路径：** `PUT /api/admin/exams/{examId}`

**描述**: 更新考试信息，当更新题目数量时会影响分值配置

**请求参数：**
```typescript
{
  title?: string,                  // 考试标题
  description?: string,            // 考试描述
  startTime?: string,             // 开始时间
  endTime?: string,               // 结束时间
  totalQuestions?: number,        // 题目总数（更新时需注意分值配置）
  duration?: number,              // 考试时长
  resetScoresIfNeeded?: boolean   // 当题目数量变化时是否重置分值，默认false
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    totalQuestions: number,
    duration: number,
    status: string,
    updatedAt: string,
    scoreConfigChanged?: boolean    // 是否影响了分值配置
  },
  message: "考试更新成功"
}
```
  startTime?: string,
  endTime?: string,
  totalQuestions?: number,
  duration?: number
}
```

### 3.4 发布考试

**接口路径：** `POST /api/admin/exams/{examId}/publish`

### 3.5 取消发布考试

**接口路径：** `POST /api/admin/exams/{examId}/unpublish`

### 3.6 删除考试

**接口路径：** `DELETE /api/admin/exams/{examId}`

**注意：** 考试文件上传已统一使用文件上传服务，请参考以下接口：
- 文件上传：`POST /api/upload/exam-files`
- 文件删除：`DELETE /api/files/{fileId}`

详细说明请参考[文件上传服务文档](./API_FILE_UPLOAD.md)

### 3.7 设置题目分值

**接口路径：** `POST /api/admin/exams/{examId}/question-scores`

**描述**: 为考试设置题目分值配置。仅支持为每道题单独设置分值，无需填写题干内容。

**请求参数：**
```typescript
{
  questions: Array<{
    number: number,           // 题目序号（1-N）
    score: number             // 该题分值
  }>
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    examId: string,
    totalQuestions: number,
    totalScore: number,
    questions: Array<{
      id: string,            // 题目ID
      number: number,        // 题目序号
      score: number,         // 题目分值
      maxScore?: number      // 最大可得分
    }>
  },
  message: "题目分值设置成功"
}
```

**使用示例：**
```typescript
// 20道题，手动为每题设置分值
{
  "questions": [
    { "number": 1, "score": 5 },
    { "number": 2, "score": 5 },
    { "number": 3, "score": 10 },
    // ... 其他题目
    { "number": 20, "score": 15 }
  ]
}
```
### 3.8 获取题目分值

**接口路径：** `GET /api/admin/exams/{examId}/question-scores`

**描述**: 获取考试的题目分值配置

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    examId: string,
    totalQuestions: number,
    totalScore: number,
    questions: Array<{
      id: string,            // 题目ID
      number: number,        // 题目序号
      score: number,         // 题目分值
      maxScore?: number      // 最大可得分
    }>
  }
}
```

### 3.9 更新单个题目分值

**接口路径：** `PUT /api/admin/exams/{examId}/question-scores/{questionNumber}`

**描述**: 更新指定题目的分值

**路径参数：**
- `examId` (string): 考试ID
- `questionNumber` (number): 题目序号（1-N）

**请求参数：**
```typescript
{
  score: number             // 新的题目分值
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    examId: string,
    questionNumber: number,
    score: number,
    totalScore: number       // 更新后的总分
  },
  message: "题目分值更新成功"
}
```

---

## 4. 阅卷管理模块

### 4.1 获取阅卷者列表

**接口路径：** `GET /api/admin/graders`

**描述**: 获取阅卷者列表，包含基本信息和阅卷状态（简化版：仅包含必要字段）

**响应格式：**
```typescript
{
  success: boolean,
  data: Array<{
    id: string,
    username: string,
    phone: string,
    status: 'available' | 'busy' | 'offline',
    currentTasks: number,    // 阅卷队列数（当前待处理任务数）
    completedTasks: number   // 已完成数（已完成的阅卷任务数）
  }>
}
```

### 4.2 获取阅卷任务列表

**接口路径：** `GET /api/admin/grading/tasks`

**请求参数（Query）：**
```typescript
{
  examId?: string,
  status?: 'pending' | 'assigned' | 'completed',
  graderId?: string
}
```

### 4.3 分配阅卷任务

**接口路径：** `POST /api/admin/grading/assign`

**请求参数：**
```typescript
{
  examId: string,
  questionNumber: number,
  graderIds: string[]
}
```

### 4.4 获取阅卷进度

**接口路径：** `GET /api/admin/grading/progress/{examId}`

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

**接口路径：** `GET /api/admin/system/settings`

**描述**: 获取系统全局配置，包含系统公告等配置

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    // 系统基础信息
    systemName: string,
    version: string,
    buildTime: string
  }
}
```

### 5.2 更新系统设置（简化版 v1.3.2）

**接口路径：** `PUT /api/admin/system/settings`

**描述**: 更新系统设置，支持部分字段更新

**请求参数：**
```typescript
{
  // 系统设置参数（暂无可配置参数）
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    updated: boolean,
    settings: {
      // 返回更新后的完整系统设置
      systemName: string,
      version: string,
      buildTime: string,
      // ...其他系统设置
    }
  },
  message: "系统设置更新成功"
}
```

### 5.3 获取管理员列表

**接口路径：** `GET /api/admin/system/admins`

### 5.4 创建管理员

**接口路径：** `POST /api/admin/system/admins`

**请求参数：**
```typescript
{
  username: string,
  password: string,
  role: 'super_admin' | 'admin'
}
```

### 5.5 更新管理员信息

**接口路径：** `PUT /api/admin/system/admins/{adminId}`

**请求参数：**
```typescript
{
  username?: string,
  avatar?: string,
  role?: 'super_admin' | 'admin'
}
```

### 5.6 修改管理员密码

**接口路径：** `PUT /api/admin/system/admins/{adminId}/password`

**请求参数：**
```typescript
{
  oldPassword: string,  // 哈希化
  newPassword: string   // 哈希化
}
```

### 5.7 删除管理员

**接口路径：** `DELETE /api/admin/system/admins/{adminId}`

### 5.8 上传头像

**接口路径：** `POST /api/upload/avatar`

**请求参数（FormData）：**
```typescript
{
  file: File
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    url: string,
    filename: string,
    size: number
  },
  message: "头像上传成功"
}
```

### 5.9 获取个人资料

**接口路径：** `GET /api/admin/profile`

**描述**: 获取当前管理员的个人资料信息

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    username: string,
    avatar?: string,
    role: string,
    createdAt: string,
    lastLoginAt: string
  }
}
```

### 5.10 更新个人资料

**接口路径：** `PUT /api/admin/profile`

**描述**: 更新当前管理员的个人资料信息

**请求参数：**
```typescript
{
  avatar?: string
}
```

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    id: string,
    username: string,
    avatar?: string,
    role: string,
    createdAt: string,
    lastLoginAt: string
  },
  message: "个人资料更新成功"
}
```

### 5.11 修改个人密码

**接口路径：** `PUT /api/admin/password`

**描述**: 当前管理员修改自己的密码

**请求参数：**
```typescript
{
  oldPassword: string,  // 哈希化
  newPassword: string   // 哈希化
}
```

**响应格式：**
```typescript
{
  success: boolean,
  message: "密码修改成功"
}
```

---

## 6. 仪表盘统计模块

### 6.1 获取仪表盘数据

**接口路径：** `GET /api/admin/dashboard/stats`

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
    coachStudents: {
      totalCoaches: number,
      totalManagedStudents: number,
      averageStudentsPerCoach: number
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

---

## 前端实现说明

### 分值设置UI设计原则

基于您的需求"选择好题目数量后即可设置每道题目的分值，无需题干内容"，我们优化了以下几个方面：

#### 1. 极简化流程
- **主要场景**：快速均分模式，只需输入"题目总数"和"每题分值"两个参数
- **高级场景**：快速+自定义模式，可为个别题目设置特殊分值
- **维护场景**：重置统一分值，批量修改已设置的分值

#### 2. 去除题干内容要求
- 所有API接口不再要求`content`字段
- 题目内容全部依赖试题文件，前端无需处理题干
- 分值设置仅关注"题目序号"和"分值"的映射关系

#### 3. 前端组件设计
```typescript
// 主要操作：快速均分
<Form onFinish={(values) => setQuestionScoresUniform(examId, values.totalQuestions, values.defaultScore)}>
  <InputNumber placeholder="题目总数" name="totalQuestions" />
  <InputNumber placeholder="每题分值" name="defaultScore" />
  <Button htmlType="submit">设置分值</Button>
</Form>

// 调用示例
setQuestionScoresUniform('exam_001', 20, 5); // 20题，每题5分
```

#### 4. API调用简化
```typescript
// 前端调用示例
const handleQuickScoreSetup = async (totalQuestions: number, defaultScore: number) => {
  const response = await fetch(`/api/admin/exams/${examId}/question-scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'uniform',
      totalQuestions,
      defaultScore
    })
  });
  
  // 自动生成1-N题目，每题相同分值，无需题干内容
};
```

#### 5. 用户体验优化
- 表单预填：从考试基本信息中自动获取`totalQuestions`
- 即时预览：显示"总分 = 题目数量 × 每题分值"
- 操作反馈：成功后显示"已设置X道题目，每题Y分，总分Z分"
- 错误处理：分值范围验证，题目数量合理性检查

### 推荐的前端实现步骤

1. **考试创建时**：只设置基本信息，暂不设置分值
2. **文件上传后**：根据试题文件确定题目数量
3. **分值设置时**：一键式快速均分设置
4. **发布前检查**：确保分值已设置且合理

这样的设计完全符合您的需求，实现了"题目数量+分值批量设置"的简化流程，避免了繁琐的题干内容填写.

### 5.9 公共系统设置获取接口

**接口路径：** `GET /api/system/settings`

**描述**: 用于前端获取公共系统设置，此接口无需认证

**响应格式：**
```typescript
{
  success: boolean,
  data: {
    // 系统基础信息
    systemName: string,
    version: string,
    buildTime: string
  }
}
```

---
