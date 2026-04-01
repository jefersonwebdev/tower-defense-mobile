/**
 * SpecialAttacks.js
 */
import { UpgradeStore } from './UpgradeStore.js';

export const SpecialAttacks = {
    cooldowns: {
        meteor: 0 // Tempo restante para poder usar de novo (em frames ou ms)
    },

    // Configurações do Meteoro
    config: {
        meteor: {
            damage: 200,
            radius: 75,
            //cooldownTime: 10000 // 10 segundos
            cooldownTime: 1000 // 1 segundo
        }
    },

    update(deltaTime) {
        if (this.cooldowns.meteor > 0) {
            this.cooldowns.meteor -= deltaTime;
            if (this.cooldowns.meteor < 0) this.cooldowns.meteor = 0;
        }
    },

    // Função para disparar o Meteoro
    useMeteor(x, y, enemies, tileSize) { // Adicione tileSize como parâmetro
    if (UpgradeStore.state.upgrades.meteor.lvl < 2) return false;
    if (this.cooldowns.meteor > 0) return false;

    const radius = this.config.meteor.radius;
    let hitCount = 0;

    enemies.forEach(enemy => {
        // CONVERSÃO: Transforma a posição de grade do inimigo em pixels reais
        const enemyPixelX = enemy.x * tileSize;
        const enemyPixelY = enemy.y * tileSize;

        const dx = enemyPixelX - x;
        const dy = enemyPixelY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
            const damage = this.config.meteor.damage * UpgradeStore.getBonus('damage');
            enemy.takeDamage(damage);
            hitCount++;
        }
    });

    console.log(`Meteoro em pixels: ${x},${y} | Acertos: ${hitCount}`);
    this.cooldowns.meteor = this.config.meteor.cooldownTime;
    return true;
}
};