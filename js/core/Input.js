/**
 * INPUT.JS - Gerenciamento de Toque, Mouse e Estado de Pressão
 */
export class Input {
    constructor(canvas, tileSize) {
        this.canvas = canvas;
        this.tileSize = tileSize;
        this.selectedTile = null; 
        this.isDown = false; // Estado crucial para o Arrastar e Soltar

        // --- EVENTOS DE RATO (PC) ---
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDown = true;
            this.handleMouse(e);
        });
        window.addEventListener('mouseup', () => {
            this.isDown = false;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDown) this.handleMouse(e);
        });

        // --- EVENTOS DE TOQUE (MOBILE) ---
        this.canvas.addEventListener('touchstart', (e) => {
            this.isDown = true;
            this.handleTouch(e);
        }, { passive: false });
        
        window.addEventListener('touchend', () => {
            this.isDown = false;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isDown) this.handleTouch(e);
        }, { passive: false });
    }

    updateTileSize(newSize) {
        this.tileSize = newSize;
    }

    handleTouch(e) {
        // Impede scroll/zoom enquanto joga
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        this.processInput(touch.clientX, touch.clientY);
    }

    handleMouse(e) {
        this.processInput(e.clientX, e.clientY);
    }

    processInput(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Cálculo de escala (caso o CSS redimensione o canvas)
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        this.selectedTile = { col, row };
    }

    /**
     * Helper para pegar as coordenadas atuais em qualquer momento
     */
    getTileCoords() {
        return this.selectedTile || { col: -1, row: -1 };
    }

    clearSelection() {
        this.selectedTile = null;
    }
}