/**
 * WAVEMANAGER.JS - Controla as hordas de inimigos
 */
export class WaveManager {
    constructor() {
        this.currentWave = 0;       // Onda atual
        this.enemiesInWave = 5;     // Quantos inimigos na primeira onda
        this.spawnedCount = 0;      // Quantos já nasceram nesta onda
        this.isWaveActive = false;  // Se os inimigos estão saindo agora
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500;  // 1.5 segundos entre cada inimigo da horda
        
        this.difficultyMultiplier = 1.2; // Aumento de 20% na vida por onda
    }

    /**
     * Inicia uma nova horda
     */
    startNextWave() {
        if (this.isWaveActive) return;
        
        this.currentWave++;
        this.spawnedCount = 0;
        this.isWaveActive = true;
        
        // Aumenta a quantidade de inimigos a cada onda
        this.enemiesInWave = 5 + (this.currentWave * 2);
        
        // Diminui levemente o intervalo (fica mais frenético)
        this.spawnInterval = Math.max(500, 1500 - (this.currentWave * 100));
        
        console.log(`Iniciando Onda ${this.currentWave}: ${this.enemiesInWave} inimigos.`);
    }

    /**
     * Verifica se é hora de criar um novo inimigo
     * @returns {Object|null} Retorna dados do inimigo ou null
     */
    update(currentTime) {
        if (!this.isWaveActive) return null;

        // Se já soltou todos os inimigos da onda
        if (this.spawnedCount >= this.enemiesInWave) {
            this.isWaveActive = false;
            return null;
        }

        // Lógica de tempo para o nascimento (Spawn)
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.lastSpawnTime = currentTime;
            this.spawnedCount++;

            // Retorna as estatísticas para esse inimigo específico
            return {
                health: 100 * Math.pow(this.difficultyMultiplier, this.currentWave - 1),
                speed: 0.02 + (this.currentWave * 0.002) // Ficam levemente mais rápidos
            };
        }

        return null;
    }
}