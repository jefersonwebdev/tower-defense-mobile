/**
 * UpgradeStore.js - Sistema de Custos Manuais
 */
export const UpgradeStore = {
    state: {
        stars: 0,
        upgrades: {
            // Defina os custos em 'costs'. O índice 0 é o custo para ir do Lv1 -> Lv2
            health: {
                lvl: 1,
                multiplier: 0.2, // +20% de vida por nível
                costs: [2, 4, 6, 10, 15] // Custos para Lv2, Lv3, Lv4, Lv5, Lv6
            },
            damage: {
                lvl: 1,
                multiplier: 0.2,
                costs: [2, 4, 8, 15, 30] // Ex: Lv2 custa 2, Lv3 custa 4... Lv6 é o máximo.
            },
            range: {
                lvl: 1,
                multiplier: 0.1,
                costs: [1, 2, 3, 5, 8, 13]
            },
            ice: {
                lvl: 1,
                multiplier: 0.15,
                costs: [5, 10, 20] // Apenas 3 upgrades disponíveis
            }
        }
    },

    // Adicione dentro do objeto UpgradeStore
    resetProgress() {
    if (!confirm("Deseja resetar seus upgrades? Você receberá todas as estrelas gastas de volta!")) {
        return false;
    }

    let totalRefund = 0;

    // Percorre cada tipo de upgrade (damage, range, ice, health)
    Object.keys(this.state.upgrades).forEach(key => {
        const up = this.state.upgrades[key];
        
        // Enquanto o nível for maior que 1, calculamos o reembolso
        while (up.lvl > 1) {
            // O custo do nível ATUAL que ele tem é o índice (lvl - 2) no array costs
            // Ex: Se ele é Lv 2, o custo pago foi o costs[0]
            const indexPago = up.lvl - 2;
            const custoPago = up.costs[indexPago];
            
            totalRefund += custoPago;
            up.lvl--; // Baixa o nível um por um até chegar em 1
        }
    });

    // Devolve as estrelas ao saldo
    this.state.stars += totalRefund;
    
    // Salva o novo estado (Lv 1 para todos e estrelas devolvidas)
    this.save();
    
    console.log(`Reset concluído! Reembolso de ${totalRefund} estrelas.`);
    return true;
},

    load() {
        const saved = localStorage.getItem('td_upgrade_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Carrega apenas o nível e estrelas, mantendo as configurações de custo do código
                this.state.stars = parsed.stars || 0;
                Object.keys(parsed.upgrades).forEach(key => {
                    if (this.state.upgrades[key]) {
                        this.state.upgrades[key].lvl = parsed.upgrades[key].lvl;
                    }
                });
            } catch (e) { console.error("Erro ao carregar:", e); }
        }
    },

    save() {
        localStorage.setItem('td_upgrade_data', JSON.stringify(this.state));
    },

    // 4. PEGAR CUSTO MANUAL
    getCost(type) {
        const up = this.state.upgrades[type];
        if (!up) return Infinity;

        const currentStep = up.lvl - 1; // Lv1 olha o índice 0 da lista de custos

        // Se não houver mais custos na lista, atingiu o nível máximo
        if (currentStep >= up.costs.length) return null;

        return up.costs[currentStep];
    },

    addStars(amount) {
        this.state.stars += amount;
        this.save();
    },

    buyUpgrade(type) {
        const cost = this.getCost(type);

        // Verifica se é nível máximo (null) ou se tem estrelas
        if (cost !== null && this.state.stars >= cost) {
            this.state.stars -= cost;
            this.state.upgrades[type].lvl += 1;
            this.save();
            return { success: true, newLvl: this.state.upgrades[type].lvl };
        }
        return { success: false, message: cost === null ? "Nível Máximo!" : "Estrelas insuficientes!" };
    },

    getBonus(type) {
        const up = this.state.upgrades[type];
        if (!up) return 1;
        return 1 + (up.lvl - 1) * up.multiplier;
    }
};

UpgradeStore.load();