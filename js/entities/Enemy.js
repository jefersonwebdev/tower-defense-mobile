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

        // --- LÓGICA DE SPRITESHEET (Agora direta no config) ---
        this.frameWidth = config.frameWidth;   // Pegando direto do tipo de inimigo
        this.frameHeight = config.frameHeight; // Pegando direto do tipo de inimigo
        this.animations = config.animations;   // Pegando direto do tipo de inimigo

        this.spriteImage = null;

        if (config.spriteSheetSrc) {
            this.spriteImage = new Image();
            this.spriteImage.src = config.spriteSheetSrc;

            // Controle de Animação
            this.currentAnimation = 'walk';
            this.frameIndex = 0;
            this.tickCount = 0;
            this.ticksPerFrame = 10;

            this.spriteImage.onload = () => {
                // Calcula colunas usando o frameWidth local
                this.cols = Math.floor(this.spriteImage.width / this.frameWidth);
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
    if (distance > 0) {
        if (Math.abs(dx) > Math.abs(dy)) {
            this.facingDir = dx > 0 ? "RIGHT" : "LEFT";
        } else {
            this.facingDir = dy > 0 ? "DOWN" : "UP";
        }
    }

    // Movimentação
    if (distance < this.speed) {
        this.x = target.x;
        this.y = target.y;
        this.waypointIndex++;
    } else {
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
        this.distanceTraveled += this.speed;
    }

    // --- LÓGICA DE ANIMAÇÃO CORRIGIDA ---
    // Agora verificamos 'this.animations' diretamente
    if (this.animations && this.animations[this.currentAnimation]) {
        const anim = this.animations[this.currentAnimation];
        const frameSequence = anim.frames; 

        this.tickCount++;
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            this.frameIndex++;

            if (this.frameIndex >= frameSequence.length) {
                this.frameIndex = 0;
            }
        }
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

        // Só tentamos desenhar se a imagem existir e as animações estiverem carregadas
        if (this.spriteImage && this.spriteImage.complete && this.animations) {

            // 1. MAPEAMENTO DAS LINHAS (Baseado no seu layout)
            const rowMap = {
                "DOWN": 0,    // Linha 1
                "LEFT": 1,    // Linha 2
                "RIGHT": 2,   // Linha 3
                "UP": 3       // Linha 4
            };

            const currentRow = rowMap[this.facingDir] || 0;

            // 2. BUSCA DO FRAME REAL
            const anim = this.animations[this.currentAnimation];

            // Proteção caso a animação ou os frames não estejam definidos corretamente
            if (anim && anim.frames) {
                const actualFrameValue = anim.frames[this.frameIndex];

                // 3. CÁLCULO DO RECORTE (Usando as propriedades diretas: this.frameWidth/Height)
                const srcX = actualFrameValue * this.frameWidth;
                const srcY = currentRow * this.frameHeight;

                ctx.drawImage(
                    this.spriteImage,
                    srcX, srcY,
                    this.frameWidth,      // Largura original do frame na imagem
                    this.frameHeight,     // Altura original do frame na imagem
                    screenX - radius,     // Posiciona o centro do sprite no X
                    screenY - radius,     // Posiciona o centro do sprite no Y
                    drawSize,             // Largura final no canvas
                    drawSize              // Altura final no canvas
                );
            }
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