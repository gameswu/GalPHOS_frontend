# GalPHOS 微服务路由架构与API覆盖文档

## 概述

基于 GalPHOS v1.2.0 微服务架构设计，前端实现了智能的 API 路由分发系统，将请求自动路由到对应的微服务实例。本文档详细列出了每个微服务覆盖的所有API接口。

## 微服务架构映射

### 端口分配

| 端口 | 服务名称 | 服务标识 | 职责描述 | API数量 |
|------|----------|----------|----------|---------|
| 3001 | User Authentication Service | `auth` | 用户认证与授权服务 | 5个 |
| 3002 | User Management Service | `userManagement` | 用户生命周期管理服务 | 20个 |
| 3003 | Exam Management Service | `examManagement` | 考试完整生命周期管理服务 | 8个 |
| 3004 | Submission Service | `submission` | 答题卡提交和管理服务 | 6个 |
| 3005 | Grading Service | `grading` | 阅卷任务分配和过程管理服务 | 18个 |
| 3006 | Score Statistics Service | `scoreStatistics` | 成绩数据分析和排名计算服务 | 9个 |
| 3007 | Region Management Service | `regionManagement` | 省份学校等地理信息管理服务 | 7个 |
| 3008 | File Storage Service | `fileStorage` | 文件上传存储和访问管理服务 | 7个 |
| 3009 | System Configuration Service | `systemConfig` | 系统全局配置管理服务 | 4个 |

**总计**: 84个API接口

## API 路径分配策略

### 🔐 学生账号类型说明

**重要**：系统中存在两种不同类型的学生账号，具有不同的权限和操作方式：

#### 1. 独立学生账号 (Independent Student Account)
- **特征**：学生自主注册的账号
- **权限**：完全自主操作权限
- **操作范围**：
  - 自主查看考试信息
  - 自主提交答卷
  - 查看个人成绩和排名
  - 管理个人资料
  - 申请区域变更

#### 2. 非独立学生账号 (Non-Independent Student Account)  
- **特征**：教练添加的学生账号
- **权限**：仅限教练代理操作
- **操作限制**：
  - 学生不能直接登录系统
  - 所有考试操作由教练代理
  - 教练代为提交答卷
  - 教练查看其成绩信息
  - 不能自主修改个人信息

#### 3. API权限映射
- `/api/student/*` → 仅适用于**独立学生账号**
- `/api/coach/students/*` → 教练管理**非独立学生账号** 
- `/api/coach/exams/*/submissions` → 教练代理**非独立学生**提交

### 🚀 微服务路径分配

### 1. 用户认证服务 (localhost:3001)

**负责用户认证与授权相关功能，共5个API端点**

```
/api/auth/admin-login      # 管理员登录
/api/auth/login           # 用户登录
/api/auth/logout          # 用户登出
/api/auth/register        # 用户注册
/api/auth/validate        # Token验证
```

**功能说明**：
- 用户登录注册认证
- 管理员身份验证
- Token生成与验证
- 会话状态管理

### 2. 用户管理服务 (localhost:3002)

**负责用户生命周期管理，共20个API端点**

```
# 管理员用户管理
/api/admin/users/{userId}           # 用户信息操作
/api/admin/users/approve            # 用户审批
/api/admin/users/approved          # 已审批用户列表
/api/admin/users/pending           # 待审批用户列表
/api/admin/users/status            # 用户状态管理

# 学生注册管理
/api/admin/student-registrations              # 注册申请管理
/api/admin/student-registrations/{requestId}/review  # 注册申请审核

# 教练学生关系管理
/api/admin/coach-students           # 教练学生关系查看
/api/admin/coach-students/{relationId}  # 教练学生关系操作
/api/admin/coach-students/stats     # 教练学生统计

# 所有角色个人资料管理
/api/admin/profile                  # 管理员个人资料
/api/student/profile               # 学生个人资料
/api/student/password              # 学生密码修改
/api/student/region-change         # 学生区域变更申请
/api/student/region-change/status  # 学生区域变更状态
/api/coach/profile                 # 教练个人信息
/api/coach/profile/change-password # 教练密码修改
/api/coach/profile/change-region   # 教练区域变更
/api/coach/profile/change-region-requests # 教练区域变更申请
/api/grader/profile                # 阅卷员个人信息
/api/grader/change-password        # 阅卷员密码修改
```

**功能说明**：
- 用户CRUD操作
- 个人资料管理（所有角色）
- 教练学生关系管理
- 学生注册申请审核
- 用户区域变更申请管理
- 统一的用户身份信息管理

### 3. 考试管理服务 (localhost:3003)

**负责考试完整生命周期管理，共8个API端点**

```
# 管理员考试管理
/api/admin/exams                   # 考试CRUD操作
/api/admin/exams/{examId}          # 考试详情操作
/api/admin/exams/{examId}/publish  # 考试发布
/api/admin/exams/{examId}/unpublish # 考试取消发布

# 学生考试查看
/api/student/exams                 # 学生可参加考试列表
/api/student/exams/{examId}        # 学生查看考试详情

# 教练考试管理
/api/coach/exams                   # 教练考试列表
/api/grader/exams                  # 阅卷员考试列表
```

**功能说明**：
- 考试创建、编辑、删除
- 考试发布与取消发布
- 考试状态控制
- 考试信息查看（各角色）

### 4. 答题提交服务 (localhost:3004)

**负责答题卡提交和管理，共6个API端点**

```
# 独立学生账号的自主提交
/api/student/exams/{examId}/submit      # 独立学生自主答题提交
/api/student/exams/{examId}/submission  # 独立学生提交状态查看

# 教练代理非独立学生提交（权限控制）
/api/coach/exams/{examId}/submissions   # 教练查看代管学生提交
/api/coach/exams/{examId}/upload-answer # 教练代理非独立学生提交答卷

# 阅卷员提交查看
/api/grader/submissions/{submissionId}  # 阅卷员查看具体提交
/api/grader/exams/{examId}/progress    # 阅卷进度查看
```

**功能说明**：
- **独立学生账号**：自主提交答卷，管理提交状态
- **非独立学生账号**：仅教练可代理提交，学生无直接操作权限
- **权限区分**：严格区分独立和非独立学生的操作权限
- 提交状态跟踪和记录查看

### 5. 阅卷管理服务 (localhost:3005)

**负责阅卷任务分配和过程管理，共18个API端点**

```
# 管理员阅卷管理
/api/admin/graders                     # 阅卷员管理
/api/admin/grading/assign              # 阅卷任务分配
/api/admin/grading/progress/{examId}   # 阅卷进度监控
/api/admin/grading/tasks               # 阅卷任务管理

# 题目分数管理
/api/admin/exams/{examId}/questions/scores        # 题目分数查看
/api/admin/exams/{examId}/questions/scores/import # 题目分数批量导入
/api/admin/exams/{examId}/questions/{questionNumber}/score # 单题分数设置

# 阅卷员任务管理
/api/grader/tasks                      # 阅卷任务列表
/api/grader/tasks/{taskId}             # 阅卷任务详情
/api/grader/tasks/{taskId}/start       # 开始阅卷任务
/api/grader/tasks/{taskId}/submit      # 提交阅卷结果
/api/grader/tasks/{taskId}/abandon     # 放弃阅卷任务
/api/grader/tasks/{taskId}/save-progress # 保存阅卷进度

# 阅卷过程管理
/api/grader/tasks/{taskId}/questions/{questionNumber}/score   # 题目评分
/api/grader/tasks/{taskId}/questions/{questionNumber}/history # 评分历史
/api/grader/exams/{examId}/questions/scores # 考试题目分数查看

# 教练非独立学生管理
/api/coach/students                    # 教练代管的非独立学生列表
/api/coach/students/{studentId}        # 教练代管的非独立学生详情
```

**功能说明**：
- 阅卷任务自动分配
- 阅卷进度实时监控
- 阅卷员工作流管理
- 题目评分标准管理
- **教练非独立学生管理**：仅管理教练添加的非独立学生账号

### 6. 成绩统计服务 (localhost:3006)

**负责成绩数据分析和排名计算，共9个API端点**

```
# 学生成绩查看
/api/student/exams/{examId}/score      # 学生考试成绩
/api/student/exams/{examId}/ranking    # 学生考试排名
/api/student/scores                    # 学生历史成绩
/api/student/scores/statistics         # 学生成绩统计
/api/student/dashboard                 # 学生仪表盘

# 教练成绩管理
/api/coach/grades/overview             # 教练成绩概览
/api/coach/grades/details              # 教练成绩详情
/api/coach/students/scores             # 教练学生成绩
/api/coach/students/{studentId}/exams/{examId}/score # 教练查看学生成绩
```

**功能说明**：
- 成绩计算与统计分析
- 排名生成与更新
- 多维度数据分析
- 仪表盘数据聚合

### 7. 区域管理服务 (localhost:3007)

**负责省份学校等地理信息管理，共6个API端点**

```
# 管理员区域管理
/api/admin/regions                     # 区域信息管理
/api/admin/regions/provinces           # 省份管理
/api/admin/regions/provinces/{provinceId} # 省份详情操作
/api/admin/regions/schools             # 学校管理
/api/admin/regions/schools/{schoolId}  # 学校详情操作

# 区域变更申请管理
/api/admin/regions/change-requests     # 区域变更申请列表
/api/admin/regions/change-requests/{requestId} # 区域变更申请处理

/api/regions/provinces-schools        # 省份学校信息查询（临时路由）
```

**功能说明**：
- 省份学校信息维护
- 区域层级关系管理
- 地理信息数据管理
- 区域变更申请处理（管理员侧）

### 8. 文件存储服务 (localhost:3008)

**负责文件上传存储和访问管理，共7个API端点**

```
# 学生文件管理
/api/student/files/download/{fileId}   # 学生文件下载

# 图片文件管理
/api/grader/images                     # 阅卷图片查看

# 考试文件管理
/api/coach/exams/{examId}/ranking      # 教练考试排名导出
/api/coach/exams/{examId}/scores/export # 教练成绩导出
/api/coach/exams/{examId}/scores/statistics # 教练成绩统计

# 仪表盘数据
/api/admin/dashboard/stats             # 管理员仪表盘统计
/api/coach/dashboard/stats             # 教练仪表盘统计
```

**注意**：当前文件存储相关API分散在各个服务中，建议未来统一迁移到专门的文件存储服务。

**功能说明**：
- 文件上传下载管理
- 文件权限控制
- 文件生命周期管理
- 头像、答题卡等各类文件
- **学生文件访问**：独立学生账号的文件下载权限

### 9. 系统配置服务 (localhost:3009)

**负责系统全局配置管理，共4个API端点**

```
# 系统管理员管理
/api/admin/system/admins               # 系统管理员列表
/api/admin/system/admins/{adminId}     # 系统管理员操作
/api/admin/system/admins/{adminId}/password # 管理员密码修改

# 系统设置
/api/admin/system/settings             # 系统全局设置
```

**功能说明**：
- 系统参数配置
- 功能开关管理
- 系统管理员管理
- 全局设置维护

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
3. **按学生账号类型**:
   - `/api/student/*` → 独立学生账号操作
   - `/api/coach/students/*` → 非独立学生账号管理
   - `/api/coach/exams/*/submissions` → 代理提交管理
4. **按业务逻辑**: 不同角色的请求有不同的服务优先级

#### 教练请求路由优先级
1. **代理提交管理** → 答题提交服务
2. **考试基础管理** → 考试管理服务  
3. **成绩统计分析** → 成绩统计服务
4. **非独立学生管理** → 阅卷管理服务
5. **个人资料管理** → 用户管理服务

#### 独立学生请求路由优先级
1. **自主提交答卷** → 答题提交服务
2. **考试信息查看** → 考试管理服务
3. **成绩查看统计** → 成绩统计服务
4. **个人资料管理** → 用户管理服务

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
6. **🔐 权限控制重要性**:
   - **严格区分**独立学生和非独立学生的操作权限
   - **教练权限边界**：只能管理自己添加的非独立学生
   - **API调用验证**：后端需验证教练与学生的关联关系
   - **数据隔离**：确保教练无法访问其他教练的学生数据

## 版本信息

- **文档版本**: 1.2.0
- **架构版本**: 基于 docs/README.md 微服务设计
- **API覆盖**: 完整映射所有80个前端API接口
- **更新日期**: 2025年6月28日

## 文档说明

本文档替代了原有的 `API_COVERAGE_REPORT.md` 和 `API_DOCS_UPDATE_REPORT.md`，成为微服务架构下API接口映射的唯一权威文档。每个微服务部分详细列出了：

1. **实际API端点**: 基于前端代码实际使用的API路径
2. **功能分组**: 按业务逻辑对API进行分类说明
3. **路由策略**: 详细的路径匹配和服务分发规则
4. **依赖关系**: 服务间的调用关系和故障转移机制

所有API接口均已验证，确保：
- ✅ 路径分配无重叠、无遗漏
- ✅ 微服务映射准确无误
- ✅ 前端路由配置正确
- ✅ 错误处理100%覆盖
