# 愤怒的小鸟Web项目

这是一个基于HTML5 Canvas的愤怒的小鸟Web游戏实现。

## 项目结构

```
crazy_bird/
├── webapp/                # 前端资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   ├── images/            # 图片资源
│   ├── sounds/            # 声音资源
│   └── index.html         # 主页面
├── WEB-INF/               # Java Web配置
│   ├── jsp/               # JSP文件
│   ├── lib/               # 依赖库
│   └── classes/           # 编译后的类文件
└── src/                   # 后端Java代码
    └── com/crazybird/     # 包结构
        ├── controller/    # 控制器
        ├── model/         # 模型
        └── service/       # 服务
```

## 如何运行

1. 将项目部署到Java Web服务器（如Tomcat）
2. 启动服务器
3. 在浏览器中访问 `http://localhost:8080/crazy_bird`

## 游戏操作

1. 点击"开始游戏"按钮
2. 用鼠标拖动小鸟，调整发射角度和力度
3. 松开鼠标发射小鸟
4. 击中猪和方块获得分数
5. 点击"重置游戏"按钮重新开始

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Java, JSP
- 服务器：Tomcat