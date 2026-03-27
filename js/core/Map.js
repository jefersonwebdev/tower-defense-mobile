/**
 * MAP.JS - Renderização Dinâmica de Terreno
 */

export class Map {
    constructor(levelData = []) {
        this.grid = levelData;
        this.rows = levelData.length;
        this.cols = levelData[0] ? levelData[0].length : 0;
        
        // Cores dos Tiles
        this.colors = {
            0: '#2ecc71', // Grama (Onde pode construir)
            1: '#f1c40f', // Caminho (Onde inimigos andam)
            2: '#e74c3c', // Base do Jogador (Objetivo)
            3: '#27ae60'  // Grama escura (Decorativo/Obstáculo)
        };
    }

    /**
     * Atualiza os dados do mapa quando uma nova fase é carregada
     */
    setData(newGrid) {
        this.grid = newGrid;
        this.rows = newGrid.length;
        this.cols = newGrid[0] ? newGrid[0].length : 0;
    }

    /**
     * Retorna o valor do tile em uma posição específica
     */
    getTileAt(col, row) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return -1;
    }

    /**
     * Desenha o mapa no canvas
     */
    draw(ctx, tileSize) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tileType = this.grid[row][col];
                
                // Desenha o fundo do tile
                ctx.fillStyle = this.colors[tileType] || '#2ecc71';
                ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);

                // Adiciona uma borda sutil para visualização do grid
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);

                // Detalhes visuais específicos
                if (tileType === 1) {
                    this.drawPathDetails(ctx, col, row, tileSize);
                } else if (tileType === 2) {
                    this.drawBaseDetails(ctx, col, row, tileSize);
                }
            }
        }
    }

    /**
     * Desenha texturas ou detalhes no caminho (opcional)
     */
    drawPathDetails(ctx, col, row, tileSize) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        // Pequenos "pontos" para parecer terra/estrada
        ctx.fillRect(col * tileSize + (tileSize * 0.2), row * tileSize + (tileSize * 0.2), 2, 2);
        ctx.fillRect(col * tileSize + (tileSize * 0.7), row * tileSize + (tileSize * 0.5), 2, 2);
    }

    /**
     * Desenha um ícone ou brilho na base final
     */
    drawBaseDetails(ctx, col, row, tileSize) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(col * tileSize + 5, row * tileSize + 5, tileSize - 10, tileSize - 10);
        ctx.restore();
    }
}