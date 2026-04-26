(function () {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ui = {
        start: document.getElementById("startBtn"),
        reset: document.getElementById("resetBtn"),
        skill: document.getElementById("skillBtn"),
        sound: document.getElementById("soundToggle"),
        status: document.getElementById("statusValue"),
        score: document.getElementById("scoreValue"),
        birds: document.getElementById("birdsValue"),
        pigs: document.getElementById("pigsValue"),
        best: document.getElementById("bestValue"),
        level: document.getElementById("levelValue"),
        combo: document.getElementById("comboValue"),
        type: document.getElementById("birdTypeValue"),
        skillText: document.getElementById("skillValue"),
        levelName: document.getElementById("levelNameValue"),
        power: document.getElementById("powerValue"),
        powerFill: document.getElementById("powerFill"),
        roster: document.getElementById("rosterList")
    };
    const audio = window.CrazyBirdAudio ? new window.CrazyBirdAudio() : { resume(){}, setEnabled(){}, playLaunch(){}, playImpact(){}, playDestroy(){}, playPig(){}, playSkill(){}, playWin(){}, playLose(){} };
    const bestKey = "crazyBirdDeluxeBest";
    const sling = { fx: 168, fy: 314, bx: 150, by: 314, pull: 116 };
    const forkX = (sling.fx + sling.bx) / 2;
    const forkY = sling.fy;
    const ground = 472;
    const materials = {
        wood: { hp: 2.2, score: 70, bounce: 0.82, fill: "#b45309", line: "#7c2d12", fx: "#f59e0b" },
        stone: { hp: 3.6, score: 110, bounce: 0.9, fill: "#64748b", line: "#334155", fx: "#cbd5e1" },
        glass: { hp: 1.5, score: 90, bounce: 0.7, fill: "rgba(125,211,252,.35)", line: "rgba(8,145,178,.95)", fx: "rgba(255,255,255,.86)" }
    };
    const pigs = {
        normal: { r: 20, hp: 1.1, score: 150, body: "#84cc16", hat: null },
        helmet: { r: 21, hp: 2, score: 220, body: "#65a30d", hat: "#475569" },
        king: { r: 24, hp: 3.2, score: 340, body: "#4d7c0f", hat: "#fbbf24" }
    };
    const birds = {
        red: { name: "赤焰鸟", skillName: "突进冲锋", skill: "dash", r: 18, mass: 1.08, g: 0.42, ls: 0.235, block: 1.08, pig: 1.04, c: { body: "#ef4444", belly: "#fee2e2", beak: "#f59e0b", eye: "#111827", trail: "#fecaca", aura: "rgba(248,113,113,.36)" } },
        yellow: { name: "疾风鸟", skillName: "破甲俯冲", skill: "pierce", r: 17, mass: 0.96, g: 0.39, ls: 0.252, block: 1.24, pig: 0.96, c: { body: "#facc15", belly: "#fef3c7", beak: "#fb923c", eye: "#111827", trail: "#fde68a", aura: "rgba(250,204,21,.3)" } },
        blue: { name: "裂空鸟", skillName: "三重分裂", skill: "split", r: 15, mass: 0.82, g: 0.4, ls: 0.244, block: 0.9, pig: 0.95, c: { body: "#38bdf8", belly: "#e0f2fe", beak: "#f59e0b", eye: "#111827", trail: "#bae6fd", aura: "rgba(56,189,248,.32)" } },
        black: { name: "雷爆鸟", skillName: "震荡爆裂", skill: "shock", r: 20, mass: 1.36, g: 0.44, ls: 0.226, block: 1.18, pig: 1.1, c: { body: "#111827", belly: "#374151", beak: "#f59e0b", eye: "#f8fafc", trail: "#cbd5e1", aura: "rgba(251,191,36,.28)" } },
        ice: { name: "寒霜鸟", skillName: "冰封脉冲", skill: "frost", r: 17, mass: 0.98, g: 0.4, ls: 0.236, block: 0.98, pig: 1.02, c: { body: "#67e8f9", belly: "#ecfeff", beak: "#fb923c", eye: "#0f172a", trail: "#a5f3fc", aura: "rgba(103,232,249,.32)" } }
    };
    const levels = [
        { name: "晨曦谷地", sky: ["#5fd2ff", "#fef9c3"], hills: ["#65a30d", "#4d7c0f"], sun: [820, 94], queue: ["red", "yellow", "blue", "black", "ice"], pigs: [[736,448,"normal"],[814,448,"helmet"],[780,214,"normal"]], blocks: [[706,382,26,92,"wood"],[786,382,26,92,"wood"],[866,382,26,92,"wood"],[730,338,96,22,"glass"],[730,270,26,74,"stone"],[808,270,26,74,"stone"],[718,238,128,24,"wood"],[882,322,58,22,"glass"]] },
        { name: "霜石堡垒", sky: ["#7dd3fc", "#dbeafe"], hills: ["#22c55e", "#15803d"], sun: [760, 72], queue: ["ice", "blue", "yellow", "red", "black"], pigs: [[714,448,"helmet"],[792,448,"normal"],[870,448,"helmet"],[790,182,"king"]], blocks: [[690,386,28,88,"stone"],[770,386,28,88,"glass"],[850,386,28,88,"stone"],[710,346,188,22,"glass"],[734,280,28,72,"stone"],[816,280,28,72,"stone"],[728,246,122,24,"glass"],[770,198,34,44,"stone"],[908,338,30,136,"wood"]] },
        { name: "暮色火山", sky: ["#312e81", "#fdba74"], hills: ["#7c2d12", "#431407"], sun: [840, 128], queue: ["black", "red", "yellow", "ice", "blue"], pigs: [[730,448,"normal"],[806,448,"helmet"],[882,448,"normal"],[770,308,"helmet"],[846,220,"king"]], blocks: [[704,390,26,84,"stone"],[782,390,26,84,"wood"],[860,390,26,84,"stone"],[728,350,184,22,"wood"],[748,306,26,54,"glass"],[820,306,26,54,"glass"],[742,272,118,20,"stone"],[822,232,48,32,"stone"],[922,332,28,142,"glass"],[654,332,28,142,"glass"]] }
    ];
    const game = { started: false, running: false, level: 0, score: 0, best: loadBest(), combo: 0, comboAt: 0, dragging: false, power: 0, queue: [], current: null, active: [], pigs: [], blocks: [], particles: [], rings: [], clouds: clouds(), status: "点击开始游戏", nextTimer: null, lvlTimer: null };

    function loadBest() { try { return Number(localStorage.getItem(bestKey) || 0); } catch (e) { return 0; } }
    function saveBest() { try { localStorage.setItem(bestKey, String(game.best)); } catch (e) {} }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
    function clouds() { return [{x:110,y:84,s:1.05,v:.16},{x:360,y:134,s:.82,v:.22},{x:646,y:88,s:1.18,v:.12},{x:892,y:154,s:.74,v:.2}]; }
    function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; }
    function norm(x, y) { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; }
    function rot(x, y, a) { return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) }; }
    function setStatus(t) { game.status = t; if (ui.status) ui.status.textContent = t; }
    function setPower(v) { game.power = clamp(v, 0, 100); if (ui.power) ui.power.textContent = Math.round(game.power) + "%"; if (ui.powerFill) ui.powerFill.style.width = game.power + "%"; }
    function remain() { return game.queue.length + (game.current && !game.current.launched && !game.current.resolved ? 1 : 0); }
    function ring(x, y, max, color, width, life) { game.rings.push({ x, y, r: 6, max, color, width, life }); }
    function emit(x, y, color, count, speed) { for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2; const s = .4 + Math.random() * (speed || 4.5); game.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 20 + Math.random() * 22, max: 42, size: 2 + Math.random() * 3, color }); } }
    function mkBlock(b, i) { const m = materials[b[4]]; return { id: i, x: b[0], y: b[1], w: b[2], h: b[3], mat: b[4], hp: m.hp, max: m.hp, alive: true, cd: 0, frozen: 0, pulse: 0 }; }
    function mkPig(p, i) { const t = pigs[p[2]]; return { id: i, x: p[0], y: p[1], type: p[2], r: t.r, hp: t.hp, max: t.hp, alive: true, cd: 0, frozen: 0, pulse: Math.random() * 3.14 }; }
    function mkBird(id, clone) { const s = birds[id]; return { id, clone: !!clone, name: s.name, skillName: s.skillName, skill: s.skill, c: s.c, r: clone ? Math.max(11, s.r - 3) : s.r, mass: clone ? s.mass * .62 : s.mass, g: s.g, ls: s.ls, block: clone ? s.block * .86 : s.block, pig: clone ? s.pig * .92 : s.pig, x: forkX, y: forkY, vx: 0, vy: 0, launched: false, resolved: false, skillReady: !clone, skillUsed: false, precision: 1, aura: 1, glow: 0, sleep: 0, trail: [] }; }
    function updateUI() {
        if (ui.score) ui.score.textContent = Math.round(game.score);
        if (ui.birds) ui.birds.textContent = remain();
        if (ui.pigs) ui.pigs.textContent = game.pigs.filter(p => p.alive).length;
        if (ui.best) ui.best.textContent = Math.round(game.best);
        if (ui.level) ui.level.textContent = (game.level + 1) + "/" + levels.length;
        if (ui.combo) ui.combo.textContent = game.combo ? "x" + game.combo : "x0";
        if (ui.levelName) ui.levelName.textContent = levels[game.level].name;
        if (ui.type) ui.type.textContent = game.current ? game.current.name : "等待装填";
        if (ui.skillText) ui.skillText.textContent = !game.current ? "点击开始游戏" : (game.current.resolved ? "等待下一只小鸟" : (!game.current.launched ? game.current.skillName : (game.current.skillReady && !game.current.skillUsed ? "可释放：" + game.current.skillName : (game.current.skillUsed ? "技能已释放" : "飞行中"))));
        if (ui.skill) ui.skill.disabled = !(game.current && game.current.launched && game.current.skillReady && !game.current.resolved && game.running);
        if (ui.roster) {
            const cards = [];
            if (game.current) cards.push(card(game.current.id, game.current.name, game.current.resolved ? "已出战" : (game.current.launched ? "飞行中" : "已装填"), true));
            game.queue.forEach((id, i) => cards.push(card(id, birds[id].name, i ? "排队" : "待命", false)));
            ui.roster.innerHTML = cards.length ? cards.join("") : '<div class="roster-empty">点击开始游戏装填鸟群</div>';
        }
    }
    function card(id, name, st, active) { const c = birds[id].c; return '<div class="roster-item' + (active ? ' active' : '') + '"><div class="roster-badge" style="background:' + c.body + ';box-shadow:0 0 0 4px ' + c.aura + ';"></div><div class="roster-copy"><strong>' + name + '</strong><span>' + st + ' · ' + birds[id].skillName + '</span></div></div>'; }
    function clearTimers() { if (game.nextTimer) clearTimeout(game.nextTimer); if (game.lvlTimer) clearTimeout(game.lvlTimer); game.nextTimer = null; game.lvlTimer = null; }
    function spawnNext() { const id = game.queue.shift(); game.current = id ? mkBird(id, false) : null; game.active = game.current ? [game.current] : []; setPower(0); updateUI(); return !!id; }
    function buildLevel(i) { clearTimers(); game.level = i; game.dragging = false; game.queue = levels[i].queue.slice(); game.blocks = levels[i].blocks.map(mkBlock); game.pigs = levels[i].pigs.map(mkPig); game.particles = []; game.rings = []; game.clouds = clouds(); spawnNext(); setStatus("第" + (i + 1) + "关：拖动弹弓发射"); }
    function start() { audio.resume(); game.started = true; game.running = true; game.score = 0; game.combo = 0; buildLevel(0); updateUI(); }
    function reset() { start(); }
    function begin(e) { if (!game.running || !game.current || game.current.launched) return; audio.resume(); const p = pos(e); if (dist(p.x, p.y, game.current.x, game.current.y) <= game.current.r + 14) { game.dragging = true; drag(e); setStatus("瞄准中，松手发射 " + game.current.name); } }
    function drag(e) { if (!game.dragging || !game.current) return; const p = pos(e), dx = p.x - forkX, dy = p.y - forkY, d = Math.hypot(dx, dy), l = Math.min(d, sling.pull), r = d ? l / d : 0; game.current.x = forkX + dx * r; game.current.y = forkY + dy * r; setPower(l / sling.pull * 100); updateUI(); }
    function release() { if (!game.dragging || !game.current) return; game.dragging = false; const lx = forkX - game.current.x, ly = forkY - game.current.y, p = Math.hypot(lx, ly); if (p < 10) { game.current.x = forkX; game.current.y = forkY; setPower(0); setStatus("拖动弹弓发射 " + game.current.name); return; } game.current.launched = true; game.current.vx = lx * game.current.ls; game.current.vy = ly * game.current.ls; audio.playLaunch(game.power); setStatus("飞行中：空格或按钮释放技能"); updateUI(); }
    function area(x, y, r, damage, type) { game.blocks.forEach(b => { if (!b.alive) return; const cx = b.x + b.w / 2, cy = b.y + b.h / 2, k = 1 - dist(x, y, cx, cy) / r; if (k <= 0) return; if (type === "frost") b.frozen = Math.max(b.frozen, 170 * k + 40); hitBlock(b, damage * k * (type === "shock" ? 1.6 : 1.05), true); emit(cx, cy, type === "frost" ? "#a5f3fc" : "#fcd34d", 8 + Math.round(10 * k), 4.5); }); game.pigs.forEach(p => { if (!p.alive) return; const k = 1 - dist(x, y, p.x, p.y) / r; if (k <= 0) return; if (type === "frost") p.frozen = Math.max(p.frozen, 180 * k + 40); hitPig(p, damage * k * (type === "shock" ? 1.5 : .9)); }); }
    function skill() {
        const b = game.current;
        if (!game.running || !b || !b.launched || !b.skillReady || b.resolved) return;
        b.skillReady = false; b.skillUsed = true; b.glow = 22;
        if (b.skill === "dash") { const d = norm(b.vx, b.vy); b.vx += d.x * 5.6; b.vy += d.y * 3.1; b.aura = 1.4; emit(b.x, b.y, b.c.trail, 18, 4.8); setStatus("赤焰鸟发动突进冲锋"); audio.playSkill("dash"); }
        else if (b.skill === "pierce") { const d = norm(b.vx, b.vy); b.vx += d.x * 7.2; b.vy += d.y * 4.1; b.precision = 1.7; b.aura = 1.25; emit(b.x, b.y, b.c.trail, 16, 5.2); setStatus("疾风鸟发动破甲俯冲"); audio.playSkill("dash"); }
        else if (b.skill === "split") { const l = mkBird("blue", true), r = mkBird("blue", true), lv = rot(b.vx, b.vy, -.32), rv = rot(b.vx, b.vy, .32); l.x = r.x = b.x; l.y = r.y = b.y; l.launched = r.launched = true; l.vx = lv.x * .98; l.vy = lv.y * .98; r.vx = rv.x * .98; r.vy = rv.y * .98; game.active.push(l, r); emit(b.x, b.y, b.c.trail, 22, 4.6); ring(b.x, b.y, 70, "rgba(125,211,252,.46)", 3, 18); setStatus("裂空鸟发动三重分裂"); audio.playSkill("split"); }
        else if (b.skill === "shock") { emit(b.x, b.y, "#fde68a", 24, 6.4); ring(b.x, b.y, 142, "rgba(251,191,36,.46)", 5, 24); area(b.x, b.y, 140, 1.8, "shock"); b.vx *= .52; b.vy *= .52; setStatus("雷爆鸟释放震荡爆裂"); audio.playSkill("shock"); }
        else if (b.skill === "frost") { emit(b.x, b.y, "#a5f3fc", 24, 5.8); ring(b.x, b.y, 136, "rgba(103,232,249,.48)", 4, 28); area(b.x, b.y, 130, 1.1, "frost"); setStatus("寒霜鸟释放冰封脉冲"); audio.playSkill("frost"); }
        updateUI();
    }
    function hitBlock(b, dmg, silent) { if (!b.alive || dmg <= 0) return; b.hp -= dmg * (b.frozen > 0 ? 1.32 : 1); b.pulse = 8; if (!silent) game.score += 12; if (b.hp <= 0) { b.alive = false; game.score += materials[b.mat].score; emit(b.x + b.w / 2, b.y + b.h / 2, materials[b.mat].fx, b.mat === "glass" ? 20 : 14, b.mat === "stone" ? 3.2 : 4.4); audio.playDestroy(b.mat); game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, b.x + b.w / 2, b.y + b.h / 2) < 96) hitPig(p, .68); }); } updateUI(); }
    function hitPig(p, dmg) { if (!p.alive || dmg <= 0) return; p.hp -= dmg * (p.frozen > 0 ? 1.28 : 1); p.cd = 8; if (p.hp <= 0) { p.alive = false; const now = performance.now(); game.combo = now - game.comboAt < 1300 ? game.combo + 1 : 1; game.comboAt = now; game.score += pigs[p.type].score + Math.max(0, game.combo - 1) * 35; emit(p.x, p.y, "#86efac", 18, 4.2); audio.playPig(); if (game.pigs.every(t => !t.alive)) completeLevel(); } updateUI(); }
    function collision(bird, block) { const cx = clamp(bird.x, block.x, block.x + block.w), cy = clamp(bird.y, block.y, block.y + block.h); let dx = bird.x - cx, dy = bird.y - cy, d = Math.hypot(dx, dy); if (d < bird.r) { if (!d) { dx = bird.x < block.x + block.w / 2 ? -1 : 1; dy = 0; d = 1; } return { x: cx, y: cy, nx: dx / d, ny: dy / d, overlap: bird.r - d }; } return null; }
    function blockDamage(bird, mat) { return Math.hypot(bird.vx, bird.vy) * bird.mass * bird.block * bird.aura * bird.precision / ((mat === "stone" ? 3.8 : mat === "glass" ? 1.55 : 2.4) * 7.1); }
    function pigDamage(bird) { return Math.hypot(bird.vx, bird.vy) * bird.mass * bird.pig * bird.aura / 5.4; }
    function resolve(b) { b.resolved = true; b.launched = false; b.vx = 0; b.vy = 0; }
    function nextBird() { if (game.nextTimer || !game.running) return; setStatus("下一只小鸟装填中"); game.nextTimer = setTimeout(() => { game.nextTimer = null; if (!game.running) return; if (spawnNext()) setStatus("拖动弹弓发射 " + game.current.name); else finish(false); updateUI(); }, 760); }
    function completeLevel() { clearTimers(); game.running = false; const bonus = remain() * 60; game.score += bonus; setStatus("第" + (game.level + 1) + "关完成，奖励 " + bonus + " 分"); emit(780, 220, "#fde68a", 40, 6); audio.playWin(); updateUI(); game.lvlTimer = setTimeout(() => { game.lvlTimer = null; if (game.level < levels.length - 1) { game.running = true; buildLevel(game.level + 1); updateUI(); } else finish(true); }, 1500); }
    function finish(win) { clearTimers(); game.running = false; setPower(0); if (win) { setStatus("战役通关！点击重新开始再来一局"); emit(790, 240, "#fde68a", 48, 6.5); audio.playWin(); } else { game.current = null; game.active = []; setStatus("小鸟已用尽，点击重新开始重试"); audio.playLose(); } if (game.score > game.best) { game.best = game.score; saveBest(); } updateUI(); }
    function update(dt) {
        game.clouds.forEach(c => { c.x += c.v * dt; if (c.x - c.s * 120 > canvas.width) c.x = -140; });
        game.blocks.forEach(b => { b.cd = Math.max(0, b.cd - dt); b.frozen = Math.max(0, b.frozen - dt); b.pulse = Math.max(0, b.pulse - dt); });
        game.pigs.forEach(p => { p.cd = Math.max(0, p.cd - dt); p.frozen = Math.max(0, p.frozen - dt); p.pulse += dt * .06; });
        game.particles = game.particles.filter(p => (p.x += p.vx * dt, p.y += p.vy * dt, p.vy += .06 * dt, p.life -= dt, p.life > 0));
        game.rings = game.rings.filter(r => (r.life -= dt, r.r += (r.max - r.r) * .18 * dt, r.life > 0));
        if (game.combo && performance.now() - game.comboAt > 1600) { game.combo = 0; updateUI(); }
        if (!game.running) return;
        game.active.forEach(b => {
            if (!b.launched || b.resolved) return;
            b.glow = Math.max(0, b.glow - dt); b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= Math.pow(.994, dt); b.vy *= Math.pow(.997, dt);
            b.trail.push({ x: b.x, y: b.y, life: 16, color: b.c.trail }); if (b.trail.length > 18) b.trail.shift(); b.trail.forEach(t => t.life -= dt); b.trail = b.trail.filter(t => t.life > 0);
            if (b.y + b.r > ground) { b.y = ground - b.r; if (Math.abs(b.vy) > 1.4) audio.playImpact(Math.abs(b.vy), "wood"); b.vy *= b.precision > 1.4 ? -.32 : -.46; b.vx *= .84; emit(b.x, ground, "rgba(255,255,255,.55)", 4, 2.2); }
            if (b.x + b.r > canvas.width - 8) { b.x = canvas.width - 8 - b.r; b.vx *= -.58; }
            if (b.x - b.r < 8) { b.x = 8 + b.r; b.vx *= -.52; }
            if (b.y - b.r < 10) { b.y = 10 + b.r; b.vy *= -.5; }
            game.blocks.forEach(k => { if (!k.alive || k.cd > 0) return; const h = collision(b, k); if (!h) return; const m = materials[k.mat], dot = b.vx * h.nx + b.vy * h.ny; b.x += h.nx * h.overlap; b.y += h.ny * h.overlap; b.vx -= 1.64 * dot * h.nx; b.vy -= 1.64 * dot * h.ny; b.vx *= m.bounce * (b.precision > 1.3 ? .96 : .84); b.vy *= m.bounce * .92; k.cd = 6; hitBlock(k, blockDamage(b, k.mat), false); emit(h.x, h.y, m.fx, k.mat === "glass" ? 8 : 6, k.mat === "stone" ? 2.8 : 3.8); audio.playImpact(Math.hypot(b.vx, b.vy), k.mat); });
            game.pigs.forEach(p => { if (!p.alive || p.cd > 0) return; if (dist(b.x, b.y, p.x, p.y) > b.r + p.r) return; hitPig(p, pigDamage(b)); b.vx *= .84; b.vy *= .84; emit(p.x, p.y, "#86efac", 10, 3.6); });
            if (Math.abs(b.vx) + Math.abs(b.vy) < 1.25 && b.y > ground - b.r - 3) b.sleep += dt; else b.sleep = 0;
            if (b.sleep > 24 || b.x > canvas.width + 160 || b.x < -160 || b.y > canvas.height + 160) resolve(b);
        });
        if (!game.pigs.some(p => p.alive)) return;
        if (game.active.length && game.active.every(b => b.resolved)) { if (game.queue.length) nextBird(); else if (!game.nextTimer) finish(false); }
    }
    function cloud(c) { ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.s, c.s); ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.arc(26, -10, 22, 0, Math.PI * 2); ctx.arc(54, 0, 30, 0, Math.PI * 2); ctx.arc(24, 10, 24, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    function rounded(x, y, w, h, r, fill) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
    function drawBg() { const lv = levels[game.level], g = ctx.createLinearGradient(0, 0, 0, canvas.height); g.addColorStop(0, lv.sky[0]); g.addColorStop(1, lv.sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.beginPath(); ctx.arc(lv.sun[0], lv.sun[1], 42, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,240,164,.95)"; ctx.fill(); game.clouds.forEach(cloud); ctx.fillStyle = lv.hills[0]; ctx.beginPath(); ctx.moveTo(0, 410); ctx.quadraticCurveTo(120, 350, 260, 420); ctx.quadraticCurveTo(370, 455, 510, 392); ctx.quadraticCurveTo(680, 320, 960, 420); ctx.lineTo(960, 540); ctx.lineTo(0, 540); ctx.closePath(); ctx.fill(); ctx.fillStyle = lv.hills[1]; ctx.fillRect(0, ground, canvas.width, canvas.height - ground); }
    function drawSling() { const b = game.current && !game.current.resolved ? game.current : { x: forkX, y: forkY }; ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sling.bx, ground); ctx.lineTo(sling.bx, sling.by); ctx.moveTo(sling.fx, ground); ctx.lineTo(sling.fx, sling.fy); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = "#a16207"; ctx.beginPath(); ctx.moveTo(sling.bx, sling.by); ctx.lineTo(b.x, b.y); ctx.moveTo(sling.fx, sling.fy); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    function drawBlock(b) { const m = materials[b.mat]; ctx.save(); if (b.frozen > 0) ctx.globalAlpha = .9; rounded(b.x, b.y, b.w, b.h, 6, m.fill); ctx.fillStyle = b.frozen > 0 ? "rgba(224,242,254,.34)" : "rgba(255,255,255,.12)"; ctx.fillRect(b.x + 5, b.y + 5, b.w - 10, 6); ctx.strokeStyle = m.line; ctx.lineWidth = 2 + b.pulse * .12; ctx.beginPath(); ctx.moveTo(b.x + 8, b.y + b.h * .3); ctx.lineTo(b.x + b.w - 8, b.y + b.h * .36); ctx.moveTo(b.x + b.w * .4, b.y + 8); ctx.lineTo(b.x + b.w * .5, b.y + b.h - 8); if (b.hp < b.max) { ctx.moveTo(b.x + b.w * .65, b.y + b.h * .2); ctx.lineTo(b.x + b.w * .3, b.y + b.h * .8); } ctx.stroke(); if (b.frozen > 0) { ctx.strokeStyle = "rgba(224,242,254,.8)"; ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4); } ctx.restore(); }
    function drawPig(p) { const t = pigs[p.type]; ctx.save(); if (p.frozen > 0) ctx.globalAlpha = .92; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = t.body; ctx.fill(); ctx.beginPath(); ctx.arc(p.x - 8, p.y - p.r + 4, 6, 0, Math.PI * 2); ctx.arc(p.x + 8, p.y - p.r + 4, 6, 0, Math.PI * 2); ctx.fillStyle = "#65a30d"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x, p.y + 2, 10, 0, Math.PI * 2); ctx.fillStyle = "#bef264"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x - 4, p.y + 2, 1.8, 0, Math.PI * 2); ctx.arc(p.x + 4, p.y + 2, 1.8, 0, Math.PI * 2); ctx.fillStyle = "#365314"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x - 5, p.y - 5, 2.4, 0, Math.PI * 2); ctx.arc(p.x + 5, p.y - 5, 2.4, 0, Math.PI * 2); ctx.fillStyle = "#111827"; ctx.fill(); if (t.hat) { ctx.fillStyle = t.hat; ctx.beginPath(); ctx.arc(p.x, p.y - p.r + 2 + Math.sin(p.pulse) * 1.2, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(p.x - 12, p.y - p.r - 1, 24, 5); } if (p.frozen > 0) { ctx.strokeStyle = "rgba(224,242,254,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2); ctx.stroke(); } ctx.restore(); }
    function drawBird(b) { b.trail.forEach(t => { ctx.globalAlpha = Math.max(t.life / 16, 0) * .38; ctx.beginPath(); ctx.arc(t.x, t.y, 6, 0, Math.PI * 2); ctx.fillStyle = t.color; ctx.fill(); }); ctx.globalAlpha = 1; if (b.glow > 0) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 10, 0, Math.PI * 2); ctx.fillStyle = b.c.aura; ctx.fill(); } ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = b.c.body; ctx.fill(); ctx.beginPath(); ctx.arc(b.x - 5, b.y + 4, b.r * .48, 0, Math.PI); ctx.fillStyle = b.c.belly; ctx.fill(); ctx.beginPath(); ctx.arc(b.x + 4, b.y - 4, 3.6, 0, Math.PI * 2); ctx.fillStyle = b.c.eye; ctx.fill(); ctx.beginPath(); ctx.moveTo(b.x + b.r - 4, b.y + 1); ctx.lineTo(b.x + b.r + 10, b.y - 2); ctx.lineTo(b.x + b.r - 4, b.y - 8); ctx.closePath(); ctx.fillStyle = b.c.beak; ctx.fill(); ctx.strokeStyle = b.id === "black" ? "#fde68a" : "#7f1d1d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x - 8, b.y - 10); ctx.lineTo(b.x + 10, b.y - 14); ctx.stroke(); }
    function drawFx() { game.particles.forEach(p => { ctx.globalAlpha = Math.max(p.life / p.max, .1); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); }); game.rings.forEach(r => { ctx.globalAlpha = Math.max(r.life / 28, .15); ctx.strokeStyle = r.color; ctx.lineWidth = r.width; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); }); ctx.globalAlpha = 1; }
    function drawOverlay() { if (game.running || game.dragging) return; ctx.fillStyle = "rgba(15,23,42,.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 36px Microsoft YaHei"; ctx.fillText(game.status, canvas.width / 2, canvas.height / 2 - 10); ctx.font = "18px Microsoft YaHei"; ctx.fillText("拖动小鸟发射，空格或技能按钮触发专属技能", canvas.width / 2, canvas.height / 2 + 28); }
    function draw() { drawBg(); game.blocks.filter(b => b.alive).forEach(drawBlock); game.pigs.filter(p => p.alive).forEach(drawPig); drawSling(); game.active.forEach(drawBird); drawFx(); drawOverlay(); }

    if (ui.start) ui.start.addEventListener("click", start);
    if (ui.reset) ui.reset.addEventListener("click", reset);
    if (ui.skill) ui.skill.addEventListener("click", skill);
    if (ui.sound) ui.sound.addEventListener("click", () => { audio.resume(); const on = ui.sound.getAttribute("aria-pressed") !== "true"; ui.sound.setAttribute("aria-pressed", on ? "true" : "false"); ui.sound.textContent = on ? "音效：开" : "音效：关"; audio.setEnabled(on); });
    canvas.addEventListener("pointerdown", begin);
    window.addEventListener("pointermove", drag);
    window.addEventListener("pointerup", release);
    window.addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); skill(); } });

    buildLevel(0);
    game.running = false;
    setStatus("点击开始游戏");
    setPower(0);
    updateUI();
    let last = performance.now();
    function loop(now) { const dt = Math.min((now - last) / 16.67, 2.2); last = now; update(dt); draw(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
})();
