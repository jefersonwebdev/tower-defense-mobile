/**
 * ENEMYTYPES.JS - Catálogo de Inimigos
 */
export const ENEMY_TYPES = {
    STANDARD: {
        name: "Normal",
        health: 75,
        speed: 0.02,
        color: "#e74c3c", // Vermelho
        reward: 10,
        size: 0.35      // Multiplicador do tamanho do tile
    },
    FAST: {
        name: "Veloz",
        health: 50,
        speed: 0.045,   // Mais que o dobro da velocidade
        color: "#f1c40f", // Amarelo
        reward: 15,
        size: 0.25      // Menor e mais difícil de clicar
    },
    TANK: {
        name: "Blindado",
        health: 400,    // Muita vida
        speed: 0.012,   // Bem lento
        color: "#8e44ad", // Roxo
        reward: 30,
        size: 0.5       // Grandão
    }
};