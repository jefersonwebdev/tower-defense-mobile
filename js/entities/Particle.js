/**
 * PARTICLE.JS - Efeito de Explosão e Faíscas
 */
export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Direção aleatória (Explosão circular)
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1; // Velocidade variada
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Vida da partícula (frames)
        this.life = 1.0; 
        this.decay = Math.random() * 0.02 + 0.015; // Velocidade com que some
        this.size = Math.random() * 3 + 2; // Tamanho aleatório
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Atrito (vai parando aos poucos)
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        // Diminui a vida
        this.life -= this.decay;
    }

    draw(ctx, tileSize) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Efeito de brilho na partícula
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Desenha um pequeno quadrado ou círculo
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}