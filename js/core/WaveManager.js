/**
 * WAVEMANAGER.JS - Controla as hordas de inimigos
 */
export class WaveManager {
    constructor() {
        this.currentWave = 0;       // Onda atual
        this.enemiesInWave = 5;     // Quantidade base
        this.spawnedCount = 0;      // Quantos já nasceram nesta horda
        this.isWaveActive = false;  // Se o nascimento (spawn) está ocorrendo
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000;  // Intervalo padrão entre inimigos
        
        // Removi o difficultyMultiplier de vida conforme solicitado
    }

    /**
     * Inicia uma nova horda
     */
    startNextWave() {
        if (this.isWaveActive) return;
        
        this.currentWave++;
        this.spawnedCount = 0;
        this.isWaveActive = true;
        
        // LÓGICA DE QUANTIDADE:
        // Onda 1: 5 + (1-1)*3 = 5
        // Onda 2: 5 + (2-1)*3 = 8... e assim por diante
        this.enemiesInWave = 5 + (this.currentWave - 1) * 2;
        
        // Opcional: manter o intervalo fixo ou diminuir levemente para não demorar demais
        this.spawnInterval = Math.max(600, 1500 - (this.currentWave * 50));
        
        console.log(`Iniciando Onda ${this.currentWave}: ${this.enemiesInWave} inimigos.`);
    }

    /**
     * Verifica se é hora de criar um novo inimigo
     */
    update(currentTime) {
        // Se a onda não está ativa, não faz nada
        if (!this.isWaveActive) return null;

        // Se já alcançou o limite de inimigos da onda atual
        if (this.spawnedCount >= this.enemiesInWave) {
            this.isWaveActive = false; 
            return null;
        }

        // Controle de tempo para o Spawn
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.lastSpawnTime = currentTime;
            this.spawnedCount++;

            // Retorna os dados do inimigo
            return {
                health: 100, // Vida fixa em 100 para todas as ondas
                speed: 0.02 + (this.currentWave * 0.001) // Velocidade aumenta sutilmente para manter o desafio
            };
        }

        return null;
    }
}