/**
 * PROJECTILE.JS - Sistema de Projéteis com Rastro de Luz e Efeitos de Status
 */
export class Projectile {
    constructor(x, y, target, config) {
        this.x = x;
        this.y = y;
        this.target = target;
        
        // Atributos base
        this.speed = config.speed || 5;
        this.damage = config.damage || 10;
        this.color = config.color || "#ffffff";
        this.type = config.type || 'BASIC'; // Importante para identificar o gelo
        this.isDead = false;

        // --- LÓGICA DE GELO ---
        // Se a config da torre tiver slow, o projétil armazena
        this.slowEffect = config.slowEffect || null;
        this.slowDuration = config.slowDuration || null;
        
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

        // COLISÃO
        if (distance < 10) {
            this.hitTarget();
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    /**
     * Gerencia o impacto no alvo
     */
    hitTarget() {
        // 1. Aplica o Dano
        this.target.takeDamage(this.damage);

        // 2. Aplica o Gelo (se for o caso)
        if (this.type === 'ICE' && this.slowEffect && this.target.applySlow) {
            this.target.applySlow(this.slowEffect, this.slowDuration);
        }

        this.isDead = true;
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
        ctx.shadowBlur = (this.type === 'ICE') ? 15 : 10; // Gelo brilha um pouco mais
        ctx.shadowColor = this.color;

        // 3. NÚCLEO DO PROJÉTIL
        ctx.beginPath();
        ctx.arc(this.x, this.y, tileSize * 0.08, 0, Math.PI * 2);
        // Se for gelo, o núcleo pode ser um azul bem clarinho em vez de branco puro
        ctx.fillStyle = (this.type === 'ICE') ? "#e0f7ff" : "white"; 
        ctx.fill();

        ctx.shadowBlur = 0; // Reseta

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