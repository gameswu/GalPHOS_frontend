# GalPHOS 前端系统

GalPHOS (Galaxy Physics Online System) 是一个基于 React、TypeScript 和 Ant Design 构建的物理竞赛管理系统前端应用。该系统支持多角色用户管理，包括管理员、教练、学生和阅卷者。

## 📋 项目信息

- **框架**: React 19 + TypeScript
- **UI库**: Ant Design 5.x
- **路由**: React Router DOM 7.x
- **构建工具**: Create React App 5.x
- **样式方案**: CSS + Ant Design
- **状态管理**: React Hooks + LocalStorage

## 🏗️ 项目结构

```
GalPHOS_frontend/
├── public/
│   └── index.html              # HTML 模板文件
├── src/
│   ├── App.tsx                 # 主应用组件，包含路由配置
│   ├── App.css                 # 全局样式文件
│   ├── index.tsx               # 应用入口文件
│   ├── api/                    # API 接口模块
│   │   ├── admin.ts            # 管理员 API
│   │   ├── auth.ts             # 认证 API
│   │   ├── coach.ts            # 教练 API
│   │   ├── grader.ts           # 阅卷者 API
│   │   └── student.ts          # 学生 API
│   ├── components/             # 通用组件
│   │   ├── CurrentExamPage.tsx # 当前考试页面
│   │   ├── HistoryExamPage.tsx # 历史考试页面
│   │   ├── ProtectedRoute.tsx  # 路由守卫组件
│   │   └── UserSettings/       # 用户设置组件
│   ├── pages/                  # 页面组件
│   │   ├── Login/              # 普通用户登录模块
│   │   ├── AdminLogin/         # 管理员登录模块
│   │   ├── Admin/              # 管理员后台模块
│   │   ├── Coach/              # 教练模块
│   │   ├── Grader/             # 阅卷者模块
│   │   └── Student/            # 学生模块
│   ├── types/                  # 类型定义
│   │   └── common.ts           # 统一类型定义文件
│   └── utils/                  # 工具函数
│       ├── apiClient.ts        # API 客户端
│       └── passwordHasher.ts   # 密码哈希工具
├── docs/                       # 项目文档
│   ├── API_TYPES_REFERENCE.md  # API 类型参考
│   ├── TYPE_MIGRATION_GUIDE.md # 类型迁移指南
│   └── *.md                    # 其他文档文件
├── build/                      # 构建输出目录
├── deploy.sh                   # Linux/macOS 部署脚本
├── deploy.bat                  # Windows 部署脚本
├── package.json                # 项目配置文件
├── tsconfig.json              # TypeScript 配置文件
└── README.md                  # 项目文档
```

## ✨ 功能特性

### 🔐 多角色认证系统
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

### 📱 用户体验
- 直观的操作界面
- 实时数据更新
- 离线状态检测
- 完善的错误处理机制

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
- **状态管理**: React Hooks + LocalStorage
- **构建工具**: Create React App 5.0
- **样式方案**: CSS + Ant Design 主题系统
- **加密工具**: crypto-js 4.2
- **类型系统**: 统一类型定义 (`src/types/common.ts`)

### 项目架构设计

#### 统一类型系统
```
src/types/common.ts             # 统一类型定义文件
├── 考试相关类型                 # Exam, StudentExam, GraderExam
├── 题目和答案类型               # Question, ExamAnswer, ExamSubmission
├── 成绩和排名类型               # ExamScore, RankingInfo, QuestionScore
├── 阅卷相关类型                 # GradingTask, AdminGradingTask
├── 用户相关类型                 # IndependentStudent, CoachManagedStudent
├── 区域管理类型                 # Province, School, RegionChangeRequest
└── 系统管理类型                 # SystemSettings, AdminUser
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
统一类型系统 ↔ API 层 ↔ Custom Hooks ↔ Container Components ↔ UI Components
```

#### API 模块组织
```
src/api/
├── apiClient.ts        # 统一的 HTTP 客户端
├── auth.ts             # 认证相关 API
├── admin.ts            # 管理员 API (引用统一类型)
├── coach.ts            # 教练 API (引用统一类型)
├── student.ts          # 学生 API (引用统一类型)
└── grader.ts           # 阅卷者 API (引用统一类型)
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

#### 请求格式
```typescript
// 统一的请求接口
interface ApiRequest<T = any> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  params?: Record<string, any>;
}

// 统一的响应格式
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}
```

#### 错误处理
```typescript
// 统一的错误处理
export const handleApiError = (error: any) => {
  if (error.response) {
    // HTTP 错误
    message.error(`请求失败: ${error.response.data.message}`);
  } else if (error.request) {
    // 网络错误
    message.error('网络连接失败，请检查网络设置');
  } else {
    // 其他错误
    message.error('操作失败，请稍后重试');
  }
};
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

## 📈 更新日志

### v1.1.0 (2025-06-26)
#### 🏗️ 架构重构
- **统一类型系统**: 完成全项目类型定义重构，建立 `src/types/common.ts` 统一类型管理
- **数据模型简化**: 删除年级、邮件和题目类型等冗余字段，专注核心业务功能
- **API 层优化**: 所有 API 接口统一使用集中类型定义，提升类型安全性
- **组件架构优化**: hooks、组件、页面全部切换为统一类型系统

#### 📚 文档完善
- 新增 `docs/API_TYPES_REFERENCE.md` 统一类型定义参考文档
- 新增 `docs/TYPE_MIGRATION_GUIDE.md` 类型迁移指南
- 完善 API 文档，所有接口引用统一类型定义
- 更新开发指南，反映最新架构设计

#### 🔧 技术改进
- 消除重复类型定义，删除各模块独立类型文件
- 优化项目结构，增强代码可维护性
- 完善 TypeScript 严格类型检查
- 提升开发体验和代码质量

### v1.0.0 (2024-06-25)
#### ✨ 新功能
- 完成多角色用户认证系统
- 实现管理员后台管理功能
- 完成教练、学生、阅卷者功能模块
- 添加用户设置和权限管理
- 实现考试管理和成绩系统

#### 🎨 界面优化
- 基于 Ant Design 5.x 的现代化界面
- 响应式布局适配各种设备
- 深色/浅色主题切换支持
- 优化用户交互体验

#### 🛡️ 安全增强
- JWT 身份验证机制
- 角色权限精细化控制
- 密码加密存储
- 路由守卫保护

#### 🐛 问题修复
- 修复登录认证偶发性失败
- 解决路由跳转权限验证问题
- 修复表格数据加载异常
- 优化移动端显示效果

#### 🔧 技术改进
- 升级到 React 19
- 优化构建性能和包大小
- 完善 TypeScript 类型定义
- 添加自动化部署脚本

## 📄 许可证

本项目采用 **MIT 许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">

**GalPHOS Frontend** © 2025

Made with ❤️ by [gameswu](https://github.com/gameswu)

[⬆ 回到顶部](#galphos-前端系统)

</div>