# GalPHOS 前端系统

GalPHOS (Galaxy Physics Online System) 是一个基于 React、TypeScript 和 Ant Design 构建的物理竞赛管理系统前端应用。该系统支持多角色用户管理，包括管理员、教练、学生和阅卷者。

## 📋 项目信息

- **当前版本**: v1.2.0
- **框架**: React 19 + TypeScript
- **UI库**: Ant Design 5.x
- **路由**: React Router DOM 7.x
- **构建工具**: Create React App 5.x
- **样式方案**: CSS + Ant Design
- **架构**: 微服务自动路由 + 全局错误通知系统

## 🏗️ 项目结构

```
GalPHOS_frontend/
├── public/
│   └── index.html              # HTML 模板文件
├── src/
│   ├── App.tsx                 # 主应用组件，包含路由配置
│   ├── App.css                 # 全局样式文件
│   ├── index.tsx               # 应用入口文件
│   ├── api/           ## 🏷️ 项目版本

**当前版本**: v1.2.0

### 主要特性
- ✅ **微服务自动路由**: 智能API分发和服务发现
- ✅ **全局错误通知**: 100% API错误覆盖的用户友好提示
- ✅ **健康检查机制**: 实时服务状态监控和故障转移
- ✅ **类型安全保障**: 完整的TypeScript类型定义和编译检查
- ✅ **统一架构规范**: 清晰的代码组织和模块划分

查看详细的更新历史和版本信息，请参考：
- [更新日志](./docs/CHANGELOG.md)
- [微服务路由文档](./docs/MICROSERVICE_ROUTING.md)
- [API错误通知覆盖报告](./docs/API_ERROR_NOTIFICATION_COVERAGE.md)   # API 接口模块
│   │   ├── admin.ts            # 管理员 API
│   │   ├── auth.ts             # 认证 API
│   │   ├── coach.ts            # 教练 API
│   │   ├── grader.ts           # 阅卷者 API
│   │   └── student.ts          # 学生 API
│   ├── components/             # 通用组件
│   │   ├── CurrentExamPage.tsx # 当前考试页面
│   │   ├── HistoryExamPage.tsx # 历史考试页面
│   │   ├── ProtectedRoute.tsx  # 路由守卫组件
│   │   ├── NotificationContainer/ # 全局错误通知组件
│   │   └── UserSettings/       # 用户设置组件
│   ├── contexts/               # React Context
│   │   └── NotificationContext.tsx # 全局通知状态管理
│   ├── services/               # 业务服务层
│   │   └── microserviceRouter.ts # 微服务自动路由
│   ├── types/                  # 类型定义
│   │   ├── api.ts              # API 相关类型定义
│   │   └── common.ts           # 通用类型定义
│   ├── pages/                  # 页面组件
│   │   ├── Login/              # 普通用户登录模块
│   │   ├── AdminLogin/         # 管理员登录模块
│   │   ├── Admin/              # 管理员后台模块
│   │   ├── Coach/              # 教练模块
│   │   ├── Grader/             # 阅卷者模块
│   │   └── Student/            # 学生模块
│   └── utils/                  # 工具函数
│       ├── apiClient.ts        # API 客户端
│       └── passwordHasher.ts   # 密码哈希工具
├── docs/                       # 项目文档
│   ├── API_ERROR_NOTIFICATION_COVERAGE.md # API错误通知覆盖报告
│   ├── MICROSERVICE_ROUTING.md # 微服务路由架构文档
│   ├── CHANGELOG.md            # 项目更新日志
│   └── *.md                    # 其他文档文件
├── build/                      # 构建输出目录
├── deploy.sh                   # Linux/macOS 部署脚本
├── deploy.bat                  # Windows 部署脚本
├── package.json                # 项目配置文件
├── tsconfig.json              # TypeScript 配置文件
└── README.md                  # 项目文档
```

## ✨ 功能特性

### 🏗️ 微服务架构系统
- **自动路由分发**: 智能API路由，支持多微服务架构
- **健康检查**: 实时服务状态监控和健康检查
- **故障转移**: 自动故障切换和服务发现机制
- **负载均衡**: 支持多服务实例的负载均衡

### � 全局错误通知系统
- **右上角气泡通知**: 优雅的错误提示界面
- **API错误100%覆盖**: 所有API调用失败自动显示通知
- **统一错误处理**: 集中化错误处理和用户反馈
- **智能错误分类**: 网络错误、业务错误、系统错误分类处理

### �🔐 多角色认证系统
- **管理员**: 用户审核、系统管理、地区管理、考试管理
- **教练**: 学生管理、考试组织、历史试题查看
- **学生**: 参加考试、查看历史试题、成绩查询
- **阅卷者**: 试卷批改、成绩录入、评分管理

### 🎨 现代化界面设计
- 基于 Ant Design 5.x 组件库
- 响应式布局设计
- 深色/浅色主题切换
- 优雅的动画效果和交互体验

### 🛡️ 安全特性
- JWT 身份验证
- 角色权限控制
- 路由守卫保护
- 密码加密存储
- API请求安全验证

### 📱 用户体验
- 直观的操作界面
- 实时数据更新
- 离线状态检测
- 完善的错误处理机制
- 智能错误重试策略

## 🚀 快速开始

### 环境要求
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd GalPHOS_frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```

4. **访问应用**
   打开浏览器访问 `http://localhost:3000`

### 一键部署

#### Linux/macOS 系统
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Windows 系统
```cmd
deploy.bat
```

## 🛠️ 开发指南

### 技术栈
- **前端框架**: React 19 + TypeScript 4.9
- **UI 组件库**: Ant Design 5.26
- **路由管理**: React Router DOM 7.6
- **架构模式**: 微服务自动路由 + 全局错误通知
- **构建工具**: Create React App 5.0
- **样式方案**: CSS + Ant Design 主题系统
- **加密工具**: crypto-js 4.2
- **类型系统**: 统一类型定义 (`src/types/common.ts` + `src/types/api.ts`)
- **服务架构**: MicroserviceRouter 自动路由分发

### 项目架构设计

### 项目架构设计

#### 微服务自动路由架构
```
API调用 → MicroserviceRouter → 服务发现 → 健康检查 → 负载均衡 → 目标微服务
                ↓
         故障检测 → 自动重试 → 故障转移 → 错误通知
```

#### 全局错误通知系统
```
API调用失败 → BaseAPI.handleApiError → NotificationContext → NotificationContainer → 用户界面气泡
```

#### 统一类型系统
```
src/types/
├── common.ts               # 通用业务类型定义
│   ├── 考试相关类型         # Exam, StudentExam, GraderExam
│   ├── 题目和答案类型       # Question, ExamAnswer, ExamSubmission
│   ├── 成绩和排名类型       # ExamScore, RankingInfo, QuestionScore
│   ├── 阅卷相关类型         # GradingTask, AdminGradingTask
│   ├── 用户相关类型         # IndependentStudent, CoachManagedStudent
│   ├── 区域管理类型         # Province, School, RegionChangeRequest
│   └── 系统管理类型         # SystemSettings, AdminUser
└── api.ts                  # API相关类型定义
    ├── 微服务配置类型       # MicroserviceConfig, ServiceHealth
    ├── API响应类型          # ApiResponse, ApiError
    └── 基础API类           # BaseAPI, RequestConfig
```

#### 页面组织结构
```
src/pages/
├── Login/              # 用户登录模块
│   ├── index.tsx       # 登录容器组件
│   └── LoginUI.tsx     # 登录展示组件
├── AdminLogin/         # 管理员登录模块
├── Admin/              # 管理员后台
│   ├── index.tsx       # 主界面容器
│   ├── components/     # 业务组件
│   ├── config/         # 配置文件
│   └── hooks/          # 业务逻辑钩子
├── Coach/              # 教练模块
├── Grader/             # 阅卷者模块
└── Student/            # 学生模块
```

#### 组件设计原则
- **容器组件**: 负责数据逻辑和状态管理 (`index.tsx`)
- **展示组件**: 负责 UI 渲染和用户交互 (`*UI.tsx`, `components/`)
- **Hook 复用**: 抽取业务逻辑到自定义 Hook (`hooks/`)
- **配置分离**: 菜单、路由等配置独立管理 (`config/`)
- **类型安全**: 统一的 TypeScript 类型定义 (`src/types/common.ts`)

#### 数据流设计
```
统一类型系统 ↔ MicroserviceRouter ↔ API 层 ↔ Custom Hooks ↔ Container Components ↔ UI Components
     ↑                    ↓
NotificationContext ← 错误处理 ← BaseAPI.handleApiError
```

#### API 模块组织
```
src/api/
├── auth.ts             # 认证相关 API (引用统一类型)
├── admin.ts            # 管理员 API (引用统一类型)
├── coach.ts            # 教练 API (引用统一类型)
├── student.ts          # 学生 API (引用统一类型)
└── grader.ts           # 阅卷者 API (引用统一类型)

src/services/
└── microserviceRouter.ts # 微服务自动路由和健康检查

src/utils/
└── apiClient.ts        # 统一的 HTTP 客户端

src/types/
├── api.ts              # API和微服务相关类型
└── common.ts           # 业务逻辑相关类型
```

#### 核心服务架构
```
MicroserviceRouter
├── 服务发现 (Service Discovery)
├── 健康检查 (Health Check)
├── 负载均衡 (Load Balancing)
├── 故障转移 (Failover)
└── 请求路由 (Request Routing)

NotificationSystem
├── 全局错误捕获
├── 用户友好提示
├── 错误分类处理
└── 自动重试机制
```

### 开发规范

#### 文件命名约定
- **组件文件**: PascalCase (如 `LoginUI.tsx`, `AdminContent.tsx`)
- **Hook 文件**: camelCase (如 `useAdminLogic.ts`, `useStudentLogic.ts`)
- **配置文件**: camelCase (如 `menuConfig.tsx`, `tableConfig.tsx`)
- **统一类型**: `src/types/common.ts` (集中管理所有类型定义)
- **工具文件**: camelCase (如 `apiClient.ts`, `passwordHasher.ts`)

#### 代码风格规范
- 使用 TypeScript 严格模式
- 优先使用函数组件和 Hooks
- 遵循 React 最佳实践
- 保持组件单一职责原则
- 使用 ES6+ 语法特性

#### 组件开发规范
```typescript
// 组件接口定义
interface ComponentProps {
  title: string;
  onAction: (data: any) => void;
}

// 函数组件定义
export const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  // 使用自定义 Hook
  const { data, loading, error } = useMyLogic();
  
  // 渲染逻辑
  return (
    <div>
      {/* JSX 内容 */}
    </div>
  );
};
```

### 状态管理策略

#### LocalStorage 数据结构
```typescript
// 用户认证信息
interface AuthState {
  token: string;
  userInfo: UserInfo;
  role: 'admin' | 'coach' | 'student' | 'grader';
}

// 系统配置信息
interface SystemConfig {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  region: string;
}
```

#### Hook 使用模式
```typescript
// 自定义业务逻辑 Hook
export const useAdminLogic = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  
  // 业务逻辑方法
  const handleAction = useCallback(() => {
    // 实现逻辑
  }, []);
  
  return { data, loading, handleAction };
};
```

### API 接口规范

#### 微服务路由配置
```typescript
// 微服务配置接口
interface MicroserviceConfig {
  auth: string[];        // 认证服务实例
  admin: string[];       // 管理服务实例
  student: string[];     // 学生服务实例
  grader: string[];      // 阅卷服务实例
  coach: string[];       // 教练服务实例
  upload: string[];      // 文件上传服务实例
  system: string[];      // 系统配置服务实例
}

// 服务健康状态
interface ServiceHealth {
  service: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: number;
  responseTime?: number;
}
```

#### 统一请求格式
```typescript
// 统一的请求接口
interface ApiRequest<T = any> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// 统一的响应格式
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}
```

#### 全局错误处理
```typescript
// BaseAPI 统一错误处理
export class BaseAPI {
  protected async handleApiError(error: any, context?: string): Promise<never> {
    const errorMessage = this.extractErrorMessage(error);
    
    // 自动显示错误通知
    this.notificationContext?.addNotification({
      type: 'error',
      message: errorMessage,
      duration: 5000
    });
    
    throw error;
  }
  
  // 智能错误重试
  protected async makeRequest<T>(config: RequestConfig): Promise<T> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(config);
      } catch (error) {
        if (attempt === maxRetries) {
          return this.handleApiError(error, config.url);
        }
        await this.delay(attempt * 1000); // 指数退避
      }
    }
  }
}
```

#### 微服务自动路由
```typescript
// 自动路由分发
class MicroserviceRouter {
  async routeRequest(path: string, options: RequestInit): Promise<Response> {
    const service = this.detectService(path);
    const healthyUrl = await this.getHealthyServiceUrl(service);
    
    if (!healthyUrl) {
      throw new Error(`服务 ${service} 当前不可用`);
    }
    
    return fetch(`${healthyUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
  
  private async getHealthyServiceUrl(service: string): Promise<string | null> {
    const urls = this.config[service] || [];
    
    for (const url of urls) {
      if (await this.isServiceHealthy(url)) {
        return url;
      }
    }
    
    return null;
  }
}
```

## 📦 部署指南

### 智能一键部署

项目提供了智能部署脚本，支持多种部署方式：

#### Linux/macOS 系统
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Windows 系统
```cmd
deploy.bat
```

### 部署脚本特性

✅ **智能依赖检查**: 检测到已存在的 `node_modules` 时跳过安装  
✅ **多种部署选项**: 支持 serve、Docker、IIS 等多种部署方式  
✅ **自动配置生成**: 自动创建 Dockerfile、nginx.conf、web.config  
✅ **错误处理**: 完善的错误检查和提示机制  
✅ **跨平台支持**: Linux、macOS、Windows 全平台支持  

### 部署选项详解

#### 选项 1: serve 快速启动 (推荐用于开发/测试)
- **端口**: 3000
- **特点**: 快速启动，适合开发测试
- **访问**: http://localhost:3000

#### 选项 2: 手动部署 (推荐用于自定义服务器)
- 构建完成后生成 `build` 目录
- 可配置任何 Web 服务器 (Apache、Nginx、IIS等)
- 支持 CDN 部署

#### 选项 3: Docker 部署 (推荐用于生产环境)
- **特性**: 
  - 🐳 容器化部署
  - 🔄 多阶段构建优化
  - 🗜️ Nginx 静态文件服务
  - 📦 生产环境优化
- **访问**: http://localhost:3000

### 手动构建

如果需要手动构建项目：

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建产物位于 build/ 目录
```

### 构建产物说明

执行 `npm run build` 后，会在 `build/` 目录生成以下文件：

```
build/
├── index.html              # 主页面文件
├── asset-manifest.json     # 资源清单文件
└── static/                 # 静态资源目录
    ├── css/               # CSS 样式文件
    │   ├── main.*.css
    │   └── main.*.css.map
    └── js/                # JavaScript 文件
        ├── main.*.js
        ├── main.*.js.LICENSE.txt
        └── main.*.js.map
```

### 环境变量配置

```bash
# 开发环境
REACT_APP_API_URL=http://localhost:8080
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development

# 生产环境
REACT_APP_API_URL=https://api.galphos.com
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
```

## 🤝 贡献指南

### 开发流程
1. **Fork 项目仓库**
2. **创建功能分支**: `git checkout -b feature/new-feature`
3. **提交更改**: `git commit -m 'feat: add new feature'`
4. **推送分支**: `git push origin feature/new-feature`
5. **提交 Pull Request**

### 代码提交规范 (Conventional Commits)
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**提交类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整 (不影响代码含义)
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动
- `ci`: CI/CD 相关变动

**示例**:
```bash
feat(auth): add password strength validation
fix(admin): resolve user deletion bug
docs(readme): update deployment instructions
style(components): format code with prettier
refactor(api): extract common request handler
test(login): add unit tests for login component
chore(deps): update dependencies to latest version
```

### 本地开发环境搭建

#### 1. 环境准备
```bash
# 检查 Node.js 版本 (需要 >= 16.0.0)
node --version

# 检查 npm 版本 (需要 >= 8.0.0)
npm --version
```

#### 2. 项目初始化
```bash
# 克隆项目
git clone <repository-url>
cd GalPHOS_frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

## � 项目版本

**当前版本**: v1.2.0

查看详细的更新历史和版本信息，请参考：
- [更新日志](./docs/CHANGELOG.md)

## 📄 许可证

本项目采用 **MIT 许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">

**GalPHOS Frontend** © 2025

Made with ❤️ by [gameswu](https://github.com/gameswu)

[⬆ 回到顶部](#galphos-前端系统)

</div>