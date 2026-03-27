/**
 * TOWER.JS - Modelo Base com Trava de Alvo (Target Locking)
 */

import { Projectile } from './Projectile.js';
import { SFX, playSound } from '../core/AudioManager.js';

export class Tower {
    constructor(col, row, config = {}) {
        this.col = col;
        this.row = row;

        this.type = config.type || 'BASIC';
        this.name = config.name || 'Torre';
        this.range = config.range || 3;
        this.fireRate = config.fireRate || 1000;
        this.color = config.color || "#3498db";
        this.bulletColor = config.bulletColor || "#f1c40f";
        
        this.config = config;

        this.angle = 0;
        this.target = null;
        this.lastShotTime = 0;
    }

    /**
     * Lógica de atualização com Trava de Alvo
     */
    update(currentTime, enemies, tileSize, projectilesArray) {
        // 1. VERIFICAR SE O ALVO ATUAL AINDA É VÁLIDO
        if (this.target) {
            const dx = this.target.x - this.col;
            const dy = this.target.y - this.row;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Se o alvo morreu ou saiu do alcance, perdemos o foco
            if (this.target.isDead || dist > this.range) {
                this.target = null;
            } else {
                // O alvo ainda é válido: apenas atualizamos o ângulo da mira
                this.angle = Math.atan2(dy, dx);
            }
        }

        // 2. SE NÃO TEM ALVO, PROCURAR O MAIS PRÓXIMO
        if (!this.target) {
            let closestDist = this.range;

            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const dx = enemy.x - this.col;
                const dy = enemy.y - this.row;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < closestDist) {
                    this.target = enemy;
                    closestDist = dist;
                    this.angle = Math.atan2(dy, dx);
                }
            }
        }

        // 3. ATIRAR: Se tiver alvo e o cooldown acabou
        if (this.target && currentTime - this.lastShotTime > this.fireRate) {
            this.shoot(projectilesArray);
            this.lastShotTime = currentTime;
        }
    }

    shoot(projectilesArray) {
        const bullet = new Projectile(
            this.col, 
            this.row, 
            this.target, 
            this.config
        );
        projectilesArray.push(bullet);
        playSound(SFX.shoot);
    }

    draw(ctx, tileSize) {
        const x = this.col * tileSize;
        const y = this.row * tileSize;
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        // Raio de Alcance
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.range * tileSize, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fill();

        // Base
        ctx.fillStyle = "#2c3e50";
        const padding = tileSize * 0.15;
        ctx.fillRect(x + padding, y + padding, tileSize - (padding * 2), tileSize - (padding * 2));

        // Canhão
        ctx.save();
        ctx.translate(centerX, centerY);
        // Ajustamos para o cano apontar corretamente na direção do ângulo
        ctx.rotate(this.angle + Math.PI / 2);
        
        ctx.fillStyle = "#34495e"; 
        ctx.fillRect(-tileSize * 0.1, -tileSize * 0.45, tileSize * 0.2, tileSize * 0.45);
        ctx.restore();

        // Topo
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, tileSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}