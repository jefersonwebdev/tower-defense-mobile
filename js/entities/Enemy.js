/**
 * ENEMY.JS - Lógica de Movimentação e Renderização de Inimigos
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

    // Atributos de Stats
    this.name = config.name || "Normal";
    this.health = config.health || 100;
    this.maxHealth = this.health;
    this.speed = config.speed || 0.02;
    this.size = config.size || 0.35;
    this.reward = config.reward || 10;
    this.color = config.color || "#e74c3c";

    // --- LÓGICA DE SPRITESHEET ---
    this.spriteConfig = config.spriteConfig; // Configurações de frame/animação
    this.spriteImage = null;

    if (config.spriteSheetSrc) {
        this.spriteImage = new Image();
        this.spriteImage.src = config.spriteSheetSrc; // Caminho: 'assets/slime_blue.png'
        
        // Controle de Animação
        this.currentAnimation = 'walk';
        this.frameIndex = 0;
        this.tickCount = 0; // Contador para trocar o frame
        this.ticksPerFrame = 10; // Velocidade da animação (menor = mais rápido)
        
        this.spriteImage.onload = () => {
            // Calcula quantas colunas existem na imagem automaticamente
            this.cols = Math.floor(this.spriteImage.width / this.spriteConfig.frameWidth);
        };
    }

    this.isDead = false;
    this.distanceTraveled = 0;
}

    /**
     * Atualiza a posição seguindo os waypoints
     */
    update(tileSize) {
    if (this.isDead) return;

    const target = this.waypoints[this.waypointIndex];
    if (!target) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // --- LÓGICA DE DIREÇÃO ---
    // Comparamos se o movimento é mais "horizontal" ou "vertical"
    if (distance > 0) {
        if (Math.abs(dx) > Math.abs(dy)) {
            // Movimento Horizontal
            this.facingDir = dx > 0 ? "RIGHT" : "LEFT";
        } else {
            // Movimento Vertical
            this.facingDir = dy > 0 ? "DOWN" : "UP";
        }
    }

    // Movimentação (seu código original)
    if (distance < this.speed) {
        this.x = target.x;
        this.y = target.y;
        this.waypointIndex++;
    } else {
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
        this.distanceTraveled += this.speed;
    }

    // --- LÓGICA DO FRAME (1, 2, 3) ---
    this.tickCount++;
    if (this.tickCount > this.ticksPerFrame) {
        this.tickCount = 0;
        this.frameIndex++;
        if (this.frameIndex > 2) this.frameIndex = 0; // Ciclo de 3 frames (0, 1, 2)
    }

    if (this.health <= 0) this.isDead = true;
}

    /**
     * Desenha o inimigo e sua barra de vida
     */
    draw(ctx, tileSize) {
    if (this.isDead) return;

    const screenX = this.x * tileSize;
    const screenY = this.y * tileSize;
    const radius = tileSize * this.size;
    const drawSize = radius * 2;

    if (this.spriteImage && this.spriteImage.complete) {
        // MAPEAMENTO DAS LINHAS
        const rowMap = {
            "DOWN": 0,    // Linha 1 da imagem
            "LEFT": 1,    // Linha 2 da imagem
            "RIGHT": 2,   // Linha 3 da imagem
            "UP": 3       // Linha 4 da imagem
        };

        const currentRow = rowMap[this.facingDir] || 0;

        // Cálculo do recorte
        // frameIndex varia de 0 a 2 (os 3 frames solicitados)
        const srcX = this.frameIndex * this.spriteConfig.frameWidth;
        const srcY = currentRow * this.spriteConfig.frameHeight;

        ctx.drawImage(
            this.spriteImage,
            srcX, srcY,
            this.spriteConfig.frameWidth,
            this.spriteConfig.frameHeight,
            screenX - radius, 
            screenY - radius,
            drawSize, 
            drawSize
        );
        
    } else {
        // Fallback: Se a imagem ainda não carregou, desenha o círculo original
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 3. Barra de Vida (Mantida como estava)
    if (this.health < this.maxHealth) {
        const barWidth = tileSize * 0.6;
        const barHeight = 4;
        const barX = screenX - barWidth / 2;
        const barY = screenY - radius - 8;

        ctx.fillStyle = "#c0392b";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = Math.max(0, this.health / this.maxHealth);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}

    /**
     * Aplica dano ao inimigo
     */
    takeDamage(amount) {
        this.health -= amount;
    }
}