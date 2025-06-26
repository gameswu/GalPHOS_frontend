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
│   └── utils/                  # 工具函数
│       ├── apiClient.ts        # API 客户端
│       └── passwordHasher.ts   # 密码哈希工具
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

## 🧪 测试账户

系统预置了以下测试账户供开发和演示使用：

### 管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- **访问地址**: `/admin-login`

### 普通用户账户
| 角色 | 用户名 | 密码 | 所属机构 |
|------|--------|------|----------|
| 教练 | `coach001` | `123456` | 北京市 - 清华大学 |
| 学生 | `student001` | `123456` | 上海市 - 复旦大学 |
| 学生 | `student002` | `123456` | 广东省 - 中山大学 |
| 阅卷者 | `grader001` | `123456` | 无地区限制 |

## 🛠️ 开发指南

### 技术栈
- **前端框架**: React 19 + TypeScript 4.9
- **UI 组件库**: Ant Design 5.26
- **路由管理**: React Router DOM 7.6
- **状态管理**: React Hooks + LocalStorage
- **构建工具**: Create React App 5.0
- **样式方案**: CSS + Ant Design 主题系统
- **加密工具**: crypto-js 4.2

### 项目架构设计

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
│   ├── hooks/          # 业务逻辑钩子
│   └── types/          # 类型定义
├── Coach/              # 教练模块
├── Grader/             # 阅卷者模块
└── Student/            # 学生模块
```

#### 组件设计原则
- **容器组件**: 负责数据逻辑和状态管理 (`index.tsx`)
- **展示组件**: 负责 UI 渲染和用户交互 (`*UI.tsx`, `components/`)
- **Hook 复用**: 抽取业务逻辑到自定义 Hook (`hooks/`)
- **配置分离**: 菜单、路由等配置独立管理 (`config/`)
- **类型安全**: 完整的 TypeScript 类型定义 (`types/`)

#### 数据流设计
```
LocalStorage ↔ Custom Hooks ↔ Container Components ↔ UI Components
```

#### API 模块组织
```
src/api/
├── apiClient.ts        # 统一的 HTTP 客户端
├── auth.ts             # 认证相关 API
├── admin.ts            # 管理员 API
├── coach.ts            # 教练 API
├── student.ts          # 学生 API
└── grader.ts           # 阅卷者 API
```

### 开发规范

#### 文件命名约定
- **组件文件**: PascalCase (如 `LoginUI.tsx`, `AdminContent.tsx`)
- **Hook 文件**: camelCase (如 `useAdminLogic.ts`, `useStudentLogic.ts`)
- **配置文件**: camelCase (如 `menuConfig.tsx`, `tableConfig.tsx`)
- **类型文件**: camelCase (如 `examTypes.ts`, `userTypes.ts`)
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

### 测试策略

#### 单元测试
```bash
# 运行测试
npm test

# 覆盖率测试
npm run test -- --coverage
```

#### 组件测试示例
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginUI } from './LoginUI';

describe('LoginUI Component', () => {
  test('renders login form', () => {
    render(<LoginUI onLogin={jest.fn()} />);
    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
  });
});
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

#### 选项 4: IIS 部署 (Windows 专用)
- **适用**: Windows Server 环境
- **特性**: 
  - 🏢 企业级部署
  - 🔄 URL 重写支持
  - 🗜️ 静态文件压缩
  - 🔒 集成 Windows 认证

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

### 服务器配置要求

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/galphos/build;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

#### Apache 配置示例
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/galphos/build
    
    # SPA 路由支持
    <Directory /var/www/galphos/build>
        Options -Indexes
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 常见问题解决

#### Q1: 构建失败 "npm run build"

**可能原因**:
- Node.js 版本过低
- 依赖安装不完整
- 内存不足

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 增加内存限制 (Windows)
set NODE_OPTIONS=--max_old_space_size=4096 && npm run build

# 增加内存限制 (Linux/macOS)
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

#### Q2: Docker 构建失败

**解决方案**:
```bash
# 检查 Docker 状态
docker --version
docker ps

# 清理 Docker 缓存
docker system prune -f

# 重新构建
docker build --no-cache -t galphos-frontend .
```

#### Q3: 页面显示空白

**可能原因**:
- 路由配置错误
- 静态资源路径问题
- 服务器不支持 SPA 路由

**解决方案**:
1. 检查服务器是否配置了 SPA 路由重写
2. 确认 `package.json` 中的 `homepage` 配置
3. 检查浏览器控制台错误信息

#### Q4: 端口被占用

**解决方案**:
```bash
# 查看端口占用 (Linux/macOS)
lsof -i :3000
sudo kill -9 <PID>

# 查看端口占用 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 性能优化建议

1. **启用 Gzip 压缩**
2. **配置静态资源缓存**
3. **使用 CDN 加速**
4. **启用 HTTP/2**
5. **配置 Service Worker (PWA)**

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

#### 3. 开发工具配置

**VS Code 推荐扩展**:
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

**VS Code 配置** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## ❓ 常见问题

### Q1: 无法登录测试账户？
**A**: 请检查浏览器控制台错误信息，确认：
1. API 服务是否正常运行
2. 网络连接是否正常
3. 浏览器是否支持 LocalStorage
4. 清除浏览器缓存后重试

### Q2: 页面样式异常？
**A**: 确认以下几点：
1. Ant Design 样式是否正确加载
2. 检查 CSS 文件是否有冲突
3. 确认浏览器兼容性
4. 尝试强制刷新页面 (Ctrl+F5)

### Q3: 路由跳转失败？
**A**: 检查以下内容：
1. 路由配置是否正确
2. 权限验证逻辑是否有误
3. 浏览器是否支持 History API
4. 服务器是否配置了 SPA 路由重写

### Q4: 构建速度很慢？
**A**: 尝试以下优化方案：
```bash
# 清理缓存
npm cache clean --force

# 增加内存限制
export NODE_OPTIONS=--max_old_space_size=4096

# 使用 npm ci 代替 npm install (CI 环境)
npm ci
```

### Q5: 开发环境热重载不工作？
**A**: 检查以下配置：
1. 确认 `react-scripts` 版本
2. 检查文件监听限制 (Linux 系统)
3. 关闭防病毒软件的实时扫描
4. 重启开发服务器

### Q6: TypeScript 编译错误？
**A**: 常见解决方案：
```bash
# 检查 TypeScript 版本兼容性
npm ls typescript

# 重新生成类型声明
npm run build

# 清理类型缓存
rm -rf node_modules/@types
npm install
```

## 📈 更新日志

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

## 🔗 相关链接

- **项目仓库**: [GitHub Repository](<repository-url>)
- **在线演示**: [Demo Site](<demo-url>)
- **API 文档**: [API Documentation](docs/)
- **问题反馈**: [Issues](<issues-url>)
- **更新通知**: [Releases](<releases-url>)

---

<div align="center">

**GalPHOS Frontend** © 2024

Made with ❤️ by [Development Team]

[⬆ 回到顶部](#galphos-前端系统)

</div>