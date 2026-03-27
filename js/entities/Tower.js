/**
 * TOWER.JS - Modelo Base para todas as Torres
 */

import { Projectile } from './Projectile.js';
import { SFX, playSound } from '../core/AudioManager.js'; // Ajuste o caminho conforme sua pasta

export class Tower {
    /**
     * @param {number} col - Coluna na grade (Grid)
     * @param {number} row - Linha na grade (Grid)
     * @param {Object} config - Atributos vindos do TowerTypes.js
     */
    constructor(col, row, config = {}) {
        // Posição na grade
        this.col = col;
        this.row = row;

        // Atributos de combate (Extraídos do catálogo)
        this.type = config.type || 'BASIC';
        this.name = config.name || 'Torre';
        this.range = config.range || 3;           // Alcance em Tiles
        this.fireRate = config.fireRate || 1000;   // Milissegundos entre tiros
        this.color = config.color || "#3498db";    // Cor do topo
        this.bulletColor = config.bulletColor || "#f1c40f"; // Cor do tiro
        
        // Referência à config completa para passar para os projéteis
        this.config = config;

        // Estado interno
        this.angle = 0;           // Direção do canhão em radianos
        this.target = null;       // Inimigo sendo focado no momento
        this.lastShotTime = 0;    // Registro do último disparo (ms)
    }

    /**
     * Lógica de atualização da torre
     * @param {number} currentTime - Tempo vindo do gameLoop
     * @param {Array} enemies - Lista de inimigos vivos no mapa
     * @param {number} tileSize - Tamanho atual dos tiles
     * @param {Array} projectilesArray - Lista global de balas no Main.js
     */
    update(currentTime, enemies, tileSize, projectilesArray) {
        this.target = null;
        let closestDist = this.range; // Só busca quem estiver no raio

        // 1. PROCURAR ALVO: Busca o inimigo mais próximo dentro do alcance
        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const dx = enemy.x - this.col;
            const dy = enemy.y - this.row;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                this.target = enemy;
                closestDist = dist;
                
                // 2. MIRAR: Calcula o ângulo para o inimigo
                this.angle = Math.atan2(dy, dx);
            }
        }

        // 3. ATIRAR: Se tiver alvo e o cooldown (fireRate) acabou
        if (this.target && currentTime - this.lastShotTime > this.fireRate) {
            this.shoot(projectilesArray);
            this.lastShotTime = currentTime;
        }
    }

    /**
     * Cria um novo projétil
     */
    shoot(projectilesArray) {
    // 1. Criamos o projétil partindo do centro da torre
    const bullet = new Projectile(
        this.col, 
        this.row, 
        this.target, 
        this.config
    );
    projectilesArray.push(bullet);

    // 2. Tocamos o som de tiro (SFX)
    playSound(SFX.shoot);
}

    /**
     * Renderização visual da torre
     */
    draw(ctx, tileSize) {
        const x = this.col * tileSize;
        const y = this.row * tileSize;
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        // --- A. DESENHAR RAIO DE ALCANCE (Sutil) ---
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.range * tileSize, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fill();

        // --- B. DESENHAR BASE (Quadrado escuro) ---
        ctx.fillStyle = "#2c3e50";
        const padding = tileSize * 0.15;
        ctx.fillRect(x + padding, y + padding, tileSize - (padding * 2), tileSize - (padding * 2));

        // --- C. DESENHAR CANHÃO (Gira com a mira) ---
        ctx.save();
        ctx.translate(centerX, centerY);
        // O cano aponta para o ângulo calculado + 90 graus (correção visual)
        ctx.rotate(this.angle + Math.PI / 2);
        
        ctx.fillStyle = "#34495e"; 
        // Cano: largura fina, altura saindo do centro
        ctx.fillRect(-tileSize * 0.1, -tileSize * 0.45, tileSize * 0.2, tileSize * 0.45);
        ctx.restore();

        // --- D. DESENHAR TOPO (Cúpula Colorida) ---
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, tileSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Detalhe: Borda para destacar no fundo verde
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}