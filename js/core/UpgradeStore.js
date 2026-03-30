/**
 * UpgradeStore.js
 * Gerencia o saldo de estrelas "gastáveis" e o nível de melhoria das torres.
 */
export const UpgradeStore = {
    // 1. ESTADO INICIAL (Fallback)
    state: {
        stars: 0, // Saldo atual para compras
        upgrades: {
            damage: { lvl: 1, baseCost: 10, multiplier: 0.2 }, // +20% dano por nível
            range:  { lvl: 1, baseCost: 15, multiplier: 0.1 }, // +10% alcance por nível
            ice:    { lvl: 1, baseCost: 20, multiplier: 0.15 } // +15% slow/tempo por nível
        }
    },

    // 2. CARREGAR DO NAVEGADOR
    load() {
        const saved = localStorage.getItem('td_upgrade_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Mescla para garantir que novos upgrades adicionados no código apareçam no save antigo
                this.state = { ...this.state, ...parsed };
                this.state.upgrades = { ...this.state.upgrades, ...parsed.upgrades };
            } catch (e) {
                console.error("Erro ao carregar UpgradeStore:", e);
            }
        }
    },

    // 3. SALVAR NO NAVEGADOR
    save() {
        localStorage.setItem('td_upgrade_data', JSON.stringify(this.state));
    },

    // 4. CALCULAR CUSTO ATUAL
    // Aumenta o custo em 80% a cada nível (Exponencial)
    getCost(type) {
        const up = this.state.upgrades[type];
        if (!up) return 0;
        return Math.floor(up.baseCost * Math.pow(1.8, up.lvl - 1));
    },

    // 5. ADICIONAR ESTRELAS (Chamado pelo LevelManager)
    addStars(amount) {
        if (amount <= 0) return;
        this.state.stars += amount;
        this.save();
    },

    // 6. COMPRAR MELHORIA
    buyUpgrade(type) {
        const cost = this.getCost(type);
        if (this.state.stars >= cost) {
            this.state.stars -= cost;
            this.state.upgrades[type].lvl += 1;
            this.save();
            return { success: true, newLvl: this.state.upgrades[type].lvl };
        }
        return { success: false, message: "Estrelas insuficientes!" };
    },

    // 7. OBTER BÔNUS PARA O JOGO
    // Ex: const danoFinal = base * UpgradeStore.getBonus('damage');
    getBonus(type) {
        const up = this.state.upgrades[type];
        if (!up) return 1;
        // Nível 1 = 1x (sem bônus)
        // Nível 2 = 1.2x (20% bônus)
        return 1 + (up.lvl - 1) * up.multiplier;
    }
};

// Inicializa automaticamente ao ser importado
UpgradeStore.load();