/**
 * WAVEMANAGER.JS - Controle de Ondas com Fila de Inimigos Estrita
 */
import { ENEMY_TYPES } from './EnemyTypes.js';

export class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.totalWaves = 0;
        this.isWaveActive = false;      // Onda em curso (spawn ou combate)
        this.spawningComplete = false;  // Todos os inimigos já entraram no mapa
        
        this.enemyQueue = [];           // Fila exata de tipos para spawnar
        this.enemiesToSpawn = 0;
        this.enemiesSpawnedInWave = 0;
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500;
        
        this.waveLogic = [];
    }

    /**
     * Configura o Manager com os dados do nível atual
     */
    configure(levelConfig) {
        this.waveLogic = levelConfig.waveLogic || []; 
        this.totalWaves = levelConfig.totalWaves || 0;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.spawningComplete = false;
        this.enemyQueue = [];
    }

    /**
     * Prepara a próxima onda e constrói a fila de inimigos
     */
    startNextWave() {
        if (this.currentWave < this.totalWaves) {
            this.currentWave++;
            this.isWaveActive = true;
            this.spawningComplete = false;
            this.enemiesSpawnedInWave = 0;
            
            const rule = this.getCurrentRule();
            this.spawnInterval = rule.spawnRate || 1500;

            // --- CONSTRUÇÃO DA FILA (ESTOQUE DA ONDA) ---
            this.enemyQueue = [];
            
            // Pega as quantidades definidas na regra (ex: { BASIC: 10, FAST: 5 })
            const enemyDefinitions = rule.enemies || { 'STANDARD': 5 };

            for (const [type, count] of Object.entries(enemyDefinitions)) {
                for (let i = 0; i < count; i++) {
                    this.enemyQueue.push(type);
                }
            }

            // Embaralha a fila para que os tipos venham misturados
            this.enemyQueue.sort(() => Math.random() - 0.5);

            this.enemiesToSpawn = this.enemyQueue.length;

            console.log(`Onda ${this.currentWave} iniciada. Total: ${this.enemiesToSpawn} inimigos.`);
            return true;
        }
        return false;
    }

    /**
     * Retorna a regra de lógica baseada na onda atual (Busca a maior startWave atingida)
     */
    getCurrentRule() {
        if (!this.waveLogic || this.waveLogic.length === 0) {
            return { startWave: 1, enemies: { 'STANDARD': 5 }, spawnRate: 1500 };
        }

        return [...this.waveLogic]
            .filter(rule => this.currentWave >= rule.startWave)
            .sort((a, b) => b.startWave - a.startWave)[0] || this.waveLogic[0];
    }

    /**
     * Chamado no Game Loop. Decide se é hora de spawnar alguém.
     */
    update(currentTime) {
        if (!this.isWaveActive || this.spawningComplete) return null;

        // Se ainda há gente na fila e passou o tempo do intervalo
        if (this.enemyQueue.length > 0) {
            if (currentTime - this.lastSpawnTime > this.spawnInterval) {
                this.lastSpawnTime = currentTime;
                this.enemiesSpawnedInWave++;

                const enemyData = this.generateEnemyData();

                // Se a fila esvaziou após este spawn, finaliza a fase de nascimento
                if (this.enemyQueue.length === 0) {
                    this.spawningComplete = true;
                }

                return enemyData;
            }
        }

        return null;
    }

    /**
     * Retira o próximo inimigo da fila e aplica atributos de dificuldade
     */
    generateEnemyData() {
        // Remove e retorna o primeiro elemento da fila
        const selectedTypeKey = this.enemyQueue.shift(); 
        
        const baseStats = ENEMY_TYPES[selectedTypeKey];

        if (!baseStats) {
            console.warn(`Tipo "${selectedTypeKey}" não encontrado em EnemyTypes.`);
            return { ...ENEMY_TYPES.STANDARD, typeKey: 'STANDARD' }; 
        }

        // Multiplicador de vida: Aumenta 10% a cada nova onda
        const difficultyMultiplier = 1 + (this.currentWave - 1) * 0.1;

        return {
            ...baseStats,
            health: baseStats.health * difficultyMultiplier,
            maxHealth: baseStats.health * difficultyMultiplier,
            typeKey: selectedTypeKey
        };
    }
}