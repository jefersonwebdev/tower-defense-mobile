/**
 * CONSTANTES GLOBAIS DO JOGO
 * Altere os valores abaixo para ajustar o equilíbrio e o visual do jogo.
 */



// js/constants.js

export const LEVELS = {
    1: { 
        id: 1, 
        unlocked: true, 
        stars: 0, 
        startingMoney: 150,
        // ... o restante dos dados da fase 1
    },
    2: { 
        id: 2, 
        unlocked: false, 
        stars: 0, 
        startingMoney: 200,
        // ... o restante dos dados da fase 2
    }
    // Adicione as outras fases...
};



// --- CONFIGURAÇÕES DE TELA E GRADE ---
export const GRID_COLUMNS = 10; // Quantas colunas o mapa terá
export const GRID_ROWS = 15;    // Quantas linhas o mapa terá (mais alto para o modo Portrait de telemóvel)

// O tamanho do Tile será calculado no Main.js com base na largura da tela (ex: canvas.width / GRID_COLUMNS)
export const TILE_SIZE_FACTOR = 1; 

// --- CORES DO CENÁRIO (Hexadecimal) ---
export const COLORS = {
    GRASS: "#2ecc71",      // Verde: Onde se pode construir
    PATH: "#f1c40f",       // Amarelo: Caminho dos inimigos
    BASE: "#e74c3c",       // Vermelho: Objetivo final
    BUILD_OVARLAY: "rgba(255, 255, 255, 0.3)", // Brilho ao tocar num espaço vazio
    BORDER: "rgba(0, 0, 0, 0.05)" // Linhas finas da grade
};

// --- CONFIGURAÇÕES DOS INIMIGOS ---
export const ENEMY_CONFIG = {
    DEFAULT_HEALTH: 100,    // Vida inicial
    DEFAULT_SPEED: 0.02,     // Velocidade de movimento
    REWARD_GOLD: 10,        // Quanto dinheiro dá ao morrer
    DAMAGE_TO_BASE: 1       // Quanto tira de vida do jogador
};

// --- CONFIGURAÇÕES DAS TORRES ---
export const TOWER_CONFIG = {
    BASE_COST: 50,          // Preço da torre simples
    BASE_RANGE_RADIUS: 3,   // Alcance em número de Tiles (ex: alcança 3 quadrados de distância)
    FIRE_RATE: 1000,        // Tempo entre tiros em milisegundos (1000ms = 1 segundo)
    PROJECTILE_SPEED: 5     // Velocidade da bala
};

// --- ESTADOS DO JOGO ---
export const GAME_STATE = {
    START: "START",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    GAMEOVER: "GAMEOVER"
};

export const GAME_CONFIG = {
    STARTING_MONEY: 100,
    STARTING_LIVES: 10,
    MONEY_PER_ENEMY: 15  // Quanto o jogador ganha ao matar um inimigo
};