(function () {
    var canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        return;
    }

    var ctx = canvas.getContext("2d");
    var startBtn = document.getElementById("startBtn");
    var resetBtn = document.getElementById("resetBtn");
    var scoreEl = document.getElementById("scoreValue");
    var birdsEl = document.getElementById("birdsValue");
    var pigsEl = document.getElementById("pigsValue");
    var bestEl = document.getElementById("bestValue");
    var statusEl = document.getElementById("statusValue");
    var powerEl = document.getElementById("powerValue");
    var powerFill = document.getElementById("powerFill");
    var bestKey = "crazyBirdBestScore";
    var sling = { x: 172, y: 364, frontX: 186, frontY: 314, backX: 150, backY: 314, maxPull: 108 };
    var forkX = (sling.frontX + sling.backX) / 2;
    var forkY = (sling.frontY + sling.backY) / 2;
    var groundY = 472;
    var game = {
        running: false,
        score: 0,
        best: loadBestScore(),
        birdsRemaining: 4,
        dragging: false,
        waitingNext: false,
        power: 0,
        bird: null,
        pigs: [],
        blocks: [],
        particles: [],
        clouds: [
            { x: 120, y: 86, size: 1.05, speed: 0.18 },
            { x: 390, y: 132, size: 0.88, speed: 0.24 },
            { x: 660, y: 72, size: 1.22, speed: 0.12 },
            { x: 860, y: 148, size: 0.76, speed: 0.2 }
        ],
        nextBirdTimer: null,
        overlay: "点击开始游戏"
    };

    function loadBestScore() {
        try {
            return Number(localStorage.getItem(bestKey) || 0);
        } catch (e) {
            return 0;
        }
    }

    function saveBestScore() {
        try {
            localStorage.setItem(bestKey, String(game.best));
        } catch (e) {
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function setStatus(text) {
        game.overlay = text;
        statusEl.textContent = text;
    }

    function setPower(value) {
        game.power = clamp(value, 0, 100);
        powerEl.textContent = Math.round(game.power) + "%";
        powerFill.style.width = game.power + "%";
    }

    function updateStats() {
        scoreEl.textContent = game.score;
        birdsEl.textContent = game.birdsRemaining;
        pigsEl.textContent = game.pigs.filter(function (pig) { return pig.alive; }).length;
        bestEl.textContent = game.best;
    }

    function buildLevel() {
        game.blocks = [
            { x: 690, y: 382, w: 26, h: 92, hp: 2, maxHp: 2, alive: true, cooldown: 0 },
            { x: 770, y: 382, w: 26, h: 92, hp: 2, maxHp: 2, alive: true, cooldown: 0 },
            { x: 850, y: 382, w: 26, h: 92, hp: 2, maxHp: 2, alive: true, cooldown: 0 },
            { x: 730, y: 338, w: 94, h: 22, hp: 2, maxHp: 2, alive: true, cooldown: 0 },
            { x: 728, y: 270, w: 26, h: 74, hp: 2, maxHp: 2, alive: true, cooldown: 0 },
            { x: 808, y: 270, w: 26, h: 74, hp: 2, maxHp: 2, alive: true, cooldown: 0 },
            { x: 716, y: 240, w: 130, h: 24, hp: 3, maxHp: 3, alive: true, cooldown: 0 },
            { x: 880, y: 324, w: 58, h: 22, hp: 2, maxHp: 2, alive: true, cooldown: 0 }
        ];
        game.pigs = [
            { x: 732, y: 448, radius: 20, alive: true, cooldown: 0 },
            { x: 812, y: 448, radius: 20, alive: true, cooldown: 0 },
            { x: 782, y: 218, radius: 19, alive: true, cooldown: 0 }
        ];
    }

    function spawnBird() {
        game.bird = {
            x: forkX,
            y: forkY,
            radius: 18,
            vx: 0,
            vy: 0,
            launched: false,
            boostReady: true,
            resolved: false,
            sleep: 0,
            trail: []
        };
        setPower(0);
    }

    function clearPendingBird() {
        if (game.nextBirdTimer) {
            clearTimeout(game.nextBirdTimer);
            game.nextBirdTimer = null;
        }
    }

    function resetGame() {
        clearPendingBird();
        game.running = true;
        game.score = 0;
        game.birdsRemaining = 4;
        game.dragging = false;
        game.waitingNext = false;
        game.particles = [];
        buildLevel();
        spawnBird();
        setStatus("拖动小鸟并松手发射");
        updateStats();
    }

    function getPointerPosition(event) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    function beginDrag(event) {
        if (!game.running || !game.bird || game.bird.launched || game.waitingNext) {
            return;
        }
        var point = getPointerPosition(event);
        var dx = point.x - game.bird.x;
        var dy = point.y - game.bird.y;
        if (Math.hypot(dx, dy) <= game.bird.radius + 8) {
            game.dragging = true;
            setStatus("松手发射小鸟");
            updateDrag(event);
        }
    }

    function updateDrag(event) {
        if (!game.dragging || !game.bird) {
            return;
        }
        var point = getPointerPosition(event);
        var dx = Math.min(point.x - forkX, 0);
        var dy = Math.max(point.y - forkY, 0);
        var distance = Math.hypot(dx, dy);
        var limited = Math.min(distance, sling.maxPull);
        var ratio = distance === 0 ? 0 : limited / distance;
        game.bird.x = forkX + dx * ratio;
        game.bird.y = forkY + dy * ratio;
        setPower(limited / sling.maxPull * 100);
    }

    function endDrag() {
        if (!game.dragging || !game.bird) {
            return;
        }
        game.dragging = false;
        var launchX = forkX - game.bird.x;
        var launchY = forkY - game.bird.y;
        var power = Math.hypot(launchX, launchY);
        if (power < 10) {
            spawnBird();
            setStatus("拖动小鸟并松手发射");
            return;
        }
        game.bird.launched = true;
        game.bird.vx = launchX * 0.23;
        game.bird.vy = launchY * 0.23;
        game.birdsRemaining -= 1;
        setStatus("飞行中，按空格冲刺一次");
        updateStats();
    }

    function emitParticles(x, y, color, count) {
        for (var i = 0; i < count; i += 1) {
            game.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 22 + Math.random() * 18,
                size: 2 + Math.random() * 4,
                color: color
            });
        }
    }

    function hitCircleRect(circle, rect) {
        var closestX = clamp(circle.x, rect.x, rect.x + rect.w);
        var closestY = clamp(circle.y, rect.y, rect.y + rect.h);
        var dx = circle.x - closestX;
        var dy = circle.y - closestY;
        var distance = Math.hypot(dx, dy);
        if (distance < circle.radius) {
            if (distance === 0) {
                dx = circle.x < rect.x + rect.w / 2 ? -1 : 1;
                dy = 0;
                distance = 1;
            }
            return {
                nx: dx / distance,
                ny: dy / distance,
                overlap: circle.radius - distance,
                x: closestX,
                y: closestY
            };
        }
        return null;
    }

    function defeatPig(pig, chain) {
        if (!pig.alive) {
            return;
        }
        pig.alive = false;
        game.score += chain ? 180 : 150;
        emitParticles(pig.x, pig.y, "#86efac", 18);
        if (game.pigs.every(function (item) { return !item.alive; })) {
            finishGame(true);
        } else {
            updateStats();
        }
    }

    function destroyBlock(block) {
        if (!block.alive) {
            return;
        }
        block.alive = false;
        game.score += 70;
        emitParticles(block.x + block.w / 2, block.y + block.h / 2, "#f59e0b", 14);
        game.pigs.forEach(function (pig) {
            if (pig.alive && Math.hypot(pig.x - (block.x + block.w / 2), pig.y - (block.y + block.h / 2)) < 86) {
                defeatPig(pig, true);
            }
        });
        updateStats();
    }

    function checkCollisions() {
        var bird = game.bird;
        if (!bird || !bird.launched || bird.resolved) {
            return;
        }
        var speed = Math.hypot(bird.vx, bird.vy);
        game.blocks.forEach(function (block) {
            if (!block.alive || block.cooldown > 0) {
                return;
            }
            var hit = hitCircleRect(bird, block);
            if (!hit || speed < 1.8) {
                return;
            }
            bird.x += hit.nx * hit.overlap;
            bird.y += hit.ny * hit.overlap;
            var dot = bird.vx * hit.nx + bird.vy * hit.ny;
            bird.vx -= 1.7 * dot * hit.nx;
            bird.vy -= 1.7 * dot * hit.ny;
            bird.vx *= 0.82;
            bird.vy *= 0.82;
            block.cooldown = 8;
            block.hp -= speed > 8 ? 2 : 1;
            game.score += 15;
            emitParticles(hit.x, hit.y, "#fbbf24", 8);
            if (block.hp <= 0) {
                destroyBlock(block);
            } else {
                updateStats();
            }
        });
        game.pigs.forEach(function (pig) {
            if (!pig.alive || pig.cooldown > 0) {
                return;
            }
            var dx = bird.x - pig.x;
            var dy = bird.y - pig.y;
            var distance = Math.hypot(dx, dy);
            if (distance < bird.radius + pig.radius) {
                pig.cooldown = 8;
                defeatPig(pig, false);
                bird.vx *= 0.86;
                bird.vy *= 0.86;
            }
        });
    }

    function finishBird() {
        if (!game.bird || game.bird.resolved) {
            return;
        }
        game.bird.resolved = true;
        setPower(0);
        if (game.pigs.every(function (pig) { return !pig.alive; })) {
            finishGame(true);
            return;
        }
        if (game.birdsRemaining > 0) {
            game.waitingNext = true;
            setStatus("下一只小鸟装填中");
            clearPendingBird();
            game.nextBirdTimer = setTimeout(function () {
                if (!game.running) {
                    return;
                }
                game.waitingNext = false;
                spawnBird();
                setStatus("拖动小鸟并松手发射");
                updateStats();
            }, 720);
        } else {
            finishGame(false);
        }
    }

    function finishGame(win) {
        if (!game.running && !game.waitingNext) {
            return;
        }
        clearPendingBird();
        game.running = false;
        game.waitingNext = false;
        setPower(0);
        if (win) {
            game.score += game.birdsRemaining * 60;
            setStatus("胜利！点击重新开始再来一局");
            emitParticles(780, 200, "#fde68a", 24);
        } else {
            setStatus("挑战失败，点击重新开始重试");
        }
        if (game.score > game.best) {
            game.best = game.score;
            saveBestScore();
        }
        updateStats();
    }

    function triggerBoost() {
        if (!game.running || !game.bird || !game.bird.launched || !game.bird.boostReady || game.bird.resolved) {
            return;
        }
        game.bird.boostReady = false;
        game.bird.vx *= 1.35;
        game.bird.vy *= 0.9;
        setStatus("冲刺释放成功");
        emitParticles(game.bird.x, game.bird.y, "#fecaca", 12);
    }

    function update(dt) {
        game.clouds.forEach(function (cloud) {
            cloud.x += cloud.speed * dt;
            if (cloud.x - cloud.size * 120 > canvas.width) {
                cloud.x = -140;
            }
        });
        game.blocks.forEach(function (block) {
            block.cooldown = Math.max(0, block.cooldown - dt);
        });
        game.pigs.forEach(function (pig) {
            pig.cooldown = Math.max(0, pig.cooldown - dt);
        });
        game.particles = game.particles.filter(function (particle) {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += 0.06 * dt;
            particle.life -= dt;
            return particle.life > 0;
        });
        if (!game.running || !game.bird || !game.bird.launched || game.bird.resolved) {
            return;
        }
        var bird = game.bird;
        bird.vy += 0.42 * dt;
        bird.x += bird.vx * dt;
        bird.y += bird.vy * dt;
        bird.vx *= Math.pow(0.993, dt);
        bird.vy *= Math.pow(0.997, dt);
        bird.trail.push({ x: bird.x, y: bird.y, life: 18 });
        if (bird.trail.length > 18) {
            bird.trail.shift();
        }
        bird.trail.forEach(function (item) {
            item.life -= dt;
        });
        bird.trail = bird.trail.filter(function (item) { return item.life > 0; });
        if (bird.y + bird.radius > groundY) {
            bird.y = groundY - bird.radius;
            bird.vy *= -0.44;
            bird.vx *= 0.86;
            emitParticles(bird.x, groundY, "rgba(255,255,255,0.65)", 4);
        }
        if (bird.x + bird.radius > canvas.width - 8) {
            bird.x = canvas.width - 8 - bird.radius;
            bird.vx *= -0.6;
        }
        if (bird.x - bird.radius < 8) {
            bird.x = 8 + bird.radius;
            bird.vx *= -0.55;
        }
        if (bird.y - bird.radius < 10) {
            bird.y = 10 + bird.radius;
            bird.vy *= -0.5;
        }
        checkCollisions();
        if (Math.abs(bird.vx) + Math.abs(bird.vy) < 1.2 && bird.y > groundY - bird.radius - 2) {
            bird.sleep += dt;
        } else {
            bird.sleep = 0;
        }
        if (bird.sleep > 26 || bird.x > canvas.width + 140 || bird.x < -140 || bird.y > canvas.height + 140) {
            finishBird();
        }
    }

    function drawRoundedRect(x, y, w, h, radius, fillStyle) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }

    function drawCloud(cloud) {
        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(cloud.size, cloud.size);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.arc(26, -10, 22, 0, Math.PI * 2);
        ctx.arc(54, 0, 30, 0, Math.PI * 2);
        ctx.arc(24, 10, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawBird(bird) {
        bird.trail.forEach(function (item) {
            ctx.globalAlpha = Math.max(item.life / 18, 0) * 0.4;
            ctx.beginPath();
            ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#fca5a5";
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bird.x - 6, bird.y + 4, 8, 0, Math.PI);
        ctx.fillStyle = "#fee2e2";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bird.x + 4, bird.y - 4, 3.6, 0, Math.PI * 2);
        ctx.fillStyle = "#111827";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bird.x + 14, bird.y + 1);
        ctx.lineTo(bird.x + 26, bird.y - 2);
        ctx.lineTo(bird.x + 14, bird.y - 8);
        ctx.closePath();
        ctx.fillStyle = "#f59e0b";
        ctx.fill();
        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bird.x - 8, bird.y - 10);
        ctx.lineTo(bird.x + 10, bird.y - 14);
        ctx.stroke();
    }

    function drawPig(pig) {
        ctx.beginPath();
        ctx.arc(pig.x, pig.y, pig.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#84cc16";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pig.x - 8, pig.y - pig.radius + 4, 6, 0, Math.PI * 2);
        ctx.arc(pig.x + 8, pig.y - pig.radius + 4, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#65a30d";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pig.x, pig.y + 2, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#bef264";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pig.x - 4, pig.y + 2, 1.8, 0, Math.PI * 2);
        ctx.arc(pig.x + 4, pig.y + 2, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "#365314";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pig.x - 5, pig.y - 5, 2.4, 0, Math.PI * 2);
        ctx.arc(pig.x + 5, pig.y - 5, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "#111827";
        ctx.fill();
    }

    function drawBlock(block) {
        var color = block.hp === block.maxHp ? "#b45309" : block.hp === 2 ? "#c2410c" : "#ea580c";
        drawRoundedRect(block.x, block.y, block.w, block.h, 6, color);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(block.x + 5, block.y + 5, block.w - 10, 6);
        ctx.strokeStyle = "rgba(120,53,15,0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(block.x + 8, block.y + block.h * 0.3);
        ctx.lineTo(block.x + block.w - 8, block.y + block.h * 0.36);
        ctx.moveTo(block.x + block.w * 0.4, block.y + 8);
        ctx.lineTo(block.x + block.w * 0.5, block.y + block.h - 8);
        if (block.hp < block.maxHp) {
            ctx.moveTo(block.x + block.w * 0.65, block.y + block.h * 0.2);
            ctx.lineTo(block.x + block.w * 0.3, block.y + block.h * 0.8);
        }
        ctx.stroke();
    }

    function drawBackground() {
        var sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, "#5fd2ff");
        sky.addColorStop(0.55, "#b7ecff");
        sky.addColorStop(1, "#fef9c3");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(820, 92, 42, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 240, 164, 0.95)";
        ctx.fill();
        game.clouds.forEach(drawCloud);
        ctx.fillStyle = "#65a30d";
        ctx.beginPath();
        ctx.moveTo(0, 410);
        ctx.quadraticCurveTo(120, 350, 260, 420);
        ctx.quadraticCurveTo(370, 455, 510, 392);
        ctx.quadraticCurveTo(680, 320, 960, 420);
        ctx.lineTo(960, 540);
        ctx.lineTo(0, 540);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4d7c0f";
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    }

    function drawSlingshot() {
        var bird = game.bird;
        var birdX = bird ? bird.x : sling.x;
        var birdY = bird ? bird.y : sling.y;
        ctx.strokeStyle = "#7c2d12";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(sling.backX, groundY);
        ctx.lineTo(sling.backX, sling.backY);
        ctx.moveTo(sling.frontX, groundY);
        ctx.lineTo(sling.frontX, sling.frontY);
        ctx.stroke();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#a16207";
        ctx.beginPath();
        ctx.moveTo(sling.backX, sling.backY);
        ctx.lineTo(birdX, birdY);
        ctx.moveTo(sling.frontX, sling.frontY);
        ctx.lineTo(birdX, birdY);
        ctx.stroke();
    }

    function drawParticles() {
        game.particles.forEach(function (particle) {
            ctx.globalAlpha = Math.max(particle.life / 40, 0.12);
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawOverlay() {
        if (game.running || game.dragging) {
            return;
        }
        ctx.fillStyle = "rgba(15,23,42,0.18)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 36px Microsoft YaHei";
        ctx.fillText(game.overlay, canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "18px Microsoft YaHei";
        ctx.fillText("点击开始游戏后拖动小鸟发射", canvas.width / 2, canvas.height / 2 + 28);
    }

    function draw() {
        drawBackground();
        game.blocks.filter(function (block) { return block.alive; }).forEach(drawBlock);
        game.pigs.filter(function (pig) { return pig.alive; }).forEach(drawPig);
        drawSlingshot();
        if (game.bird) {
            drawBird(game.bird);
        }
        drawParticles();
        drawOverlay();
    }

    startBtn.addEventListener("click", resetGame);
    resetBtn.addEventListener("click", resetGame);
    canvas.addEventListener("pointerdown", beginDrag);
    window.addEventListener("pointermove", updateDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("keydown", function (event) {
        if (event.code === "Space") {
            event.preventDefault();
            triggerBoost();
        }
    });

    buildLevel();
    spawnBird();
    updateStats();
    setStatus("点击开始游戏");

    var lastTime = performance.now();
    function loop(now) {
        var dt = Math.min((now - lastTime) / 16.67, 2.2);
        lastTime = now;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
