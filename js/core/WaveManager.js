/**
 * WAVEMANAGER.JS - Controle de Ondas e Progressão
 */
import { GAME_CONFIG } from '../constants.js';
import { ENEMY_TYPES } from './EnemyTypes.js';

export class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.totalWaves = 0;
        this.isWaveActive = false; // Indica se a onda está ocorrendo (spawn ou combate)
        this.spawningComplete = false; // Nova flag para saber se o spawn acabou
        
        this.enemiesToSpawn = 0;
        this.enemiesSpawnedInWave = 0;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500;
        
        this.waveLogic = [];
    }

    configure(levelConfig) {
        this.waveLogic = levelConfig.waveLogic || []; 
        this.totalWaves = levelConfig.totalWaves || 0;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.spawningComplete = false;
        this.enemiesSpawnedInWave = 0;
    }

    startNextWave() {
        if (this.currentWave < this.totalWaves) {
            this.currentWave++;
            this.isWaveActive = true;
            this.spawningComplete = false; // Reset da flag de spawn
            this.enemiesSpawnedInWave = 0;
            
            this.enemiesToSpawn = 5 + (this.currentWave * 2);
            
            const rule = this.getCurrentRule();
            this.spawnInterval = rule.spawnRate || 1500;

            console.log(`Iniciando Onda ${this.currentWave}`);
            return true;
        }
        return false;
    }

    getCurrentRule() {
        if (!this.waveLogic || this.waveLogic.length === 0) {
            return { startWave: 1, types: ['STANDARD'], spawnRate: 1500 };
        }

        return [...this.waveLogic]
            .filter(rule => this.currentWave >= rule.startWave)
            .sort((a, b) => b.startWave - a.startWave)[0] || this.waveLogic[0];
    }

    /**
     * Atualiza o spawn. Retorna dados do inimigo ou null.
     */
    update(currentTime) {
        // Se a onda não está ativa ou se o spawn já acabou, não faz nada
        if (!this.isWaveActive || this.spawningComplete) return null;

        if (this.enemiesSpawnedInWave < this.enemiesToSpawn) {
            if (currentTime - this.lastSpawnTime > this.spawnInterval) {
                this.lastSpawnTime = currentTime;
                this.enemiesSpawnedInWave++;

                // Se foi o último inimigo a nascer, marca o spawn como completo
                if (this.enemiesSpawnedInWave >= this.enemiesToSpawn) {
                    this.spawningComplete = true;
                }

                return this.generateEnemyData();
            }
        }

        return null;
    }

    generateEnemyData() {
        const rule = this.getCurrentRule();
        const types = rule.types; 
        const selectedTypeKey = types[Math.floor(Math.random() * types.length)];
        
        const baseStats = ENEMY_TYPES[selectedTypeKey];

        if (!baseStats) {
            console.warn(`Tipo "${selectedTypeKey}" inválido. Usando STANDARD.`);
            return ENEMY_TYPES.STANDARD; 
        }

        const difficultyMultiplier = 1 + (this.currentWave - 1) * 0.1;

        return {
            ...baseStats,
            health: baseStats.health * difficultyMultiplier,
            typeKey: selectedTypeKey
        };
    }
}