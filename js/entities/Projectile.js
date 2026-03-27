/**
 * PROJECTILE.JS - Sistema de Projéteis com Rastro de Luz
 */
export class Projectile {
    constructor(x, y, target, config) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = config.speed || 5;
        this.damage = config.damage || 10;
        this.color = config.color || "#ffffff";
        this.isDead = false;
        
        // Histórico de posições para o rastro (Trail)
        this.history = [];
        this.maxHistory = 6; 
    }

    update(tileSize) {
        if (this.isDead) return;

        // Se o alvo sumir ou morrer, o projétil se dissipa
        if (!this.target || this.target.health <= 0) {
            this.isDead = true;
            return;
        }

        // Salva posição atual para o rastro
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) this.history.shift();

        // Cálculo de movimentação em direção ao alvo
        const dx = (this.target.x * tileSize) - this.x;
        const dy = (this.target.y * tileSize) - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            this.target.takeDamage(this.damage);
            this.isDead = true;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx, tileSize) {
        // 1. DESENHO DO RASTRO (TRAIL)
        this.history.forEach((pos, index) => {
            const opacity = index / this.history.length;
            const size = (tileSize * 0.08) * opacity;
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(this.color, opacity * 0.5);
            ctx.fill();
        });

        // 2. BRILHO EXTERNO (GLOW)
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        // 3. NÚCLEO DO PROJÉTIL
        ctx.beginPath();
        ctx.arc(this.x, this.y, tileSize * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = "white"; // Núcleo branco para parecer quente/energia
        ctx.fill();

        // Reseta efeitos de sombra para não pesar o desempenho
        ctx.shadowBlur = 0;

        // 4. BORDA COLORIDA
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}