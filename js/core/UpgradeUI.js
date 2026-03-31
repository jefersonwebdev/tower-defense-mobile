import { UpgradeStore } from './UpgradeStore.js';

export const UpgradeUI = {
    render() {
        const grid = document.getElementById('upgrade-list');
        const starDisplay = document.getElementById('upgrade-stars-count');

        if (!grid || !starDisplay) return;

        // 1. Atualiza o saldo de estrelas no topo
        starDisplay.innerText = UpgradeStore.state.stars;

        grid.innerHTML = '';

        // 2. Pega os upgrades do estado do Store
        const upgrades = UpgradeStore.state.upgrades;

        Object.keys(upgrades).forEach(key => {
            const up = upgrades[key];

            // USANDO A NOVA FUNÇÃO DO STORE PARA PEGAR O CUSTO REAL
            const currentCost = UpgradeStore.getCost(key);
            const canAfford = UpgradeStore.state.stars >= currentCost;
            const isMax = currentCost === null;

            // Nomes amigáveis para exibir (Se não tiver no objeto, usa a chave)
            const friendlyNames = {
                damage: "DANO EXTRA",
                range: "ALCANCE",
                ice: "CRIOGENIA (GELO)",
                health: "VIDA MÁXIMA"
            };

            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <div class="upgrade-info">
                    <h3>${friendlyNames[key] || key.toUpperCase()} (Nível ${up.lvl})</h3>
                    <p>Bônus atual: +${Math.round((UpgradeStore.getBonus(key) - 1) * 100)}%</p>
                </div>
                <div class="upgrade-level-bar">
                    <div class="level-progress" style="width: ${Math.min(up.lvl * 10, 100)}%"></div>
                </div>
                <button class="btn-buy-upgrade" ${(isMax || !canAfford) ? 'disabled' : ''}>
                    ${isMax ? 'NÍVEL MÁXIMO' : `UPGRADE - ${currentCost} ⭐`}
                </button>
            `;

            // 3. O CLICK QUE ESTAVA FALTANDO
            const btn = card.querySelector('.btn-buy-upgrade');
            btn.onclick = () => {
                const result = UpgradeStore.buyUpgrade(key);

                if (result.success) {
                    // Feedback visual e re-renderização
                    this.render();
                    console.log(`Upgrade ${key} para nível ${result.newLvl}!`);
                } else {
                    alert(result.message);
                }
            };

            grid.appendChild(card);
        });
    }
};