# GalPHOS 微服务路由架构文档

## 概述

基于 `docs/README.md` 中的微服务架构设计，前端实现了智能的 API 路由分发系统，将请求自动路由到对应的微服务实例。

## 微服务架构映射

### 端口分配

| 端口 | 服务名称 | 服务标识 | 职责描述 |
|------|----------|----------|----------|
| 3001 | User Authentication Service | `auth` | 用户认证与授权服务 |
| 3002 | User Management Service | `userManagement` | 用户生命周期管理服务 |
| 3003 | Exam Management Service | `examManagement` | 考试完整生命周期管理服务 |
| 3004 | Submission Service | `submission` | 答题卡提交和管理服务 |
| 3005 | Grading Service | `grading` | 阅卷任务分配和过程管理服务 |
| 3006 | Score Statistics Service | `scoreStatistics` | 成绩数据分析和排名计算服务 |
| 3007 | Region Management Service | `regionManagement` | 省份学校等地理信息管理服务 |
| 3008 | File Storage Service | `fileStorage` | 文件上传存储和访问管理服务 |
| 3009 | System Configuration Service | `systemConfig` | 系统全局配置管理服务 |

## API 路径分配策略

### 1. 用户认证服务 (localhost:3001)
```
/api/auth/login
/api/auth/register
/api/auth/validate
/api/auth/logout
/api/auth/admin-login
```
- 用户登录注册
- Token验证与管理
- 管理员认证

### 2. 用户管理服务 (localhost:3002)
```
/api/admin/users/*
/api/admin/coach-students*
/api/admin/student-registrations*
/api/admin/profile*
/api/student/profile*
/api/student/password*
/api/student/region-change*
/api/coach/profile*
/api/coach/students*
/api/grader/profile*
/api/grader/change-password*
```
- 用户CRUD操作
- 个人资料管理（所有角色）
- 教练学生关系管理
- 学生注册审核

### 3. 考试管理服务 (localhost:3003)
```
/api/admin/exams*
/api/admin/questions*
/api/student/exams（查看，不包含提交）
/api/student/exams/*/score
/api/student/exams/*/ranking
/api/coach/exams*
/api/grader/exams*
```
- 考试创建、发布、管理
- 题目配置管理
- 考试状态控制
- 考试信息查看

### 4. 答题提交服务 (localhost:3004)
```
/api/student/exams/*/submit*
/api/student/exams/*/submission*
/api/coach/exams/*/submissions*
/api/coach/exams/*/upload-answer*
/api/grader/submissions*
```
- 学生答题卡提交
- 教练代理提交
- 提交状态管理
- 提交记录查看

### 5. 阅卷管理服务 (localhost:3005)
```
/api/grader/tasks*
/api/admin/grading*
/api/admin/graders*
```
- 阅卷任务分配
- 阅卷进度管理
- 阅卷员管理
- 阅卷流程控制

### 6. 成绩统计服务 (localhost:3006)
```
/api/student/scores*
/api/student/dashboard*
/api/coach/grades*
/api/coach/dashboard*
/api/admin/dashboard*
/api/grader/statistics*
/api/grader/history*
```
- 成绩计算与统计
- 排名生成
- 数据分析
- 仪表盘数据

### 7. 区域管理服务 (localhost:3007)
```
/api/admin/regions*
/api/regions/provinces-schools*
/api/regions*
```
- 省份学校管理
- 区域层级关系
- 地理信息维护

### 8. 文件存储服务 (localhost:3008)
```
/api/student/upload*
/api/student/files*
/api/coach/*/upload*
/api/coach/*/files*
/api/grader/files*
/api/grader/images*
/api/admin/*/upload*
/api/admin/exams/*/files*
/api/upload*
/api/download*
/api/files*
```
- 文件上传下载
- 文件权限控制
- 文件生命周期管理
- 头像、答题卡等各类文件

### 9. 系统配置服务 (localhost:3009)
```
/api/admin/system*
/api/config*
/api/system*
```
- 系统参数配置
- 功能开关管理
- 系统管理员管理

## 路由匹配算法

### 匹配优先级

1. **精确匹配** (优先级 4)：完全匹配路径
2. **路径参数匹配** (优先级 3)：支持 `{userId}` 等参数
3. **前缀匹配** (优先级 2)：路径前缀匹配
4. **通配符匹配** (优先级 1)：使用 `*` 的模式匹配

### 智能推断策略

当精确匹配失败时，系统会根据路径特征进行智能推断：

1. **按功能关键词**: 如 `auth`, `exam`, `score`, `upload` 等
2. **按角色前缀**: 如 `/api/student/`, `/api/coach/`, `/api/admin/`, `/api/grader/`
3. **按业务逻辑**: 不同角色的请求有不同的服务优先级

## 故障转移机制

### 服务依赖关系

```
auth ↔ userManagement
submission → examManagement → userManagement
submission → fileStorage → systemConfig
grading ↔ scoreStatistics
grading → userManagement
regionManagement → userManagement
systemConfig → auth
```

### 健康检查

- **检查间隔**: 30秒
- **检查路径**: `/health`
- **超时时间**: 5秒
- **故障判定**: HTTP 状态码非 200 或请求超时

## 使用示例

### 基本路由

```typescript
// 自动路由到认证服务 (localhost:3001)
const loginUrl = microserviceRouter.buildApiUrl('/api/auth/login');

// 自动路由到考试管理服务 (localhost:3003)
const examUrl = microserviceRouter.buildApiUrl('/api/student/exams/123');
```

### 带参数路由

```typescript
// 构建带路径参数的URL
const examSubmitUrl = microserviceRouter.buildApiUrlWithParams(
  '/api/student/exams/{examId}/submit',
  { examId: '123' },
  { timestamp: Date.now() }
);
```

### 服务状态监控

```typescript
// 获取所有服务状态
const servicesStatus = microserviceRouter.getServicesStatus();

// 获取特定服务信息
const serviceInfo = microserviceRouter.getMatchingServiceInfo('/api/student/exams');
```

## 环境配置

### 开发环境

```bash
# 启用微服务模式
REACT_APP_MICROSERVICE_MODE=true

# 各服务URL配置
REACT_APP_AUTH_SERVICE_URL=http://localhost:3001
REACT_APP_USER_MANAGEMENT_SERVICE_URL=http://localhost:3002
# ... 其他服务配置
```

### 生产环境

```bash
# 生产环境服务地址
REACT_APP_AUTH_SERVICE_URL=https://auth.galphos.com
REACT_APP_USER_MANAGEMENT_SERVICE_URL=https://user-mgmt.galphos.com
# ... 其他服务配置
```

## 监控和调试

### 日志记录

系统会记录以下关键信息：
- 路由匹配结果
- 服务健康状态变化
- 故障转移事件
- 服务推断过程

### 调试工具

```typescript
// 验证路径参数
const validation = microserviceRouter.validatePathParams(
  '/api/users/{userId}/exams/{examId}',
  { userId: '123', examId: '456' }
);

// 查看服务配置
const allConfigs = microserviceRouter.getAllServiceConfigs();
```

## 注意事项

1. **服务启动顺序**: 建议按依赖关系启动服务
2. **网络延迟**: 跨服务调用可能增加响应时间
3. **数据一致性**: 注意分布式环境下的数据一致性
4. **错误处理**: 做好服务不可用时的降级处理
5. **监控告警**: 设置服务健康监控和告警机制

## 版本信息

- **文档版本**: 1.0.0
- **架构版本**: 基于 docs/README.md 微服务设计
- **更新日期**: 2025年6月28日
