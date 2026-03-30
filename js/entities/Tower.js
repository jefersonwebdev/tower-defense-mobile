/**
 * TOWER.JS - Modelo Base com Trava de Alvo e Design Pulsante
 */

import { Projectile } from './Projectile.js';
import { SFX, playSound } from '../core/AudioManager.js';
import { getTowerStats } from '../core/TowerTypes.js';

export class Tower {
    constructor(col, row, type = 'BASIC') {
        this.col = col;
        this.row = row;
        this.type = type;

        // BUSCA DINÂMICA: Pega os dados já calculados com upgrades
        const stats = getTowerStats(type);

        // Atribui os valores das estatísticas à instância
        this.name = stats.name;
        this.color = stats.color;
        this.bulletColor = stats.bulletColor;
        this.range = stats.range;           // Já vem com bônus de alcance
        this.fireRate = stats.fireRate;
        this.damage = stats.damage;         // Já vem com bônus de dano
        
        // Atributos específicos para a Torre de Gelo
        this.slowEffect = stats.slowEffect || null;
        this.slowDuration = stats.slowDuration || null;

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
    // Calculamos o centro exato da torre em pixels
    const centerX = (this.col * tileSize) + (tileSize / 2);
    const centerY = (this.row * tileSize) + (tileSize / 2);

    // CRIAMOS O OBJETO DE CONFIGURAÇÃO MANUALMENTE COM OS DADOS DA INSTÂNCIA
    const bulletConfig = {
        type: this.type,           // Passa 'ICE'
        damage: this.damage,       // Dano atualizado
        color: this.color,         // Cor do rastro
        slowEffect: this.slowEffect,     // Multiplicador (ex: 0.5)
        slowDuration: this.slowDuration, // Duração (ex: 1500)
        speed: 5                   // Velocidade do projétil
    };

    const bullet = new Projectile(
        centerX, 
        centerY, 
        this.target, 
        bulletConfig
    );
    
    projectilesArray.push(bullet);
    playSound(SFX.shoot);
}

    draw(ctx, tileSize, gameMap) {
    const x = this.col * tileSize;
    const y = this.row * tileSize;
    const centerX = x + tileSize / 2;
    const centerY = y + tileSize / 2;

    ctx.save(); 

    // 1. VALIDAÇÃO DE POSICIONAMENTO (CAMINHO VS GRAMA)
    // Verifica se o tile atual sob a torre é diferente de 0 (caminho/obstáculo)
    const isInvalidPos = gameMap && gameMap.getTileAt(this.col, this.row) !== 0;
    
    // Define a cor temática: Vermelho se inválido e arrastando, senão a cor original da torre
    const feedbackColor = (this.isDragging && isInvalidPos) ? "#ff4757" : this.color;

    // 2. EFEITO DE ARRASTE (DRAG FEEDBACK)
    if (this.isDragging) {
        ctx.globalAlpha = 0.7; // Levemente mais visível que antes
        
        // Quadrado de destaque no chão: Vermelho se inválido, branco se válido
        ctx.fillStyle = isInvalidPos ? "rgba(255, 71, 87, 0.3)" : "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x, y, tileSize, tileSize);
    }

    // 3. CÁLCULO DA PULSAÇÃO
    const pulseBase = Math.sin(Date.now() / 600) * 0.05;
    const pulse = this.isDragging ? 0.3 + pulseBase : 0.1 + pulseBase;
    
    // 4. RAIO DE ALCANCE DINÂMICO
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.range * tileSize, 0, Math.PI * 2);
    
    const rangeGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.range * tileSize);
    rangeGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    rangeGrad.addColorStop(0.8, this.hexToRgba(feedbackColor, pulse));
    rangeGrad.addColorStop(1, this.hexToRgba(feedbackColor, pulse + 0.1));
    
    ctx.fillStyle = rangeGrad;
    ctx.fill();
    
    // BORDA DO ALCANCE: Fica sólida e grossa (4px) se a posição for inválida
    ctx.strokeStyle = this.hexToRgba(feedbackColor, 0.8);
    if (this.isDragging && isInvalidPos) {
        ctx.lineWidth = 4;
        ctx.setLineDash([]); // Linha sólida para erro
    } else {
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]); // Linha tracejada para normal/válido
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. SOMBRA PROJETADA (Oculta ao arrastar para foco total no alcance)
    if (!this.isDragging) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(centerX + 4, centerY + 4, tileSize * 0.35, tileSize * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 6. BASE DA TORRE (Metal Industrial)
    const padding = tileSize * 0.15;
    const baseSize = tileSize - (padding * 2);
    
    ctx.fillStyle = "#1a252f"; 
    ctx.fillRect(x + padding, y + padding, baseSize, baseSize);
    
    ctx.fillStyle = "#2c3e50"; 
    ctx.fillRect(x + padding + 2, y + padding + 2, baseSize - 4, baseSize - 6);

    // 7. CANHÃO GIRATÓRIO
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.angle + Math.PI / 2);
    
    ctx.fillStyle = "#34495e";
    ctx.fillRect(-tileSize * 0.15, -tileSize * 0.1, tileSize * 0.3, tileSize * 0.2);
    
    ctx.fillStyle = "#1a252f"; 
    ctx.fillRect(-tileSize * 0.08, -tileSize * 0.45, tileSize * 0.16, tileSize * 0.45);
    
    // Bocal reflete a cor de feedback
    ctx.fillStyle = feedbackColor;
    ctx.fillRect(-tileSize * 0.1, -tileSize * 0.48, tileSize * 0.2, tileSize * 0.08);
    ctx.restore();

    // 8. CÚPULA SUPERIOR (Reflete a cor de feedback)
    const domeGrad = ctx.createRadialGradient(
        centerX - tileSize * 0.08, centerY - tileSize * 0.08, 0,
        centerX, centerY, tileSize * 0.25
    );
    domeGrad.addColorStop(0, feedbackColor);
    domeGrad.addColorStop(1, "#111");

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileSize * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Brilho de reflexo na cúpula
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileSize * 0.18, -Math.PI/2, 0);
    ctx.stroke();

    ctx.restore(); 
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

    /**
 * Gera uma imagem Base64 do design da torre para ser usada em elementos HTML
 */
static generateStaticIcon(config, size = 64) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d');
    const tileSize = size;
    
    // Simula as coordenadas centrais para o desenho
    const centerX = size / 2;
    const centerY = size / 2;
    const x = 0;
    const y = 0;
    const feedbackColor = config.color || "#3498db";

    // Reutilizamos a lógica visual do seu método draw (simplificada para ícone estático)
    ctx.save();

    // 6. BASE (Copiado do seu draw)
    const padding = tileSize * 0.15;
    const baseSize = tileSize - (padding * 2);
    ctx.fillStyle = "#1a252f"; 
    ctx.fillRect(x + padding, y + padding, baseSize, baseSize);
    ctx.fillStyle = "#2c3e50"; 
    ctx.fillRect(x + padding + 2, y + padding + 2, baseSize - 4, baseSize - 6);

    // 7. CANHÃO (Ângulo fixo para cima para o botão)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(0); // Apontando para cima no ícone
    ctx.fillStyle = "#34495e";
    ctx.fillRect(-tileSize * 0.15, -tileSize * 0.1, tileSize * 0.3, tileSize * 0.2);
    ctx.fillStyle = "#1a252f"; 
    ctx.fillRect(-tileSize * 0.08, -tileSize * 0.45, tileSize * 0.16, tileSize * 0.45);
    ctx.fillStyle = feedbackColor;
    ctx.fillRect(-tileSize * 0.1, -tileSize * 0.48, tileSize * 0.2, tileSize * 0.08);
    ctx.restore();

    // 8. CÚPULA SUPERIOR
    const domeGrad = ctx.createRadialGradient(
        centerX - tileSize * 0.08, centerY - tileSize * 0.08, 0,
        centerX, centerY, tileSize * 0.25
    );
    domeGrad.addColorStop(0, feedbackColor);
    domeGrad.addColorStop(1, "#111");
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileSize * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Reflexo
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileSize * 0.18, -Math.PI/2, 0);
    ctx.stroke();

    ctx.restore();

    return tempCanvas.toDataURL(); // Retorna a string da imagem
}
}


