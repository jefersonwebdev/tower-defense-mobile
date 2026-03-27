/**
 * WAVEMANAGER.JS - Lógica de Hordas com Progressão Complexa
 */
import { ENEMY_TYPES } from './EnemyTypes.js';

export class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.isWaveActive = false;
        this.spawnQueue = []; // Fila de inimigos preparada para a onda
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000; // Intervalo base entre inimigos
        
        // Configurações de Progressão
        this.baseEnemies = 5;       // Inimigos na onda 1
        this.perWaveIncrease = 1;   // Aumento de inimigos comuns por onda
    }

    /**
     * Calcula e prepara a lista de inimigos da próxima horda
     */
    startNextWave() {
        if (this.isWaveActive) return;

        this.currentWave++;
        this.spawnQueue = [];
        this.isWaveActive = true;

        // 1. QUANTIDADE DE INIMIGOS NORMAIS
        // Onda 1: 5 | Onda 2: 8 | Onda 3: 11...
        const normalCount = this.baseEnemies + (this.currentWave - 1) * this.perWaveIncrease;
        for (let i = 0; i < normalCount; i++) {
            this.spawnQueue.push({ ...ENEMY_TYPES.STANDARD });
        }

        // 2. LÓGICA DE INIMIGOS RÁPIDOS (FAST)
        // Aparece a partir da onda 3. A cada 3 ondas, aumenta +2.
        if (this.currentWave >= 3) {
            // Onda 3-5: 2 rápidos | Onda 6-8: 4 rápidos | Onda 9+: 6 rápidos...
            const fastGroups = Math.floor((this.currentWave - 3) / 3) + 1;
            const fastCount = fastGroups * 1;
            for (let i = 0; i < fastCount; i++) {
                this.spawnQueue.push({ ...ENEMY_TYPES.FAST });
            }
        }

        // 3. LÓGICA DE INIMIGOS TANK
        // Aparece a partir da onda 6. A cada 3 ondas, aumenta +1.
        if (this.currentWave >= 6) {
            // Onda 6-8: 1 tank | Onda 9-11: 2 tanks | Onda 12+: 3 tanks...
            const tankGroups = Math.floor((this.currentWave - 6) / 3) + 1;
            const tankCount = tankGroups * 1;
            for (let i = 0; i < tankCount; i++) {
                this.spawnQueue.push({ ...ENEMY_TYPES.TANK });
            }
        }

        // 4. EMBARALHAR A FILA (Shuffle)
        // Para que os inimigos não venham em blocos (ex: todos os tanks por último)
        this.spawnQueue.sort(() => Math.random() - 0.5);

        // 5. AJUSTE DE VELOCIDADE DE SPAWN
        // Quanto mais inimigos, mais rápido eles saem para a onda não durar uma eternidade
        this.spawnInterval = Math.max(400, 1200 - (this.currentWave * 40));

        console.log(`Onda ${this.currentWave} iniciada! Total: ${this.spawnQueue.length} inimigos.`);
    }

    /**
     * Gerencia o tempo de nascimento dos inimigos
     */
    update(currentTime) {
        if (!this.isWaveActive || this.spawnQueue.length === 0) {
            // Se a fila esvaziou, o spawn parou (mas a onda só acaba no main.js quando os inimigos morrem)
            if (this.spawnQueue.length === 0) this.isWaveActive = false;
            return null;
        }

        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.lastSpawnTime = currentTime;
            
            // Remove e retorna o primeiro inimigo da fila preparada
            return this.spawnQueue.shift();
        }

        return null;
    }
}