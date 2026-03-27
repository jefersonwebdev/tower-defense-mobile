/**
 * LEVEL PROVIDER - Transforma desenho em lógica de jogo
 */

export const LevelProvider = {
    parse(levelConfig) {
        // 1. Converte o texto em Matriz
        const grid = levelConfig.mapLayout
            .trim()
            .split('\n')
            .map(line => line.trim().split(/\s+/).map(Number));

        // 2. Gera Waypoints automaticamente
        const waypoints = this.generateWaypoints(grid);

        return {
            ...levelConfig,
            grid,
            waypoints
        };
    },

    generateWaypoints(grid) {
        const path = [];
        let curX = -1, curY = -1;

        // Acha a entrada (Onde está o primeiro '1' na borda ou linha 0)
        // Vamos supor que sempre começa no topo ou esquerda
        for (let r = 0; r < grid.length; r++) {
            if (grid[r][1] === 1) { curX = 1; curY = r; break; } // Exemplo específico do seu mapa
        }

        // Se não achou na lateral, busca na linha 0
        if (curX === -1) {
            curY = 0;
            curX = grid[0].findIndex(v => v === 1);
        }

        const visited = new Set();
        let foundEnd = false;

        // Adiciona o ponto inicial (centralizado)
        path.push({ x: curX + 0.5, y: curY + 0.5 });

        while (!foundEnd) {
            visited.add(`${curX},${curY}`);
            
            // Vizinhos: Baixo, Cima, Direita, Esquerda
            const neighbors = [
                { x: curX, y: curY + 1 }, { x: curX, y: curY - 1 },
                { x: curX + 1, y: curY }, { x: curX - 1, y: curY }
            ];

            let moved = false;
            for (let n of neighbors) {
                if (n.y >= 0 && n.y < grid.length && n.x >= 0 && n.x < grid[0].length) {
                    const tile = grid[n.y][n.x];
                    
                    // Se for o objetivo final (2), termina
                    if (tile === 2) {
                        path.push({ x: n.x + 0.5, y: n.y + 0.5 });
                        foundEnd = true;
                        moved = true;
                        break;
                    }

                    // Se for caminho (1) e não visitado
                    if (tile === 1 && !visited.has(`${n.x},${n.y}`)) {
                        // Só adicionamos waypoint se houver uma CURVA
                        // (Opcional para otimizar, mas vamos adicionar todos para garantir precisão)
                        curX = n.x;
                        curY = n.y;
                        path.push({ x: curX + 0.5, y: curY + 0.5 });
                        moved = true;
                        break;
                    }
                }
            }
            if (!moved) break; // Caminho sem saída
        }
        return path;
    }
};