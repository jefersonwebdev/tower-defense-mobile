export class Input {
    constructor(canvas, tileSize) {
        this.canvas = canvas;
        this.tileSize = tileSize;
        this.selectedTile = null; // Guarda {col, row} do último toque

        // Evento para Telemóvel (Touch)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        
        // Evento para Rato (Desktop - útil para testares no PC)
        this.canvas.addEventListener('mousedown', (e) => this.handleMouse(e));
    }

    /**
     * Atualiza o tamanho do tile se o ecrã rodar
     */
    updateTileSize(newSize) {
        this.tileSize = newSize;
    }

    handleTouch(e) {
        // Impede o comportamento padrão (ex: zoom ou scroll)
        e.preventDefault();
        const touch = e.touches[0];
        this.processInput(touch.clientX, touch.clientY);
    }

    handleMouse(e) {
        this.processInput(e.clientX, e.clientY);
    }

    processInput(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Calcula a posição relativa ao canvas
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Converte pixels em coordenadas da Grade (Grid)
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        this.selectedTile = { col, row };
        
        // Dispara um evento personalizado para o jogo saber que houve um toque
        console.log(`Toque detetado na Coluna: ${col}, Linha: ${row}`);
    }

    /**
     * Limpa a seleção (ex: após construir ou cancelar)
     */
    clearSelection() {
        this.selectedTile = null;
    }
}