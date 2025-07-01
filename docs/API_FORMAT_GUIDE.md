# GalPHOS API文档统一格式说明

> **重要更新**: 本文档已根据统一类型系统（`src/types/common.ts`）进行全面更新，确保所有API接口使用一致的数据类型定义。

## 统一类型系统说明

### 类型定义来源
所有API接口中使用的数据类型均基于 `src/types/common.ts` 中定义的统一类型系统，这确保了前后端数据结构的一致性和类型安全。

### 主要类型分类
1. **考试相关类型**: `Exam`, `StudentExam`, `GraderExam`, `ExamWithQuestions`
2. **题目相关类型**: `Question`, `QuestionScore`
3. **答案相关类型**: `ExamAnswer`, `ExamSubmission`
4. **阅卷相关类型**: `GradingTask`, `AdminGradingTask`
5. **用户相关类型**: `PendingUser`, `ApprovedUser`, `AdminUser`
6. **区域相关类型**: `Province`, `School`, `RegionChangeRequest`
7. **系统相关类型**: `SystemSettings`, `StudentRegistrationRequest`

### 类型引用格式
在API文档中，所有类型引用都应遵循以下格式：
```typescript
// 引用统一类型定义
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 使用统一类型
type ExamListResponse = ApiResponse<Exam[]>;
type StudentExamResponse = ApiResponse<StudentExam>;
```

## Token认证机制详解

### 什么是Token？
**Token**（令牌）是一种用于身份验证和授权的字符串，在GalPHOS系统中使用JWT（JSON Web Token）格式。

### Token的作用
1. **身份验证**: 验证用户身份，确保请求来自已登录的合法用户
2. **权限控制**: 区分不同角色（管理员、教练、学生、阅卷员）的访问权限
3. **会话管理**: 维持用户登录状态，避免频繁输入用户名密码
4. **安全性**: 防止未授权访问和CSRF攻击

### Token获取流程
```
1. 用户通过登录接口提供用户名和密码
2. 服务器验证用户信息
3. 验证成功后，服务器生成JWT Token并返回
4. 前端存储Token（通常在localStorage中）
5. 后续请求在请求头中携带Token
```

### Token格式
```
JWT Token格式: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

组成部分:
- Header: 算法和类型信息
- Payload: 用户信息和权限
- Signature: 签名验证
```

### Token有效期
- **默认有效期**: 24小时
- **刷新机制**: Token过期后需要重新登录
- **安全考虑**: 有效期不宜过长，避免安全风险

---

## 统一API文档格式

### 1. 文档结构
```markdown
# [模块名] API接口文档

## 概述
简要说明该模块的功能和用途

## 基础信息
### API基础URL
### 认证方式  
### Token说明
### 统一请求头
### 统一响应格式

## [模块编号]. [模块名称]模块
### [接口编号]. [接口名称]
```

### 2. 接口格式规范

#### 接口标题格式
```markdown
### X.X 接口名称
**接口**: `HTTP方法 /路径`
**描述**: 接口功能说明
```

#### 请求参数格式
```markdown
**请求头**: (如果有特殊要求)
**路径参数**: (如果有)
**查询参数**: (如果有)  
**请求体**: (如果有)
```

#### 响应格式
```markdown
**响应**:
```typescript
{
  success: boolean,
  data?: T,
  message?: string
}
```

### 3. 请求头标准

#### 基础请求头
```typescript
{
  "Content-Type": "application/json"
}
```

#### 需要认证的请求头
```typescript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

#### 文件上传请求头
```typescript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

### 4. 响应格式标准

#### 成功响应
```typescript
{
  success: true,
  data: {
    // 具体数据内容
  },
  message?: "操作成功"
}
```

#### 错误响应
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

### 5. 常见HTTP状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权（Token无效/过期） |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 500 | Internal Server Error | 服务器错误 |

---

## Content-Type说明

### 为什么需要Content-Type？
1. **告知服务器请求数据格式**: 让服务器知道如何解析请求体
2. **确保正确解析**: 避免数据解析错误
3. **API规范性**: 统一接口规范，便于维护

### 常用Content-Type类型

#### application/json
- **用途**: 发送JSON格式数据
- **适用场景**: 大部分API请求
- **示例**:
```typescript
{
  "Content-Type": "application/json"
}
```

#### multipart/form-data  
- **用途**: 文件上传
- **适用场景**: 上传图片、文档等文件
- **示例**:
```typescript
{
  "Content-Type": "multipart/form-data"
}
```

#### application/x-www-form-urlencoded
- **用途**: 表单数据提交
- **适用场景**: 简单表单提交
- **示例**:
```typescript
{
  "Content-Type": "application/x-www-form-urlencoded"
}
```

---

## 安全性最佳实践

### 1. Token安全
- 不在URL中传递Token
- 使用HTTPS传输
- 定期刷新Token
- 及时清除过期Token

### 2. 密码安全
- 前端哈希化后传输
- 不在客户端存储明文密码
- 使用强密码策略

### 3. 权限控制
- 严格验证用户权限
- 最小权限原则
- 及时撤销权限

### 4. 数据验证
- 严格验证输入参数
- 防止SQL注入
- 防止XSS攻击

---

## 系统配置简化说明 (v1.3.0)

### 简化原则
为了提高系统的可维护性和用户体验，系统配置已进行大幅简化：

#### 保留功能
1. **维护模式控制**：
   - 维护模式开关 (`maintenanceMode`)
   - 维护消息设置 (`maintenanceMessage`)
   
2. **系统公告管理**：
   - 公告列表 (`systemAnnouncements`)
   - 公告显示开关 (`announcementEnabled`)
   - 自动轮播功能

3. **系统信息展示**：
   - 系统名称、版本、构建时间（硬编码）
   - 技术架构信息（硬编码）
   - 系统特性列表（硬编码）

#### 移除功能
- 复杂的文件上传配置
- 考试时长等业务配置
- 用户注册开关等权限配置
- 自动阅卷等功能开关

#### 设计理念
- **简化优先**：只保留核心的维护和公告功能
- **硬编码信息**：系统技术信息直接在代码中维护
- **用户友好**：维护模式时提供清晰的用户反馈
- **管理便捷**：公告管理支持增删改和轮播显示

### 新增组件
1. **SystemSettingsSimplified**：简化的系统配置管理界面
2. **SystemAnnouncementCarousel**：系统公告轮播组件
