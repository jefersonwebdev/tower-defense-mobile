/**
 * PARTICLE.JS - Pequenos fragmentos para efeitos visuais
 */
export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Direção aleatória (360 graus)
        const angle = Math.random() * Math.PI * 2;
        // Velocidade aleatória
        const speed = Math.random() * 0.05 + 0.02;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.life = 1.0; // Vida da partícula (1.0 a 0.0)
        this.decay = Math.random() * 0.03 + 0.02; // Quão rápido ela some
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        if (this.life < 0) this.life = 0;
    }

    draw(ctx, tileSize) {
        ctx.globalAlpha = this.life; // Vai ficando transparente
        ctx.fillStyle = this.color;
        
        const size = tileSize * 0.1;
        ctx.fillRect(
            this.x * tileSize + tileSize/2, 
            this.y * tileSize + tileSize/2, 
            size, size
        );
        
        ctx.globalAlpha = 1.0; // Reseta a transparência
    }
}