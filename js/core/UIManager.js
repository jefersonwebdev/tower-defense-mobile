/**
 * UIMANAGER.JS - Gerenciamento de Interfaces e Menus
 */
import { Tower } from '../entities/Tower.js'; // Caminho atualizado
import { LEVELS } from './Levels.js';

import { getTowerStats } from './TowerTypes.js'; // Importamos a FUNÇÃO agora
import { UpgradeStore } from './UpgradeStore.js'; // Para mostrar as estrelas se quiser

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
     /**
 *@param {number} playerMoney - Dinheiro atual do jogador
 * @param {Object|null} selectedType - Torre selecionada
 * @param {Function} onSelect - Callback
 */
createTowerButtons(playerMoney, selectedType, onSelect) {
    const container = document.getElementById('tower-inventory');
    if (!container) return;

    container.innerHTML = ''; 

    // Definimos as chaves das torres que queremos exibir no menu
    const availableTowers = ['BASIC', 'FAST', 'SNIPER', 'ICE'];

    availableTowers.forEach(key => {
        // IMPORTANTE: Aqui pegamos os stats ATUALIZADOS com os upgrades
        const stats = getTowerStats(key); 
        
        const btn = document.createElement('button');
        
        // Verificamos a seleção pelo 'type' que é único
        const isSelected = selectedType && selectedType.type === stats.type;
        const canAfford = playerMoney >= stats.price; 
        
        // Gera o ícone usando os stats calculados (cor, etc)
        const iconUrl = Tower.generateStaticIcon(stats, 64); 
        
        btn.className = `tower-btn ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`;
        btn.style.setProperty('--tower-color', stats.color); 
        
        btn.innerHTML = `
            <div class="tower-icon-frame">
                <img src="${iconUrl}" class="tower-render-img">
            </div>
            <div class="tower-details">
                <strong>${stats.name.toUpperCase()}</strong>
                <span class="price-tag">$${stats.price}</span>
            </div>
        `;

        btn.onclick = () => {
            if (!canAfford && !isSelected) return; 
            
            // Se já estiver selecionado, deseleciona (null). Se não, seleciona os stats.
            const newSelection = isSelected ? null : stats;
            onSelect(newSelection);
            
            // Re-renderiza para atualizar as bordas de seleção
            this.createTowerButtons(playerMoney, newSelection, onSelect);
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