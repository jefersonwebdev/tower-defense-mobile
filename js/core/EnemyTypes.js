/**
 * ENEMYTYPES.JS - Catálogo de Inimigos
 */
const slimeAnimBase = {
    frameWidth: 176,
    frameHeight: 192,
    animations: {
        walk: { frames: [0, 1, 2], speed: 0.15 },
        damage: { frames: [7, 11, 16], speed: 0.15 }
        //walk: { startFrame: 0, endFrame: 3, speed: 0.15 },
        //damage: { startFrame: 8, endFrame: 15, speed: 0.2 }
    }
};


export const ENEMY_TYPES = {
    STANDARD: {
        name: "Normal",
        health: 75,
        speed: 0.02,
        color: "#e74c3c", // Vermelho
        reward: 10,
        size: 0.35,      // Multiplicador do tamanho do tile
        //iconData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNrdWxsLWljb24gbHVjaWRlLXNrdWxsIj48cGF0aCBkPSJtMTIuNSAxNy0uNS0xLS41IDFoMXoiLz48cGF0aCBkPSJNMTUgMjJhMSAxIDAgMCAwIDEtMXYtMWEyIDIgMCAwIDAgMS41Ni0zLjI1IDggOCAwIDEgMC0xMS4xMiAwQTIgMiAwIDAgMCA4IDIwdjFhMSAxIDAgMCAwIDEgMXoiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSIxIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjEyIiByPSIxIi8+PC9zdmc+'
        spriteSheetSrc: 'assets/enemies/slime_blue.png',
        frameWidth: 176,
        frameHeight: 192,
        animations: {
            walk: { frames: [0, 1, 2], speed: 0.15 },
            damage: { frames: [7, 11, 16], speed: 0.15 }
            //walk: { startFrame: 0, endFrame: 3, speed: 0.15 },
            //damage: { startFrame: 8, endFrame: 15, speed: 0.2 }
        }
    },
    FAST: {
        name: "Veloz",
        health: 50,
        speed: 0.045,   // Mais que o dobro da velocidade
        color: "#f1c40f", // Amarelo
        reward: 15,
        size: 0.25,      // Menor e mais difícil de clicar
        //iconData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNrdWxsLWljb24gbHVjaWRlLXNrdWxsIj48cGF0aCBkPSJtMTIuNSAxNy0uNS0xLS41IDFoMXoiLz48cGF0aCBkPSJNMTUgMjJhMSAxIDAgMCAwIDEtMXYtMWEyIDIgMCAwIDAgMS41Ni0zLjI1IDggOCAwIDEgMC0xMS4xMiAwQTIgMiAwIDAgMCA4IDIwdjFhMSAxIDAgMCAwIDEgMXoiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSIxIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjEyIiByPSIxIi8+PC9zdmc+'
        spriteSheetSrc: 'assets/enemies/zumbi.png',
        frameWidth: 235,
        frameHeight: 192,
        animations: {
            walk: { frames: [0, 1, 2, 3, 4, 5], speed: 0.12 },
            damage: { frames: [7, 11, 16], speed: 0.15 }
            //walk: { startFrame: 0, endFrame: 3, speed: 0.15 },
            //damage: { startFrame: 8, endFrame: 15, speed: 0.2 }
        }
    },
    TANK: {
        name: "Blindado",
        health: 400,    // Muita vida
        speed: 0.012,   // Bem lento
        color: "#8e44ad", // Roxo
        reward: 30,
        size: 0.5,       // Grandão
        //iconData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNrdWxsLWljb24gbHVjaWRlLXNrdWxsIj48cGF0aCBkPSJtMTIuNSAxNy0uNS0xLS41IDFoMXoiLz48cGF0aCBkPSJNMTUgMjJhMSAxIDAgMCAwIDEtMXYtMWEyIDIgMCAwIDAgMS41Ni0zLjI1IDggOCAwIDEgMC0xMS4xMiAwQTIgMiAwIDAgMCA4IDIwdjFhMSAxIDAgMCAwIDEgMXoiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSIxIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjEyIiByPSIxIi8+PC9zdmc+'
        spriteSheetSrc: 'assets/enemies/cogumelo.png',
        frameWidth: 235,
        frameHeight: 192,
        animations: {
            walk: { frames: [0, 1, 2, 3, 4, 5], speed: 0.12 },
            damage: { frames: [7, 11, 16], speed: 0.15 }
            //walk: { startFrame: 0, endFrame: 3, speed: 0.15 },
            //damage: { startFrame: 8, endFrame: 15, speed: 0.2 }
        }
    }
};