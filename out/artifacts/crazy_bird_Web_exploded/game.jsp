<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>愤怒的小鸟</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
    <div id="game-container">
        <h1>愤怒的小鸟</h1>
        <div id="game-canvas">
            <canvas id="canvas" width="800" height="600"></canvas>
        </div>
        <div id="game-controls">
            <button id="start-btn">开始游戏</button>
            <button id="reset-btn">重置游戏</button>
            <div id="score">得分: 0</div>
        </div>
    </div>
    <script src="${pageContext.request.contextPath}/js/game.js"></script>
</body>
</html>