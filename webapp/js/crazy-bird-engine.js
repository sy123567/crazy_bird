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
        roster: document.getElementById("rosterList"),
        levelSelect: document.getElementById("levelSelect"),
        levelStart: document.getElementById("levelStartBtn"),
        stageSkill: document.getElementById("stageSkillBtn"),
        fullscreen: document.getElementById("fullscreenBtn"),
        library: document.getElementById("birdLibrary"),
        stage: document.querySelector(".game-stage-card")
    };
    const audio = window.CrazyBirdAudio ? new window.CrazyBirdAudio() : {};
    ["resume", "setEnabled", "setTheme", "playButton", "playLevelStart", "playBirdReady", "playAim", "playLaunch", "playImpact", "playDestroy", "playPigHit", "playPig", "playCombo", "playSkill", "playWin", "playLose"].forEach(name => {
        const fn = audio[name];
        audio[name] = typeof fn === "function" ? function (...args) { try { return fn.apply(audio, args); } catch (e) { return undefined; } } : function () {};
    });
    const bestKey = "crazyBirdDeluxeBest";
    const sling = { fx: 206, fy: 314, bx: 188, by: 314, pull: 124 };
    const forkX = (sling.fx + sling.bx) / 2;
    const forkY = sling.fy;
    const ground = 472;
    const materials = {
        wood: { hp: 1.6, score: 70, bounce: 0.68, fill: "#b45309", line: "#7c2d12", fx: "#f59e0b" },
        stone: { hp: 2.6, score: 110, bounce: 0.8, fill: "#64748b", line: "#334155", fx: "#cbd5e1" },
        glass: { hp: 0.95, score: 90, bounce: 0.58, fill: "rgba(125,211,252,.35)", line: "rgba(8,145,178,.95)", fx: "rgba(255,255,255,.86)" }
    };
    const pigs = {
        normal: { r: 20, hp: 1, score: 150, body: "#84cc16", hat: null },
        helmet: { r: 21, hp: 1.6, score: 220, body: "#65a30d", hat: "#475569" },
        king: { r: 24, hp: 2.5, score: 340, body: "#4d7c0f", hat: "#fbbf24" }
    };
    const birds = {
        red: { name: "赤焰鸟", skillName: "突进冲锋", skill: "dash", r: 18, mass: 1.2, g: 0.4, ls: 0.3, block: 1.5, pig: 1.4, c: { body: "#ef4444", belly: "#fee2e2", beak: "#f59e0b", eye: "#111827", trail: "#fecaca", aura: "rgba(248,113,113,.36)" } },
        yellow: { name: "疾风鸟", skillName: "破甲俯冲", skill: "pierce", r: 17, mass: 1.04, g: 0.37, ls: 0.33, block: 1.75, pig: 1.26, c: { body: "#facc15", belly: "#fef3c7", beak: "#fb923c", eye: "#111827", trail: "#fde68a", aura: "rgba(250,204,21,.3)" } },
        blue: { name: "裂空鸟", skillName: "三重分裂", skill: "split", r: 15, mass: 0.96, g: 0.38, ls: 0.31, block: 1.28, pig: 1.22, c: { body: "#38bdf8", belly: "#e0f2fe", beak: "#f59e0b", eye: "#111827", trail: "#bae6fd", aura: "rgba(56,189,248,.32)" } },
        black: { name: "雷爆鸟", skillName: "震荡爆裂", skill: "shock", r: 20, mass: 1.5, g: 0.42, ls: 0.28, block: 1.55, pig: 1.48, c: { body: "#111827", belly: "#374151", beak: "#f59e0b", eye: "#f8fafc", trail: "#cbd5e1", aura: "rgba(251,191,36,.28)" } },
        ice: { name: "寒霜鸟", skillName: "冰封脉冲", skill: "frost", r: 17, mass: 1.1, g: 0.38, ls: 0.3, block: 1.38, pig: 1.36, c: { body: "#67e8f9", belly: "#ecfeff", beak: "#fb923c", eye: "#0f172a", trail: "#a5f3fc", aura: "rgba(103,232,249,.32)" } },
        green: { name: "翠羽鸟", skillName: "回旋斩", skill: "boomerang", r: 17, mass: 1.14, g: 0.38, ls: 0.31, block: 1.55, pig: 1.44, c: { body: "#22c55e", belly: "#dcfce7", beak: "#f97316", eye: "#052e16", trail: "#bbf7d0", aura: "rgba(34,197,94,.3)" } },
        purple: { name: "幻影鸟", skillName: "空间折叠", skill: "teleport", r: 16, mass: 1.02, g: 0.36, ls: 0.34, block: 1.84, pig: 1.24, c: { body: "#8b5cf6", belly: "#ede9fe", beak: "#f59e0b", eye: "#1e1b4b", trail: "#ddd6fe", aura: "rgba(139,92,246,.32)" } },
        white: { name: "投弹鸟", skillName: "爆裂蛋", skill: "egg_drop", r: 16, mass: 1, g: 0.34, ls: 0.3, block: 1.4, pig: 1.45, c: { body: "#f8fafc", belly: "#e2e8f0", beak: "#fb923c", eye: "#0f172a", trail: "#ffffff", aura: "rgba(255,255,255,.42)" } },
        orange: { name: "熔岩鸟", skillName: "岩浆爆发", skill: "inflate", r: 19, mass: 1.56, g: 0.43, ls: 0.27, block: 1.75, pig: 1.52, c: { body: "#f97316", belly: "#ffedd5", beak: "#facc15", eye: "#431407", trail: "#fed7aa", aura: "rgba(249,115,22,.34)" } },
        pink: { name: "甜心鸟", skillName: "爱心护盾", skill: "heal", r: 16, mass: 1.04, g: 0.37, ls: 0.31, block: 1.34, pig: 1.42, c: { body: "#ec4899", belly: "#fce7f3", beak: "#f59e0b", eye: "#500724", trail: "#fbcfe8", aura: "rgba(236,72,153,.3)" } },
        steel: { name: "钢甲鸟", skillName: "铁壁", skill: "shield", r: 19, mass: 1.42, g: 0.41, ls: 0.29, block: 2.1, pig: 1.4, c: { body: "#64748b", belly: "#cbd5e1", beak: "#f97316", eye: "#0f172a", trail: "#e2e8f0", aura: "rgba(100,116,139,.32)" } },
        storm: { name: "风暴鸟", skillName: "雷链", skill: "chain_lightning", r: 18, mass: 1.28, g: 0.39, ls: 0.3, block: 1.52, pig: 1.48, c: { body: "#2563eb", belly: "#dbeafe", beak: "#fbbf24", eye: "#172554", trail: "#bfdbfe", aura: "rgba(37,99,235,.32)" } },
        leaf: { name: "藤蔓鸟", skillName: "藤鞭", skill: "grapple", r: 16, mass: 1.08, g: 0.36, ls: 0.33, block: 1.4, pig: 1.5, c: { body: "#16a34a", belly: "#dcfce7", beak: "#ea580c", eye: "#052e16", trail: "#86efac", aura: "rgba(22,163,74,.32)" } },
        sand: { name: "沙暴鸟", skillName: "沙尘暴", skill: "sandstorm", r: 18, mass: 1.24, g: 0.4, ls: 0.29, block: 1.64, pig: 1.34, c: { body: "#d97706", belly: "#fef3c7", beak: "#facc15", eye: "#451a03", trail: "#fde68a", aura: "rgba(217,119,6,.3)" } },
        shadow: { name: "暗影鸟", skillName: "暗影斩", skill: "phase", r: 17, mass: 1.16, g: 0.37, ls: 0.32, block: 1.46, pig: 1.4, c: { body: "#312e81", belly: "#c4b5fd", beak: "#fb923c", eye: "#faf5ff", trail: "#a78bfa", aura: "rgba(49,46,129,.35)" } },
        solar: { name: "曜阳鸟", skillName: "烈日射线", skill: "laser", r: 19, mass: 1.36, g: 0.4, ls: 0.29, block: 1.58, pig: 1.52, c: { body: "#f59e0b", belly: "#fef3c7", beak: "#ef4444", eye: "#451a03", trail: "#fde68a", aura: "rgba(245,158,11,.34)" } },
        lunar: { name: "月霜鸟", skillName: "月之引力", skill: "gravity_reverse", r: 17, mass: 1.08, g: 0.36, ls: 0.31, block: 1.36, pig: 1.4, c: { body: "#818cf8", belly: "#e0e7ff", beak: "#f97316", eye: "#1e1b4b", trail: "#c7d2fe", aura: "rgba(129,140,248,.32)" } },
        crystal: { name: "晶蓝鸟", skillName: "冰晶散射", skill: "shatter", r: 15, mass: 1, g: 0.38, ls: 0.31, block: 1.3, pig: 1.28, c: { body: "#06b6d4", belly: "#cffafe", beak: "#fb923c", eye: "#083344", trail: "#a5f3fc", aura: "rgba(6,182,212,.34)" } },
        rocket: { name: "火箭鸟", skillName: "追踪导弹", skill: "homing", r: 18, mass: 1.22, g: 0.38, ls: 0.34, block: 1.5, pig: 1.36, c: { body: "#dc2626", belly: "#fee2e2", beak: "#facc15", eye: "#450a0a", trail: "#fca5a5", aura: "rgba(220,38,38,.34)" } },
        magnet: { name: "磁暴鸟", skillName: "引力场", skill: "magnet", r: 18, mass: 1.3, g: 0.39, ls: 0.3, block: 1.52, pig: 1.46, c: { body: "#0f766e", belly: "#ccfbf1", beak: "#f97316", eye: "#042f2e", trail: "#99f6e4", aura: "rgba(15,118,110,.32)" } },
        toxic: { name: "毒雾鸟", skillName: "毒瘴", skill: "toxic_cloud", r: 16, mass: 1.06, g: 0.37, ls: 0.31, block: 1.36, pig: 1.5, c: { body: "#65a30d", belly: "#ecfccb", beak: "#f97316", eye: "#1a2e05", trail: "#d9f99d", aura: "rgba(101,163,13,.32)" } },
        cloud: { name: "气球鸟", skillName: "浮空", skill: "lift", r: 16, mass: 1.02, g: 0.3, ls: 0.3, block: 1.2, pig: 1.32, c: { body: "#93c5fd", belly: "#eff6ff", beak: "#fb923c", eye: "#1e3a8a", trail: "#dbeafe", aura: "rgba(147,197,253,.42)" } },
        ember: { name: "余烬鸟", skillName: "火焰喷射", skill: "burn", r: 19, mass: 1.32, g: 0.41, ls: 0.29, block: 1.56, pig: 1.48, c: { body: "#b91c1c", belly: "#fed7aa", beak: "#facc15", eye: "#450a0a", trail: "#fdba74", aura: "rgba(185,28,28,.34)" } },
        sonic: { name: "音速鸟", skillName: "音爆", skill: "sonic_boom", r: 16, mass: 1, g: 0.35, ls: 0.35, block: 1.8, pig: 1.26, c: { body: "#0ea5e9", belly: "#e0f2fe", beak: "#f97316", eye: "#082f49", trail: "#7dd3fc", aura: "rgba(14,165,233,.34)" } },
        ghost: { name: "幽灵鸟", skillName: "幽灵突袭", skill: "ghost_dive", r: 16, mass: 0.96, g: 0.35, ls: 0.31, block: 1.26, pig: 1.34, c: { body: "#a855f7", belly: "#f3e8ff", beak: "#f59e0b", eye: "#3b0764", trail: "#e9d5ff", aura: "rgba(168,85,247,.32)" } }
    };
    const birdKeys = Object.keys(birds);
    const levelThemes = [
        { name: "晨曦谷地", sky: ["#5fd2ff", "#fef9c3"], hills: ["#65a30d", "#4d7c0f"], sun: [820, 94] },
        { name: "霜石堡垒", sky: ["#7dd3fc", "#dbeafe"], hills: ["#22c55e", "#15803d"], sun: [760, 72] },
        { name: "暮色火山", sky: ["#312e81", "#fdba74"], hills: ["#7c2d12", "#431407"], sun: [840, 128] },
        { name: "海风断崖", sky: ["#38bdf8", "#ccfbf1"], hills: ["#0f766e", "#115e59"], sun: [790, 82] },
        { name: "星夜沼泽", sky: ["#1e1b4b", "#7c3aed"], hills: ["#365314", "#1a2e05"], sun: [830, 110] },
        { name: "金砂遗迹", sky: ["#fbbf24", "#fef3c7"], hills: ["#b45309", "#78350f"], sun: [780, 88] },
        { name: "晶蓝雪原", sky: ["#bae6fd", "#eff6ff"], hills: ["#38bdf8", "#1d4ed8"], sun: [830, 76] },
        { name: "紫雾森林", sky: ["#a78bfa", "#f5d0fe"], hills: ["#6d28d9", "#3b0764"], sun: [770, 96] },
        { name: "钢铁峡湾", sky: ["#94a3b8", "#e2e8f0"], hills: ["#475569", "#1e293b"], sun: [820, 70] },
        { name: "烈阳荒原", sky: ["#fb923c", "#fed7aa"], hills: ["#ea580c", "#7c2d12"], sun: [800, 92] }
    ];
    const levels = [
        { name: "晨曦谷地", sky: ["#5fd2ff", "#fef9c3"], hills: ["#65a30d", "#4d7c0f"], sun: [820, 94], queue: ["red", "yellow", "blue", "black", "ice"], pigs: [[736,448,"normal"],[814,448,"helmet"],[780,214,"normal"]], blocks: [[706,382,26,92,"wood"],[786,382,26,92,"wood"],[866,382,26,92,"wood"],[730,338,96,22,"glass"],[730,270,26,74,"stone"],[808,270,26,74,"stone"],[718,238,128,24,"wood"],[882,322,58,22,"glass"]] },
        { name: "霜石堡垒", sky: ["#7dd3fc", "#dbeafe"], hills: ["#22c55e", "#15803d"], sun: [760, 72], queue: ["ice", "blue", "yellow", "red", "black"], pigs: [[714,448,"helmet"],[792,448,"normal"],[870,448,"helmet"],[790,182,"king"]], blocks: [[690,386,28,88,"wood"],[770,386,28,88,"wood"],[850,386,28,88,"wood"],[710,346,188,22,"glass"],[734,280,28,72,"wood"],[816,280,28,72,"wood"],[728,246,122,24,"glass"],[770,198,34,44,"wood"],[908,338,30,136,"wood"]] },
        { name: "暮色火山", sky: ["#312e81", "#fdba74"], hills: ["#7c2d12", "#431407"], sun: [840, 128], queue: ["black", "red", "yellow", "ice", "blue"], pigs: [[730,448,"normal"],[806,448,"helmet"],[882,448,"normal"],[770,308,"helmet"],[846,220,"king"]], blocks: [[704,390,26,84,"stone"],[782,390,26,84,"wood"],[860,390,26,84,"stone"],[728,350,184,22,"wood"],[748,306,26,54,"glass"],[820,306,26,54,"glass"],[742,272,118,20,"stone"],[822,232,48,32,"stone"],[922,332,28,142,"glass"],[654,332,28,142,"glass"]] }
    ];
    function makeLevel(i) {
        const theme = levelThemes[i % levelThemes.length];
        const tier = Math.floor(i / 10);
        const wave = i % 10;
        const mats = ["wood", "glass", "wood", "stone"];
        const baseX = 620 + (i % 5) * 18;
        const towerCount = clamp(3 + (i % 4), 3, 6);
        const queueSize = 5 + (i % 3 === 0 ? 1 : 0);
        const queue = Array.from({ length: queueSize }, (_, n) => birdKeys[(i + tier + n * 3) % birdKeys.length]);
        const pigCount = clamp(3 + Math.floor(i / 18), 3, 7);
        const pigTypes = ["normal", "helmet", "normal", "helmet", "king"];
        const levelPigs = [];
        const blocks = [];
        for (let p = 0; p < pigCount; p += 1) {
            const row = Math.floor(p / 4);
            const col = p % 4;
            const px = clamp(baseX + 44 + col * 62 + row * 24, 590, 910);
            const py = clamp(448 - row * 82 - ((p + wave) % 2) * 10, 172, 448);
            const type = i > 22 && p === pigCount - 1 && i % 3 === 0 ? "king" : pigTypes[(i + p + tier) % pigTypes.length];
            levelPigs.push([px, py, type]);
        }
        for (let t = 0; t < towerCount; t += 1) {
            const x = clamp(baseX + t * 52, 570, 900);
            const h = 66 + ((i + t) % 3) * 16 + Math.min(tier, 5) * 3;
            blocks.push([x, ground - h, 24, h, mats[(i + t) % mats.length]]);
            if (t < towerCount - 1) blocks.push([x + 18, ground - h - 20, 58, 20, mats[(i + t + 1) % mats.length]]);
        }
        blocks.push([baseX + 26, 344 - (wave % 3) * 10, towerCount * 48 + 18, 20, mats[(i + 2) % mats.length]]);
        if (i > 12) blocks.push([baseX + 62, 274 - (wave % 4) * 8, towerCount * 36 + 12, 18, mats[(i + 3) % mats.length]]);
        if (i > 35) blocks.push([clamp(baseX - 42, 560, 820), 330, 24, 142, mats[(i + 1) % mats.length]]);
        if (i > 60) blocks.push([clamp(baseX + towerCount * 52 + 16, 650, 922), 320, 24, 152, mats[(i + 2) % mats.length]]);
        return { name: theme.name + " " + String(i + 1).padStart(2, "0"), sky: theme.sky, hills: theme.hills, sun: theme.sun, queue, pigs: levelPigs, blocks };
    }
    while (levels.length < 100) levels.push(makeLevel(levels.length));
    const game = { started: false, running: false, level: 0, selected: 0, score: 0, best: loadBest(), combo: 0, comboAt: 0, dragging: false, power: 0, queue: [], current: null, active: [], pigs: [], blocks: [], particles: [], rings: [], hazards: [], beams: [], burns: [], eggs: [], clouds: clouds(), status: "点击开始游戏", nextTimer: null, lvlTimer: null };

    function loadBest() { try { return Number(localStorage.getItem(bestKey) || 0); } catch (e) { return 0; } }
    function saveBest() { try { localStorage.setItem(bestKey, String(game.best)); } catch (e) {} }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
    function clouds() { return [{x:110,y:84,s:1.05,v:.16},{x:360,y:134,s:.82,v:.22},{x:646,y:88,s:1.18,v:.12},{x:892,y:154,s:.74,v:.2}]; }
    function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; }
    function norm(x, y) { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; }
    function rot(x, y, a) { return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) }; }
    function pointToSegment(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy; const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)); const qx = x1 + t * dx, qy = y1 + t * dy; return Math.hypot(px - qx, py - qy); }
    function setStatus(t) { game.status = t; if (ui.status) ui.status.textContent = t; }
    function setPower(v) { game.power = clamp(v, 0, 100); if (ui.power) ui.power.textContent = Math.round(game.power) + "%"; if (ui.powerFill) ui.powerFill.style.width = game.power + "%"; }
    function canUseSkill() { return !!(game.current && game.current.launched && game.current.skillReady && !game.current.resolved && game.running); }
    function remain() { return game.queue.length + (game.current && !game.current.launched && !game.current.resolved ? 1 : 0); }
    function ring(x, y, max, color, width, life) { game.rings.push({ x, y, r: 6, max, color, width, life }); }
    function emit(x, y, color, count, speed) { for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2; const s = .4 + Math.random() * (speed || 4.5); game.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 20 + Math.random() * 22, max: 42, size: 2 + Math.random() * 3, color }); } }
    function flash(color, life) { game.flash = { color, life: life || 16, max: life || 16 }; }
    function shockwave(x, y, r, damage, type) { area(x, y, r, damage, type); game.blocks.forEach(b => { if (!b.alive) return; const cx = b.x + b.w / 2, cy = b.y + b.h / 2, d = dist(x, y, cx, cy); if (d >= r || d < 1) return; const k = 1 - d / r, nx = (cx - x) / d, ny = (cy - y) / d; b.x += nx * k * (type === "shock" ? 12 : 6); b.y += ny * k * (type === "shock" ? 8 : 4); }); game.pigs.forEach(p => { if (!p.alive) return; const d = dist(x, y, p.x, p.y); if (d >= r || d < 1) return; const k = 1 - d / r, nx = (p.x - x) / d, ny = (p.y - y) / d; p.x += nx * k * (type === "shock" ? 14 : 6); p.y += ny * k * (type === "shock" ? 9 : 4); }); }
    function mkBlock(b, i) { const m = materials[b[4]]; return { id: i, x: b[0], y: b[1], w: b[2], h: b[3], mat: b[4], hp: m.hp, max: m.hp, alive: true, cd: 0, frozen: 0, pulse: 0, vx: 0, vy: 0, airborne: false, rotation: 0, lift: 0 }; }
    function mkPig(p, i) { const t = pigs[p[2]]; return { id: i, x: p[0], y: p[1], type: p[2], r: t.r, hp: t.hp, max: t.hp, alive: true, cd: 0, frozen: 0, pulse: Math.random() * 3.14, vx: 0, vy: 0, airborne: false, lift: 0 }; }
    function mkBird(id, clone) { const s = birds[id]; return { id, clone: !!clone, name: s.name, skillName: s.skillName, skill: s.skill, c: s.c, r: clone ? Math.max(12, s.r - 2) : s.r, mass: clone ? s.mass * 0.86 : s.mass, g: s.g, ls: s.ls, block: clone ? s.block * 0.98 : s.block, pig: clone ? s.pig * 1.0 : s.pig, x: forkX, y: forkY, vx: 0, vy: 0, launched: false, resolved: false, skillReady: !clone, skillUsed: false, precision: 1, aura: 1, glow: 0, sleep: 0, trail: [] }; }
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
        const canSkill = canUseSkill();
        if (ui.skill) ui.skill.disabled = !canSkill;
        if (ui.stageSkill) ui.stageSkill.disabled = !canSkill;
        if (ui.levelSelect) ui.levelSelect.value = String(game.selected);
        if (ui.roster) {
            const cards = [];
            if (game.current) cards.push(card(game.current.id, game.current.name, game.current.resolved ? "已出战" : (game.current.launched ? "飞行中" : "已装填"), true));
            game.queue.forEach((id, i) => cards.push(card(id, birds[id].name, i ? "排队" : "待命", false)));
            ui.roster.innerHTML = cards.length ? cards.join("") : '<div class="roster-empty">点击开始游戏装填鸟群</div>';
        }
    }
    function card(id, name, st, active) { const c = birds[id].c; return '<div class="roster-item' + (active ? ' active' : '') + '"><div class="roster-badge" style="background:' + c.body + ';box-shadow:0 0 0 4px ' + c.aura + ';"></div><div class="roster-copy"><strong>' + name + '</strong><span>' + st + ' · ' + birds[id].skillName + '</span></div></div>'; }
    function clearTimers() { if (game.nextTimer) clearTimeout(game.nextTimer); if (game.lvlTimer) clearTimeout(game.lvlTimer); game.nextTimer = null; game.lvlTimer = null; }
    function spawnNext(silent) { const id = game.queue.shift(); game.current = id ? mkBird(id, false) : null; game.active = game.current ? [game.current] : []; setPower(0); if (id && !silent) audio.playBirdReady(); updateUI(); return !!id; }
    function buildLevel(i) { clearTimers(); game.level = clamp(i, 0, levels.length - 1); game.selected = game.level; game.dragging = false; game.queue = levels[game.level].queue.slice(); game.blocks = levels[game.level].blocks.map(mkBlock); game.pigs = levels[game.level].pigs.map(mkPig); game.particles = []; game.rings = []; game.hazards = []; game.beams = []; game.burns = []; game.eggs = []; game.flash = null; game.clouds = clouds(); audio.setTheme(game.level); spawnNext(); setStatus("第" + (game.level + 1) + "关：拖动弹弓发射"); }
    function previewLevel(i) { clearTimers(); game.level = clamp(i, 0, levels.length - 1); game.selected = game.level; game.started = false; game.running = false; game.dragging = false; game.combo = 0; game.queue = levels[game.level].queue.slice(); game.blocks = levels[game.level].blocks.map(mkBlock); game.pigs = levels[game.level].pigs.map(mkPig); game.particles = []; game.rings = []; game.hazards = []; game.beams = []; game.burns = []; game.eggs = []; game.flash = null; game.clouds = clouds(); game.current = null; game.active = []; spawnNext(true); setPower(0); setStatus("预览第" + (game.level + 1) + "关，点击开始本关"); updateUI(); }
    function start() { audio.playButton(); startLevel(game.selected || 0, true); }
    function startLevel(i, clearScore) { audio.resume(); audio.playLevelStart(i); game.started = true; game.running = true; if (clearScore) { game.score = 0; game.combo = 0; } buildLevel(i); updateUI(); }
    function reset() { audio.playButton(); startLevel(game.level, true); }
    function begin(e) { if (e.cancelable) e.preventDefault(); if (canUseSkill()) { skill(); return; } if (!game.running || !game.current || game.current.launched) return; audio.resume(); const p = pos(e); if (e.pointerType === "touch" || dist(p.x, p.y, game.current.x, game.current.y) <= game.current.r + 42) { game.dragging = true; drag(e); setStatus("瞄准中，松手发射 " + game.current.name); } }
    function drag(e) { if (!game.dragging || !game.current) return; if (e.cancelable) e.preventDefault(); const p = pos(e), dx = p.x - forkX, dy = p.y - forkY, d = Math.hypot(dx, dy), l = Math.min(d, sling.pull), r = d ? l / d : 0; game.current.x = forkX + dx * r; game.current.y = forkY + dy * r; setPower(l / sling.pull * 100); audio.playAim(game.power); updateUI(); }
    function release() { if (!game.dragging || !game.current) return; game.dragging = false; const lx = forkX - game.current.x, ly = forkY - game.current.y, p = Math.hypot(lx, ly); if (p < 10) { game.current.x = forkX; game.current.y = forkY; setPower(0); setStatus("拖动弹弓发射 " + game.current.name); return; } game.current.launched = true; game.current.vx = lx * game.current.ls; game.current.vy = ly * game.current.ls; audio.playLaunch(game.power); setStatus("飞行中：空格或按钮释放技能"); updateUI(); }
    function area(x, y, r, damage, type) { game.blocks.forEach(b => { if (!b.alive) return; const cx = b.x + b.w / 2, cy = b.y + b.h / 2, k = 1 - dist(x, y, cx, cy) / r; if (k <= 0) return; if (type === "frost") b.frozen = Math.max(b.frozen, 220 * k + 60); b.cd = 0; hitBlock(b, damage * (0.55 + k * 0.85) * (type === "shock" ? 1.9 : 1.25), true); emit(cx, cy, type === "frost" ? "#a5f3fc" : "#fcd34d", 10 + Math.round(14 * k), 5.4); }); game.pigs.forEach(p => { if (!p.alive) return; const k = 1 - dist(x, y, p.x, p.y) / r; if (k <= 0) return; if (type === "frost") p.frozen = Math.max(p.frozen, 240 * k + 60); p.cd = 0; hitPig(p, damage * (0.6 + k * 0.9) * (type === "shock" ? 1.7 : 1.1)); }); }
    function skill() {
        const b = game.current;
        if (!game.running || !b || !b.launched || !b.skillReady || b.resolved) return;
        b.skillReady = false; b.skillUsed = true; b.glow = 28;
        const sp = Math.hypot(b.vx, b.vy), d = sp > 0.5 ? norm(b.vx, b.vy) : { x: 1, y: -0.15 };
        setStatus(b.name + " 发动 " + b.skillName);
        switch (b.skill) {
        case "dash": {
            const boost = Math.max(sp * 1.42, 26);
            b.vx = d.x * boost; b.vy = d.y * boost - 1.2;
            b.aura = 1.35; b.precision = 1.2; b.mass *= 1.1;
            emit(b.x, b.y, b.c.trail, 24, 5.4); ring(b.x, b.y, 86, b.c.aura, 4, 18);
            flash(b.c.aura, 7); audio.playSkill("dash");
            break;
        }
        case "pierce": {
            const boost = Math.max(sp * 1.55, 30);
            b.vx = d.x * boost; b.vy = d.y * boost - 0.4;
            b.precision = 1.95; b.aura = 1.22;
            emit(b.x, b.y, b.c.trail, 22, 5.8); ring(b.x, b.y, 96, b.c.aura, 3, 20);
            flash(b.c.aura, 7); audio.playSkill("pierce");
            break;
        }
        case "split": {
            [-0.3, 0.3].forEach((ang, i) => {
                const v = rot(b.vx, b.vy, ang), c = mkBird(b.id, true);
                c.x = b.x + (i ? 6 : -6); c.y = b.y - 2; c.launched = true;
                c.vx = v.x * 1.0; c.vy = v.y * 1.0; c.aura = 1.12; c.precision = 1.08;
                game.active.push(c);
            });
            b.aura = 1.08; b.precision = 1.05; b.vy -= 0.5;
            emit(b.x, b.y, b.c.trail, 22, 5); ring(b.x, b.y, 82, b.c.aura, 3, 20);
            flash(b.c.aura, 6); audio.playSkill("split");
            break;
        }
        case "shock": {
            const R = 128;
            emit(b.x, b.y, "#fde68a", 54, 8.4); emit(b.x, b.y, "#ef4444", 22, 4.2);
            ring(b.x, b.y, R + 16, "rgba(251,191,36,.62)", 8, 28);
            ring(b.x, b.y, Math.max(24, R - 38), "rgba(248,113,113,.58)", 6, 22);
            flash("rgba(253,224,71,.5)", 18);
            game.blocks.filter(k => k.alive && dist(b.x, b.y, k.x + k.w / 2, k.y + k.h / 2) <= R).forEach(k => { emit(k.x + k.w / 2, k.y + k.h / 2, materials[k.mat].fx, 14, 3.6); ring(k.x + k.w / 2, k.y + k.h / 2, 42, materials[k.mat].fx, 2, 10); hitBlock(k, 999, true); });
            game.pigs.filter(p => p.alive && dist(b.x, b.y, p.x, p.y) <= R).forEach(p => { emit(p.x, p.y, "#86efac", 16, 4); hitPig(p, 999); });
            audio.playSkill("shock"); resolve(b);
            break;
        }
        case "frost": {
            const R = 130;
            emit(b.x, b.y, "#a5f3fc", 38, 6); emit(b.x, b.y, "#ffffff", 16, 3.2);
            ring(b.x, b.y, R + 8, "rgba(103,232,249,.58)", 6, 26);
            ring(b.x, b.y, Math.max(30, R - 42), "rgba(224,242,254,.58)", 4, 22);
            shockwave(b.x, b.y, R, 2, "frost");
            flash("rgba(186,230,253,.42)", 16);
            audio.playSkill("frost"); resolve(b);
            break;
        }
        case "boomerang": {
            b.boomerangTimer = 16; b.aura = 1.3; b.precision = 1.5; b.mass *= 1.08;
            const boomerangBoost = Math.max(sp * 1.1, 18);
            b.vx = d.x * boomerangBoost * 0.9; b.vy = d.y * boomerangBoost * 0.9;
            emit(b.x, b.y, b.c.trail, 20, 4.5); ring(b.x, b.y, 58, b.c.aura, 3, 14);
            flash(b.c.aura, 6); audio.playSkill("boomerang");
            break;
        }
        case "teleport": {
            emit(b.x, b.y, b.c.trail, 24, 4.5); ring(b.x, b.y, 56, b.c.aura, 3, 14);
            const tx = clamp(b.x + d.x * 110, 30, canvas.width - 30);
            const ty = clamp(b.y + d.y * 110, 30, ground - b.r - 4);
            b.x = tx; b.y = ty;
            emit(tx, ty, b.c.trail, 24, 5); ring(tx, ty, 56, b.c.aura, 3, 16);
            b.aura = 1.3; b.precision = 1.7;
            flash(b.c.aura, 8); audio.playSkill("teleport");
            break;
        }
        case "egg_drop": {
            const ex = b.x, ey = b.y + 4;
            emit(ex, ey, "#fef3c7", 22, 3.5); ring(ex, ey, 50, "rgba(251,191,36,.62)", 4, 14);
            area(ex, ey, 42, 2.5, null);
            flash(b.c.aura, 8); audio.playSkill("egg_drop");
            break;
        }
        case "inflate": {
            b.r = Math.min(b.r * 1.6, 32);
            b.mass *= 1.6; b.block *= 1.5; b.pig *= 1.5;
            b.aura = 1.35; b.precision = 1.2;
            emit(b.x, b.y, b.c.trail, 26, 4.5); ring(b.x, b.y, 68, b.c.aura, 4, 16);
            flash(b.c.aura, 8); audio.playSkill("inflate");
            break;
        }
        case "heal": {
            const pool = birdKeys.filter(id => id !== "pink");
            const gift = pool[Math.floor(Math.random() * pool.length)];
            game.queue.unshift(gift);
            b.aura = 1.25; b.precision = 1.4; b.mass *= 1.3;
            const healBoost = Math.max(sp * 1.2, 22);
            b.vx = d.x * healBoost; b.vy = d.y * healBoost - 2;
            emit(b.x, b.y, "#fbcfe8", 28, 4); ring(b.x, b.y, 56, b.c.aura, 3, 14);
            flash("rgba(252,231,243,.55)", 8);
            setStatus(b.name + " 召唤 " + birds[gift].name + " 归队");
            audio.playSkill("heal");
            break;
        }
        case "shield": {
            b.precision = 2.8; b.aura = 1.5; b.mass *= 1.4; b.shield = 1;
            const shieldBoost = Math.max(sp * 1.05, 16);
            b.vx = d.x * shieldBoost; b.vy = d.y * shieldBoost;
            emit(b.x, b.y, b.c.trail, 24, 4); ring(b.x, b.y, 52, b.c.aura, 4, 14);
            flash(b.c.aura, 7); audio.playSkill("shield");
            break;
        }
        case "chain_lightning": {
            const R = 140;
            const nodes = [];
            game.pigs.forEach(p => { if (p.alive && dist(b.x, b.y, p.x, p.y) < R) nodes.push({ x: p.x, y: p.y, dd: dist(b.x, b.y, p.x, p.y), pig: p }); });
            game.blocks.forEach(k => { if (k.alive && dist(b.x, b.y, k.x + k.w / 2, k.y + k.h / 2) < R) nodes.push({ x: k.x + k.w / 2, y: k.y + k.h / 2, dd: dist(b.x, b.y, k.x + k.w / 2, k.y + k.h / 2), block: k }); });
            nodes.sort((a, e) => a.dd - e.dd);
            let prev = { x: b.x, y: b.y };
            nodes.slice(0, 3).forEach(t => {
                game.beams.push({ fromX: prev.x, fromY: prev.y, toX: t.x, toY: t.y, color: "rgba(191,219,254,.95)", life: 16, max: 16, width: 3 });
                emit(t.x, t.y, "#dbeafe", 12, 3);
                if (t.pig) hitPig(t.pig, 3.5);
                if (t.block) hitBlock(t.block, 3.8, false);
                prev = t;
            });
            flash("rgba(191,219,254,.42)", 9); audio.playSkill("chain_lightning"); resolve(b);
            break;
        }
        case "grapple": {
            const R = 90;
            game.blocks.forEach(k => {
                if (!k.alive) return;
                const cx = k.x + k.w / 2, cy = k.y + k.h / 2, dd = dist(b.x, b.y, cx, cy);
                if (dd > R || dd < 1) return;
                k.airborne = true; k.lift = 6;
                k.vx = (b.x - cx) / dd * 4; k.vy = (b.y - cy) / dd * 4 - 1;
                k.rotation = (Math.random() - 0.5) * 0.25;
                hitBlock(k, 2.2, false);
            });
            game.pigs.forEach(p => {
                if (!p.alive) return;
                const dd = dist(b.x, b.y, p.x, p.y);
                if (dd > R || dd < 1) return;
                p.airborne = true; p.lift = 6;
                p.vx = (b.x - p.x) / dd * 4; p.vy = (b.y - p.y) / dd * 4 - 1;
                hitPig(p, 2.5);
            });
            emit(b.x, b.y, b.c.trail, 24, 4.2); ring(b.x, b.y, R, b.c.aura, 3, 16);
            flash(b.c.aura, 8); audio.playSkill("grapple");
            break;
        }
        case "sandstorm": {
            game.hazards.push({ x: b.x, y: ground - 35, r: 56, type: "sand", life: 90, max: 90, tick: 0, everyN: 8, damage: 0.5 });
            emit(b.x, ground - 18, "#fde68a", 32, 3.8); ring(b.x, ground - 18, 60, "rgba(217,119,6,.58)", 4, 16);
            flash("rgba(253,230,138,.38)", 8); audio.playSkill("sandstorm"); resolve(b);
            break;
        }
        case "phase": {
            b.ghost = true; b.pig *= 2.5; b.aura = 1.5; b.precision = 2.5;
            const phaseBoost = Math.max(sp * 1.3, 24);
            b.vx = d.x * phaseBoost; b.vy = d.y * phaseBoost - 1.5;
            emit(b.x, b.y, b.c.trail, 22, 4.5); ring(b.x, b.y, 52, b.c.aura, 3, 14);
            flash(b.c.aura, 7); audio.playSkill("phase");
            break;
        }
        case "laser": {
            const L = 420;
            const ex = b.x + d.x * L, ey = b.y + d.y * L;
            game.beams.push({ fromX: b.x, fromY: b.y, toX: ex, toY: ey, color: "rgba(253,224,71,.95)", life: 20, max: 20, width: 6 });
            game.blocks.forEach(k => { if (!k.alive) return; const cx = k.x + k.w / 2, cy = k.y + k.h / 2; if (pointToSegment(cx, cy, b.x, b.y, ex, ey) < Math.max(k.w, k.h) / 2 + 3) { hitBlock(k, 6, false); emit(cx, cy, materials[k.mat].fx, 8, 2.8); } });
            game.pigs.forEach(p => { if (!p.alive) return; if (pointToSegment(p.x, p.y, b.x, b.y, ex, ey) < p.r + 4) { hitPig(p, 5.8); emit(p.x, p.y, "#fde68a", 10, 3); } });
            flash("rgba(253,224,71,.55)", 14); audio.playSkill("laser"); resolve(b);
            break;
        }
        case "gravity_reverse": {
            b.gOrig = b.g; b.g = -Math.abs(b.g) * 0.8; b.antigravity = 36;
            b.aura = 1.3; b.precision = 1.5; b.mass *= 0.85;
            emit(b.x, b.y, b.c.trail, 22, 4); ring(b.x, b.y, 54, b.c.aura, 3, 16);
            flash(b.c.aura, 8); audio.playSkill("gravity_reverse");
            break;
        }
        case "shatter": {
            for (let i = 0; i < 4; i++) {
                const ang = (i - 1.5) * 0.35;
                const base = sp > 0.5 ? { x: b.vx, y: b.vy } : { x: d.x * 10, y: d.y * 10 };
                const v = rot(base.x, base.y, ang);
                const c = mkBird(b.id, true);
                c.x = b.x + (i - 1.5) * 4; c.y = b.y - 2; c.launched = true; c.r = Math.max(10, b.r - 3);
                c.vx = v.x * 1.1; c.vy = v.y * 1.1; c.aura = 1.15; c.precision = 1.3;
                game.active.push(c);
            }
            b.aura = 1.1; b.r = Math.max(11, b.r - 2); b.vy -= 0.5;
            emit(b.x, b.y, b.c.trail, 32, 5); ring(b.x, b.y, 64, b.c.aura, 3, 16);
            flash(b.c.aura, 9); audio.playSkill("shatter");
            break;
        }
        case "homing": {
            b.homing = 36; b.aura = 1.4; b.precision = 1.5; b.mass *= 1.15;
            const boost = Math.max(sp * 1.25, 24);
            b.vx = d.x * boost; b.vy = d.y * boost;
            emit(b.x, b.y, b.c.trail, 24, 5); ring(b.x, b.y, 56, b.c.aura, 3, 16);
            flash(b.c.aura, 7); audio.playSkill("homing");
            break;
        }
        case "magnet": {
            const R = 86;
            game.blocks.forEach(k => {
                if (!k.alive) return;
                const cx = k.x + k.w / 2, cy = k.y + k.h / 2, dd = dist(b.x, b.y, cx, cy);
                if (dd > R || dd < 3) return;
                k.airborne = true; k.lift = 5;
                const strength = (1 - dd / R) * 6;
                k.vx = (b.x - cx) / dd * strength; k.vy = (b.y - cy) / dd * strength;
                hitBlock(k, 1.8, false);
            });
            game.pigs.forEach(p => {
                if (!p.alive) return;
                const dd = dist(b.x, b.y, p.x, p.y);
                if (dd > R || dd < 3) return;
                p.airborne = true; p.lift = 5;
                const strength = (1 - dd / R) * 6;
                p.vx = (b.x - p.x) / dd * strength; p.vy = (b.y - p.y) / dd * strength;
                hitPig(p, 2);
            });
            emit(b.x, b.y, b.c.trail, 24, 4); ring(b.x, b.y, R, b.c.aura, 4, 16);
            flash(b.c.aura, 8); audio.playSkill("magnet");
            break;
        }
        case "toxic_cloud": {
            game.hazards.push({ x: b.x, y: b.y, r: 52, type: "toxic", life: 100, max: 100, tick: 0, everyN: 6, damage: 0.65 });
            emit(b.x, b.y, "#bef264", 28, 3.5); ring(b.x, b.y, 58, "rgba(101,163,13,.58)", 4, 14);
            flash("rgba(190,242,100,.42)", 10); audio.playSkill("toxic_cloud"); resolve(b);
            break;
        }
        case "lift": {
            const R = 82;
            emit(b.x, b.y, b.c.trail, 32, 4.5); emit(b.x, b.y, "#ffffff", 18, 2.8);
            ring(b.x, b.y, R + 6, b.c.aura, 5, 20); ring(b.x, b.y, Math.max(24, R - 30), "rgba(255,255,255,.5)", 3, 16);
            flash(b.c.aura, 10);
            game.blocks.forEach(k => {
                if (!k.alive) return;
                const cx = k.x + k.w / 2, cy = k.y + k.h / 2, dd = dist(b.x, b.y, cx, cy);
                if (dd > R) return;
                const ratio = 1 - dd / R;
                k.airborne = true; k.lift = 18 + 8 * ratio;
                k.vx = ((cx - b.x) / Math.max(dd, 1)) * (1.2 + ratio * 1.2);
                k.vy = -4 - ratio * 1.5 - Math.random() * 0.6;
                k.rotation = (Math.random() - 0.5) * 0.15;
                hitBlock(k, 1.5, false);
            });
            game.pigs.forEach(p => {
                if (!p.alive) return;
                const dd = dist(b.x, b.y, p.x, p.y);
                if (dd > R) return;
                const ratio = 1 - dd / R;
                p.airborne = true; p.lift = 20 + 8 * ratio;
                p.vx = ((p.x - b.x) / Math.max(dd, 1)) * (1.1 + ratio * 1.1);
                p.vy = -4.5 - ratio * 1.8 - Math.random() * 0.6;
                hitPig(p, 1.8);
            });
            audio.playSkill("lift"); resolve(b);
            break;
        }
        case "burn": {
            b.burnLeft = 42; b.aura = 1.25; b.precision = 1.4;
            const burnBoost = Math.max(sp * 1.15, 20);
            b.vx = d.x * burnBoost; b.vy = d.y * burnBoost;
            emit(b.x, b.y, "#f97316", 26, 4.5); ring(b.x, b.y, 52, "rgba(249,115,22,.6)", 3, 14);
            flash("rgba(249,115,22,.4)", 7); audio.playSkill("burn");
            break;
        }
        case "sonic_boom": {
            const R = 100, coneDot = 0.45;
            emit(b.x, b.y, b.c.trail, 28, 5); ring(b.x, b.y, 64, b.c.aura, 4, 16);
            game.blocks.forEach(k => {
                if (!k.alive) return;
                const cx = k.x + k.w / 2, cy = k.y + k.h / 2, dd = dist(b.x, b.y, cx, cy);
                if (dd > R || dd < 2) return;
                const nx = (cx - b.x) / dd, ny = (cy - b.y) / dd;
                const dot = nx * d.x + ny * d.y;
                if (dot < coneDot) return;
                hitBlock(k, 3.2 * dot * (1 - dd / R * 0.5), false);
                k.airborne = true; k.lift = 3; k.vx = nx * 3; k.vy = ny * 3 - 0.8;
            });
            game.pigs.forEach(p => {
                if (!p.alive) return;
                const dd = dist(b.x, b.y, p.x, p.y);
                if (dd > R || dd < 2) return;
                const nx = (p.x - b.x) / dd, ny = (p.y - b.y) / dd;
                const dot = nx * d.x + ny * d.y;
                if (dot < coneDot) return;
                hitPig(p, 3.5 * dot * (1 - dd / R * 0.5));
                p.airborne = true; p.lift = 3; p.vx = nx * 3; p.vy = ny * 3 - 0.8;
            });
            flash(b.c.aura, 9); audio.playSkill("sonic_boom");
            break;
        }
        case "ghost_dive": {
            b.ghost = true; b.pig *= 3.2; b.aura = 1.5; b.precision = 2.8;
            const boost = Math.max(sp * 1.3, 24);
            b.vx = d.x * boost * 0.7; b.vy = Math.abs(d.y) * boost + 5;
            emit(b.x, b.y, b.c.trail, 26, 5); ring(b.x, b.y, 58, b.c.aura, 4, 18);
            flash(b.c.aura, 9); audio.playSkill("ghost_dive");
            break;
        }
        }
        updateUI();
    }
    function hitBlock(b, dmg, silent) { if (!b.alive || dmg <= 0) return; b.hp -= dmg * (b.frozen > 0 ? 1.4 : 1); b.pulse = 10; if (!silent) game.score += 14; if (b.hp <= 0) { b.alive = false; game.score += materials[b.mat].score; emit(b.x + b.w / 2, b.y + b.h / 2, materials[b.mat].fx, b.mat === "glass" ? 24 : 18, b.mat === "stone" ? 3.4 : 4.6); ring(b.x + b.w / 2, b.y + b.h / 2, 60, materials[b.mat].fx, 3, 14); audio.playDestroy(b.mat); game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, b.x + b.w / 2, b.y + b.h / 2) < 110) hitPig(p, 1.2); }); game.blocks.forEach(o => { if (!o.alive || o === b) return; const ox = o.x + o.w / 2, oy = o.y + o.h / 2, cx = b.x + b.w / 2, cy = b.y + b.h / 2; const d = dist(ox, oy, cx, cy); if (d < 72) hitBlock(o, 0.4 * (1 - d / 72), true); if (!o.airborne) { const overlap = Math.max(0, Math.min(o.x + o.w, b.x + b.w) - Math.max(o.x, b.x)); const verticalGap = b.y - (o.y + o.h); if (overlap > 3 && verticalGap >= -4 && verticalGap <= 10) { o.airborne = true; o.vx = (Math.random() - 0.5) * 0.8; o.vy = 0.3; o.rotation = (Math.random() - 0.5) * 0.06; } } }); } updateUI(); }
    function hitPig(p, dmg) { if (!p.alive || dmg <= 0) return; p.hp -= dmg * (p.frozen > 0 ? 1.28 : 1); p.cd = 8; audio.playPigHit(dmg); if (p.hp <= 0) { p.alive = false; const now = performance.now(); game.combo = now - game.comboAt < 1300 ? game.combo + 1 : 1; game.comboAt = now; game.score += pigs[p.type].score + Math.max(0, game.combo - 1) * 35; emit(p.x, p.y, "#86efac", 18, 4.2); audio.playPig(); if (game.combo > 1) audio.playCombo(game.combo); if (game.pigs.every(t => !t.alive)) completeLevel(); } updateUI(); }
    function collision(bird, block) { const cx = clamp(bird.x, block.x, block.x + block.w), cy = clamp(bird.y, block.y, block.y + block.h); let dx = bird.x - cx, dy = bird.y - cy, d = Math.hypot(dx, dy); if (d < bird.r) { if (!d) { dx = bird.x < block.x + block.w / 2 ? -1 : 1; dy = 0; d = 1; } return { x: cx, y: cy, nx: dx / d, ny: dy / d, overlap: bird.r - d }; } return null; }
    function blockDamage(bird, mat) { return Math.hypot(bird.vx, bird.vy) * bird.mass * bird.block * bird.aura * bird.precision / ((mat === "stone" ? 2.6 : mat === "glass" ? 1.05 : 1.7) * 5.6); }
    function pigDamage(bird) { return Math.hypot(bird.vx, bird.vy) * bird.mass * bird.pig * bird.aura / 3.3; }
    function resolve(b) { b.resolved = true; b.launched = false; b.vx = 0; b.vy = 0; }
    function nextBird() { if (game.nextTimer || !game.running) return; setStatus("下一只小鸟装填中"); game.nextTimer = setTimeout(() => { game.nextTimer = null; if (!game.running) return; if (spawnNext()) setStatus("拖动弹弓发射 " + game.current.name); else finish(false); updateUI(); }, 760); }
    function completeLevel() { clearTimers(); game.running = false; const bonus = remain() * 60; game.score += bonus; setStatus("第" + (game.level + 1) + "关完成，奖励 " + bonus + " 分"); emit(780, 220, "#fde68a", 40, 6); audio.playWin(); updateUI(); game.lvlTimer = setTimeout(() => { game.lvlTimer = null; if (game.level < levels.length - 1) { startLevel(game.level + 1, false); } else finish(true); }, 1500); }
    function finish(win) { clearTimers(); game.running = false; setPower(0); if (win) { setStatus("战役通关！点击重新开始再来一局"); emit(790, 240, "#fde68a", 48, 6.5); audio.playWin(); } else { game.current = null; game.active = []; setStatus("小鸟已用尽，点击重新开始重试"); audio.playLose(); } if (game.score > game.best) { game.best = game.score; saveBest(); } updateUI(); }
    function update(dt) {
        game.clouds.forEach(c => { c.x += c.v * dt; if (c.x - c.s * 120 > canvas.width) c.x = -140; });
        game.blocks.forEach(b => {
            b.cd = Math.max(0, b.cd - dt); b.frozen = Math.max(0, b.frozen - dt); b.pulse = Math.max(0, b.pulse - dt);
            if (!b.alive || !b.airborne) return;
            const buoyant = b.lift > 0 ? 0.22 : 0.36;
            b.vy += buoyant * dt;
            b.x += b.vx * dt; b.y += b.vy * dt;
            b.rotation += b.vx * 0.018 * dt;
            if (b.lift > 0) b.lift = Math.max(0, b.lift - dt);
            if (b.x < 6) { b.x = 6; b.vx *= -0.4; }
            if (b.x + b.w > canvas.width - 6) { b.x = canvas.width - 6 - b.w; b.vx *= -0.4; }
            if (b.vy > 0) {
                for (let oi = 0; oi < game.blocks.length; oi++) {
                    const o = game.blocks[oi];
                    if (!o.alive || o === b || o.airborne) continue;
                    const hO = Math.max(0, Math.min(o.x + o.w, b.x + b.w) - Math.max(o.x, b.x));
                    if (hO < 4) continue;
                    const bottomPrev = b.y + b.h - b.vy * dt;
                    if (b.y + b.h >= o.y && bottomPrev <= o.y + 3) {
                        b.y = o.y - b.h;
                        const sp2 = Math.abs(b.vy);
                        b.vy *= -0.18; b.vx *= 0.6;
                        if (sp2 > 2.2) { hitBlock(o, Math.min(sp2 * 0.22, 1.1), true); audio.playImpact(sp2, o.mat); }
                        if (Math.abs(b.vy) < 0.7) { b.airborne = false; b.vx = 0; b.vy = 0; b.rotation *= 0.4; }
                        break;
                    }
                }
            }
            if (b.y + b.h >= ground) {
                b.y = ground - b.h;
                const sp = Math.abs(b.vy);
                b.vy *= -0.22; b.vx *= 0.55;
                if (sp > 3) {
                    emit(b.x + b.w / 2, b.y + b.h, "rgba(255,255,255,.55)", 10, 3.2);
                    audio.playImpact(sp, b.mat);
                    hitBlock(b, Math.min(sp * 0.22, 1.1), true);
                    game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, b.x + b.w / 2, b.y + b.h) < 74) hitPig(p, Math.min(sp * 0.26, 1.1)); });
                }
                if (Math.abs(b.vy) < 0.8) { b.airborne = false; b.vx = 0; b.vy = 0; b.rotation *= 0.4; }
            }
        });
        game.pigs.forEach(p => {
            p.cd = Math.max(0, p.cd - dt); p.frozen = Math.max(0, p.frozen - dt); p.pulse += dt * .06;
            if (!p.alive || !p.airborne) return;
            const buoyant = p.lift > 0 ? 0.24 : 0.38;
            p.vy += buoyant * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.lift > 0) p.lift = Math.max(0, p.lift - dt);
            if (p.x - p.r < 6) { p.x = 6 + p.r; p.vx *= -0.4; }
            if (p.x + p.r > canvas.width - 6) { p.x = canvas.width - 6 - p.r; p.vx *= -0.4; }
            if (p.y + p.r >= ground) {
                p.y = ground - p.r;
                const sp = Math.abs(p.vy);
                p.vy *= -0.2; p.vx *= 0.5;
                if (sp > 3) { emit(p.x, ground, "#86efac", 10, 3); hitPig(p, Math.min(sp * 0.55, 2.4)); }
                if (Math.abs(p.vy) < 0.7) { p.airborne = false; p.vx = 0; p.vy = 0; }
            }
        });
        game.particles = game.particles.filter(p => (p.x += p.vx * dt, p.y += p.vy * dt, p.vy += .06 * dt, p.life -= dt, p.life > 0));
        game.rings = game.rings.filter(r => (r.life -= dt, r.r += (r.max - r.r) * .18 * dt, r.life > 0));
        game.beams = game.beams.filter(bm => (bm.life -= dt, bm.life > 0));
        game.hazards = game.hazards.filter(h => {
            h.life -= dt; h.tick = (h.tick || 0) + dt;
            if (h.tick >= h.everyN) {
                h.tick = 0;
                game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, h.x, h.y) < h.r) hitPig(p, h.damage); });
                if (h.type === "sand") game.blocks.forEach(k => { if (k.alive && dist(k.x + k.w / 2, k.y + k.h / 2, h.x, h.y) < h.r) hitBlock(k, h.damage * 0.5, true); });
            }
            if (Math.random() < 0.15) emit(h.x + (Math.random() - 0.5) * h.r * 1.2, h.y + (Math.random() - 0.5) * h.r * 0.9, h.type === "toxic" ? "#84cc16" : "#d97706", 2, 1.4);
            return h.life > 0;
        });
        game.burns = game.burns.filter(t => {
            t.life -= dt; t.tick = (t.tick || 0) + dt;
            if (t.tick >= 8) { t.tick = 0; game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, t.x, t.y) < 18) hitPig(p, 0.35); }); game.blocks.forEach(k => { if (k.alive && dist(k.x + k.w / 2, k.y + k.h / 2, t.x, t.y) < 22) hitBlock(k, 0.25, true); }); }
            return t.life > 0;
        });
        if (game.flash) { game.flash.life -= dt; if (game.flash.life <= 0) game.flash = null; }
        if (game.combo && performance.now() - game.comboAt > 1600) { game.combo = 0; updateUI(); }
        if (!game.running) return;
        game.active.forEach(b => {
            if (!b.launched || b.resolved) return;
            if (b.boomerangTimer > 0) { b.boomerangTimer -= dt; if (b.boomerangTimer <= 0) { b.vx = -b.vx * 1.25; b.vy = -Math.abs(b.vy) * 0.6 - 2.2; b.precision = Math.max(b.precision, 1.5); b.aura = Math.max(b.aura, 1.35); emit(b.x, b.y, b.c.trail, 20, 5); } }
            if (b.homing > 0) { b.homing -= dt; let best = null, bestD = Infinity; game.pigs.forEach(p => { if (!p.alive) return; const dd = dist(b.x, b.y, p.x, p.y); if (dd < bestD) { bestD = dd; best = p; } }); if (best) { const dx = best.x - b.x, dy = best.y - b.y, dd2 = Math.hypot(dx, dy) || 1, sp2 = Math.hypot(b.vx, b.vy) || 8; b.vx = b.vx * 0.78 + (dx / dd2) * sp2 * 0.22; b.vy = b.vy * 0.78 + (dy / dd2) * sp2 * 0.22; if (Math.random() < 0.4) emit(b.x - b.vx * 0.2, b.y - b.vy * 0.2, b.c.trail, 2, 2); } }
            if (b.antigravity > 0) { b.antigravity -= dt; if (b.antigravity <= 0 && b.gOrig) { b.g = b.gOrig; b.gOrig = null; } }
            if (b.burnLeft > 0 && b.launched) { b.burnLeft -= dt; if (Math.random() < 0.8) game.burns.push({ x: b.x + (Math.random() - 0.5) * 6, y: b.y + 3, life: 48, max: 48, tick: 0 }); }
            b.glow = Math.max(0, b.glow - dt); b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= Math.pow(.994, dt); b.vy *= Math.pow(.997, dt);
            b.trail.push({ x: b.x, y: b.y, life: 16, color: b.c.trail }); if (b.trail.length > 18) b.trail.shift(); b.trail.forEach(t => t.life -= dt); b.trail = b.trail.filter(t => t.life > 0);
            if (b.y + b.r > ground) { b.y = ground - b.r; if (Math.abs(b.vy) > 1.4) audio.playImpact(Math.abs(b.vy), "wood"); b.vy *= b.precision > 1.4 ? -.32 : -.46; b.vx *= .84; emit(b.x, ground, "rgba(255,255,255,.55)", 4, 2.2); }
            if (b.x + b.r > canvas.width - 8) { b.x = canvas.width - 8 - b.r; b.vx *= -.58; }
            if (b.x - b.r < 8) { b.x = 8 + b.r; b.vx *= -.52; }
            if (b.y - b.r < 10) { b.y = 10 + b.r; b.vy *= -.5; }
            let contacted = false;
            game.blocks.forEach(k => {
                if (!k.alive || k.cd > 0 || b.resolved || b.ghost) return;
                const h = collision(b, k); if (!h) return;
                const m = materials[k.mat];
                b.x += h.nx * h.overlap; b.y += h.ny * h.overlap;
                if (b.precision > 1.8) {
                    b.vx *= 0.9; b.vy *= 0.92;
                    k.cd = 14;
                } else {
                    const dot = b.vx * h.nx + b.vy * h.ny;
                    b.vx -= 1.64 * dot * h.nx; b.vy -= 1.64 * dot * h.ny;
                    b.vx *= m.bounce * (b.precision > 1.3 ? .96 : .84);
                    b.vy *= m.bounce * .92;
                    k.cd = 6;
                }
                hitBlock(k, blockDamage(b, k.mat), false);
                emit(h.x, h.y, m.fx, k.mat === "glass" ? 8 : 6, k.mat === "stone" ? 2.8 : 3.8);
                audio.playImpact(Math.hypot(b.vx, b.vy), k.mat);
                contacted = true;
            });
            game.pigs.forEach(p => {
                if (!p.alive || p.cd > 0 || b.resolved) return;
                if (dist(b.x, b.y, p.x, p.y) > b.r + p.r) return;
                hitPig(p, pigDamage(b));
                if (b.precision > 1.8) { b.vx *= 0.94; b.vy *= 0.94; } else { b.vx *= .78; b.vy *= .78; }
                emit(p.x, p.y, "#86efac", 12, 4);
                contacted = true;
            });
            if (contacted && !b.clone && b === game.current && b.skillReady && !b.skillUsed && !b.resolved && (b.skill === "shock" || b.skill === "frost" || b.skill === "lift")) skill();
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
    function drawBlock(b) { const m = materials[b.mat]; ctx.save(); if (b.frozen > 0) ctx.globalAlpha = .9; if (b.airborne && b.rotation) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(b.rotation); ctx.translate(-cx, -cy); } if (b.lift > 0) { ctx.shadowColor = "rgba(147,197,253,.8)"; ctx.shadowBlur = 14; } rounded(b.x, b.y, b.w, b.h, 6, m.fill); ctx.shadowBlur = 0; ctx.fillStyle = b.frozen > 0 ? "rgba(224,242,254,.34)" : "rgba(255,255,255,.12)"; ctx.fillRect(b.x + 5, b.y + 5, b.w - 10, 6); ctx.strokeStyle = m.line; ctx.lineWidth = 2 + b.pulse * .12; ctx.beginPath(); ctx.moveTo(b.x + 8, b.y + b.h * .3); ctx.lineTo(b.x + b.w - 8, b.y + b.h * .36); ctx.moveTo(b.x + b.w * .4, b.y + 8); ctx.lineTo(b.x + b.w * .5, b.y + b.h - 8); if (b.hp < b.max) { ctx.moveTo(b.x + b.w * .65, b.y + b.h * .2); ctx.lineTo(b.x + b.w * .3, b.y + b.h * .8); } ctx.stroke(); if (b.frozen > 0) { ctx.strokeStyle = "rgba(224,242,254,.8)"; ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4); } ctx.restore(); }
    function drawPig(p) { const t = pigs[p.type]; ctx.save(); if (p.frozen > 0) ctx.globalAlpha = .92; if (p.lift > 0) { ctx.shadowColor = "rgba(147,197,253,.85)"; ctx.shadowBlur = 16; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = t.body; ctx.fill(); ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(p.x - 8, p.y - p.r + 4, 6, 0, Math.PI * 2); ctx.arc(p.x + 8, p.y - p.r + 4, 6, 0, Math.PI * 2); ctx.fillStyle = "#65a30d"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x, p.y + 2, 10, 0, Math.PI * 2); ctx.fillStyle = "#bef264"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x - 4, p.y + 2, 1.8, 0, Math.PI * 2); ctx.arc(p.x + 4, p.y + 2, 1.8, 0, Math.PI * 2); ctx.fillStyle = "#365314"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x - 5, p.y - 5, 2.4, 0, Math.PI * 2); ctx.arc(p.x + 5, p.y - 5, 2.4, 0, Math.PI * 2); ctx.fillStyle = "#111827"; ctx.fill(); if (t.hat) { ctx.fillStyle = t.hat; ctx.beginPath(); ctx.arc(p.x, p.y - p.r + 2 + Math.sin(p.pulse) * 1.2, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(p.x - 12, p.y - p.r - 1, 24, 5); } if (p.frozen > 0) { ctx.strokeStyle = "rgba(224,242,254,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2); ctx.stroke(); } ctx.restore(); }
    function drawBird(b) {
        b.trail.forEach(t => { ctx.globalAlpha = Math.max(t.life / 16, 0) * .38; ctx.beginPath(); ctx.arc(t.x, t.y, 6, 0, Math.PI * 2); ctx.fillStyle = t.color; ctx.fill(); });
        ctx.globalAlpha = b.ghost ? 0.55 : 1;
        if (b.glow > 0) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 10, 0, Math.PI * 2); ctx.fillStyle = b.c.aura; ctx.fill(); }
        const label = b.skillUsed ? "已用：" + b.skillName : b.skillName;
        ctx.save();
        ctx.font = "bold 12px Microsoft YaHei";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const w = Math.min(112, Math.max(58, ctx.measureText(label).width + 16));
        const lx = clamp(b.x - w / 2, 8, canvas.width - w - 8);
        const ly = clamp(b.y - b.r - 30, 18, canvas.height - 18);
        ctx.fillStyle = b.skillUsed ? "rgba(71,85,105,.82)" : "rgba(15,23,42,.82)";
        rounded(lx, ly - 10, w, 20, 10, ctx.fillStyle);
        ctx.fillStyle = b.skillReady && b.launched ? "#fde68a" : "#ffffff";
        ctx.fillText(label, lx + w / 2, ly);
        ctx.restore();
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = b.c.body; ctx.fill();
        ctx.beginPath(); ctx.arc(b.x - 5, b.y + 4, b.r * .48, 0, Math.PI); ctx.fillStyle = b.c.belly; ctx.fill();
        ctx.beginPath(); ctx.arc(b.x + 4, b.y - 4, 3.6, 0, Math.PI * 2); ctx.fillStyle = b.c.eye; ctx.fill();
        ctx.beginPath(); ctx.moveTo(b.x + b.r - 4, b.y + 1); ctx.lineTo(b.x + b.r + 10, b.y - 2); ctx.lineTo(b.x + b.r - 4, b.y - 8); ctx.closePath(); ctx.fillStyle = b.c.beak; ctx.fill();
        ctx.strokeStyle = b.id === "black" ? "#fde68a" : "#7f1d1d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x - 8, b.y - 10); ctx.lineTo(b.x + 10, b.y - 14); ctx.stroke();
        ctx.globalAlpha = 1;
    }
    function drawFx() { game.particles.forEach(p => { ctx.globalAlpha = Math.max(p.life / p.max, .1); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); }); game.rings.forEach(r => { ctx.globalAlpha = Math.max(r.life / 28, .15); ctx.strokeStyle = r.color; ctx.lineWidth = r.width; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); }); ctx.globalAlpha = 1; if (game.flash) { ctx.save(); ctx.globalAlpha = Math.max(0, game.flash.life / game.flash.max) * 0.85; ctx.fillStyle = game.flash.color; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore(); ctx.globalAlpha = 1; } }
    function drawHazards() { game.hazards.forEach(h => { ctx.save(); ctx.globalAlpha = Math.min(1, h.life / 40) * 0.5; ctx.fillStyle = h.type === "toxic" ? "rgba(101,163,13,.55)" : "rgba(217,119,6,.5)"; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill(); const n = 6, t = performance.now() * 0.002; for (let i = 0; i < n; i++) { const a = t + i / n * Math.PI * 2; const rx = h.x + Math.cos(a) * h.r * 0.7, ry = h.y + Math.sin(a) * h.r * 0.6; ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI * 2); ctx.fillStyle = h.type === "toxic" ? "#84cc16" : "#d97706"; ctx.fill(); } ctx.restore(); }); }
    function drawBeams() { game.beams.forEach(bm => { ctx.save(); ctx.globalAlpha = Math.max(0, bm.life / bm.max); ctx.strokeStyle = bm.color; ctx.lineWidth = bm.width; ctx.shadowColor = bm.color; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(bm.fromX, bm.fromY); ctx.lineTo(bm.toX, bm.toY); ctx.stroke(); ctx.restore(); }); }
    function drawBurns() { game.burns.forEach(t => { ctx.save(); ctx.globalAlpha = Math.max(0, t.life / t.max) * 0.78; ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.arc(t.x, t.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(254,215,170,.9)"; ctx.beginPath(); ctx.arc(t.x, t.y, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }); }
    function drawOverlay() { if (game.running || game.dragging) return; ctx.fillStyle = "rgba(15,23,42,.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 36px Microsoft YaHei"; ctx.fillText(game.status, canvas.width / 2, canvas.height / 2 - 10); ctx.font = "18px Microsoft YaHei"; ctx.fillText("拖动小鸟发射，空格或技能按钮触发专属技能", canvas.width / 2, canvas.height / 2 + 28); }
    function draw() { drawBg(); drawHazards(); drawBurns(); game.blocks.filter(b => b.alive).forEach(drawBlock); game.pigs.filter(p => p.alive).forEach(drawPig); drawSling(); game.active.forEach(drawBird); drawBeams(); drawFx(); drawOverlay(); }
    function renderLevelOptions() { if (!ui.levelSelect) return; ui.levelSelect.innerHTML = levels.map((lv, i) => '<option value="' + i + '">第' + (i + 1) + '关 · ' + lv.name + '</option>').join(""); ui.levelSelect.value = String(game.selected); }
    function renderBirdLibrary() { if (!ui.library) return; ui.library.innerHTML = birdKeys.map(id => { const b = birds[id], c = b.c; return '<article class="bird-chip" style="background:linear-gradient(135deg,' + c.body + ',' + c.trail + ');"><strong>' + b.name + '</strong><span>' + b.skillName + ' · ' + b.skill + '</span></article>'; }).join(""); }
    function startSelectedLevel() { audio.playButton(); startLevel(Number(ui.levelSelect ? ui.levelSelect.value : game.selected) || 0, true); }
    function toggleFullscreen() { audio.playButton(); const target = ui.stage || canvas; if (!document.fullscreenElement) { const request = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen; if (request) request.call(target); return; } const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen; if (exit) exit.call(document); }
    function syncFullscreenButton() { if (ui.fullscreen) ui.fullscreen.textContent = document.fullscreenElement ? "退出全屏" : "全屏模式"; }

    if (ui.start) ui.start.addEventListener("click", start);
    if (ui.reset) ui.reset.addEventListener("click", reset);
    if (ui.skill) ui.skill.addEventListener("click", () => { audio.playButton(); skill(); });
    if (ui.stageSkill) ui.stageSkill.addEventListener("click", () => { audio.playButton(); skill(); });
    if (ui.levelSelect) ui.levelSelect.addEventListener("change", () => { audio.playButton(); previewLevel(Number(ui.levelSelect.value) || 0); });
    if (ui.levelStart) ui.levelStart.addEventListener("click", startSelectedLevel);
    if (ui.fullscreen) ui.fullscreen.addEventListener("click", toggleFullscreen);
    if (ui.sound) ui.sound.addEventListener("click", () => { audio.resume(); const on = ui.sound.getAttribute("aria-pressed") !== "true"; ui.sound.setAttribute("aria-pressed", on ? "true" : "false"); ui.sound.textContent = on ? "音效/音乐：开" : "音效/音乐：关"; audio.setEnabled(on); if (on) audio.playButton(); });
    document.addEventListener("fullscreenchange", syncFullscreenButton);
    document.addEventListener("webkitfullscreenchange", syncFullscreenButton);
    canvas.addEventListener("pointerdown", begin, { passive: false });
    window.addEventListener("pointermove", drag, { passive: false });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); skill(); } });

    renderLevelOptions();
    renderBirdLibrary();
    previewLevel(0);
    setStatus("点击开始游戏，或先切换关卡预览");
    let last = performance.now();
    function loop(now) { const dt = Math.min((now - last) / 16.67, 2.2); last = now; update(dt); draw(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
})();
