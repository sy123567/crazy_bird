class Bird {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = { x: 0, y: 0 };
        this.isLaunched = false;
        this.color = "#FF6347";
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        if (this.isLaunched) {
            this.velocity.y += 0.2;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
    }

    launch(angle, power) {
        this.isLaunched = true;
        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = -Math.sin(angle) * power;
    }
}

class Pig {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = "#FFD700";
        this.isAlive = true;
    }

    draw(ctx) {
        if (this.isAlive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = "#8B4513";
        this.isActive = true;
    }

    draw(ctx) {
        if (this.isActive) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.bird = new Bird(100, 300, 20);
        this.pigs = [];
        this.blocks = [];
        this.score = 0;
        this.isGameActive = false;
        this.mouse = { x: 0, y: 0 };
        this.isDragging = false;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.pigs = [
            new Pig(600, 300, 25),
            new Pig(650, 280, 25),
            new Pig(700, 320, 25)
        ];

        this.blocks = [
            new Block(550, 350, 50, 50),
            new Block(600, 350, 50, 50),
            new Block(650, 350, 50, 50),
            new Block(600, 300, 50, 50)
        ];

        this.score = 0;
        this.updateScore();
    }

    setupEventListeners() {
        console.log("Setting up event listeners...");
        
        const startBtn = document.getElementById("start-btn");
        const resetBtn = document.getElementById("reset-btn");
        
        console.log("Start button:", startBtn);
        console.log("Reset button:", resetBtn);
        console.log("Canvas:", this.canvas);
        
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                console.log("Start button clicked!");
                this.startGame();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                console.log("Reset button clicked!");
                this.resetGame();
            });
        }

        if (this.canvas) {
            this.canvas.addEventListener("mousedown", (e) => {
                console.log("Mouse down on canvas");
                this.handleMouseDown(e);
            });

            this.canvas.addEventListener("mousemove", (e) => {
                this.handleMouseMove(e);
            });

            this.canvas.addEventListener("mouseup", (e) => {
                console.log("Mouse up on canvas");
                this.handleMouseUp(e);
            });
        }
        
        console.log("Event listeners setup complete");
    }

    startGame() {
        console.log("Game started!");
        this.isGameActive = true;
    }

    resetGame() {
        console.log("Game reset!");
        this.bird = new Bird(100, 300, 20);
        this.init();
        this.isGameActive = false;
    }

    handleMouseDown(e) {
        if (!this.isGameActive || this.bird.isLaunched) return;

        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        const distance = Math.sqrt(
            (this.mouse.x - this.bird.x) ** 2 + (this.mouse.y - this.bird.y) ** 2
        );

        if (distance < this.bird.radius) {
            this.isDragging = true;
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const pullX = Math.max(0, this.bird.x - mouseX);
        const pullY = Math.max(0, mouseY - this.bird.y);
        const angle = Math.atan2(pullY, pullX);
        const power = Math.min(Math.sqrt(pullX ** 2 + pullY ** 2) / 10, 10);

        this.bird.launch(angle, power);
        this.isDragging = false;
    }

    checkCollision() {
        // 检查小鸟与猪的碰撞
        for (const pig of this.pigs) {
            if (pig.isAlive) {
                const distance = Math.sqrt(
                    (this.bird.x - pig.x) ** 2 + (this.bird.y - pig.y) ** 2
                );
                if (distance < this.bird.radius + pig.radius) {
                    pig.isAlive = false;
                    this.score += 10;
                    this.updateScore();
                }
            }
        }

        // 检查小鸟与方块的碰撞
        for (const block of this.blocks) {
            if (block.isActive) {
                if (
                    this.bird.x + this.bird.radius > block.x &&
                    this.bird.x - this.bird.radius < block.x + block.width &&
                    this.bird.y + this.bird.radius > block.y &&
                    this.bird.y - this.bird.radius < block.y + block.height
                ) {
                    block.isActive = false;
                    this.score += 5;
                    this.updateScore();
                    this.bird.velocity.x *= -0.5;
                    this.bird.velocity.y *= -0.5;
                }
            }
        }

        // 检查小鸟是否飞出边界
        if (
            this.bird.x < 0 ||
            this.bird.x > this.canvas.width ||
            this.bird.y > this.canvas.height
        ) {
            this.resetBird();
        }
    }

    resetBird() {
        this.bird = new Bird(100, 300, 20);
    }

    updateScore() {
        document.getElementById("score").textContent = `得分: ${this.score}`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制弹弓
        this.ctx.beginPath();
        this.ctx.moveTo(80, 300);
        this.ctx.lineTo(120, 300);
        this.ctx.strokeStyle = "#8B4513";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();

        // 绘制小鸟
        this.bird.draw(this.ctx);

        // 绘制猪
        for (const pig of this.pigs) {
            pig.draw(this.ctx);
        }

        // 绘制方块
        for (const block of this.blocks) {
            block.draw(this.ctx);
        }

        // 绘制瞄准线
        if (this.isDragging) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.bird.x, this.bird.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    update() {
        if (this.isGameActive) {
            this.bird.update();
            this.checkCollision();
        }
    }

    animate() {
        this.draw();
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化游戏
window.addEventListener("load", () => {
    console.log("Game loading...");
    new Game();
    console.log("Game loaded!");
});