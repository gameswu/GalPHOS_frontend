@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM GalPHOS 前端快速部署脚本 (Windows版本)

echo 🚀 开始部署 GalPHOS 前端...

REM 检查 Node.js 是否安装
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm 是否安装
where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

REM 显示Node.js和npm版本
echo ℹ️  检测到的版本信息:
node --version
npm --version
echo.

REM 检查是否存在 node_modules 目录和 package-lock.json
if exist "node_modules" if exist "package-lock.json" (
    echo ✅ 检测到已安装的依赖，跳过安装步骤
    goto :build
)

REM 安装依赖
echo 📦 安装依赖...
npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

:build
REM 构建项目
echo 🔨 构建项目...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo ✅ 构建完成！
echo.

REM 提供部署选项
echo 请选择部署方式：
echo 1^) 使用 serve 快速启动 ^(端口 3000^)
echo 2^) 仅构建，手动部署
echo 3^) 使用 Docker 部署
echo 4^) 使用 IIS 部署配置
echo.

set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" goto :serve
if "%choice%"=="2" goto :manual
if "%choice%"=="3" goto :docker
if "%choice%"=="4" goto :iis
echo ❌ 无效选项
pause
exit /b 1

:serve
echo 🌐 使用 serve 启动服务器...
where serve >nul 2>&1
if errorlevel 1 (
    echo 📦 安装 serve...
    npm install -g serve
    if errorlevel 1 (
        echo ❌ serve 安装失败
        pause
        exit /b 1
    )
)
echo 🚀 启动服务器在 http://localhost:3000
echo 按 Ctrl+C 停止服务器
serve -s build -l 3000
goto :end

:manual
echo ✅ 构建完成！build 目录已准备就绪。
echo 📁 构建文件位置: %cd%\build
echo 📖 请参考 DEPLOYMENT.md 文档进行手动部署。
goto :end

:docker
echo 🐳 使用 Docker 部署...
where docker >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查是否存在 Dockerfile
if not exist "Dockerfile" (
    echo 📝 创建 Dockerfile...
    (
        echo # 多阶段构建
        echo FROM node:18-alpine as build
        echo.
        echo WORKDIR /app
        echo COPY package*.json ./
        echo RUN npm ci --only=production
        echo.
        echo COPY . .
        echo RUN npm run build
        echo.
        echo # 生产环境
        echo FROM nginx:alpine
        echo.
        echo # 复制构建产物
        echo COPY --from=build /app/build /usr/share/nginx/html
        echo.
        echo # 复制 Nginx 配置
        echo COPY nginx.conf /etc/nginx/nginx.conf
        echo.
        echo EXPOSE 80
        echo.
        echo CMD ["nginx", "-g", "daemon off;"]
    ) > Dockerfile
)

REM 检查是否存在 nginx.conf
if not exist "nginx.conf" (
    echo 📝 创建 nginx.conf...
    (
        echo events {
        echo     worker_connections 1024;
        echo }
        echo.
        echo http {
        echo     include /etc/nginx/mime.types;
        echo     default_type application/octet-stream;
        echo.
        echo     sendfile on;
        echo     keepalive_timeout 65;
        echo.
        echo     gzip on;
        echo     gzip_vary on;
        echo     gzip_min_length 1024;
        echo     gzip_types
        echo         text/plain
        echo         text/css
        echo         text/xml
        echo         text/javascript
        echo         application/javascript
        echo         application/xml+rss;
        echo.
        echo     server {
        echo         listen 80;
        echo         server_name localhost;
        echo.
        echo         root /usr/share/nginx/html;
        echo         index index.html;
        echo.
        echo         location / {
        echo             try_files $uri $uri/ /index.html;
        echo         }
        echo.
        echo         location /static/ {
        echo             expires 1y;
        echo             add_header Cache-Control "public, no-transform";
        echo         }
        echo     }
        echo }
    ) > nginx.conf
)

echo 🔨 构建 Docker 镜像...
docker build -t galphos-frontend .
if errorlevel 1 (
    echo ❌ Docker 镜像构建失败
    pause
    exit /b 1
)

echo 🚀 启动 Docker 容器...
docker run -d -p 3000:80 --name galphos-frontend galphos-frontend
if errorlevel 1 (
    echo ❌ Docker 容器启动失败
    pause
    exit /b 1
)

echo ✅ Docker 部署完成！
echo 🌐 访问地址: http://localhost:3000
goto :end

:iis
echo 🏢 创建 IIS 部署配置...

REM 创建 web.config 文件
if not exist "build\web.config" (
    echo 📝 创建 web.config...
    (
        echo ^<?xml version="1.0" encoding="utf-8"?^>
        echo ^<configuration^>
        echo   ^<system.webServer^>
        echo     ^<rewrite^>
        echo       ^<rules^>
        echo         ^<rule name="React Routes" stopProcessing="true"^>
        echo           ^<match url=".*" /^>
        echo           ^<conditions logicalGrouping="MatchAll"^>
        echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /^>
        echo             ^<add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /^>
        echo           ^</conditions^>
        echo           ^<action type="Rewrite" url="/" /^>
        echo         ^</rule^>
        echo       ^</rules^>
        echo     ^</rewrite^>
        echo     ^<staticContent^>
        echo       ^<mimeMap fileExtension=".json" mimeType="application/json" /^>
        echo       ^<mimeMap fileExtension=".woff" mimeType="application/font-woff" /^>
        echo       ^<mimeMap fileExtension=".woff2" mimeType="application/font-woff2" /^>
        echo     ^</staticContent^>
        echo     ^<httpCompression^>
        echo       ^<dynamicTypes^>
        echo         ^<add mimeType="application/javascript" enabled="true" /^>
        echo         ^<add mimeType="application/json" enabled="true" /^>
        echo       ^</dynamicTypes^>
        echo       ^<staticTypes^>
        echo         ^<add mimeType="text/css" enabled="true" /^>
        echo         ^<add mimeType="application/javascript" enabled="true" /^>
        echo       ^</staticTypes^>
        echo     ^</httpCompression^>
        echo   ^</system.webServer^>
        echo ^</configuration^>
    ) > build\web.config
)

echo ✅ IIS 配置文件已创建！
echo 📁 请将 build 目录中的所有文件复制到 IIS 网站根目录
echo 📖 配置步骤：
echo    1. 打开 IIS 管理器
echo    2. 创建新网站或选择现有网站
echo    3. 将网站物理路径指向: %cd%\build
echo    4. 确保启用了 URL 重写模块
echo    5. 启动网站
goto :end

:end
echo.
echo 🎉 部署完成！
echo.
pause
