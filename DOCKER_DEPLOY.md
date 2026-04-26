# 愤怒的小鸟 - Docker部署指南

本指南介绍如何使用Docker和Docker Compose部署愤怒的小鸟游戏。

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- Maven 3.6+

## 快速部署

### Windows用户

双击运行 `deploy.bat` 或在命令行中执行：

```cmd
deploy.bat
```

### Linux/Mac用户

在终端中执行：

```bash
chmod +x deploy.sh
./deploy.sh
```

## 手动部署

如果你想要手动执行每一步操作：

### 1. 构建项目

```bash
mvn clean package
```

### 2. 构建Docker镜像

```bash
docker build -t crazy_bird:latest .
```

### 3. 运行容器

```bash
docker run -d -p 8080:8080 --name crazy_bird_game crazy_bird:latest
```

或者使用Docker Compose：

```bash
docker-compose up -d
```

## 访问游戏

部署成功后，通过以下地址访问游戏：

- 本地访问: http://localhost:8080/crazy_bird
- 局域网访问: http://你的IP地址:8080/crazy_bird

## 常用Docker命令

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 删除容器和镜像
docker-compose down --rmi all
```

## 配置说明

### 修改端口

如果8080端口已被占用，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8081:8080"  # 将容器的8080端口映射到主机的8081端口
```

### 修改内存配置

可以在 `docker-compose.yml` 中修改Java虚拟机内存配置：

```yaml
environment:
  - JAVA_OPTS=-Xmx1024m -Xms512m
```

## 故障排除

### Docker容器无法启动

```bash
# 查看容器日志
docker logs crazy_bird_game

# 检查端口占用
netstat -an | findstr "8080"
```

### 页面无法访问

1. 确认容器正在运行: `docker ps`
2. 确认防火墙允许8080端口
3. 尝试访问: http://127.0.0.1:8080/crazy_bird

### 构建失败

```bash
# 清理Docker缓存
docker builder prune

# 重新构建
docker-compose build --no-cache
```

## 生产环境部署建议

对于生产环境，建议：

1. 使用Nginx作为反向代理
2. 配置SSL证书启用HTTPS
3. 使用Docker Swarm或Kubernetes进行编排
4. 配置日志收集和监控