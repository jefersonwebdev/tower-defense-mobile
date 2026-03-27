/**
 * LEVELS.JS - Banco de Dados de Fases
 */

export const LEVELS = [
    {
        id: 1,
        name: "Planície Verde",
        description: "Uma rota simples para iniciantes.",
        startingMoney: 100,
        totalWaves: 10,
        // O sistema vai converter esse desenho em matriz automaticamente
        mapLayout: `
            0 1 0 0 0 0 0 0 0 0
            0 1 0 0 0 0 1 1 1 0
            0 1 1 1 1 0 1 0 1 0
            0 0 0 0 1 0 1 0 1 0
            0 0 0 0 1 1 1 0 1 0
            0 0 0 0 0 0 0 0 1 0
            0 0 0 0 0 0 1 1 1 0
            0 1 1 1 1 1 1 0 0 0
            0 1 0 0 0 0 0 0 0 0
            0 1 1 1 1 1 1 1 0 0
            0 0 0 0 0 0 0 1 0 0
            0 0 1 1 1 1 1 1 0 0
            0 0 1 0 0 0 0 0 0 0
            0 0 1 1 1 1 1 1 1 2
            0 0 0 0 0 0 0 0 0 0
        `,
        waypoints: [
            {x: 1.5, y: 0.5}, {x: 1.5, y: 2.5}, {x: 4.5, y: 2.5}, {x: 4.5, y: 4.5}, 
            {x: 7.5, y: 4.5}, {x: 7.5, y: 7.5}, {x: 1.5, y: 7.5}, {x: 1.5, y: 9.5}, {x: 9.5, y: 9.5}
        ],
        // Configuração de Inimigos por Onda
        waveLogic: [
            { startWave: 1, types: ['BASIC'], spawnRate: 1500 },
            { startWave: 4, types: ['BASIC', 'FAST'], spawnRate: 1200 },
            { startWave: 8, types: ['FAST', 'TANK'], spawnRate: 1000 }
        ]
    },
    {
        id: 2,
        name: "Deserto de Fogo",
        description: "Inimigos rápidos e pouco dinheiro.",
        startingMoney: 100,
        totalWaves: 10,
        mapLayout: `
            0 0 0 1 0 0 2 0 0 0
            0 0 0 1 0 0 1 0 0 0
            0 1 1 1 0 0 1 1 1 0
            0 1 0 0 0 0 0 0 1 0
            0 1 0 1 1 1 1 0 1 0
            0 1 0 1 0 0 1 0 1 0
            0 1 1 1 0 0 1 0 1 0
            0 0 0 0 0 0 1 0 1 0
            0 1 1 1 1 1 1 0 1 0
            0 1 0 0 0 0 0 0 1 0
            0 1 0 0 0 0 0 0 1 0
            0 1 0 0 0 0 0 0 1 0
            0 1 0 0 0 0 0 0 1 0
            0 1 1 1 1 1 1 1 1 0
            0 0 0 0 0 0 0 0 0 0
        `,
        // Configuração de Inimigos por Onda
        waveLogic: [
            { startWave: 1, types: ['BASIC'], spawnRate: 1500 },
            { startWave: 4, types: ['BASIC', 'FAST'], spawnRate: 1200 },
            { startWave: 8, types: ['FAST', 'TANK'], spawnRate: 1000 }
        ]
        // ... waypoints e waveLogic do Deserto
    }
];

// Função utilitária para converter o texto em matriz real
export function parseMapLayout(layoutString) {
    return layoutString
        .trim()
        .split('\n')
        .map(line => line.trim().split(/\s+/).map(Number));
}