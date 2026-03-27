/**
 * DICIONÁRIO DE TIPOS DE TORRES
 * Para criar uma nova torre, basta copiar o modelo 'BASIC' e alterar os valores.
 */

export const TOWER_TYPES = {
    // --- TORRE PADRÃO (O seu modelo base) ---
    BASIC: {
        type: 'BASIC',
        name: 'Torre de Vigia',
        color: '#3498db',         // Azul
        bulletColor: '#f1c40f',   // Amarelo
        range: 3,                 // Alcance em tiles
        fireRate: 800,            // Milissegundos entre tiros (menor = mais rápido)
        damage: 15,               // Dano por projétil
        price: 50,                // Custo para construir
        description: 'Uma torre equilibrada para iniciantes.'
    },

    // --- EXEMPLO: TORRE RÁPIDA (Metralhadora) ---
    FAST: {
        type: 'FAST',
        name: 'Metralhadora',
        color: '#e67e22',         // Laranja
        bulletColor: '#ecf0f1',   // Branco
        range: 2,                 // Menos alcance
        fireRate: 200,            // Atira MUITO rápido
        damage: 10,                // Mas dá pouco dano
        price: 100,
        description: 'Alta cadência de tiro, baixo alcance.'
    },

    // --- EXEMPLO: TORRE DE LONGO ALCANCE (Sniper) ---
    SNIPER: {
        type: 'SNIPER',
        name: 'Canhão Longo',
        color: '#9b59b6',         // Roxo
        bulletColor: '#e74c3c',   // Vermelho
        range: 6,                 // Alcance enorme
        fireRate: 2000,           // Atira bem devagar
        damage: 50,               // Dano massivo
        price: 150,
        description: 'Lenta, mas elimina alvos à distância.'
    }

    // [AQUI VOCÊ PODE ACRESCENTAR AS SUAS NOVAS TORRES SEGUINDO O MODELO]
};