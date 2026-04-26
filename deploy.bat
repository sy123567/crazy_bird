@echo off
chcp 65001 >nul
echo =========================================
echo   愤怒的小鸟 Docker 部署脚本
echo =========================================

echo.
echo [1/4] 检查Docker是否安装...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker未安装!
    echo 请先安装Docker: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)
echo ✓ Docker已安装

echo.
echo [2/4] 检查Docker Compose是否安装...
where docker-compose >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker Compose未安装!
    echo 请先安装Docker Compose: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)
echo ✓ Docker Compose已安装

echo.
echo [3/4] 构建Docker镜像...
call mvn clean package
if %errorlevel% neq 0 (
    echo 错误: Maven构建失败!
    pause
    exit /b 1
)
echo ✓ 构建成功

echo.
echo [4/4] 启动Docker容器...
docker-compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo   ✓ 部署成功!
    echo =========================================
    echo.
    echo 游戏访问地址: http://localhost:8080/crazy_bird
    echo.
    echo 常用命令:
    echo   查看日志: docker-compose logs -f
    echo   停止服务: docker-compose down
    echo   重启服务: docker-compose restart
    echo.
) else (
    echo 错误: Docker容器启动失败!
    pause
    exit /b 1
)

pause