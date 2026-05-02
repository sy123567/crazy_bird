(function () {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ui = {
        start: document.getElementById("startBtn"),
        reset: document.getElementById("resetBtn"),
        skill: document.getElementById("skillBtn"),
        sound: document.getElementById("soundToggle"),
        aimToggle: document.getElementById("aimToggle"),
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
    const sling = { fx: 264, fy: 452, bx: 236, by: 452, pull: 164 };
    const forkX = (sling.fx + sling.bx) / 2;
    const forkY = sling.fy;
    const ground = 640;
    const materials = {
        wood: { hp: 1.6, score: 70, bounce: 0.68, fill: "#b45309", line: "#7c2d12", fx: "#f59e0b", tier: 0 },
        stone: { hp: 2.6, score: 110, bounce: 0.8, fill: "#64748b", line: "#334155", fx: "#cbd5e1", tier: 0 },
        glass: { hp: 0.95, score: 90, bounce: 0.58, fill: "rgba(125,211,252,.35)", line: "rgba(8,145,178,.95)", fx: "rgba(255,255,255,.86)", tier: 0 },
        rubber: { hp: 2.0, score: 140, bounce: 1.32, fill: "#7c3aed", line: "#4c1d95", fx: "#c4b5fd", tier: 1 },
        steel: { hp: 4.4, score: 200, bounce: 0.82, fill: "#475569", line: "#0f172a", fx: "#94a3b8", tier: 1 },
        ice_block: { hp: 0.8, score: 85, bounce: 0.5, fill: "rgba(165,243,252,.55)", line: "#0e7490", fx: "#cffafe", chill: 1, tier: 2 },
        crystal: { hp: 1.1, score: 170, bounce: 0.72, fill: "rgba(110,231,183,.55)", line: "#047857", fx: "#6ee7b7", explode: 42, tier: 2 },
        gold: { hp: 1.5, score: 440, bounce: 0.62, fill: "#f59e0b", line: "#92400e", fx: "#fde68a", bonus: 1, tier: 3 },
        obsidian: { hp: 6.2, score: 280, bounce: 0.72, fill: "#1e1b4b", line: "#0b0b1e", fx: "#a855f7", antiExplode: 1, tier: 3 }
    };
    const pigs = {
        normal: { r: 22, hp: 1, score: 150, body: "#84cc16", hat: null, shade: "#4d7c0f", eye: "#111827" },
        helmet: { r: 23, hp: 1.8, score: 220, body: "#65a30d", hat: "#475569", shade: "#365314", eye: "#111827", armor: 1 },
        king: { r: 26, hp: 2.8, score: 340, body: "#4d7c0f", hat: "#fbbf24", shade: "#365314", eye: "#111827", armor: 1 },
        splitter: { r: 22, hp: 1.3, score: 210, body: "#a3e635", hat: "#16a34a", shade: "#4d7c0f", eye: "#111827", ability: "split", tier: 1 },
        armored: { r: 24, hp: 5.2, score: 420, body: "#64748b", hat: "#0f172a", shade: "#334155", eye: "#e2e8f0", armor: 2, ability: "armored", tier: 1 },
        bomber: { r: 22, hp: 1.3, score: 280, body: "#f97316", hat: "#b91c1c", shade: "#c2410c", eye: "#111827", ability: "bomb", tier: 1 },
        healer: { r: 22, hp: 1.9, score: 300, body: "#f472b6", hat: "#ec4899", shade: "#9d174d", eye: "#500724", ability: "heal", tier: 2 },
        shielder: { r: 23, hp: 1.6, score: 320, body: "#38bdf8", hat: "#0284c7", shade: "#0369a1", eye: "#0c4a6e", ability: "shield", tier: 2 },
        mage: { r: 21, hp: 1.3, score: 340, body: "#a855f7", hat: "#581c87", shade: "#6b21a8", eye: "#f3e8ff", ability: "debuff", tier: 2 },
        icy: { r: 22, hp: 1.5, score: 280, body: "#67e8f9", hat: "#0891b2", shade: "#0e7490", eye: "#0c4a6e", ability: "chill", tier: 2 },
        jumper: { r: 20, hp: 1.2, score: 260, body: "#fcd34d", hat: "#ca8a04", shade: "#854d0e", eye: "#422006", ability: "jump", tier: 2 },
        summoner: { r: 23, hp: 2.2, score: 400, body: "#c084fc", hat: "#7e22ce", shade: "#6b21a8", eye: "#3b0764", ability: "summon", tier: 3 },
        ghostly: { r: 21, hp: 1.3, score: 320, body: "rgba(226,232,240,.6)", hat: "#94a3b8", shade: "#cbd5e1", eye: "#1e293b", ability: "ghost", tier: 3 },
        giant: { r: 34, hp: 5.2, score: 560, body: "#4d7c0f", hat: "#a16207", shade: "#365314", eye: "#111827", armor: 1, ability: "giant", tier: 3 },
        zombie: { r: 22, hp: 1.5, score: 280, body: "#166534", hat: "#0f172a", shade: "#14532d", eye: "#fef9c3", ability: "revive", tier: 3 },
        thorns: { r: 22, hp: 1.7, score: 320, body: "#059669", hat: "#14532d", shade: "#047857", eye: "#052e16", ability: "thorns", tier: 3 },
        swapper: { r: 20, hp: 1.2, score: 280, body: "#f472b6", hat: "#9d174d", shade: "#831843", eye: "#500724", ability: "swap", tier: 4 },
        teleporter: { r: 20, hp: 1.1, score: 260, body: "#7c3aed", hat: "#5b21b6", shade: "#6d28d9", eye: "#f3e8ff", ability: "teleport", tier: 4 },
        builder: { r: 22, hp: 1.6, score: 320, body: "#b45309", hat: "#451a03", shade: "#92400e", eye: "#fef3c7", ability: "build", tier: 4 },
        weakener: { r: 22, hp: 1.4, score: 300, body: "#6b7280", hat: "#111827", shade: "#374151", eye: "#fafafa", ability: "weaken", tier: 4 },
        mimic: { r: 22, hp: 2, score: 360, body: "#b45309", hat: "#78350f", shade: "#7c2d12", eye: "#fef9c3", ability: "mimic", tier: 4 },
        berserker: { r: 22, hp: 2.4, score: 360, body: "#dc2626", hat: "#450a0a", shade: "#991b1b", eye: "#fca5a5", ability: "berserk", tier: 5 },
        captain: { r: 23, hp: 2.1, score: 400, body: "#2563eb", hat: "#fbbf24", shade: "#1d4ed8", eye: "#fef3c7", ability: "captain", tier: 5 },
        alchemist: { r: 21, hp: 1.6, score: 340, body: "#14b8a6", hat: "#0f766e", shade: "#0d9488", eye: "#042f2e", ability: "terrain", tier: 5 }
    };
    const pigKeys = Object.keys(pigs);
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
        { name: "晨曦谷地", sky: ["#5fd2ff", "#fef9c3"], hills: ["#65a30d", "#4d7c0f"], sun: [1080, 120], queue: ["red", "yellow", "blue", "black", "ice"], pigs: [[960,618,"normal"],[1040,618,"helmet"],[1000,340,"normal"]], blocks: [[930,518,26,122,"wood"],[1010,518,26,122,"wood"],[1090,518,26,122,"wood"],[954,476,96,22,"glass"],[954,400,26,76,"stone"],[1032,400,26,76,"stone"],[942,366,128,24,"wood"],[1106,452,58,22,"glass"]] },
        { name: "霜石堡垒", sky: ["#7dd3fc", "#dbeafe"], hills: ["#22c55e", "#15803d"], sun: [1000, 96], queue: ["ice", "blue", "yellow", "red", "black"], pigs: [[924,618,"helmet"],[1002,618,"normal"],[1080,618,"helmet"],[1000,290,"king"]], blocks: [[900,520,28,120,"wood"],[980,520,28,120,"wood"],[1060,520,28,120,"wood"],[920,480,188,22,"glass"],[944,408,28,72,"wood"],[1026,408,28,72,"wood"],[938,374,122,24,"glass"],[980,318,34,44,"wood"],[1128,470,30,170,"wood"]] },
        { name: "暮色火山", sky: ["#312e81", "#fdba74"], hills: ["#7c2d12", "#431407"], sun: [1100, 160], queue: ["black", "red", "yellow", "ice", "blue"], pigs: [[930,618,"normal"],[1008,618,"helmet"],[1084,618,"splitter"],[980,456,"helmet"],[1060,350,"king"]], blocks: [[904,524,26,116,"stone"],[982,524,26,116,"wood"],[1060,524,26,116,"stone"],[928,484,184,22,"wood"],[948,430,26,54,"glass"],[1020,430,26,54,"glass"],[942,396,118,20,"stone"],[1022,356,48,40,"stone"],[1144,464,30,176,"glass"],[854,464,30,176,"glass"]] }
    ];
    function makeLevel(i) {
        const theme = levelThemes[i % levelThemes.length];
        const tier = Math.floor(i / 10);
        const wave = i % 10;
        const allMats = ["wood", "glass", "stone", "rubber", "steel", "ice_block", "crystal", "gold", "obsidian"];
        const mats = allMats.filter(m => materials[m].tier <= Math.min(tier, 5));
        if (!mats.length) mats.push("wood", "glass", "stone");
        const diff = Math.max(0, i - 2);
        const isVilla = i >= 2;
        const baseX = 780 + (i % 5) * 28;
        const towerCount = clamp(3 + Math.floor(diff * 0.6), 3, 15);
        const queueSize = clamp(5 + Math.floor(diff * 0.35), 5, 18);
        const queue = Array.from({ length: queueSize }, (_, n) => birdKeys[(i + tier + n * 3) % birdKeys.length]);
        const pigCount = clamp(3 + Math.floor(diff * 1.1), 3, 25);
        const tierPigs = pigKeys.filter(k => (pigs[k].tier || 0) <= Math.min(tier, 5));
        const levelPigs = [];
        const blocks = [];
        const cols = isVilla ? 7 : 5;
        const rowSpacing = isVilla ? 95 : 80;
        const colSpacing = isVilla ? 72 : 58;
        for (let p = 0; p < pigCount; p += 1) {
            const row = Math.floor(p / cols);
            const col = p % cols;
            const offsetX = (row % 2) * (colSpacing / 2) + (Math.random() - 0.5) * (isVilla ? 24 : 12);
            const offsetY = ((p + wave) % 2) * (isVilla ? 15 : 10) + (Math.random() - 0.5) * (isVilla ? 18 : 8);
            const px = clamp(baseX + 40 + col * colSpacing + offsetX, 700, 1300);
            const py = clamp(ground - 28 - row * rowSpacing + offsetY, 120, ground - 30);
            let type;
            if (i > 8 && p === pigCount - 1 && i % 2 === 0) type = tier >= 3 ? (i % 3 ? "giant" : "king") : "king";
            else if (i > 15 && p === pigCount - 2 && i % 4 === 0) type = tier >= 2 ? "helmet" : "king";
            else if (tierPigs.length > 3 && (p + i) % 4 === 0) type = tierPigs[(p + i) % tierPigs.length];
            else type = ["normal", "helmet", "normal", "helmet", "king"][(i + p + tier) % 5];
            levelPigs.push([px, py, type]);
        }
        const towerHeightBase = isVilla ? 100 : 70;
        const heightBonus = Math.min(tier, 8) * 12 + ((i + wave) % 4) * 15;
        for (let t = 0; t < towerCount; t += 1) {
            const x = clamp(baseX + t * (isVilla ? 60 : 52), 680, 1320);
            const h = towerHeightBase + heightBonus + ((i + t) % 4) * 12;
            const mat = mats[(i + t * 2) % mats.length];
            blocks.push([x, ground - h, 28, h, mat]);
            if (t < towerCount - 1 && (t + i) % 2 === 0) {
                const connY = ground - h - (isVilla ? 26 : 20);
                blocks.push([x + 22, connY, isVilla ? 68 : 58, isVilla ? 26 : 20, mats[(i + t + 1) % mats.length]]);
            }
            if (isVilla && h > 150 && (t + i) % 3 === 0) {
                const midY = ground - h * 0.6;
                blocks.push([x - 8, midY, 44, 18, mats[(i + t + 2) % mats.length]]);
            }
        }
        const mainFloorY = ground - (isVilla ? 130 : 80);
        blocks.push([baseX + 20, mainFloorY, Math.min(720, towerCount * (isVilla ? 58 : 50) + 24), isVilla ? 26 : 22, mats[(i + 2) % mats.length]]);
        if (isVilla) {
            const secondFloorY = mainFloorY - (isVilla ? 100 : 70);
            blocks.push([baseX + 60, secondFloorY, Math.min(600, towerCount * (isVilla ? 48 : 40) + 18), isVilla ? 24 : 20, mats[(i + 3) % mats.length]]);
            if (i >= 5) {
                const thirdFloorY = secondFloorY - (isVilla ? 85 : 60);
                blocks.push([baseX + 100, thirdFloorY, Math.min(480, towerCount * (isVilla ? 40 : 34) + 14), isVilla ? 22 : 18, mats[(i + 4) % mats.length]]);
            }
            if (i >= 8) {
                const fourthFloorY = mainFloorY - (isVilla ? 280 : 200);
                blocks.push([baseX + 140, fourthFloorY, Math.min(360, towerCount * 32 + 12), 20, mats[(i + 5) % mats.length]]);
            }
            const leftWallX = clamp(baseX - 60, 680, 1000);
            blocks.push([leftWallX, ground - 320, 30, 320 - 60, mats.indexOf("steel") >= 0 ? "steel" : "stone"]);
            const rightWallX = clamp(baseX + towerCount * 60 + 24, 900, 1320);
            blocks.push([rightWallX, ground - 320, 30, 320 - 60, mats.indexOf("steel") >= 0 ? "steel" : "stone"]);
        }
        if (diff >= 3) {
            const supportY = ground - (isVilla ? 280 : 200);
            blocks.push([clamp(baseX - 70, 680, 1020), supportY, 28, 280 - 50, mats[(i + 1) % mats.length]]);
            blocks.push([clamp(baseX + towerCount * (isVilla ? 60 : 52) + 30, 920, 1320), supportY, 28, 280 - 50, mats[(i + 2) % mats.length]]);
        }
        if (diff >= 6) {
            for (let b = 0; b < Math.min(3, Math.floor(tier / 2)); b++) {
                const bridgeX = baseX + 80 + b * 120;
                const bridgeY = ground - (isVilla ? 220 : 160);
                blocks.push([bridgeX, bridgeY, 26, isVilla ? 160 : 120, mats[(i + b + 3) % mats.length]]);
            }
        }
        if (diff >= 10) {
            const towerTopY = ground - (isVilla ? 340 : 260);
            blocks.push([baseX + 40, towerTopY, 24, 70, mats.indexOf("steel") >= 0 ? "steel" : "stone"]);
            blocks.push([baseX + towerCount * (isVilla ? 60 : 52) - 20, towerTopY, 24, 70, mats.indexOf("steel") >= 0 ? "steel" : "stone"]);
            blocks.push([baseX + 54, towerTopY - 20, Math.min(380, towerCount * 28 + 16), 18, mats.indexOf("gold") >= 0 ? "gold" : mats[(i + 6) % mats.length]]);
        }
        if (diff >= 15) {
            const peakY = ground - (isVilla ? 400 : 320);
            blocks.push([baseX + towerCount * 30 - 20, peakY, 60, 16, mats.indexOf("crystal") >= 0 ? "crystal" : mats[(i + 7) % mats.length]]);
        }
        if (diff >= 20) {
            for (let c = 0; c < Math.min(2, Math.floor(tier / 3)); c++) {
                const cornerX = c === 0 ? clamp(baseX - 40, 680, 900) : clamp(baseX + towerCount * 60 + 10, 1000, 1320);
                const cornerY = ground - 380;
                blocks.push([cornerX, cornerY, 36, 36, mats.indexOf("obsidian") >= 0 ? "obsidian" : "stone"]);
            }
        }
        if (i >= 12) {
            const randomBlockCount = Math.min(4, Math.floor(tier / 2));
            for (let r = 0; r < randomBlockCount; r++) {
                const randX = clamp(baseX + (Math.random() - 0.5) * 200 + towerCount * 30, 700, 1300);
                const randY = clamp(ground - 100 - Math.random() * 250, 150, ground - 50);
                blocks.push([randX, randY, 24 + Math.random() * 20, 18 + Math.random() * 24, mats[Math.floor(Math.random() * mats.length)]]);
            }
        }
        return { name: theme.name + " " + String(i + 1).padStart(2, "0"), sky: theme.sky, hills: theme.hills, sun: theme.sun, queue, pigs: levelPigs, blocks };
    }
    while (levels.length < 100) levels.push(makeLevel(levels.length));
    const game = { started: false, running: false, level: 0, selected: 0, score: 0, best: loadBest(), combo: 0, comboAt: 0, dragging: false, power: 0, queue: [], current: null, active: [], pigs: [], blocks: [], particles: [], rings: [], hazards: [], beams: [], burns: [], eggs: [], glyphs: [], shockwaves: [], shake: { x: 0, y: 0, t: 0, mag: 0 }, clouds: clouds(), status: "点击开始游戏", nextTimer: null, lvlTimer: null, pigCounter: 0, blockCounter: 0, aimPreview: true, skillUseCount: 0 };

    function loadBest() { try { return Number(localStorage.getItem(bestKey) || 0); } catch (e) { return 0; } }
    function saveBest() { try { localStorage.setItem(bestKey, String(game.best)); } catch (e) {} }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
    function clouds() { return [{x:140,y:96,s:1.05,v:.16},{x:420,y:156,s:.82,v:.22},{x:760,y:102,s:1.18,v:.12},{x:1080,y:176,s:.74,v:.2},{x:1220,y:78,s:.92,v:.14}]; }
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
    function shake(mag, t) { if (mag > game.shake.mag) game.shake.mag = mag; if (t > game.shake.t) game.shake.t = t; }
    function spark(x, y, count, colors, speedScale, life) { const arr = Array.isArray(colors) ? colors : [colors]; for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2; const s = 1.2 + Math.random() * (speedScale || 5); const color = arr[i % arr.length]; game.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, life: life || (32 + Math.random() * 22), max: life || 54, size: 2.4 + Math.random() * 3.4, color, spark: true, glow: 12 + Math.random() * 8 }); } }
    function glyph(x, y, r, color, sides, life, rotSpeed) { game.glyphs.push({ x, y, r, color, sides: sides || 6, life: life || 28, max: life || 28, rot: Math.random() * Math.PI * 2, rotSpeed: rotSpeed || 0.06 }); }
    function bolt(x1, y1, x2, y2, color, width, life, jitter) { const dx = x2 - x1, dy = y2 - y1, dd = Math.hypot(dx, dy) || 1; const segs = Math.max(5, Math.min(14, Math.round(dd / 22))); const jt = jitter || Math.min(28, dd * 0.14); const nx = -dy / dd, ny = dx / dd; const pts = [[x1, y1]]; for (let i = 1; i < segs; i++) { const t = i / segs; const bx = x1 + dx * t, by = y1 + dy * t; const k = (Math.random() - 0.5) * jt; pts.push([bx + nx * k, by + ny * k]); } pts.push([x2, y2]); game.beams.push({ pts, color, width: width || 3.2, life: life || 20, max: life || 20, jagged: true, glow: true }); }
    function nova(x, y, color, outerR) {
        const R = outerR || 80;
        ring(x, y, R, color, 6, 24);
        ring(x, y, R * 0.68, "rgba(255,255,255,.85)", 3, 20);
        ring(x, y, R * 0.36, color, 2, 14);
        emit(x, y, color, 24, 5.4);
        spark(x, y, 14, [color, "#ffffff"], 6, 60);
    }
    function shockwave(x, y, r, damage, type) { area(x, y, r, damage, type); game.blocks.forEach(b => { if (!b.alive) return; const cx = b.x + b.w / 2, cy = b.y + b.h / 2, d = dist(x, y, cx, cy); if (d >= r || d < 1) return; const k = 1 - d / r, nx = (cx - x) / d, ny = (cy - y) / d; b.x += nx * k * (type === "shock" ? 12 : 6); b.y += ny * k * (type === "shock" ? 8 : 4); }); game.pigs.forEach(p => { if (!p.alive) return; const d = dist(x, y, p.x, p.y); if (d >= r || d < 1) return; const k = 1 - d / r, nx = (p.x - x) / d, ny = (p.y - y) / d; p.x += nx * k * (type === "shock" ? 14 : 6); p.y += ny * k * (type === "shock" ? 9 : 4); }); }
    function mkBlock(b, i) { const m = materials[b[4]]; return { id: i, x: b[0], y: b[1], w: b[2], h: b[3], mat: b[4], hp: m.hp, max: m.hp, alive: true, cd: 0, frozen: 0, pulse: 0, vx: 0, vy: 0, airborne: false, rotation: 0, lift: 0, summoned: false }; }
    function mkPig(p, i) { const t = pigs[p[2]]; return { id: i, x: p[0], y: p[1], type: p[2], r: t.r, hp: t.hp, max: t.hp, alive: true, cd: 0, frozen: 0, pulse: Math.random() * 3.14, vx: 0, vy: 0, airborne: false, lift: 0, ability: t.ability || null, abilityTick: Math.random() * 40, shield: t.ability === "shield" ? 1 : 0, revived: false, mimicked: t.ability === "mimic", summonCount: 0, buildCount: 0, buffTimer: 0, buffMult: 1 }; }
    function mkBird(id, clone) { const s = birds[id], atk = clone ? 0.74 : 0.82; return { id, clone: !!clone, name: s.name, skillName: s.skillName, skill: s.skill, c: s.c, r: clone ? Math.max(12, s.r - 2) : s.r, mass: clone ? s.mass * 0.86 : s.mass, g: s.g, ls: s.ls, block: (clone ? s.block * 0.98 : s.block) * atk, pig: (clone ? s.pig * 1.0 : s.pig) * atk, x: forkX, y: forkY, vx: 0, vy: 0, launched: false, resolved: false, skillReady: !clone, skillUsed: false, precision: 1, aura: 1, glow: 0, sleep: 0, trail: [] }; }
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
    function buildLevel(i) { clearTimers(); game.level = clamp(i, 0, levels.length - 1); game.selected = game.level; game.dragging = false; game.queue = levels[game.level].queue.slice(); game.pigCounter = 0; game.blockCounter = 0; game.blocks = levels[game.level].blocks.map(mkBlock); game.pigs = levels[game.level].pigs.map(mkPig); game.particles = []; game.rings = []; game.hazards = []; game.beams = []; game.burns = []; game.eggs = []; game.glyphs = []; game.shockwaves = []; game.shake = { x: 0, y: 0, t: 0, mag: 0 }; game.flash = null; game.clouds = clouds(); audio.setTheme(game.level); spawnNext(); setStatus("第" + (game.level + 1) + "关：拖动弹弓发射"); }
    function previewLevel(i) { clearTimers(); game.level = clamp(i, 0, levels.length - 1); game.selected = game.level; game.started = false; game.running = false; game.dragging = false; game.combo = 0; game.queue = levels[game.level].queue.slice(); game.pigCounter = 0; game.blockCounter = 0; game.blocks = levels[game.level].blocks.map(mkBlock); game.pigs = levels[game.level].pigs.map(mkPig); game.particles = []; game.rings = []; game.hazards = []; game.beams = []; game.burns = []; game.eggs = []; game.glyphs = []; game.shockwaves = []; game.shake = { x: 0, y: 0, t: 0, mag: 0 }; game.flash = null; game.clouds = clouds(); game.current = null; game.active = []; spawnNext(true); setPower(0); setStatus("预览第" + (game.level + 1) + "关，点击开始本关"); updateUI(); }
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
            ring(b.x, b.y, 96, b.c.aura, 5, 20); ring(b.x, b.y, 60, "rgba(254,215,170,.85)", 3, 16);
            spark(b.x, b.y, 18, [b.c.trail, "#fde68a", "#ffffff"], 6.5, 54);
            emit(b.x, b.y, b.c.trail, 28, 6); glyph(b.x, b.y, 38, b.c.body, 3, 24, 0.18);
            shake(4, 10); flash(b.c.aura, 10); audio.playSkill("dash");
            break;
        }
        case "pierce": {
            const boost = Math.max(sp * 1.55, 30);
            b.vx = d.x * boost; b.vy = d.y * boost - 0.4;
            b.precision = 1.95; b.aura = 1.22;
            ring(b.x, b.y, 110, b.c.aura, 4, 22); ring(b.x, b.y, 72, "rgba(253,224,71,.75)", 3, 18);
            for (let i = 0; i < 3; i++) bolt(b.x, b.y, b.x + d.x * 120 + (Math.random() - 0.5) * 30, b.y + d.y * 120 + (Math.random() - 0.5) * 30, "rgba(254,240,138,.9)", 2.6, 14, 10);
            spark(b.x, b.y, 20, [b.c.trail, "#fef3c7", "#ffffff"], 7, 50);
            emit(b.x, b.y, b.c.trail, 22, 5.8);
            shake(5, 12); flash(b.c.aura, 10); audio.playSkill("pierce");
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
            ring(b.x, b.y, 92, b.c.aura, 5, 22); ring(b.x, b.y, 58, "rgba(186,230,253,.85)", 3, 16);
            glyph(b.x, b.y, 42, b.c.body, 3, 22, 0.2);
            spark(b.x, b.y, 22, [b.c.trail, "#bae6fd", "#ffffff"], 6.2, 54);
            emit(b.x, b.y, b.c.trail, 24, 5.2);
            shake(4, 10); flash(b.c.aura, 10); audio.playSkill("split");
            break;
        }
        case "shock": {
            const R = 128;
            emit(b.x, b.y, "#fde68a", 70, 9); emit(b.x, b.y, "#ef4444", 28, 5);
            ring(b.x, b.y, R + 30, "rgba(251,191,36,.7)", 10, 32);
            ring(b.x, b.y, R + 6, "rgba(253,224,71,.62)", 7, 26);
            ring(b.x, b.y, Math.max(20, R - 52), "rgba(239,68,68,.7)", 5, 22);
            glyph(b.x, b.y, 72, "#fde68a", 8, 30, 0.14);
            glyph(b.x, b.y, 48, "#ef4444", 5, 26, -0.22);
            spark(b.x, b.y, 30, ["#fde68a", "#f97316", "#ef4444", "#ffffff"], 8, 64);
            for (let i = 0; i < 10; i++) { const ang = i / 10 * Math.PI * 2; bolt(b.x, b.y, b.x + Math.cos(ang) * R, b.y + Math.sin(ang) * R, "rgba(254,240,138,.95)", 3, 18, 16); }
            flash("rgba(253,224,71,.6)", 22); shake(14, 26);
            game.blocks.filter(k => k.alive && dist(b.x, b.y, k.x + k.w / 2, k.y + k.h / 2) <= R).forEach(k => { emit(k.x + k.w / 2, k.y + k.h / 2, materials[k.mat].fx, 14, 3.6); ring(k.x + k.w / 2, k.y + k.h / 2, 42, materials[k.mat].fx, 2, 10); spark(k.x + k.w / 2, k.y + k.h / 2, 6, [materials[k.mat].fx, "#ffffff"], 5, 48); hitBlock(k, 999, true); });
            game.pigs.filter(p => p.alive && dist(b.x, b.y, p.x, p.y) <= R).forEach(p => { emit(p.x, p.y, "#86efac", 16, 4); spark(p.x, p.y, 8, ["#86efac", "#fde68a"], 5, 48); hitPig(p, 999); });
            audio.playSkill("shock"); resolve(b);
            break;
        }
        case "frost": {
            const R = 130;
            emit(b.x, b.y, "#a5f3fc", 48, 6.4); emit(b.x, b.y, "#ffffff", 22, 3.6);
            ring(b.x, b.y, R + 18, "rgba(103,232,249,.68)", 8, 30);
            ring(b.x, b.y, R - 2, "rgba(186,230,253,.6)", 5, 24);
            ring(b.x, b.y, Math.max(28, R - 56), "rgba(224,242,254,.72)", 3, 22);
            glyph(b.x, b.y, 60, "#67e8f9", 6, 36, 0.08);
            glyph(b.x, b.y, 34, "#ffffff", 6, 30, -0.14);
            spark(b.x, b.y, 28, ["#a5f3fc", "#e0f2fe", "#ffffff"], 6.5, 70);
            shockwave(b.x, b.y, R, 2, "frost");
            flash("rgba(186,230,253,.55)", 20); shake(8, 18);
            audio.playSkill("frost"); resolve(b);
            break;
        }
        case "boomerang": {
            b.boomerangTimer = 16; b.aura = 1.3; b.precision = 1.5; b.mass *= 1.08;
            const boomerangBoost = Math.max(sp * 1.1, 18);
            b.vx = d.x * boomerangBoost * 0.9; b.vy = d.y * boomerangBoost * 0.9;
            ring(b.x, b.y, 72, b.c.aura, 4, 18); ring(b.x, b.y, 42, "rgba(187,247,208,.85)", 3, 14);
            glyph(b.x, b.y, 48, b.c.body, 4, 32, 0.32);
            spark(b.x, b.y, 18, [b.c.trail, "#bbf7d0", "#ffffff"], 5.6, 50);
            emit(b.x, b.y, b.c.trail, 22, 4.8);
            shake(3, 8); flash(b.c.aura, 9); audio.playSkill("boomerang");
            break;
        }
        case "teleport": {
            const sx = b.x, sy = b.y;
            ring(sx, sy, 66, b.c.aura, 5, 20); ring(sx, sy, 40, "rgba(221,214,254,.85)", 3, 16);
            glyph(sx, sy, 46, b.c.body, 6, 26, 0.42);
            spark(sx, sy, 22, [b.c.trail, "#ddd6fe", "#ffffff"], 6, 56);
            emit(sx, sy, b.c.trail, 26, 5);
            const tx = clamp(b.x + d.x * 110, 30, canvas.width - 30);
            const ty = clamp(b.y + d.y * 110, 30, ground - b.r - 4);
            b.x = tx; b.y = ty;
            ring(tx, ty, 72, b.c.aura, 5, 22); ring(tx, ty, 40, "rgba(221,214,254,.85)", 3, 16);
            glyph(tx, ty, 48, b.c.body, 6, 30, -0.48);
            spark(tx, ty, 24, [b.c.trail, "#ddd6fe", "#ffffff"], 6, 58);
            emit(tx, ty, b.c.trail, 26, 5.4);
            bolt(sx, sy, tx, ty, "rgba(221,214,254,.95)", 3, 20, 22);
            b.aura = 1.3; b.precision = 1.7;
            shake(5, 12); flash(b.c.aura, 12); audio.playSkill("teleport");
            break;
        }
        case "egg_drop": {
            const ex = b.x, ey = b.y + 4;
            ring(ex, ey, 62, "rgba(251,191,36,.72)", 5, 18); ring(ex, ey, 36, "rgba(254,243,199,.85)", 3, 14);
            glyph(ex, ey, 30, "#fbbf24", 4, 22, 0.3);
            spark(ex, ey, 20, ["#fef3c7", "#fbbf24", "#ffffff"], 6.5, 54);
            emit(ex, ey, "#fef3c7", 26, 4.5);
            area(ex, ey, 42, 2.5, null);
            shake(5, 12); flash(b.c.aura, 11); audio.playSkill("egg_drop");
            break;
        }
        case "inflate": {
            b.r = Math.min(b.r * 1.6, 32);
            b.mass *= 1.6; b.block *= 1.5; b.pig *= 1.5;
            b.aura = 1.35; b.precision = 1.2;
            ring(b.x, b.y, 82, b.c.aura, 6, 20); ring(b.x, b.y, 52, "rgba(254,215,170,.8)", 4, 16);
            glyph(b.x, b.y, 42, "#f97316", 8, 28, 0.2);
            spark(b.x, b.y, 24, ["#f97316", "#fed7aa", "#facc15"], 6.5, 60);
            emit(b.x, b.y, b.c.trail, 30, 5);
            shake(6, 14); flash(b.c.aura, 11); audio.playSkill("inflate");
            break;
        }
        case "heal": {
            const pool = birdKeys.filter(id => id !== "pink");
            const gift = pool[Math.floor(Math.random() * pool.length)];
            game.queue.unshift(gift);
            b.aura = 1.25; b.precision = 1.4; b.mass *= 1.3;
            const healBoost = Math.max(sp * 1.2, 22);
            b.vx = d.x * healBoost; b.vy = d.y * healBoost - 2;
            ring(b.x, b.y, 74, b.c.aura, 5, 22); ring(b.x, b.y, 44, "rgba(251,207,232,.88)", 3, 18);
            glyph(b.x, b.y, 50, "#ec4899", 6, 34, 0.16);
            glyph(b.x, b.y, 32, "#ffffff", 5, 30, -0.22);
            spark(b.x, b.y, 26, ["#fbcfe8", "#fce7f3", "#ffffff", "#ec4899"], 5.5, 70);
            emit(b.x, b.y, "#fbcfe8", 30, 4.4);
            shake(3, 8); flash("rgba(252,231,243,.65)", 12);
            setStatus(b.name + " 召唤 " + birds[gift].name + " 归队");
            audio.playSkill("heal");
            break;
        }
        case "shield": {
            b.precision = 2.8; b.aura = 1.5; b.mass *= 1.4; b.shield = 1;
            const shieldBoost = Math.max(sp * 1.05, 16);
            b.vx = d.x * shieldBoost; b.vy = d.y * shieldBoost;
            ring(b.x, b.y, 68, b.c.aura, 6, 22); ring(b.x, b.y, 42, "rgba(226,232,240,.88)", 4, 18);
            glyph(b.x, b.y, 46, "#cbd5e1", 6, 40, 0.12);
            glyph(b.x, b.y, 28, "#f97316", 3, 34, -0.18);
            spark(b.x, b.y, 22, ["#e2e8f0", "#f97316", "#ffffff"], 5.5, 60);
            emit(b.x, b.y, b.c.trail, 26, 4.4);
            shake(4, 10); flash(b.c.aura, 10); audio.playSkill("shield");
            break;
        }
        case "chain_lightning": {
            const R = 140;
            const nodes = [];
            game.pigs.forEach(p => { if (p.alive && dist(b.x, b.y, p.x, p.y) < R) nodes.push({ x: p.x, y: p.y, dd: dist(b.x, b.y, p.x, p.y), pig: p }); });
            game.blocks.forEach(k => { if (k.alive && dist(b.x, b.y, k.x + k.w / 2, k.y + k.h / 2) < R) nodes.push({ x: k.x + k.w / 2, y: k.y + k.h / 2, dd: dist(b.x, b.y, k.x + k.w / 2, k.y + k.h / 2), block: k }); });
            nodes.sort((a, e) => a.dd - e.dd);
            ring(b.x, b.y, 86, b.c.aura, 5, 22); glyph(b.x, b.y, 54, "#60a5fa", 6, 28, 0.36);
            spark(b.x, b.y, 18, ["#bfdbfe", "#ffffff", "#3b82f6"], 6.5, 48);
            let prev = { x: b.x, y: b.y };
            nodes.slice(0, 3).forEach(t => {
                bolt(prev.x, prev.y, t.x, t.y, "rgba(191,219,254,.98)", 3.4, 20, 18);
                bolt(prev.x, prev.y, t.x, t.y, "rgba(147,197,253,.72)", 2, 14, 14);
                spark(t.x, t.y, 10, ["#dbeafe", "#ffffff", "#3b82f6"], 5.4, 48);
                emit(t.x, t.y, "#dbeafe", 14, 3.4);
                if (t.pig) hitPig(t.pig, 3.5);
                if (t.block) hitBlock(t.block, 3.8, false);
                prev = t;
            });
            shake(7, 16); flash("rgba(191,219,254,.55)", 14); audio.playSkill("chain_lightning"); resolve(b);
            break;
        }
        case "grapple": {
            const R = 90;
            ring(b.x, b.y, R + 8, b.c.aura, 5, 22); ring(b.x, b.y, R - 30, "rgba(134,239,172,.8)", 3, 16);
            glyph(b.x, b.y, 52, "#16a34a", 5, 28, 0.3);
            game.blocks.forEach(k => {
                if (!k.alive) return;
                const cx = k.x + k.w / 2, cy = k.y + k.h / 2, dd = dist(b.x, b.y, cx, cy);
                if (dd > R || dd < 1) return;
                k.airborne = true; k.lift = 6;
                k.vx = (b.x - cx) / dd * 4; k.vy = (b.y - cy) / dd * 4 - 1;
                k.rotation = (Math.random() - 0.5) * 0.25;
                bolt(b.x, b.y, cx, cy, "rgba(34,197,94,.9)", 2.2, 16, 10);
                hitBlock(k, 2.2, false);
            });
            game.pigs.forEach(p => {
                if (!p.alive) return;
                const dd = dist(b.x, b.y, p.x, p.y);
                if (dd > R || dd < 1) return;
                p.airborne = true; p.lift = 6;
                p.vx = (b.x - p.x) / dd * 4; p.vy = (b.y - p.y) / dd * 4 - 1;
                bolt(b.x, b.y, p.x, p.y, "rgba(34,197,94,.95)", 2.4, 18, 12);
                spark(p.x, p.y, 8, ["#86efac", "#bbf7d0"], 5, 48);
                hitPig(p, 2.5);
            });
            spark(b.x, b.y, 20, [b.c.trail, "#bbf7d0", "#ffffff"], 5.4, 54);
            emit(b.x, b.y, b.c.trail, 26, 4.4);
            shake(5, 12); flash(b.c.aura, 10); audio.playSkill("grapple");
            break;
        }
        case "sandstorm": {
            game.hazards.push({ x: b.x, y: ground - 35, r: 56, type: "sand", life: 90, max: 90, tick: 0, everyN: 8, damage: 0.5 });
            ring(b.x, ground - 18, 74, "rgba(217,119,6,.72)", 6, 22); ring(b.x, ground - 18, 48, "rgba(253,230,138,.78)", 4, 18);
            glyph(b.x, ground - 24, 46, "#d97706", 8, 36, 0.5);
            glyph(b.x, ground - 24, 28, "#fde68a", 6, 30, -0.38);
            spark(b.x, ground - 24, 28, ["#fde68a", "#d97706", "#fef3c7"], 6.2, 64);
            emit(b.x, ground - 18, "#fde68a", 38, 4.2);
            shake(6, 14); flash("rgba(253,230,138,.52)", 12); audio.playSkill("sandstorm"); resolve(b);
            break;
        }
        case "phase": {
            b.ghost = true; b.pig *= 2.5; b.aura = 1.5; b.precision = 2.5;
            const phaseBoost = Math.max(sp * 1.3, 24);
            b.vx = d.x * phaseBoost; b.vy = d.y * phaseBoost - 1.5;
            ring(b.x, b.y, 70, b.c.aura, 5, 22); ring(b.x, b.y, 40, "rgba(167,139,250,.85)", 3, 16);
            glyph(b.x, b.y, 44, "#a78bfa", 6, 28, 0.44);
            spark(b.x, b.y, 22, [b.c.trail, "#c4b5fd", "#ffffff"], 5.8, 56);
            emit(b.x, b.y, b.c.trail, 26, 4.8);
            shake(4, 10); flash(b.c.aura, 10); audio.playSkill("phase");
            break;
        }
        case "laser": {
            const L = 420;
            const ex = b.x + d.x * L, ey = b.y + d.y * L;
            game.beams.push({ fromX: b.x, fromY: b.y, toX: ex, toY: ey, color: "rgba(253,224,71,.95)", life: 22, max: 22, width: 9, glow: true });
            game.beams.push({ fromX: b.x, fromY: b.y, toX: ex, toY: ey, color: "rgba(255,255,255,.98)", life: 22, max: 22, width: 3, glow: true });
            ring(b.x, b.y, 60, "rgba(253,224,71,.88)", 5, 22);
            glyph(b.x, b.y, 40, "#f59e0b", 8, 30, 0.6);
            spark(b.x, b.y, 22, ["#fde68a", "#fbbf24", "#ffffff"], 6, 60);
            spark(ex, ey, 18, ["#fde68a", "#ffffff"], 7, 50);
            ring(ex, ey, 54, "rgba(253,224,71,.8)", 4, 18);
            game.blocks.forEach(k => { if (!k.alive) return; const cx = k.x + k.w / 2, cy = k.y + k.h / 2; if (pointToSegment(cx, cy, b.x, b.y, ex, ey) < Math.max(k.w, k.h) / 2 + 3) { hitBlock(k, 6, false); emit(cx, cy, materials[k.mat].fx, 10, 3); spark(cx, cy, 6, [materials[k.mat].fx, "#ffffff"], 5, 40); } });
            game.pigs.forEach(p => { if (!p.alive) return; if (pointToSegment(p.x, p.y, b.x, b.y, ex, ey) < p.r + 4) { hitPig(p, 5.8); emit(p.x, p.y, "#fde68a", 12, 3.2); spark(p.x, p.y, 6, ["#fde68a", "#ffffff"], 5, 40); } });
            shake(10, 18); flash("rgba(253,224,71,.7)", 18); audio.playSkill("laser"); resolve(b);
            break;
        }
        case "gravity_reverse": {
            b.gOrig = b.g; b.g = -Math.abs(b.g) * 0.8; b.antigravity = 36;
            b.aura = 1.3; b.precision = 1.5; b.mass *= 0.85;
            ring(b.x, b.y, 72, b.c.aura, 5, 22); ring(b.x, b.y, 40, "rgba(199,210,254,.85)", 3, 18);
            glyph(b.x, b.y, 48, "#818cf8", 6, 36, 0.28);
            for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r0 = 28 + Math.random() * 16; game.particles.push({ x: b.x + Math.cos(a) * r0, y: b.y + Math.sin(a) * r0, vx: Math.cos(a) * 0.4, vy: -2.6 - Math.random() * 1.2, life: 54, max: 54, size: 2.6, color: "#c7d2fe", spark: true, glow: 10 }); }
            emit(b.x, b.y, b.c.trail, 24, 4.4);
            shake(4, 10); flash(b.c.aura, 11); audio.playSkill("gravity_reverse");
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
            ring(b.x, b.y, 78, b.c.aura, 5, 22); ring(b.x, b.y, 46, "rgba(207,250,254,.88)", 3, 18);
            glyph(b.x, b.y, 42, "#06b6d4", 6, 26, 0.4);
            glyph(b.x, b.y, 26, "#ffffff", 4, 22, -0.32);
            spark(b.x, b.y, 30, [b.c.trail, "#cffafe", "#06b6d4", "#ffffff"], 7, 54);
            emit(b.x, b.y, b.c.trail, 34, 5.4);
            shake(5, 12); flash(b.c.aura, 11); audio.playSkill("shatter");
            break;
        }
        case "homing": {
            b.homing = 36; b.aura = 1.4; b.precision = 1.5; b.mass *= 1.15;
            const boost = Math.max(sp * 1.25, 24);
            b.vx = d.x * boost; b.vy = d.y * boost;
            ring(b.x, b.y, 72, b.c.aura, 5, 22); ring(b.x, b.y, 44, "rgba(254,202,202,.85)", 3, 16);
            glyph(b.x, b.y, 44, "#dc2626", 3, 30, 0.55);
            let target = null, bestD = Infinity;
            game.pigs.forEach(p => { if (!p.alive) return; const dd = dist(b.x, b.y, p.x, p.y); if (dd < bestD) { bestD = dd; target = p; } });
            if (target) glyph(target.x, target.y, 22, "#dc2626", 4, 28, 0.8);
            spark(b.x, b.y, 22, [b.c.trail, "#fecaca", "#ffffff"], 6, 52);
            emit(b.x, b.y, b.c.trail, 26, 5.2);
            shake(4, 10); flash(b.c.aura, 10); audio.playSkill("homing");
            break;
        }
        case "magnet": {
            const R = 86;
            ring(b.x, b.y, R, b.c.aura, 5, 22); ring(b.x, b.y, R * 0.58, "rgba(153,246,228,.85)", 3, 18);
            glyph(b.x, b.y, 48, "#0f766e", 6, 30, 0.36);
            game.blocks.forEach(k => {
                if (!k.alive) return;
                const cx = k.x + k.w / 2, cy = k.y + k.h / 2, dd = dist(b.x, b.y, cx, cy);
                if (dd > R || dd < 3) return;
                k.airborne = true; k.lift = 5;
                const strength = (1 - dd / R) * 6;
                k.vx = (b.x - cx) / dd * strength; k.vy = (b.y - cy) / dd * strength;
                bolt(b.x, b.y, cx, cy, "rgba(94,234,212,.85)", 2, 14, 6);
                hitBlock(k, 1.8, false);
            });
            game.pigs.forEach(p => {
                if (!p.alive) return;
                const dd = dist(b.x, b.y, p.x, p.y);
                if (dd > R || dd < 3) return;
                p.airborne = true; p.lift = 5;
                const strength = (1 - dd / R) * 6;
                p.vx = (b.x - p.x) / dd * strength; p.vy = (b.y - p.y) / dd * strength;
                bolt(b.x, b.y, p.x, p.y, "rgba(94,234,212,.9)", 2.2, 16, 8);
                hitPig(p, 2);
            });
            spark(b.x, b.y, 22, [b.c.trail, "#99f6e4", "#ffffff"], 5.5, 54);
            emit(b.x, b.y, b.c.trail, 26, 4.4);
            shake(5, 12); flash(b.c.aura, 10); audio.playSkill("magnet");
            break;
        }
        case "toxic_cloud": {
            game.hazards.push({ x: b.x, y: b.y, r: 52, type: "toxic", life: 100, max: 100, tick: 0, everyN: 6, damage: 0.65 });
            ring(b.x, b.y, 70, "rgba(101,163,13,.7)", 5, 22); ring(b.x, b.y, 42, "rgba(190,242,100,.78)", 3, 18);
            glyph(b.x, b.y, 42, "#65a30d", 6, 34, 0.26);
            glyph(b.x, b.y, 26, "#bef264", 4, 28, -0.2);
            spark(b.x, b.y, 26, ["#bef264", "#84cc16", "#ecfccb"], 5.4, 64);
            emit(b.x, b.y, "#bef264", 32, 4);
            shake(4, 10); flash("rgba(190,242,100,.55)", 12); audio.playSkill("toxic_cloud"); resolve(b);
            break;
        }
        case "lift": {
            const R = 82;
            emit(b.x, b.y, b.c.trail, 34, 4.5); emit(b.x, b.y, "#ffffff", 20, 2.8);
            ring(b.x, b.y, R + 14, b.c.aura, 6, 26); ring(b.x, b.y, R - 8, "rgba(219,234,254,.85)", 4, 20); ring(b.x, b.y, Math.max(20, R - 46), "rgba(255,255,255,.6)", 3, 16);
            glyph(b.x, b.y, 52, "#93c5fd", 6, 30, 0.14);
            spark(b.x, b.y, 24, [b.c.trail, "#dbeafe", "#ffffff"], 6, 60);
            for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r0 = 20 + Math.random() * 16; game.particles.push({ x: b.x + Math.cos(a) * r0, y: b.y + Math.sin(a) * r0, vx: (Math.random() - 0.5) * 0.4, vy: -3 - Math.random() * 1.4, life: 58, max: 58, size: 2.8, color: "#bfdbfe", spark: true, glow: 10 }); }
            shake(4, 10); flash(b.c.aura, 12);
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
            ring(b.x, b.y, 72, "rgba(249,115,22,.75)", 5, 22); ring(b.x, b.y, 42, "rgba(254,215,170,.88)", 3, 16);
            glyph(b.x, b.y, 42, "#b91c1c", 8, 28, 0.4);
            glyph(b.x, b.y, 26, "#f97316", 5, 24, -0.34);
            spark(b.x, b.y, 26, ["#f97316", "#fdba74", "#facc15", "#fef3c7"], 6, 60);
            emit(b.x, b.y, "#f97316", 32, 5);
            shake(5, 12); flash("rgba(249,115,22,.55)", 12); audio.playSkill("burn");
            break;
        }
        case "sonic_boom": {
            const R = 100, coneDot = 0.45;
            ring(b.x, b.y, 80, b.c.aura, 6, 22); ring(b.x, b.y, 52, "rgba(186,230,253,.82)", 4, 18); ring(b.x, b.y, 32, "rgba(255,255,255,.88)", 3, 14);
            glyph(b.x, b.y, 44, "#0ea5e9", 3, 24, 0.5);
            spark(b.x, b.y, 26, [b.c.trail, "#bae6fd", "#ffffff"], 7, 56);
            emit(b.x, b.y, b.c.trail, 30, 5.4);
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
            shake(8, 16); flash(b.c.aura, 14); audio.playSkill("sonic_boom");
            break;
        }
        case "ghost_dive": {
            b.ghost = true; b.pig *= 3.2; b.aura = 1.5; b.precision = 2.8;
            const boost = Math.max(sp * 1.3, 24);
            b.vx = d.x * boost * 0.7; b.vy = Math.abs(d.y) * boost + 5;
            ring(b.x, b.y, 76, b.c.aura, 5, 24); ring(b.x, b.y, 44, "rgba(233,213,255,.88)", 3, 18);
            glyph(b.x, b.y, 46, "#a855f7", 5, 30, 0.42);
            glyph(b.x, b.y, 28, "#ffffff", 4, 24, -0.3);
            spark(b.x, b.y, 26, [b.c.trail, "#e9d5ff", "#ffffff", "#a855f7"], 6.4, 64);
            emit(b.x, b.y, b.c.trail, 30, 5.4);
            shake(5, 12); flash(b.c.aura, 12); audio.playSkill("ghost_dive");
            break;
        }
        }
        updateUI();
    }
    function hitBlock(b, dmg, silent) {
        if (!b.alive || dmg <= 0) return;
        const m = materials[b.mat];
        b.hp -= dmg * (b.frozen > 0 ? 1.4 : 1); b.pulse = 10;
        if (!silent) game.score += 14;
        if (b.hp <= 0) {
            b.alive = false;
            game.score += m.score * (m.bonus ? 1.6 : 1);
            const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
            emit(cx, cy, m.fx, b.mat === "glass" ? 26 : 20, b.mat === "stone" || b.mat === "steel" ? 3.6 : 4.8);
            ring(cx, cy, 72, m.fx, 4, 16);
            ring(cx, cy, 44, "rgba(255,255,255,.82)", 2, 12);
            spark(cx, cy, b.mat === "glass" || b.mat === "ice_block" ? 16 : 10, [m.fx, "#ffffff"], 5.6, 46);
            shake(b.mat === "obsidian" ? 7 : (b.mat === "stone" || b.mat === "steel" ? 4 : 3), 8);
            audio.playDestroy(b.mat);
            if (m.explode && !b._chained) {
                const r = m.explode;
                ring(cx, cy, r + 16, "rgba(110,231,183,.85)", 6, 22);
                spark(cx, cy, 18, [m.fx, "#ffffff", "#34d399"], 6.5, 56);
                flash("rgba(110,231,183,.4)", 12); shake(6, 14);
                game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, cx, cy) < r) hitPig(p, 1.6); });
                game.blocks.forEach(o => { if (!o.alive || o === b) return; if (materials[o.mat].antiExplode) return; const ox = o.x + o.w / 2, oy = o.y + o.h / 2, d = dist(ox, oy, cx, cy); if (d < r) { o._chained = true; hitBlock(o, 1.2 * (1 - d / r), true); o._chained = false; } });
            }
            if (m.chill) game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, cx, cy) < 80) p.frozen = Math.max(p.frozen, 80); });
            game.pigs.forEach(p => { if (p.alive && dist(p.x, p.y, cx, cy) < 110) hitPig(p, 1.2); });
            game.blocks.forEach(o => { if (!o.alive || o === b) return; const ox = o.x + o.w / 2, oy = o.y + o.h / 2; const d = dist(ox, oy, cx, cy); if (d < 72) hitBlock(o, 0.4 * (1 - d / 72), true); if (!o.airborne) { const overlap = Math.max(0, Math.min(o.x + o.w, b.x + b.w) - Math.max(o.x, b.x)); const verticalGap = b.y - (o.y + o.h); if (overlap > 3 && verticalGap >= -4 && verticalGap <= 10) { o.airborne = true; o.vx = (Math.random() - 0.5) * 0.8; o.vy = 0.3; o.rotation = (Math.random() - 0.5) * 0.06; } } });
        }
        updateUI();
    }
    function hitPig(p, dmg, source) {
        if (!p.alive || dmg <= 0) return;
        const t = pigs[p.type];
        if (p.ability === "ghost" && (!source || (!source.precision || source.precision < 1.5) && !source.ghost)) { spark(p.x, p.y, 4, ["#cbd5e1", "#ffffff"], 3.4, 24); return; }
        if (p.shield > 0 && dmg < 6) { p.shield = 0; ring(p.x, p.y, 38, "rgba(56,189,248,.92)", 4, 16); spark(p.x, p.y, 10, ["#38bdf8", "#ffffff"], 4.4, 36); return; }
        if (p.ability === "thorns" && source && source.r) { source.thornsHit = (source.thornsHit || 0) + dmg * 0.5; spark(p.x, p.y, 8, ["#059669", "#86efac"], 4, 32); }
        let actual = dmg * (p.frozen > 0 ? 1.28 : 1);
        if (p.ability === "armored") actual *= 0.55;
        if (p.ability === "berserk" && p.hp / p.max < 0.4) actual *= 0.85;
        p.hp -= actual; p.cd = 8;
        audio.playPigHit(dmg);
        if (p.hp > 0) {
            if (p.ability === "jump" && Math.random() < 0.7) { p.airborne = true; p.lift = 6; p.vx = (Math.random() - 0.5) * 5; p.vy = -5 - Math.random() * 2; emit(p.x, p.y, "#fde68a", 10, 3.4); }
            else if (p.ability === "teleport") { const oldx = p.x, oldy = p.y; p.x = clamp(640 + Math.random() * 580, 600, canvas.width - 40); p.y = clamp(180 + Math.random() * 360, 160, ground - p.r - 4); ring(oldx, oldy, 50, "rgba(124,58,237,.9)", 4, 16); ring(p.x, p.y, 50, "rgba(124,58,237,.9)", 4, 16); spark(oldx, oldy, 14, ["#7c3aed", "#ddd6fe"], 5, 38); spark(p.x, p.y, 14, ["#7c3aed", "#ddd6fe"], 5, 38); bolt(oldx, oldy, p.x, p.y, "rgba(196,181,253,.95)", 2.4, 18, 18); }
            else if (p.ability === "swap") { const others = game.pigs.filter(q => q.alive && q !== p); if (others.length) { const target = others[Math.floor(Math.random() * others.length)]; const tx = target.x, ty = target.y; ring(p.x, p.y, 40, "rgba(244,114,182,.9)", 3, 14); ring(tx, ty, 40, "rgba(244,114,182,.9)", 3, 14); target.x = p.x; target.y = p.y; p.x = tx; p.y = ty; spark(tx, ty, 10, ["#f472b6", "#fce7f3"], 4.6, 38); } }
            else if (p.ability === "mimic" && p.mimicked) { p.mimicked = false; ring(p.x, p.y, 46, "rgba(180,83,9,.92)", 4, 16); spark(p.x, p.y, 14, ["#b45309", "#fef3c7"], 5, 40); }
        }
        if (p.hp <= 0) {
            if (p.ability === "revive" && !p.revived) { p.revived = true; p.hp = p.max * 0.55; p.shield = 0; ring(p.x, p.y, 56, "rgba(22,101,52,.95)", 5, 22); spark(p.x, p.y, 16, ["#166534", "#fef9c3", "#84cc16"], 5.4, 50); flash("rgba(22,101,52,.32)", 10); shake(4, 10); updateUI(); return; }
            p.alive = false;
            const now = performance.now();
            game.combo = now - game.comboAt < 1300 ? game.combo + 1 : 1;
            game.comboAt = now;
            game.score += t.score + Math.max(0, game.combo - 1) * 35;
            emit(p.x, p.y, "#86efac", 22, 4.4);
            ring(p.x, p.y, 58, "rgba(134,239,172,.82)", 3, 14);
            spark(p.x, p.y, 12, ["#86efac", "#bbf7d0", "#ffffff"], 5.2, 48);
            shake(3, 7);
            if (game.combo >= 3) { flash("rgba(250,204,21,.28)", 8); spark(p.x, p.y, 10, ["#fde68a", "#ffffff"], 4, 40); }
            audio.playPig();
            if (game.combo > 1) audio.playCombo(game.combo);
            if (p.ability === "split") {
                ring(p.x, p.y, 60, "rgba(163,230,53,.9)", 4, 16);
                for (let i = 0; i < 3; i++) {
                    const a = (i - 1) * 0.5 + (Math.random() - 0.5) * 0.3;
                    const np = mkPig([p.x + Math.cos(a) * 14, p.y - 10, "normal"], 9000 + (++game.pigCounter));
                    np.r = 14; np.hp = 0.6; np.max = 0.6; np.airborne = true; np.lift = 6; np.vx = Math.cos(a) * 3.6; np.vy = -3 - Math.random();
                    game.pigs.push(np);
                }
                spark(p.x, p.y, 14, ["#a3e635", "#bef264", "#ffffff"], 5.5, 44);
            } else if (p.ability === "bomb") {
                const r = 92;
                ring(p.x, p.y, r + 14, "rgba(249,115,22,.9)", 7, 24);
                spark(p.x, p.y, 22, ["#f97316", "#fbbf24", "#ffffff", "#dc2626"], 7, 56);
                flash("rgba(249,115,22,.45)", 14); shake(8, 16); audio.playSkill("shock");
                game.pigs.forEach(q => { if (q.alive && q !== p && dist(q.x, q.y, p.x, p.y) < r) hitPig(q, 1.4, p); });
                game.blocks.forEach(k => { if (k.alive && !materials[k.mat].antiExplode && dist(k.x + k.w / 2, k.y + k.h / 2, p.x, p.y) < r) hitBlock(k, 2, true); });
            } else if (p.ability === "summon") {
                ring(p.x, p.y, 64, "rgba(192,132,252,.9)", 4, 18);
                for (let i = 0; i < 2; i++) {
                    const np = mkPig([p.x + (i - 0.5) * 30, p.y - 6, "normal"], 9000 + (++game.pigCounter));
                    np.r = 16; np.hp = 0.7; np.max = 0.7;
                    game.pigs.push(np);
                }
            }
            if (game.pigs.every(t => !t.alive)) completeLevel();
        }
        updateUI();
    }
    function collision(bird, block) { const cx = clamp(bird.x, block.x, block.x + block.w), cy = clamp(bird.y, block.y, block.y + block.h); let dx = bird.x - cx, dy = bird.y - cy, d = Math.hypot(dx, dy); if (d < bird.r) { if (!d) { dx = bird.x < block.x + block.w / 2 ? -1 : 1; dy = 0; d = 1; } return { x: cx, y: cy, nx: dx / d, ny: dy / d, overlap: bird.r - d }; } return null; }
    function blockDamage(bird, mat) { const m = materials[mat]; const tough = m.hp >= 4 ? 3.4 : (mat === "stone" ? 2.6 : mat === "glass" ? 1.05 : mat === "ice_block" ? 0.95 : mat === "rubber" ? 2.2 : 1.7); return Math.hypot(bird.vx, bird.vy) * bird.mass * bird.block * bird.aura * bird.precision / (tough * 5.6); }
    function pigDamage(bird) { return Math.hypot(bird.vx, bird.vy) * bird.mass * bird.pig * bird.aura / 3.3; }
    function spawnPig(type, x, y, small) { const p = mkPig([clamp(x, 40, canvas.width - 40), clamp(y, 80, ground - 20), type], 9000 + (++game.pigCounter)); if (small) { p.r = Math.max(13, p.r * 0.72); p.hp *= 0.58; p.max = p.hp; } game.pigs.push(p); return p; }
    function spawnBlock(x, y, w, h, mat) { const b = mkBlock([clamp(x, 20, canvas.width - w - 20), clamp(y, 40, ground - h), w, h, mat], 9000 + (++game.blockCounter)); b.summoned = true; game.blocks.push(b); return b; }
    function weakenCurrentBird(mult, frames) { if (!game.current || !game.current.launched || game.current.resolved) return; const b = game.current; if (!b.weakened) { b.weakened = true; b.baseBlock = b.block; b.basePig = b.pig; b.baseAura = b.aura; b.block *= mult; b.pig *= mult; b.aura *= Math.max(0.72, mult); } b.weakenFrames = Math.max(b.weakenFrames || 0, frames || 80); spark(b.x, b.y, 4, ["#9ca3af", "#ffffff"], 2.6, 28); }
    function pigAbilityTick(p, dt) {
        if (!p.alive || p.frozen > 0) return;
        p.abilityTick += dt;
        if (p.buffTimer > 0) { p.buffTimer = Math.max(0, p.buffTimer - dt); if (!p.buffTimer) p.buffMult = 1; }
        if (p.ability === "berserk" && p.hp / p.max < 0.45) { p.buffMult = 1.28; p.buffTimer = 28; if (Math.random() < 0.05) spark(p.x, p.y, 2, ["#dc2626", "#fca5a5"], 2.8, 24); }
        if (p.ability === "captain" && p.abilityTick > 64) {
            p.abilityTick = 0; ring(p.x, p.y, 92, "rgba(37,99,235,.68)", 3, 18);
            game.pigs.forEach(q => { if (q.alive && q !== p && dist(q.x, q.y, p.x, p.y) < 110) { q.buffMult = 1.22; q.buffTimer = 90; spark(q.x, q.y, 3, ["#60a5fa", "#fde68a"], 2.4, 30); } });
        } else if (p.ability === "heal" && p.abilityTick > 95) {
            p.abilityTick = 0; let target = null, hp = 99;
            game.pigs.forEach(q => { if (q.alive && q.hp < q.max && dist(q.x, q.y, p.x, p.y) < 180 && q.hp / q.max < hp) { target = q; hp = q.hp / q.max; } });
            if (target) { target.hp = Math.min(target.max, target.hp + 0.55); bolt(p.x, p.y, target.x, target.y, "rgba(244,114,182,.9)", 2.2, 18, 10); ring(target.x, target.y, 36, "rgba(244,114,182,.8)", 3, 14); spark(target.x, target.y, 8, ["#f472b6", "#fce7f3", "#ffffff"], 3.8, 34); }
        } else if (p.ability === "shield" && p.abilityTick > 110) {
            p.abilityTick = 0; let target = null;
            game.pigs.forEach(q => { if (q.alive && q.shield <= 0 && dist(q.x, q.y, p.x, p.y) < 170 && (!target || q.hp > target.hp)) target = q; });
            if (target) { target.shield = 1; ring(target.x, target.y, target.r + 16, "rgba(56,189,248,.82)", 4, 22); spark(target.x, target.y, 8, ["#38bdf8", "#ffffff"], 3.4, 34); }
        } else if (p.ability === "debuff" && p.abilityTick > 70) {
            p.abilityTick = 0; if (game.current && game.current.launched && !game.current.resolved && dist(p.x, p.y, game.current.x, game.current.y) < 210) { weakenCurrentBird(0.78, 100); bolt(p.x, p.y, game.current.x, game.current.y, "rgba(168,85,247,.78)", 2.2, 16, 14); }
        } else if (p.ability === "chill" && p.abilityTick > 78) {
            p.abilityTick = 0; if (game.current && game.current.launched && !game.current.resolved && dist(p.x, p.y, game.current.x, game.current.y) < 170) { game.current.vx *= 0.88; game.current.vy *= 0.88; game.current.glow = Math.max(game.current.glow, 10); ring(game.current.x, game.current.y, 34, "rgba(103,232,249,.72)", 3, 12); } game.blocks.forEach(k => { if (k.alive && dist(k.x + k.w / 2, k.y + k.h / 2, p.x, p.y) < 90) k.frozen = Math.max(k.frozen, 70); });
        } else if (p.ability === "summon" && p.abilityTick > 150 && p.summonCount < 2 && game.pigs.filter(q => q.alive).length < 32) {
            p.abilityTick = 0; p.summonCount += 1; const np = spawnPig("normal", p.x + (Math.random() - 0.5) * 64, p.y - 10, true); np.airborne = true; np.lift = 5; np.vx = (Math.random() - 0.5) * 3; np.vy = -2.5; ring(p.x, p.y, 60, "rgba(192,132,252,.82)", 4, 18); spark(np.x, np.y, 10, ["#c084fc", "#ffffff"], 4, 38);
        } else if (p.ability === "build" && p.abilityTick > 135 && p.buildCount < 3) {
            p.abilityTick = 0; p.buildCount += 1; const mat = game.level > 30 ? "stone" : "wood"; const bx = p.x + (Math.random() < 0.5 ? -48 : 28), by = Math.min(ground - 58, p.y + p.r + 6); const b = spawnBlock(bx, by, 34, 58, mat); b.airborne = true; b.vy = -1.8; b.vx = (Math.random() - 0.5) * 1.2; ring(b.x + b.w / 2, b.y + b.h / 2, 42, materials[mat].fx, 3, 14);
        } else if (p.ability === "terrain" && p.abilityTick > 145) {
            p.abilityTick = 0; const live = game.blocks.filter(k => k.alive && dist(k.x + k.w / 2, k.y + k.h / 2, p.x, p.y) < 190); if (live.length) { const k = live[Math.floor(Math.random() * live.length)]; const mat = ["rubber", "ice_block", "crystal"][Math.floor(Math.random() * 3)]; k.mat = mat; k.hp = Math.max(k.hp, materials[mat].hp * 0.65); k.max = Math.max(k.max, materials[mat].hp); ring(k.x + k.w / 2, k.y + k.h / 2, 46, materials[mat].fx, 4, 18); spark(k.x + k.w / 2, k.y + k.h / 2, 10, [materials[mat].fx, "#ffffff"], 4, 38); } 
        } else if (p.ability === "weakener" && p.abilityTick > 60) {
            p.abilityTick = 0; if (game.current && game.current.launched && !game.current.resolved && dist(p.x, p.y, game.current.x, game.current.y) < 180) weakenCurrentBird(0.72, 90);
        } else if (p.ability === "giant" && p.abilityTick > 88 && p.y + p.r >= ground - 2) {
            p.abilityTick = 0; shake(5, 10); ring(p.x, ground - 6, 88, "rgba(132,204,22,.46)", 4, 18); game.blocks.forEach(k => { if (k.alive && dist(k.x + k.w / 2, k.y + k.h / 2, p.x, ground) < 95) { k.airborne = true; k.vy = -2.4; k.vx += (k.x + k.w / 2 - p.x) * 0.018; hitBlock(k, 0.45, true); } });
        }
    }
    function resolve(b) { b.resolved = true; b.launched = false; b.vx = 0; b.vy = 0; }
    function nextBird() { if (game.nextTimer || !game.running) return; setStatus("下一只小鸟装填中"); game.nextTimer = setTimeout(() => { game.nextTimer = null; if (!game.running) return; if (spawnNext()) setStatus("拖动弹弓发射 " + game.current.name); else finish(false); updateUI(); }, 760); }
    function completeLevel() { clearTimers(); game.running = false; const bonus = remain() * 60; game.score += bonus; setStatus("第" + (game.level + 1) + "关完成，奖励 " + bonus + " 分"); emit(1040, 300, "#fde68a", 52, 6.5); nova(1040, 300, "rgba(250,204,21,.9)", 120); audio.playWin(); updateUI(); game.lvlTimer = setTimeout(() => { game.lvlTimer = null; if (game.level < levels.length - 1) { startLevel(game.level + 1, false); } else finish(true); }, 1500); }
    function finish(win) { clearTimers(); game.running = false; setPower(0); if (win) { setStatus("战役通关！点击重新开始再来一局"); emit(1040, 320, "#fde68a", 60, 7); nova(1040, 320, "rgba(250,204,21,.9)", 140); audio.playWin(); } else { game.current = null; game.active = []; setStatus("小鸟已用尽，点击重新开始重试"); audio.playLose(); } if (game.score > game.best) { game.best = game.score; saveBest(); } updateUI(); }
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
            pigAbilityTick(p, dt);
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
        game.particles = game.particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (p.spark) { p.vx *= Math.pow(0.96, dt); p.vy *= Math.pow(0.96, dt); p.vy += .03 * dt; } else { p.vy += .06 * dt; } p.life -= dt; return p.life > 0; });
        game.rings = game.rings.filter(r => (r.life -= dt, r.r += (r.max - r.r) * .18 * dt, r.life > 0));
        game.beams = game.beams.filter(bm => (bm.life -= dt, bm.life > 0));
        game.glyphs = game.glyphs.filter(g => { g.life -= dt; g.rot += g.rotSpeed * dt; return g.life > 0; });
        if (game.shake.t > 0) { game.shake.t -= dt; const m = game.shake.mag * Math.max(0, Math.min(1, game.shake.t / 14)); game.shake.x = (Math.random() - 0.5) * m * 2; game.shake.y = (Math.random() - 0.5) * m * 2; if (game.shake.t <= 0) { game.shake.mag = 0; game.shake.x = 0; game.shake.y = 0; } } else { game.shake.x = 0; game.shake.y = 0; }
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
            if (b.weakenFrames > 0) { b.weakenFrames -= dt; if (b.weakenFrames <= 0 && b.weakened) { b.block = b.baseBlock || b.block; b.pig = b.basePig || b.pig; b.aura = b.baseAura || b.aura; b.weakened = false; } }
            if (b.thornsHit > 0) { b.vx *= 0.965; b.vy *= 0.965; b.glow = Math.max(b.glow, 8); b.thornsHit = Math.max(0, b.thornsHit - dt); }
            if (b.burnLeft > 0 && b.launched) { b.burnLeft -= dt; if (Math.random() < 0.9) { game.burns.push({ x: b.x - b.vx * 0.25 + (Math.random() - 0.5) * 14, y: b.y - b.vy * 0.25 + 4, life: 54, max: 54, tick: 0 }); spark(b.x - b.vx * 0.18, b.y - b.vy * 0.18, 1, ["#f97316", "#facc15"], 2.4, 26); } }
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
                emit(h.x, h.y, m.fx, k.mat === "glass" ? 10 : 8, k.mat === "stone" ? 3.2 : 4.2);
                const impactSp = Math.hypot(b.vx, b.vy);
                if (impactSp > 5.5) { spark(h.x, h.y, 6, [m.fx, "#ffffff"], 4.4, 34); shake(Math.min(4, impactSp * 0.25), 6); }
                audio.playImpact(impactSp, k.mat);
                contacted = true;
            });
            game.pigs.forEach(p => {
                if (!p.alive || p.cd > 0 || b.resolved) return;
                if (dist(b.x, b.y, p.x, p.y) > b.r + p.r) return;
                hitPig(p, pigDamage(b), b);
                if (b.precision > 1.8) { b.vx *= 0.94; b.vy *= 0.94; } else { b.vx *= .78; b.vy *= .78; }
                emit(p.x, p.y, "#86efac", 14, 4.2);
                spark(p.x, p.y, 6, ["#86efac", "#bbf7d0"], 4.2, 36);
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
    function drawBg() {
        const lv = levels[game.level], g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, lv.sky[0]); g.addColorStop(1, lv.sky[1]);
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath(); ctx.arc(lv.sun[0], lv.sun[1], 54, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,240,164,.95)"; ctx.fill();
        ctx.beginPath(); ctx.arc(lv.sun[0], lv.sun[1], 78, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,240,164,.18)"; ctx.fill();
        game.clouds.forEach(cloud);
        ctx.fillStyle = lv.hills[0]; ctx.beginPath();
        ctx.moveTo(0, 540);
        ctx.quadraticCurveTo(150, 450, 340, 550);
        ctx.quadraticCurveTo(500, 610, 680, 500);
        ctx.quadraticCurveTo(880, 390, 1280, 550);
        ctx.lineTo(1280, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();
        ctx.fillStyle = lv.hills[1]; ctx.beginPath();
        ctx.moveTo(0, 600);
        ctx.quadraticCurveTo(220, 560, 420, 626);
        ctx.quadraticCurveTo(640, 690, 900, 580);
        ctx.quadraticCurveTo(1080, 512, 1280, 620);
        ctx.lineTo(1280, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(76,42,18,.95)"; ctx.fillRect(0, ground, canvas.width, canvas.height - ground);
        ctx.fillStyle = "rgba(132,204,22,.88)"; ctx.fillRect(0, ground - 7, canvas.width, 12);
        ctx.fillStyle = "rgba(255,255,255,.12)"; for (let x = 0; x < canvas.width; x += 64) ctx.fillRect(x + (game.level % 3) * 7, ground + 24 + (x % 5) * 4, 28, 5);
    }
    function drawAimPreview() {
        if (!game.aimPreview || !game.dragging || !game.current || game.current.launched) return;
        const b = game.current, lx = forkX - b.x, ly = forkY - b.y, pull = Math.hypot(lx, ly);
        if (pull < 12) return;
        let x = forkX, y = forkY, vx = lx * b.ls, vy = ly * b.ls;
        ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.shadowColor = b.c.trail; ctx.shadowBlur = 10;
        for (let i = 0; i < 36; i++) {
            vx *= Math.pow(.994, 2.1); vy = vy * Math.pow(.997, 2.1) + b.g * 2.1;
            x += vx * 2.1; y += vy * 2.1;
            if (y > ground - b.r || x < 0 || x > canvas.width) break;
            const alpha = 1 - i / 38, r = Math.max(2.2, 6.2 - i * 0.09);
            ctx.globalAlpha = alpha * 0.82;
            ctx.fillStyle = i % 3 === 0 ? "#ffffff" : b.c.trail;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = .72; ctx.strokeStyle = b.c.trail; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(forkX + lx * .34, forkY + ly * .34); ctx.stroke();
        ctx.restore(); ctx.globalAlpha = 1;
    }
    function drawSling() { const b = game.current && !game.current.resolved ? game.current : { x: forkX, y: forkY }; ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sling.bx, ground); ctx.lineTo(sling.bx, sling.by); ctx.moveTo(sling.fx, ground); ctx.lineTo(sling.fx, sling.fy); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = "#a16207"; ctx.beginPath(); ctx.moveTo(sling.bx, sling.by); ctx.lineTo(b.x, b.y); ctx.moveTo(sling.fx, sling.fy); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    function drawBlock(b) { const m = materials[b.mat]; ctx.save(); if (b.frozen > 0) ctx.globalAlpha = .9; if (b.airborne && b.rotation) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(b.rotation); ctx.translate(-cx, -cy); } if (b.lift > 0) { ctx.shadowColor = "rgba(147,197,253,.8)"; ctx.shadowBlur = 14; } rounded(b.x, b.y, b.w, b.h, 6, m.fill); ctx.shadowBlur = 0; ctx.fillStyle = b.frozen > 0 ? "rgba(224,242,254,.34)" : "rgba(255,255,255,.12)"; ctx.fillRect(b.x + 5, b.y + 5, b.w - 10, 6); ctx.strokeStyle = m.line; ctx.lineWidth = 2 + b.pulse * .12; ctx.beginPath(); ctx.moveTo(b.x + 8, b.y + b.h * .3); ctx.lineTo(b.x + b.w - 8, b.y + b.h * .36); ctx.moveTo(b.x + b.w * .4, b.y + 8); ctx.lineTo(b.x + b.w * .5, b.y + b.h - 8); if (b.hp < b.max) { ctx.moveTo(b.x + b.w * .65, b.y + b.h * .2); ctx.lineTo(b.x + b.w * .3, b.y + b.h * .8); } ctx.stroke(); if (b.frozen > 0) { ctx.strokeStyle = "rgba(224,242,254,.8)"; ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4); } ctx.restore(); }
    function drawPig(p) {
        const t = pigs[p.type], wobble = Math.sin(p.pulse) * 1.4, r = p.r;
        ctx.save();
        if (p.frozen > 0) ctx.globalAlpha = .88;
        if (p.ability === "ghost") ctx.globalAlpha *= .68;
        if (p.lift > 0 || p.buffTimer > 0 || p.shield > 0) { ctx.shadowColor = p.shield > 0 ? "rgba(56,189,248,.95)" : (p.buffTimer > 0 ? "rgba(250,204,21,.8)" : "rgba(147,197,253,.85)"); ctx.shadowBlur = p.shield > 0 ? 20 : 14; }
        const g = ctx.createRadialGradient(p.x - r * .35, p.y - r * .45, 2, p.x, p.y, r * 1.15);
        g.addColorStop(0, "#ecfccb"); g.addColorStop(.38, t.body); g.addColorStop(1, t.shade || "#365314");
        ctx.fillStyle = t.shade || "#65a30d";
        ctx.beginPath(); ctx.arc(p.x - r * .43, p.y - r * .78 + wobble, r * .28, 0, Math.PI * 2); ctx.arc(p.x + r * .43, p.y - r * .78 - wobble, r * .28, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,.26)"; ctx.beginPath(); ctx.ellipse(p.x - r * .28, p.y - r * .36, r * .38, r * .18, -0.35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#bef264"; ctx.beginPath(); ctx.ellipse(p.x, p.y + r * .18, r * .48, r * .36, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#365314"; ctx.beginPath(); ctx.arc(p.x - r * .18, p.y + r * .16, r * .07, 0, Math.PI * 2); ctx.arc(p.x + r * .18, p.y + r * .16, r * .07, 0, Math.PI * 2); ctx.fill();
        const angry = p.hp / p.max < .45 || p.ability === "berserk";
        ctx.strokeStyle = angry ? "#7f1d1d" : "#111827"; ctx.lineWidth = 2.4; ctx.beginPath();
        ctx.moveTo(p.x - r * .42, p.y - r * .3); ctx.lineTo(p.x - r * .14, p.y - r * (angry ? .38 : .27));
        ctx.moveTo(p.x + r * .42, p.y - r * .3); ctx.lineTo(p.x + r * .14, p.y - r * (angry ? .38 : .27)); ctx.stroke();
        ctx.fillStyle = t.eye || "#111827"; ctx.beginPath(); ctx.arc(p.x - r * .28, p.y - r * .18, r * .11, 0, Math.PI * 2); ctx.arc(p.x + r * .28, p.y - r * .18, r * .11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p.x - r * .31, p.y - r * .22, r * .035, 0, Math.PI * 2); ctx.arc(p.x + r * .25, p.y - r * .22, r * .035, 0, Math.PI * 2); ctx.fill();
        if (t.hat) { ctx.fillStyle = t.hat; ctx.beginPath(); ctx.arc(p.x, p.y - r + 2 + wobble, r * .54, Math.PI, 0); ctx.fill(); rounded(p.x - r * .65, p.y - r - 2 + wobble, r * 1.3, r * .24, 4, t.hat); }
        const iconColor = p.ability === "bomb" ? "#f97316" : p.ability === "heal" ? "#f472b6" : p.ability === "shield" ? "#38bdf8" : p.ability === "teleport" || p.ability === "debuff" ? "#a855f7" : p.ability === "terrain" ? "#14b8a6" : p.ability === "split" ? "#a3e635" : null;
        if (iconColor) { ctx.strokeStyle = iconColor; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(p.x, p.y - r - 10 + wobble, 7, 0, Math.PI * 2); ctx.stroke(); }
        if (p.shield > 0) { ctx.strokeStyle = "rgba(56,189,248,.86)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, r + 6 + Math.sin(p.pulse) * 1.8, 0, Math.PI * 2); ctx.stroke(); }
        if (p.buffTimer > 0) { ctx.strokeStyle = "rgba(250,204,21,.82)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, r + 10, -Math.PI * .2, Math.PI * 1.15); ctx.stroke(); }
        if (p.frozen > 0) { ctx.strokeStyle = "rgba(224,242,254,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, r + 3, 0, Math.PI * 2); ctx.stroke(); }
        const hp = Math.max(0, p.hp / p.max);
        if (hp < .98) { rounded(p.x - r, p.y + r + 8, r * 2, 5, 3, "rgba(15,23,42,.35)"); rounded(p.x - r, p.y + r + 8, r * 2 * hp, 5, 3, hp < .35 ? "#ef4444" : "#84cc16"); }
        ctx.restore(); ctx.globalAlpha = 1;
    }
    function drawBird(b) {
        b.trail.forEach(t => { ctx.globalAlpha = Math.max(t.life / 16, 0) * .42; ctx.beginPath(); ctx.arc(t.x, t.y, 7, 0, Math.PI * 2); ctx.fillStyle = t.color; ctx.fill(); });
        ctx.globalAlpha = b.ghost ? 0.55 : 1;
        if (b.glow > 0 || b.weakened) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r + (b.weakened ? 14 : 10), 0, Math.PI * 2); ctx.fillStyle = b.weakened ? "rgba(107,114,128,.32)" : b.c.aura; ctx.fill(); }
        const label = b.skillUsed ? "已用：" + b.skillName : b.skillName;
        ctx.save();
        ctx.font = "bold 12px Microsoft YaHei"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const w = Math.min(128, Math.max(58, ctx.measureText(label).width + 16));
        const lx = clamp(b.x - w / 2, 8, canvas.width - w - 8), ly = clamp(b.y - b.r - 32, 18, canvas.height - 18);
        rounded(lx, ly - 10, w, 20, 10, b.skillUsed ? "rgba(71,85,105,.82)" : "rgba(15,23,42,.82)");
        ctx.fillStyle = b.skillReady && b.launched ? "#fde68a" : "#ffffff"; ctx.fillText(label, lx + w / 2, ly); ctx.restore();
        ctx.save(); ctx.translate(b.x, b.y); if (b.launched) ctx.rotate(Math.atan2(b.vy, b.vx) * .08);
        const r = b.r, g = ctx.createRadialGradient(-r * .35, -r * .45, 2, 0, 0, r * 1.2);
        g.addColorStop(0, "#ffffff"); g.addColorStop(.34, b.c.body); g.addColorStop(1, b.id === "black" ? "#020617" : b.c.body);
        ctx.fillStyle = b.c.trail; ctx.beginPath(); ctx.ellipse(-r * .52, 1, r * .66, r * .38, -0.45, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.c.belly; ctx.beginPath(); ctx.ellipse(-r * .24, r * .26, r * .47, r * .35, -0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.c.beak; ctx.beginPath(); ctx.moveTo(r * .82, -r * .12); ctx.lineTo(r * 1.45, -r * .02); ctx.lineTo(r * .82, r * .23); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(r * .26, -r * .26, r * .22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.c.eye; ctx.beginPath(); ctx.arc(r * .32, -r * .25, r * .11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = b.id === "black" ? "#fde68a" : "#7f1d1d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-r * .42, -r * .58); ctx.lineTo(r * .42, -r * .72); ctx.stroke();
        if (b.skill === "burn" || b.skill === "dash" || b.skill === "laser") { ctx.fillStyle = "rgba(249,115,22,.86)"; ctx.beginPath(); ctx.moveTo(-r * 1.08, -2); ctx.lineTo(-r * 1.82, -r * .34); ctx.lineTo(-r * 1.42, r * .18); ctx.closePath(); ctx.fill(); }
        else if (b.skill === "frost" || b.skill === "shatter") { ctx.strokeStyle = "#cffafe"; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9); ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25); ctx.stroke(); } }
        else if (b.skill === "chain_lightning" || b.skill === "shock") { ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * .1, -r * 1.05); ctx.lineTo(r * .14, -r * .55); ctx.lineTo(-r * .05, -r * .55); ctx.lineTo(r * .22, 0); ctx.stroke(); }
        else if (b.skill === "grapple" || b.skill === "magnet") { ctx.strokeStyle = b.skill === "magnet" ? "#5eead4" : "#86efac"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-r * .15, -r * .1, r * .72, .2, Math.PI * 1.45); ctx.stroke(); }
        ctx.restore(); ctx.globalAlpha = 1;
    }
    function drawFx() {
        game.particles.forEach(p => {
            const a = Math.max(p.life / p.max, .08);
            if (p.spark) {
                ctx.save();
                ctx.globalAlpha = a;
                ctx.shadowColor = p.color; ctx.shadowBlur = p.glow || 12;
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.1, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(255,255,255,.92)";
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            } else {
                ctx.globalAlpha = a;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color; ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        game.rings.forEach(r => { ctx.globalAlpha = Math.max(r.life / 28, .15); ctx.strokeStyle = r.color; ctx.lineWidth = r.width; ctx.shadowColor = r.color; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); });
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        if (game.flash) { ctx.save(); ctx.globalAlpha = Math.max(0, game.flash.life / game.flash.max) * 0.85; ctx.fillStyle = game.flash.color; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore(); ctx.globalAlpha = 1; }
    }
    function drawGlyphs() {
        game.glyphs.forEach(g => {
            const a = Math.max(0, g.life / g.max);
            ctx.save();
            ctx.globalAlpha = a * 0.9;
            ctx.translate(g.x, g.y); ctx.rotate(g.rot);
            ctx.strokeStyle = g.color; ctx.lineWidth = 2.4; ctx.shadowColor = g.color; ctx.shadowBlur = 16;
            ctx.beginPath(); ctx.arc(0, 0, g.r, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath();
            for (let i = 0; i < g.sides; i++) { const ang = i / g.sides * Math.PI * 2; const px = Math.cos(ang) * g.r, py = Math.sin(ang) * g.r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
            ctx.closePath(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, g.r * 0.55, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < g.sides; i++) { const ang = i / g.sides * Math.PI * 2 + Math.PI / g.sides; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * g.r, Math.sin(ang) * g.r); ctx.stroke(); }
            ctx.restore();
        });
    }
    function drawHazards() { game.hazards.forEach(h => { ctx.save(); ctx.globalAlpha = Math.min(1, h.life / 40) * 0.55; ctx.fillStyle = h.type === "toxic" ? "rgba(101,163,13,.55)" : "rgba(217,119,6,.5)"; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill(); const n = 8, t = performance.now() * 0.002; for (let i = 0; i < n; i++) { const a = t + i / n * Math.PI * 2; const rr = h.r * (0.55 + 0.3 * Math.sin(t * 2 + i)); const rx = h.x + Math.cos(a) * rr, ry = h.y + Math.sin(a) * rr * 0.85; ctx.beginPath(); ctx.arc(rx, ry, 8, 0, Math.PI * 2); ctx.fillStyle = h.type === "toxic" ? "#84cc16" : "#d97706"; ctx.fill(); } ctx.restore(); }); }
    function drawBeams() {
        game.beams.forEach(bm => {
            ctx.save();
            const a = Math.max(0, bm.life / bm.max);
            ctx.globalAlpha = a;
            ctx.strokeStyle = bm.color; ctx.lineWidth = bm.width;
            if (bm.glow) { ctx.shadowColor = bm.color; ctx.shadowBlur = 18; }
            ctx.lineCap = "round"; ctx.lineJoin = "round";
            ctx.beginPath();
            if (bm.jagged && bm.pts) {
                ctx.moveTo(bm.pts[0][0], bm.pts[0][1]);
                for (let i = 1; i < bm.pts.length; i++) ctx.lineTo(bm.pts[i][0], bm.pts[i][1]);
            } else {
                ctx.moveTo(bm.fromX, bm.fromY); ctx.lineTo(bm.toX, bm.toY);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = Math.max(1, bm.width * 0.42);
            ctx.beginPath();
            if (bm.jagged && bm.pts) {
                ctx.moveTo(bm.pts[0][0], bm.pts[0][1]);
                for (let i = 1; i < bm.pts.length; i++) ctx.lineTo(bm.pts[i][0], bm.pts[i][1]);
            } else {
                ctx.moveTo(bm.fromX, bm.fromY); ctx.lineTo(bm.toX, bm.toY);
            }
            ctx.stroke();
            ctx.restore();
        });
    }
    function drawBurns() { game.burns.forEach(t => { const a = Math.max(0, t.life / t.max); ctx.save(); ctx.globalAlpha = a * 0.82; ctx.shadowColor = "#f97316"; ctx.shadowBlur = 12; ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.arc(t.x, t.y, 5.2 + Math.sin(t.life * 0.3) * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "rgba(254,215,170,.95)"; ctx.beginPath(); ctx.arc(t.x, t.y, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }); }
    function drawOverlay() { if (game.running || game.dragging) return; ctx.fillStyle = "rgba(15,23,42,.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 36px Microsoft YaHei"; ctx.fillText(game.status, canvas.width / 2, canvas.height / 2 - 10); ctx.font = "18px Microsoft YaHei"; ctx.fillText("拖动小鸟发射，空格或技能按钮触发专属技能", canvas.width / 2, canvas.height / 2 + 28); }
    function draw() {
        ctx.save();
        if (game.shake.x || game.shake.y) ctx.translate(game.shake.x, game.shake.y);
        drawBg();
        drawHazards();
        drawBurns();
        drawGlyphs();
        game.blocks.filter(b => b.alive).forEach(drawBlock);
        game.pigs.filter(p => p.alive).forEach(drawPig);
        drawSling();
        drawAimPreview();
        game.active.forEach(drawBird);
        drawBeams();
        drawFx();
        ctx.restore();
        drawOverlay();
    }
    function renderLevelOptions() { if (!ui.levelSelect) return; ui.levelSelect.innerHTML = levels.map((lv, i) => '<option value="' + i + '">第' + (i + 1) + '关 · ' + lv.name + '</option>').join(""); ui.levelSelect.value = String(game.selected); }
    function renderBirdLibrary() { if (!ui.library) return; ui.library.innerHTML = birdKeys.map(id => { const b = birds[id], c = b.c; return '<article class="bird-chip" style="background:linear-gradient(135deg,' + c.body + ',' + c.trail + ');"><strong>' + b.name + '</strong><span>' + b.skillName + ' · ' + b.skill + '</span></article>'; }).join(""); }
    function startSelectedLevel() { audio.playButton(); startLevel(Number(ui.levelSelect ? ui.levelSelect.value : game.selected) || 0, true); }
    function toggleFullscreen() { audio.playButton(); const target = ui.stage || canvas; if (!document.fullscreenElement) { const request = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen; if (request) request.call(target); return; } const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen; if (exit) exit.call(document); }
    function syncFullscreenButton() { if (ui.fullscreen) ui.fullscreen.textContent = document.fullscreenElement ? "退出全屏" : "全屏模式"; }
    function syncAimButton() { if (ui.aimToggle) { ui.aimToggle.setAttribute("aria-pressed", game.aimPreview ? "true" : "false"); ui.aimToggle.textContent = game.aimPreview ? "预瞄线：开" : "预瞄线：关"; } }
    function toggleAimPreview() { game.aimPreview = !game.aimPreview; syncAimButton(); audio.playButton(); }

    if (ui.start) ui.start.addEventListener("click", start);
    if (ui.reset) ui.reset.addEventListener("click", reset);
    if (ui.skill) ui.skill.addEventListener("click", () => { audio.playButton(); skill(); });
    if (ui.stageSkill) ui.stageSkill.addEventListener("click", () => { audio.playButton(); skill(); });
    if (ui.levelSelect) ui.levelSelect.addEventListener("change", () => { audio.playButton(); previewLevel(Number(ui.levelSelect.value) || 0); });
    if (ui.levelStart) ui.levelStart.addEventListener("click", startSelectedLevel);
    if (ui.fullscreen) ui.fullscreen.addEventListener("click", toggleFullscreen);
    if (ui.aimToggle) ui.aimToggle.addEventListener("click", toggleAimPreview);
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
    syncAimButton();
    previewLevel(0);
    setStatus("点击开始游戏，或先切换关卡预览");
    let last = performance.now();
    function loop(now) { const dt = Math.min((now - last) / 16.67, 2.2); last = now; update(dt); draw(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
})();
