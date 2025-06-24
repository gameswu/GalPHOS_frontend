# GalPHOS 前端系统

GalPHOS (Galaxy Physics Online System) 是一个基于 React、TypeScript 和 Ant Design 构建的物理竞赛管理系统前端应用。该系统支持多角色用户管理，包括管理员、教练、学生和阅卷者。

## 项目结构

```
GalPHOS_frontend/
├── public/
│   ├── index.html            # HTML 模板文件
│   ├── favicon.ico           # 网站图标
│   └── manifest.json         # PWA 配置文件
├── src/
│   ├── App.tsx               # 主应用组件，包含路由配置
│   ├── App.css               # 全局样式文件
│   ├── index.tsx             # 应用入口文件
│   └── pages/                # 页面组件目录
│       ├── Login/            # 普通用户登录模块
│       │   ├── index.tsx     # 登录业务逻辑
│       │   ├── LoginUI.tsx   # 登录界面组件
│       │   └── DebugPanel.tsx # 调试面板（开发环境）
│       ├── AdminLogin/       # 管理员登录模块
│       │   └── index.tsx     # 管理员登录页面
│       ├── Admin/            # 管理员后台模块
│       │   ├── index.tsx     # 管理员主界面
│       │   ├── hooks/        # 管理员业务逻辑钩子
│       │   │   └── useAdminLogic.ts
│       │   ├── config/       # 管理员配置文件
│       │   │   └── menuConfig.tsx
│       │   └── components/   # 管理员专用组件
│       │       └── AdminContent.tsx
│       └── Dashboard/        # 用户仪表板模块
│           ├── index.tsx     # 用户主界面
│           ├── hooks/        # 用户业务逻辑钩子
│           │   └── useDashboardLogic.ts
│           ├── config/       # 用户配置文件
│           │   └── menuConfig.tsx
│           └── components/   # 用户专用组件
│               └── DashboardContent.tsx
├── package.json              # npm 配置文件
├── tsconfig.json            # TypeScript 配置文件
└── README.md                # 项目文档
```

## 功能特性

### 🔐 多角色认证系统
- **管理员**：用户审核、系统管理
- **教练**：学生管理、考试组织、历史试题查看
- **学生**：参加考试、查看历史试题、成绩查询
- **阅卷者**：试卷批改、成绩录入

### 🎨 现代化界面设计
- 基于 Ant Design 组件库
- 响应式布局设计
- 深色/浅色主题切换
- 优雅的动画效果

### 🛡️ 安全特性
- JWT 身份验证
- 角色权限控制
- 路由守卫
- 数据加密存储

### 📱 用户体验
- 直观的操作界面
- 实时数据更新
- 离线状态检测
- 错误处理机制

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

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

## 测试账户

系统预置了以下测试账户供开发和演示使用：

### 管理员账户
- 用户名：`admin`
- 密码：`admin123`
- 访问地址：`/admin-login`

### 普通用户账户
| 角色 | 用户名 | 密码 | 所属机构 |
|------|--------|------|----------|
| 教练 | `coach001` | `123456` | 北京市 - 清华大学 |
| 学生 | `student001` | `123456` | 上海市 - 复旦大学 |
| 学生 | `student002` | `123456` | 广东省 - 中山大学 |
| 阅卷者 | `grader001` | `123456` | 无地区限制 |

## 开发指南

### 技术栈
- **前端框架**：React 18 + TypeScript
- **UI 组件库**：Ant Design 5.x
- **路由管理**：React Router DOM 6.x
- **状态管理**：React Hooks + LocalStorage
- **样式方案**：CSS-in-JS + 全局样式

### 项目架构

#### 页面组织
```
pages/
├── Login/           # 用户登录模块
├── AdminLogin/      # 管理员登录模块
├── Admin/           # 管理员后台
└── Dashboard/       # 用户仪表板
```

#### 组件设计原则
- **容器组件**：负责数据逻辑和状态管理
- **展示组件**：负责 UI 渲染和用户交互
- **Hook 复用**：抽取业务逻辑到自定义 Hook
- **配置分离**：菜单、路由等配置独立管理

#### 数据流
```
LocalStorage ← → Custom Hooks ← → Components ← → UI
```

### 开发规范

#### 文件命名
- 组件文件：PascalCase（如 `LoginUI.tsx`）
- Hook 文件：camelCase（如 `useAdminLogic.ts`）
- 配置文件：camelCase（如 `menuConfig.tsx`）

#### 代码风格
- 使用 TypeScript 严格模式
- 优先使用函数组件和 Hooks
- 遵循 React 最佳实践
- 保持组件单一职责

## 部署说明

### 构建生产版本
```bash
npm run build
```

### 生产环境配置
- 移除调试面板
- 配置生产环境 API 地址
- 启用代码压缩和优化
- 设置正确的 public path

### 环境变量
```bash
REACT_APP_API_URL=https://api.galphos.com
REACT_APP_VERSION=1.0.0
```

## 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

### 代码提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建工具或辅助工具的变动
```

## 常见问题

### Q: 无法登录测试账户？
A: 请检查浏览器控制台，使用开发环境的调试面板重新初始化测试账户。

### Q: 页面样式异常？
A: 确认 Ant Design 样式正确加载，检查 CSS 文件冲突。

### Q: 路由跳转失败？
A: 检查路由配置和权限验证逻辑。

## 更新日志

### v1.0.0 (2024-06-25)
- ✨ 完成多角色用户系统
- ✨ 实现管理员后台功能
- ✨ 完成用户仪表板界面
- 🐛 修复登录认证问题
- 🎨 优化界面设计和用户体验

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。