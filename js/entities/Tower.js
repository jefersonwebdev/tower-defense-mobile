/**
 * TOWER.JS - Modelo Base com Trava de Alvo e Design Pulsante
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
     * Lógica de atualização com Trava de Alvo e Mira Precisa
     */
    update(currentTime, enemies, tileSize, projectilesArray) {
        // 1. VERIFICAR SE O ALVO ATUAL AINDA É VÁLIDO
        if (this.target) {
            // Calculamos a distância baseada no centro da torre e posição do inimigo
            const dx = this.target.x - (this.col + 0.5);
            const dy = this.target.y - (this.row + 0.5);
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Se o alvo morreu ou saiu do alcance, perdemos o foco
            if (this.target.isDead || dist > this.range) {
                this.target = null;
            } else {
                // Atualiza o ângulo para olhar para o inimigo
                this.angle = Math.atan2(dy, dx);
            }
        }

        // 2. SE NÃO TEM ALVO, PROCURAR O MAIS PRÓXIMO
        if (!this.target) {
            let closestDist = this.range;

            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const dx = enemy.x - (this.col + 0.5);
                const dy = enemy.y - (this.row + 0.5);
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
            this.shoot(projectilesArray, tileSize);
            this.lastShotTime = currentTime;
        }
    }

    shoot(projectilesArray, tileSize) {
        // Calculamos o centro exato da torre em pixels para o ponto de origem do tiro
        const centerX = (this.col * tileSize) + (tileSize / 2);
        const centerY = (this.row * tileSize) + (tileSize / 2);

        const bullet = new Projectile(
            centerX, 
            centerY, 
            this.target, 
            { 
                ...this.config,
                color: this.color // O projétil herda a cor da torre para o efeito de rastro
            }
        );
        
        projectilesArray.push(bullet);
        playSound(SFX.shoot);
    }

    draw(ctx, tileSize) {
        const x = this.col * tileSize;
        const y = this.row * tileSize;
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        // 1. CÁLCULO DA PULSAÇÃO (Alcance "Respirando")
        const pulse = 0.1 + Math.sin(Date.now() / 600) * 0.05;
        
        // 2. RAIO DE ALCANCE DINÂMICO TEMÁTICO
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.range * tileSize, 0, Math.PI * 2);
        
        const rangeGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.range * tileSize);
        rangeGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        rangeGrad.addColorStop(0.8, this.hexToRgba(this.color, pulse));
        rangeGrad.addColorStop(1, this.hexToRgba(this.color, pulse + 0.1));
        
        ctx.fillStyle = rangeGrad;
        ctx.fill();
        
        ctx.strokeStyle = this.hexToRgba(this.color, 0.3);
        ctx.setLineDash([8, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. SOMBRA PROJETADA
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(centerX + 4, centerY + 4, tileSize * 0.35, tileSize * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. BASE DA TORRE (Metal Industrial)
        const padding = tileSize * 0.15;
        const baseSize = tileSize - (padding * 2);
        
        ctx.fillStyle = "#1a252f"; // Sombra base
        ctx.fillRect(x + padding, y + padding, baseSize, baseSize);
        
        ctx.fillStyle = "#2c3e50"; // Metal principal
        ctx.fillRect(x + padding + 2, y + padding + 2, baseSize - 4, baseSize - 6);

        // 5. CANHÃO GIRATÓRIO
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.angle + Math.PI / 2);
        
        // Base do cano
        ctx.fillStyle = "#34495e";
        ctx.fillRect(-tileSize * 0.15, -tileSize * 0.1, tileSize * 0.3, tileSize * 0.2);
        
        // Cano principal
        ctx.fillStyle = "#1a252f"; 
        ctx.fillRect(-tileSize * 0.08, -tileSize * 0.45, tileSize * 0.16, tileSize * 0.45);
        
        // Bocal colorido (Identificação visual)
        ctx.fillStyle = this.color;
        ctx.fillRect(-tileSize * 0.1, -tileSize * 0.48, tileSize * 0.2, tileSize * 0.08);
        ctx.restore();

        // 6. CÚPULA SUPERIOR (Efeito de Vidro/Esfera)
        const domeGrad = ctx.createRadialGradient(
            centerX - tileSize * 0.08, centerY - tileSize * 0.08, 0,
            centerX, centerY, tileSize * 0.25
        );
        domeGrad.addColorStop(0, this.color);
        domeGrad.addColorStop(1, "#111");

        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, tileSize * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Brilho de reflexo
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, tileSize * 0.18, -Math.PI/2, 0);
        ctx.stroke();
    }

    /**
     * Helper para aplicar transparência em cores Hex
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}