/**
 * LEVELS.JS - Banco de Dados de Fases
 */

export const LEVELS = [
    {
        id: 1,
        name: "Planície Verde",
        description: "Uma rota simples para iniciantes.",
        startingMoney: 50,
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
    {x: 1.5, y: 0.5},  // Entrada (Topo)
    {x: 1.5, y: 2.5},  // Primeira curva (Direita)
    {x: 4.5, y: 2.5},  // Segunda curva (Baixo)
    {x: 4.5, y: 4.5},  // Terceira curva (Direita)
    {x: 6.5, y: 4.5},  // Quarta curva (Cima) -> Você tinha pulado esta!
    {x: 6.5, y: 1.5},  // Quinta curva (Direita)
    {x: 8.5, y: 1.5},  // Sexta curva (Baixo)
    {x: 8.5, y: 6.5},  // Sétima curva (Esquerda)
    {x: 6.5, y: 6.5},  // Oitava curva (Baixo)
    {x: 6.5, y: 7.5},  // Nona curva (Esquerda)
    {x: 1.5, y: 7.5},  // Décima curva (Baixo)
    {x: 1.5, y: 9.5},  // 11ª curva (Direita)
    {x: 7.5, y: 9.5},  // 12ª curva (Baixo)
    {x: 7.5, y: 11.5}, // 13ª curva (Esquerda) -> Refletindo o grid
    {x: 2.5, y: 11.5}, // 14ª curva (Baixo)
    {x: 2.5, y: 13.5}, // 15ª curva (Direita final)
    {x: 9.5, y: 13.5}  // Destino Final (Onde está o 2)
],
        // Configuração de Inimigos por Onda
        waveLogic: [
        { 
            startWave: 1, 
            spawnRate: 2000, 
            enemies: { 'BASIC': 5} // Onda 1 até 3: apenas 8 básicos
        },
        { 
            startWave: 3, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 6, 'FAST': 1 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 5, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 8, 'FAST': 2 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 8, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 10,'FAST': 3, 'TANK': 1 } // Onda 8 em diante: elite
        },
        { 
            startWave: 10, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 12,'FAST': 4, 'TANK': 2 } // Onda 8 em diante: elite
        }
    ]
    },
    {
    id: 2,
    name: "Deserto de Fogo",
    description: "Inimigos rápidos e pouco dinheiro.",
    startingMoney: 100,
    totalWaves: 1,
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
    waypoints: [
        {x: 3.5, y: 0.5},  // Entrada (Topo Coluna 3)
        {x: 3.5, y: 2.5},  // Desce até encontrar a curva horizontal
        {x: 1.5, y: 2.5},  // Vira para a esquerda (Coluna 1)
        {x: 1.5, y: 6.5},  // Desce o corredor esquerdo até a curva da Linha 6
        {x: 3.5, y: 6.5},  // Vira para a direita (Coluna 3)
        {x: 3.5, y: 4.5},  // Sobe o mini-retorno (Linha 4)
        {x: 6.5, y: 4.5},  // Atravessa para a direita (Coluna 6)
        {x: 6.5, y: 8.5},  // Desce pelo meio (Linha 8)
        {x: 1.5, y: 8.5},  // Vira para a esquerda de novo (Coluna 1)
        {x: 1.5, y: 13.5}, // Desce o último paredão esquerdo (Linha 13)
        {x: 8.5, y: 13.5}, // Atravessa a base inteira (Coluna 8)
        {x: 8.5, y: 2.5},  // Sobe o paredão direito inteiro (Linha 2)
        {x: 6.5, y: 2.5},  // Vira para a esquerda para alinhar com o '2'
        {x: 6.5, y: 0.5}   // FIM (Sobe para o '2' na Coluna 6)
    ],
    waveLogic: [
        { 
            startWave: 1, 
            spawnRate: 2000, 
            enemies: { 'BASIC': 5} // Onda 1 até 3: apenas 8 básicos
        },
        { 
            startWave: 3, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 6, 'FAST': 1 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 5, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 8, 'FAST': 2 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 8, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 10,'FAST': 3, 'TANK': 1 } // Onda 8 em diante: elite
        }
    ]
},
{
        id: 3,
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
    {x: 1.5, y: 0.5},  // Entrada (Topo)
    {x: 1.5, y: 2.5},  // Primeira curva (Direita)
    {x: 4.5, y: 2.5},  // Segunda curva (Baixo)
    {x: 4.5, y: 4.5},  // Terceira curva (Direita)
    {x: 6.5, y: 4.5},  // Quarta curva (Cima) -> Você tinha pulado esta!
    {x: 6.5, y: 1.5},  // Quinta curva (Direita)
    {x: 8.5, y: 1.5},  // Sexta curva (Baixo)
    {x: 8.5, y: 6.5},  // Sétima curva (Esquerda)
    {x: 6.5, y: 6.5},  // Oitava curva (Baixo)
    {x: 6.5, y: 7.5},  // Nona curva (Esquerda)
    {x: 1.5, y: 7.5},  // Décima curva (Baixo)
    {x: 1.5, y: 9.5},  // 11ª curva (Direita)
    {x: 7.5, y: 9.5},  // 12ª curva (Baixo)
    {x: 7.5, y: 11.5}, // 13ª curva (Esquerda) -> Refletindo o grid
    {x: 2.5, y: 11.5}, // 14ª curva (Baixo)
    {x: 2.5, y: 13.5}, // 15ª curva (Direita final)
    {x: 9.5, y: 13.5}  // Destino Final (Onde está o 2)
],
        // Configuração de Inimigos por Onda
        waveLogic: [
        { 
            startWave: 1, 
            spawnRate: 2000, 
            enemies: { 'BASIC': 5} // Onda 1 até 3: apenas 8 básicos
        },
        { 
            startWave: 3, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 6, 'FAST': 1 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 5, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 8, 'FAST': 2 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 8, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 10,'FAST': 3, 'TANK': 1 } // Onda 8 em diante: elite
        }
    ]
    },
    {
        id: 4,
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
    {x: 1.5, y: 0.5},  // Entrada (Topo)
    {x: 1.5, y: 2.5},  // Primeira curva (Direita)
    {x: 4.5, y: 2.5},  // Segunda curva (Baixo)
    {x: 4.5, y: 4.5},  // Terceira curva (Direita)
    {x: 6.5, y: 4.5},  // Quarta curva (Cima) -> Você tinha pulado esta!
    {x: 6.5, y: 1.5},  // Quinta curva (Direita)
    {x: 8.5, y: 1.5},  // Sexta curva (Baixo)
    {x: 8.5, y: 6.5},  // Sétima curva (Esquerda)
    {x: 6.5, y: 6.5},  // Oitava curva (Baixo)
    {x: 6.5, y: 7.5},  // Nona curva (Esquerda)
    {x: 1.5, y: 7.5},  // Décima curva (Baixo)
    {x: 1.5, y: 9.5},  // 11ª curva (Direita)
    {x: 7.5, y: 9.5},  // 12ª curva (Baixo)
    {x: 7.5, y: 11.5}, // 13ª curva (Esquerda) -> Refletindo o grid
    {x: 2.5, y: 11.5}, // 14ª curva (Baixo)
    {x: 2.5, y: 13.5}, // 15ª curva (Direita final)
    {x: 9.5, y: 13.5}  // Destino Final (Onde está o 2)
],
        // Configuração de Inimigos por Onda
        waveLogic: [
        { 
            startWave: 1, 
            spawnRate: 2000, 
            enemies: { 'BASIC': 5} // Onda 1 até 3: apenas 8 básicos
        },
        { 
            startWave: 3, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 6, 'FAST': 1 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 5, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 8, 'FAST': 2 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 8, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 10,'FAST': 3, 'TANK': 1 } // Onda 8 em diante: elite
        }
    ]
    },
    {
        id: 5,
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
    {x: 1.5, y: 0.5},  // Entrada (Topo)
    {x: 1.5, y: 2.5},  // Primeira curva (Direita)
    {x: 4.5, y: 2.5},  // Segunda curva (Baixo)
    {x: 4.5, y: 4.5},  // Terceira curva (Direita)
    {x: 6.5, y: 4.5},  // Quarta curva (Cima) -> Você tinha pulado esta!
    {x: 6.5, y: 1.5},  // Quinta curva (Direita)
    {x: 8.5, y: 1.5},  // Sexta curva (Baixo)
    {x: 8.5, y: 6.5},  // Sétima curva (Esquerda)
    {x: 6.5, y: 6.5},  // Oitava curva (Baixo)
    {x: 6.5, y: 7.5},  // Nona curva (Esquerda)
    {x: 1.5, y: 7.5},  // Décima curva (Baixo)
    {x: 1.5, y: 9.5},  // 11ª curva (Direita)
    {x: 7.5, y: 9.5},  // 12ª curva (Baixo)
    {x: 7.5, y: 11.5}, // 13ª curva (Esquerda) -> Refletindo o grid
    {x: 2.5, y: 11.5}, // 14ª curva (Baixo)
    {x: 2.5, y: 13.5}, // 15ª curva (Direita final)
    {x: 9.5, y: 13.5}  // Destino Final (Onde está o 2)
],
        // Configuração de Inimigos por Onda
        waveLogic: [
        { 
            startWave: 1, 
            spawnRate: 2000, 
            enemies: { 'BASIC': 5} // Onda 1 até 3: apenas 8 básicos
        },
        { 
            startWave: 3, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 6, 'FAST': 1 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 5, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 8, 'FAST': 2 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 8, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 10,'FAST': 3, 'TANK': 1 } // Onda 8 em diante: elite
        }
    ]
    },
    {
        id: 6,
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
    {x: 1.5, y: 0.5},  // Entrada (Topo)
    {x: 1.5, y: 2.5},  // Primeira curva (Direita)
    {x: 4.5, y: 2.5},  // Segunda curva (Baixo)
    {x: 4.5, y: 4.5},  // Terceira curva (Direita)
    {x: 6.5, y: 4.5},  // Quarta curva (Cima) -> Você tinha pulado esta!
    {x: 6.5, y: 1.5},  // Quinta curva (Direita)
    {x: 8.5, y: 1.5},  // Sexta curva (Baixo)
    {x: 8.5, y: 6.5},  // Sétima curva (Esquerda)
    {x: 6.5, y: 6.5},  // Oitava curva (Baixo)
    {x: 6.5, y: 7.5},  // Nona curva (Esquerda)
    {x: 1.5, y: 7.5},  // Décima curva (Baixo)
    {x: 1.5, y: 9.5},  // 11ª curva (Direita)
    {x: 7.5, y: 9.5},  // 12ª curva (Baixo)
    {x: 7.5, y: 11.5}, // 13ª curva (Esquerda) -> Refletindo o grid
    {x: 2.5, y: 11.5}, // 14ª curva (Baixo)
    {x: 2.5, y: 13.5}, // 15ª curva (Direita final)
    {x: 9.5, y: 13.5}  // Destino Final (Onde está o 2)
],
        // Configuração de Inimigos por Onda
       waveLogic: [
        { 
            startWave: 1, 
            spawnRate: 2500, 
            enemies: { 'BASIC': 5} // Onda 1 até 3: apenas 8 básicos
        },
        { 
            startWave: 3, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 6, 'FAST': 1 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 5, 
            spawnRate: 1500, 
            enemies: { 'BASIC': 8, 'FAST': 2 } // Onda 4 até 7: mistura
        },
        { 
            startWave: 8, 
            spawnRate: 1200, 
            enemies: { 'BASIC': 10,'FAST': 3, 'TANK': 1 } // Onda 8 em diante: elite
        }
    ]
    },
];

// Função utilitária para converter o texto em matriz real
export function parseMapLayout(layoutString) {
    return layoutString
        .trim()
        .split('\n')
        .map(line => line.trim().split(/\s+/).map(Number));
}