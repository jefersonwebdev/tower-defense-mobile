import { COLORS } from '../constants.js';

export class Projectile {
    /**
     * @param {number} x - Posição X inicial (centro da torre)
     * @param {number} y - Posição Y inicial (centro da torre)
     * @param {Object} target - O inimigo alvo
     * @param {Object} config - Configuração da torre (dano, velocidade, cor)
     */
    constructor(x, y, target, config) {
        this.x = x;
        this.y = y;
        this.target = target; // Mantém o alvo para seguir (opcional, pode ser linha reta)
        
        // Atributos baseados na torre que atirou
        this.speed = config.projectileSpeed || 0.2; // Velocidade em Grid Units por frame
        this.damage = config.damage || 10;
        this.color = config.bulletColor || "#f1c40f"; // Amarelo padrão
        this.radius = 0.1; // Tamanho da bala em relação ao Tile

        this.isDead = false; // Para remover da memória
    }

    /**
     * Lógica de Movimento (Persegue o alvo)
     */
    update(tileSize) {
        // Se o alvo morreu antes da bala chegar, a bala "morre"
        if (!this.target || this.target.isDead) {
            this.isDead = true;
            return;
        }

        // Calcula a direção para o alvo
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Se a bala chegou perto o suficiente (Colisão)
        if (distance < this.speed) {
            this.target.health -= this.damage; // Aplica o dano
            if (this.target.health <= 0) this.target.isDead = true;
            this.isDead = true; // A bala some
        } else {
            // Move-se em direção ao alvo
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx, tileSize) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Desenha a bala centralizada no Tile
        ctx.arc(this.x * tileSize + tileSize/2, this.y * tileSize + tileSize/2, tileSize * this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho opcional para mobile
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // Reseta o brilho para não afetar outros desenhos
    }
}