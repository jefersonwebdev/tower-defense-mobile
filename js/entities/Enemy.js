/**
 * ENEMY.JS - Lógica de Movimentação e Renderização de Inimigos
 */

export class Enemy {
    /**
     * @param {Array} waypoints - Lista de coordenadas {x, y} do caminho
     * @param {Object} config - Objeto vindo do ENEMY_TYPES (EnemyTypes.js)
     */
    constructor(waypoints, config = {}) {
        this.waypoints = waypoints;
        this.waypointIndex = 0;

        // Posição inicial no primeiro waypoint
        this.x = waypoints[0].x;
        this.y = waypoints[0].y;

        // Atributos baseados no tipo (vindo do catálogo)
        this.name = config.name || "Normal";
        this.health = config.health || 100;
        this.maxHealth = this.health;
        this.speed = config.speed || 0.02;
        this.color = config.color || "#e74c3c";
        this.size = config.size || 0.35; // Multiplicador do TILE_SIZE (ex: 0.35 = 35% do tile)
        this.reward = config.reward || 10;

        this.isDead = false;
        this.distanceTraveled = 0; // Útil para a torre decidir em quem atirar primeiro
    }

    /**
     * Atualiza a posição seguindo os waypoints
     */
    update(tileSize) {
        if (this.isDead) return;

        const target = this.waypoints[this.waypointIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Chegou no waypoint atual, vai para o próximo
            this.x = target.x;
            this.y = target.y;
            this.waypointIndex++;
        } else {
            // Move-se em direção ao alvo
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.distanceTraveled += this.speed;
        }

        // Se a vida chegar a zero, marca como morto
        if (this.health <= 0) {
            this.isDead = true;
        }
    }

    /**
     * Desenha o inimigo e sua barra de vida
     */
    draw(ctx, tileSize) {
        if (this.isDead) return;

        const screenX = this.x * tileSize;
        const screenY = this.y * tileSize;
        const radius = tileSize * this.size;

        // 1. Desenhar Sombra (Sutil)
        ctx.beginPath();
        ctx.arc(screenX + 2, screenY + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fill();

        // 2. Corpo do Inimigo
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Detalhe: Borda para dar profundidade
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Barra de Vida (Só aparece se tiver levado dano)
        if (this.health < this.maxHealth) {
            const barWidth = tileSize * 0.6;
            const barHeight = 4;
            const barX = screenX - barWidth / 2;
            const barY = screenY - radius - 8;

            // Fundo da barra (Vermelho/Vazio)
            ctx.fillStyle = "#c0392b";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Frente da barra (Verde/Atual)
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