/**
 * ENEMY.JS - Lógica de Movimentação e Renderização com Suporte a Status
 */
export class Enemy {
    /**
     * @param {Array} waypoints - Lista de coordenadas {x, y} do caminho
     * @param {Object} config - Objeto vindo do ENEMY_TYPES (EnemyTypes.js)
     */
    constructor(waypoints, config) {
        this.waypoints = waypoints;
        this.waypointIndex = 0;

        // Posição inicial
        this.x = waypoints[0].x;
        this.y = waypoints[0].y;

        // --- ATRIBUTOS DE STATS (Vindos do teu config) ---
        this.name = config.name || "Normal";
        this.health = config.health || 100;
        this.maxHealth = this.health;
        
        // Lógica de Velocidade para o Gelo:
        // Guardamos a original para poder voltar ao normal depois que o gelo derreter
        this.baseSpeed = config.speed || 0.02; 
        this.speed = this.baseSpeed; 
        
        this.size = config.size || 0.35;
        this.reward = config.reward || 10;
        this.color = config.color || "#e74c3c";

        // --- LÓGICA DE STATUS ---
        this.slowTimer = 0;

        // --- CONFIGURAÇÃO DE SPRITES (Mantendo o teu padrão) ---
        this.frameWidth = config.frameWidth;
        this.frameHeight = config.frameHeight;
        this.animations = config.animations;
        this.spriteImage = null;

        if (config.spriteSheetSrc) {
            this.spriteImage = new Image();
            this.spriteImage.src = config.spriteSheetSrc;
            this.currentAnimation = 'walk';
            this.frameIndex = 0;
            this.tickCount = 0;
            this.ticksPerFrame = 10;

            this.spriteImage.onload = () => {
                this.cols = Math.floor(this.spriteImage.width / this.frameWidth);
            };
        }

        this.isDead = false;
        this.distanceTraveled = 0;
    }

    /**
     * Esta é a função que o Projétil de Gelo vai chamar
     */
    applySlow(multiplier, duration) {
        this.speed = this.baseSpeed * multiplier;
        this.slowTimer = duration; 
    }

    update(tileSize) {
        if (this.isDead) return;

        // 1. GERENCIAMENTO DO GELO (Timer)
        if (this.slowTimer > 0) {
            this.slowTimer--; 
            if (this.slowTimer <= 0) {
                this.speed = this.baseSpeed; // Reseta para a velocidade do EnemyTypes
            }
        }

        const target = this.waypoints[this.waypointIndex];
        if (!target) return;

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Direção
        if (distance > 0) {
            if (Math.abs(dx) > Math.abs(dy)) {
                this.facingDir = dx > 0 ? "RIGHT" : "LEFT";
            } else {
                this.facingDir = dy > 0 ? "DOWN" : "UP";
            }
        }

        // Movimentação (Usa this.speed que pode estar modificada)
        if (distance < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.waypointIndex++;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.distanceTraveled += this.speed;
        }

        // Animação (Desacelera se estiver lento)
        if (this.animations && this.animations[this.currentAnimation]) {
            const anim = this.animations[this.currentAnimation];
            this.tickCount++;
            
            const effectiveDelay = this.slowTimer > 0 ? this.ticksPerFrame * 2 : this.ticksPerFrame;

            if (this.tickCount > effectiveDelay) {
                this.tickCount = 0;
                this.frameIndex++;
                if (this.frameIndex >= anim.frames.length) this.frameIndex = 0;
            }
        }

        if (this.health <= 0) this.isDead = true;
    }

    draw(ctx, tileSize) {
    if (this.isDead) return;

    const screenX = this.x * tileSize;
    const screenY = this.y * tileSize;
    const radius = tileSize * this.size;
    const drawSize = radius * 2;

    ctx.save();

    // 1. Aura de Gelo (Substitui o shadowBlur que causa lag)
    if (this.slowTimer > 0) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 212, 255, 0.2)"; // Azul ciano bem suave
        ctx.fill();
    }

    // 2. Renderização do Inimigo (Sprite ou Círculo)
    if (this.spriteImage && this.spriteImage.complete && this.animations) {
        const rowMap = { "DOWN": 0, "LEFT": 1, "RIGHT": 2, "UP": 3 };
        const currentRow = rowMap[this.facingDir] || 0;
        const anim = this.animations[this.currentAnimation];

        if (anim && anim.frames) {
            const actualFrameValue = anim.frames[this.frameIndex];
            ctx.drawImage(
                this.spriteImage,
                actualFrameValue * this.frameWidth, currentRow * this.frameHeight,
                this.frameWidth, this.frameHeight,
                screenX - radius, screenY - radius,
                drawSize, drawSize
            );
        }
    } else {
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // 3. Tintura de Gelo (O pulo do gato para performance!)
    if (this.slowTimer > 0) {
        // 'source-atop' faz com que o retângulo abaixo só pinte ONDE JÁ EXISTE desenho
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "rgba(0, 212, 255, 0.35)"; // Tinta azul transparente
        ctx.fillRect(screenX - radius, screenY - radius, drawSize, drawSize);
    }

    ctx.restore(); // Limpa o CompositeOperation e estados

    // 4. Barra de Vida (Sempre visível e leve)
    if (this.health < this.maxHealth) {
        const barWidth = tileSize * 0.6;
        const barHeight = 4;
        const barX = screenX - barWidth / 2;
        const barY = screenY - radius - 8;
        
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
}

    takeDamage(amount) {
        this.health -= amount;
    }
}