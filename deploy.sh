#!/bin/bash

# GalPHOS 前端快速部署脚本

set -e

echo "🚀 开始部署 GalPHOS 前端..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 显示Node.js和npm版本
echo "ℹ️  检测到的版本信息:"
node --version
npm --version
echo ""

# 检查是否存在 node_modules 目录和 package-lock.json
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo "✅ 检测到已安装的依赖，跳过安装步骤"
else
    # 安装依赖
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

echo "✅ 构建完成！"

# 提供部署选项
echo ""
echo "请选择部署方式："
echo "1) 使用 serve 快速启动 (端口 3000)"
echo "2) 仅构建，手动部署"
echo "3) 使用 Docker 部署"

read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        echo "🌐 使用 serve 启动服务器..."
        if ! command -v serve &> /dev/null; then
            echo "📦 安装 serve..."
            npm install -g serve
        fi
        echo "🚀 启动服务器在 http://localhost:3000"
        serve -s build -l 3000
        ;;
    2)
        echo "✅ 构建完成！build 目录已准备就绪。"
        echo "📁 构建文件位置: $(pwd)/build"
        echo "📖 请参考 DEPLOYMENT.md 文档进行手动部署。"
        ;;
    3)
        echo "🐳 使用 Docker 部署..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker 未安装，请先安装 Docker"
            exit 1
        fi
        
        # 检查是否存在 Dockerfile
        if [ ! -f "Dockerfile" ]; then
            echo "📝 创建 Dockerfile..."
            cat > Dockerfile << 'EOF'
# 多阶段构建
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产环境
FROM nginx:alpine

# 复制构建产物
COPY --from=build /app/build /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
        fi
        
        # 检查是否存在 nginx.conf
        if [ ! -f "nginx.conf" ]; then
            echo "📝 创建 nginx.conf..."
            cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    keepalive_timeout 65;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss;
    
    server {
        listen 80;
        server_name localhost;
        
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, no-transform";
        }
    }
}
EOF
        fi
        
        echo "🔨 构建 Docker 镜像..."
        docker build -t galphos-frontend .
        
        echo "🚀 启动 Docker 容器..."
        docker run -d -p 3000:80 --name galphos-frontend galphos-frontend
        
        echo "✅ Docker 部署完成！"
        echo "🌐 访问地址: http://localhost:3000"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
