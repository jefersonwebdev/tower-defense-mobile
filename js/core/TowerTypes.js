import { UpgradeStore } from './UpgradeStore.js';

/**
 * Retorna as estatísticas da torre já calculadas com os upgrades do jogador.
 * @param {string} type - O tipo da torre (BASIC, FAST, SNIPER, ICE)
 * @returns {Object} Atributos da torre atualizados
 */
export const getTowerStats = (type) => {
    // Pegamos os níveis atuais de upgrade
    const damageLvl = UpgradeStore.state.upgrades.damage.lvl;
    const rangeLvl = UpgradeStore.state.upgrades.range.lvl;
    const iceLvl = UpgradeStore.state.upgrades.ice.lvl;

    const towers = {
        BASIC: {
            type: 'BASIC',
            name: 'GUN',
            color: '#3498db',
            bulletColor: '#f1c40f',
            // Bônus: +0.2 tiles por nível
            range: 2 + (rangeLvl - 1) * 0.2, 
            fireRate: 800,
            // Bônus: +5 de dano por nível
            damage: 15 + (damageLvl - 1) * 5,
            price: 50,
            description: 'Uma torre equilibrada para iniciantes.'
        },

        FAST: {
            type: 'FAST',
            name: 'SMG',
            color: '#e67e22',
            bulletColor: '#ecf0f1',
            range: 1.5 + (rangeLvl - 1) * 0.1,
            fireRate: 200,
            damage: 10 + (damageLvl - 1) * 3,
            price: 100,
            description: 'Alta cadência de tiro, baixo alcance.'
        },

        SNIPER: {
            type: 'SNIPER',
            name: 'CANNON',
            color: '#9b59b6',
            bulletColor: '#e74c3c',
            range: 3.5 + (rangeLvl - 1) * 0.5,
            fireRate: 2000,
            damage: 50 + (damageLvl - 1) * 15,
            price: 150,
            description: 'Lenta, mas elimina alvos à distância.'
        },

        ICE: {
            type: 'ICE',
            name: 'FROST',
            color: '#00d4ff',
            bulletColor: '#ffffff',
            range: 2 + (rangeLvl - 1) * 0.2,
            fireRate: 1000,
            damage: 5 + (damageLvl - 1) * 2,
            price: 25,
            // Lógica de Gelo:
            slowEffect: 0.5 * Math.pow(0.9, iceLvl - 1), // Reduz vel. (cada nível melhora 10%)
            slowDuration: 1500 + (iceLvl - 1) * 500,    // Duração do gelo em ms
            description: 'Gela os inimigos, reduzindo sua velocidade.'
        }
    };

    return towers[type] || towers.BASIC;
};