import { TOWER_TYPES } from './TowerTypes.js';
import { ScoreSystem } from './ScoreSystem.js';

export const UIManager = {
    updateHUD(money, lives, wave, maxWaves = 10) {
        document.getElementById('label-money').innerText = money;
        document.getElementById('label-lives').innerText = lives;
        document.getElementById('label-wave').innerText = `${wave}/${maxWaves}`;
    },

    displayHighScores(newId = null) {
        const list = document.getElementById('high-scores-list');
        const scores = ScoreSystem.getTopScores();
        
        list.innerHTML = scores.map(entry => {
            const glow = entry.id === newId ? 'class="new-high-score-glow"' : '';
            return `<li ${glow}><span>${entry.name}</span><strong>${entry.score} pts</strong></li>`;
        }).join('');
    },

    createTowerButtons(selectedType, onSelect) {
        const menu = document.getElementById('tower-inventory');
        menu.innerHTML = '';
        Object.keys(TOWER_TYPES).forEach(key => {
            const type = TOWER_TYPES[key];
            const btn = document.createElement('button');
            btn.className = `tower-btn ${type === selectedType ? 'selected' : ''}`;
            btn.innerHTML = `<strong>${type.name}</strong><br><small>$${type.price}</small>`;
            btn.style.backgroundColor = type.color;
            btn.onclick = () => onSelect(type);
            menu.appendChild(btn);
        });
    }
};