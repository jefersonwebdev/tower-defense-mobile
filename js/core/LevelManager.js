/**
 * LevelManager.js
 * Gerencia o estado das fases, progresso e conversão de dados.
 */
import { LEVELS, parseMapLayout } from './Levels.js';
import { UpgradeStore } from './UpgradeStore.js';

export class LevelManager {
    constructor() {
        this.levels = {};
        this.init();
    }

    /**
     * Inicializa os níveis a partir do banco de dados (LEVELS)
     * Converte o layout de string para matriz e define estados iniciais.
     */
    init() {
        // Tenta carregar do LocalStorage para não perder progresso ao dar F5
        const savedProgress = JSON.parse(localStorage.getItem('td_progress')) || {};

        LEVELS.forEach((lvl) => {
            const progress = savedProgress[lvl.id] || { unlocked: lvl.id === 1, stars: 0 };
            
            this.levels[lvl.id] = {
                ...lvl,
                // Converte a string mapLayout em matriz real [][], se existir
                grid: lvl.mapLayout ? parseMapLayout(lvl.mapLayout) : [],
                // Prioriza o progresso salvo, senão usa o padrão
                unlocked: progress.unlocked,
                stars: progress.stars
            };
        });
    }

    /**
     * Calcula quantas estrelas o jogador ganhou baseado na vida restante.
     * @param {number} currentLives - Vida ao final do jogo.
     * @param {number} maxLives - Vida total permitida.
     * @returns {number} 1, 2 ou 3 estrelas.
     */
    calculateStars(currentLives, maxLives) {
        const percentage = (currentLives / maxLives) * 100;
        if (percentage >= 100) return 3;
        if (percentage >= 50) return 2;
        return 1;
    }

    /**
     * Processa a vitória: salva estrelas e desbloqueia o próximo nível.
     */
    processWin(levelId, starsEarned) {
        const lvl = this.levels[levelId];
        if (!lvl) return;

        // --- LÓGICA DE MOEDA PARA UPGRADES ---
        // Se o jogador superou o recorde anterior, ele ganha a diferença em "estrelas gastáveis"
        // Ex: Tinha 1 estrela, agora ganhou 3. Ele recebe +2 para gastar no UpgradeStore.
        const newStarsForBank = starsEarned - lvl.stars;
        if (newStarsForBank > 0) {
            UpgradeStore.addStars(newStarsForBank);
        }

        // Atualiza o recorde visual da fase
        if (starsEarned > lvl.stars) {
            lvl.stars = starsEarned;
        }

        // Desbloqueia o próximo nível (se existir)
        const nextId = levelId + 1;
        if (this.levels[nextId]) {
            this.levels[nextId].unlocked = true;
        }

        this.saveToStorage();
    }

    /**
     * Soma todas as estrelas conquistadas pelo jogador.
     */
    getTotalStars() {
        return Object.values(this.levels).reduce((sum, lvl) => sum + (lvl.stars || 0), 0);
    }

    /**
     * Salva o progresso no navegador (LocalStorage).
     */
    saveToStorage() {
        const progress = {};
        Object.values(this.levels).forEach(lvl => {
            progress[lvl.id] = { unlocked: lvl.unlocked, stars: lvl.stars };
        });
        localStorage.setItem('td_progress', JSON.stringify(progress));
    }

    /**
     * Reseta todo o progresso (útil para testes).
     */
    resetProgress() {
        localStorage.removeItem('td_progress');
        location.reload();
    }

    // Dentro da classe LevelManager
    getMaxPossibleStars() {
        // Pega a quantidade de fases e multiplica por 3
        const totalLevels = Object.keys(this.levels).length;
        return totalLevels * 3;
    }
}