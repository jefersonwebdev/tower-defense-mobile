import { ENEMY_CONFIG, COLORS } from '../constants.js';

export class Enemy {
    /**
     * @param {Array} waypoints - Lista de coordenadas [{x, y}] que formam o caminho
     */
    constructor(waypoints) {
        this.waypoints = waypoints; // O caminho que ele deve seguir
        this.waypointIndex = 0;     // Em qual curva do caminho ele está
        
        // Posição inicial (primeiro waypoint)
        this.x = waypoints[0].x;
        this.y = waypoints[0].y;

        // Atributos base
        this.health = ENEMY_CONFIG.DEFAULT_HEALTH;
        this.speed = ENEMY_CONFIG.DEFAULT_SPEED;
        this.radius = 0.25; // Tamanho em relação ao Tile
        this.isDead = false;
    }

    /**
     * Lógica de Movimento
     */
    update(tileSize) {
        if (this.waypointIndex >= this.waypoints.length) return;

        const target = this.waypoints[this.waypointIndex];
        
        // Distância até o próximo ponto
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Se chegou no ponto atual, foca no próximo
        if (distance < this.speed) {
            this.waypointIndex++;
        } else {
            // Move-se em direção ao alvo
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Verifica se chegou ao fim (Base)
        if (this.waypointIndex >= this.waypoints.length) {
            this.isDead = true; 
            // Aqui depois subtraímos vida do jogador
        }
    }

    draw(ctx, tileSize) {
        ctx.fillStyle = "#e74c3c"; // Vermelho
        ctx.beginPath();
        ctx.arc(this.x * tileSize + tileSize/2, this.y * tileSize + tileSize/2, tileSize * this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Barra de Vida simples em cima do inimigo
        ctx.fillStyle = "#27ae60";
        const healthBarWidth = tileSize * 0.5;
        ctx.fillRect(this.x * tileSize + tileSize/4, this.y * tileSize, (this.health/100) * healthBarWidth, 4);
    }
}