/**
 * UIMANAGER.JS - Gerenciamento de Interfaces e Menus
 */

import { LEVELS } from './Levels.js';
import { TOWER_TYPES } from './TowerTypes.js';

export const UIManager = {
    /**
     * Renderiza o grid de seleção de fases
     */
    renderLevelMenu(onSelectLevel) {
        const grid = document.getElementById('levels-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Limpa antes de renderizar

        LEVELS.forEach(level => {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.innerHTML = `
                <h3>${level.name}</h3>
                <p>${level.description}</p>
                <div class="level-stats">
                    <span>Waves: ${level.totalWaves}</span>
                    <span>💰 $${level.startingMoney}</span>
                </div>
            `;

            card.onclick = () => onSelectLevel(level);
            grid.appendChild(card);
        });
    },

    /**
     * Cria os botões de inventário de torres
     * @param {Object|null} selectedType - A torre atualmente selecionada (ou null para reset)
     * @param {Function} onSelect - Callback disparado ao clicar
     */
    createTowerButtons(selectedType, onSelect) {
        const container = document.getElementById('tower-inventory');
        if (!container) return;

        container.innerHTML = ''; // Limpa para atualizar o estado visual

        Object.keys(TOWER_TYPES).forEach(key => {
            const type = TOWER_TYPES[key];
            const btn = document.createElement('button');
            
            // Verifica se este botão é o que está selecionado no momento
            const isSelected = selectedType && selectedType.name === type.name;
            
            btn.className = `tower-btn ${isSelected ? 'selected' : ''}`;
            btn.style.setProperty('--tower-color', type.color); // Para o brilho no CSS
            
            btn.innerHTML = `
                <div class="tower-icon" style="background-color: ${type.color}"></div>
                <div class="tower-details">
                    <strong>${type.name.toUpperCase()}</strong>
                    <span>$${type.price}</span>
                </div>
            `;

            btn.onclick = () => {
                // Se clicar em um já selecionado, deseleciona (Toggle)
                const newSelection = isSelected ? null : type;
                onSelect(newSelection);
                
                // Re-renderiza para atualizar as bordas (feedback visual)
                this.createTowerButtons(newSelection, onSelect);
            };

            container.appendChild(btn);
        });
    },

    /**
     * Atualiza os textos do HUD durante a gameplay
     */
    updateHUD(money, lives, currentWave, totalWaves) {
        const labelMoney = document.getElementById('label-money');
        const labelLives = document.getElementById('label-lives');
        const labelWave = document.getElementById('label-wave');

        if (labelMoney) labelMoney.innerText = Math.floor(money);
        if (labelLives) {
            labelLives.innerText = lives;
            // Efeito visual se a vida estiver baixa
            labelLives.style.color = lives <= 5 ? '#e74c3c' : '#fff';
        }
        if (labelWave) labelWave.innerText = `${currentWave}/${totalWaves}`;
    },

    /**
     * Exibe a lista de recordes na tela de Game Over
     */
    displayHighScores(newScoreId = null) {
        const list = document.getElementById('high-scores-list');
        if (!list) return;

        const scores = JSON.parse(localStorage.getItem('mega_td_scores') || '[]');
        list.innerHTML = '';

        scores.slice(0, 5).forEach(item => {
            const li = document.createElement('li');
            li.className = item.id === newScoreId ? 'new-record' : '';
            li.innerHTML = `<span>${item.name}</span> <span>${item.score} pts</span>`;
            list.appendChild(li);
        });
    }
};