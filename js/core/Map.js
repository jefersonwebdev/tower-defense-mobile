import { COLORS } from '../constants.js';

export class Map {
    constructor(gridData) {
        this.grid = gridData; // A matriz [ [0,1,0], [0,1,2] ]
    }

    /**
     * DESENHA O MAPA
     * @param {CanvasRenderingContext2D} ctx - O contexto do canvas
     * @param {number} tileSize - O tamanho calculado no main.js
     */
    draw(ctx, tileSize) {
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                const tileType = this.grid[row][col];
                
                // Posição real na tela
                const x = col * tileSize;
                const y = row * tileSize;

                // Escolhe a cor baseada na constante
                switch (tileType) {
                    case 0: ctx.fillStyle = COLORS.GRASS; break;
                    case 1: ctx.fillStyle = COLORS.PATH; break;
                    case 2: ctx.fillStyle = COLORS.BASE; break;
                    default: ctx.fillStyle = COLORS.GRASS;
                }

                // Desenha o quadrado
                ctx.fillRect(x, y, tileSize, tileSize);

                // Desenha a borda sutil para o jogador ver a grade
                ctx.strokeStyle = COLORS.BORDER;
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
    }

    /**
     * VERIFICA O TIPO DE TILE EM UMA COORDENADA DE GRADE
     * Útil para saber se o jogador pode construir ali.
     */
    getTileAt(col, row) {
        if (this.grid[row] && this.grid[row][col] !== undefined) {
            return this.grid[row][col];
        }
        return -1; // Fora do mapa
    }
}