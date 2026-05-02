.PHONY: build up down restart logs clean

build:
	@echo "构建项目..."
	mvn clean package

docker-build: build
	@echo "构建Docker镜像..."
	docker build -t crazy_bird:latest .

up: docker-build
	@echo "启动Docker容器..."
	docker-compose up -d
	@echo ""
	@echo "游戏访问地址: http://localhost:8080/crazy_bird"

down:
	@echo "停止Docker容器..."
	docker-compose down

restart:
	@echo "重启Docker容器..."
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	@echo "清理构建产物..."
	mvn clean
	@echo "清理Docker资源..."
	docker-compose down -v --rmi all

rebuild: down clean build docker-build up