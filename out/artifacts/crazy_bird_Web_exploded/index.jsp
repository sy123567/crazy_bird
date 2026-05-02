<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crazy Bird Deluxe</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/game.css">
</head>
<body>
<div class="page-shell">
    <header class="hero">
        <div class="hero-copy">
            <span class="eyebrow">JSP Canvas Arcade</span>
            <h1>愤怒的小鸟</h1>
            <p class="subtitle">升级后的 Crazy Bird Deluxe 加入多关卡战役、五种鸟类专属技能、木石玻璃材质结构、连击得分和实时音效反馈。拖拽弹弓发射，飞行中抓准时机释放技能，击溃猪堡。</p>
        </div>
        <div class="hero-actions">
            <button id="startBtn" class="primary-btn" type="button">开始游戏</button>
            <button id="skillBtn" class="tertiary-btn" type="button" disabled>释放技能</button>
            <button id="soundToggle" class="ghost-btn" type="button" aria-pressed="true">音效：开</button>
            <button id="resetBtn" class="secondary-btn" type="button">重新开始</button>
        </div>
    </header>

    <main class="game-layout">
        <section class="game-stage-card">
            <canvas id="gameCanvas" width="960" height="540"></canvas>
            <div class="hint-bar">
                <span>操作：鼠标拖拽蓄力，松手发射</span>
                <span>技能：空格或“释放技能”按钮</span>
                <span>材质：木质易碎，石质耐撞，玻璃脆但弹性高</span>
                <span>目标：逐关清空所有小猪并保留更多小鸟</span>
            </div>
            <div class="bird-library">
                <article class="bird-chip red">
                    <strong>赤焰鸟</strong>
                    <span>突进冲锋，强化正面撞击</span>
                </article>
                <article class="bird-chip yellow">
                    <strong>疾风鸟</strong>
                    <span>破甲俯冲，高速穿透结构</span>
                </article>
                <article class="bird-chip blue">
                    <strong>裂空鸟</strong>
                    <span>三重分裂，扩大命中范围</span>
                </article>
                <article class="bird-chip black">
                    <strong>雷爆鸟</strong>
                    <span>震荡爆裂，释放范围冲击波</span>
                </article>
                <article class="bird-chip ice">
                    <strong>寒霜鸟</strong>
                    <span>冰封脉冲，冻结敌人和方块</span>
                </article>
            </div>
        </section>

        <aside class="game-sidebar">
            <div class="stat-card accent">
                <span class="label">当前状态</span>
                <strong id="statusValue">点击开始游戏</strong>
            </div>

            <div class="stat-grid">
                <div class="stat-card">
                    <span class="label">得分</span>
                    <strong id="scoreValue">0</strong>
                </div>
                <div class="stat-card">
                    <span class="label">剩余小鸟</span>
                    <strong id="birdsValue">4</strong>
                </div>
                <div class="stat-card">
                    <span class="label">剩余小猪</span>
                    <strong id="pigsValue">3</strong>
                </div>
                <div class="stat-card">
                    <span class="label">最高分</span>
                    <strong id="bestValue">0</strong>
                </div>
                <div class="stat-card">
                    <span class="label">关卡</span>
                    <strong id="levelValue">1/3</strong>
                </div>
                <div class="stat-card">
                    <span class="label">连击</span>
                    <strong id="comboValue">x0</strong>
                </div>
                <div class="stat-card wide-card">
                    <span class="label">当前鸟种</span>
                    <strong id="birdTypeValue">等待装填</strong>
                </div>
                <div class="stat-card wide-card">
                    <span class="label">技能状态</span>
                    <strong id="skillValue">点击开始游戏</strong>
                </div>
            </div>

            <div class="power-panel">
                <div class="power-head">
                    <span>发射力度</span>
                    <span id="powerValue">0%</span>
                </div>
                <div class="power-track">
                    <div id="powerFill" class="power-fill"></div>
                </div>
            </div>

            <div class="mission-card">
                <div class="mission-head">
                    <span class="label">当前战场</span>
                    <strong id="levelNameValue">晨曦谷地</strong>
                </div>
                <p>根据关卡鸟群顺序选择合适的撞击点，优先拆除支撑结构，触发连锁坍塌和连击加分。</p>
            </div>

            <div class="roster-card">
                <h2>鸟群编队</h2>
                <div id="rosterList" class="roster-list">
                    <div class="roster-empty">点击开始游戏装填鸟群</div>
                </div>
            </div>

            <div class="tips-card">
                <h2>作战说明</h2>
                <ul>
                    <li>拖动距离越远，发射速度越快，音效也会更强。</li>
                    <li>木质结构易碎，石质结构血量更高，玻璃结构适合制造连锁。</li>
                    <li>击败小猪会累积连击，连续击倒可获得额外分数。</li>
                    <li>技能只可在当前主鸟飞行中释放一次，分裂出的副鸟没有额外技能。</li>
                    <li>通关时会按剩余小鸟数追加奖励分。</li>
                </ul>
            </div>
        </aside>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/crazy-bird-audio.js"></script>
<script src="${pageContext.request.contextPath}/js/crazy-bird-engine.js"></script>
</body>
</html>
