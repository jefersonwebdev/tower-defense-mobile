import { GAME_CONFIG } from '../constants.js';
import { ENEMY_TYPES } from './EnemyTypes.js'; // Certifique-se de ter este arquivo com as configs de vida/velocidade

export class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.totalWaves = 0;
        this.isWaveActive = false;
        
        // Controle de Spawn
        this.enemiesToSpawn = 0;
        this.enemiesSpawnedInWave = 0;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500; // Padrão inicial
        
        // Regras da Fase Atual
        this.waveLogic = [];
    }

    /**
     * Configura o Manager com os dados da fase escolhida no menu
     */
    configure(levelConfig) {
    // Garante que waveLogic seja ao menos uma lista vazia se não existir no nível
    this.waveLogic = levelConfig.waveLogic || []; 
    this.totalWaves = levelConfig.totalWaves || 0;
    this.currentWave = 0;
    this.isWaveActive = false;
    this.enemiesSpawnedInWave = 0;
}

    /**
     * Inicia a próxima onda e calcula a dificuldade
     */
    startNextWave() {
        if (this.currentWave < this.totalWaves) {
            this.currentWave++;
            this.isWaveActive = true;
            this.enemiesSpawnedInWave = 0;
            
            // Lógica de progressão: aumenta 2 inimigos por onda
            this.enemiesToSpawn = 5 + (this.currentWave * 2);
            
            // Busca a regra de spawn para a onda atual
            const rule = this.getCurrentRule();
            this.spawnInterval = rule.spawnRate || 1500;

            console.log(`Iniciando Onda ${this.currentWave} com ${this.enemiesToSpawn} inimigos.`);
            return true;
        }
        return false;
    }

    /**
     * Retorna a regra de inimigos baseada na onda atual
     */
    getCurrentRule() {
    // Verifica se waveLogic existe e tem itens antes de tentar iterar
    if (!this.waveLogic || this.waveLogic.length === 0) {
        return { startWave: 1, types: ['STANDARD'], spawnRate: 1500 }; // Regra padrão de segurança
    }

    const rules = [...this.waveLogic]
        .filter(rule => this.currentWave >= rule.startWave)
        .sort((a, b) => b.startWave - a.startWave);
    
    return rules[0] || this.waveLogic[0];
}

    /**
     * Atualiza o spawn. Chamado a cada frame no gameLoop
     */
    update(currentTime) {
        if (!this.isWaveActive) return null;

        // Verifica se ainda há inimigos para nascer nesta onda
        if (this.enemiesSpawnedInWave < this.enemiesToSpawn) {
            if (currentTime - this.lastSpawnTime > this.spawnInterval) {
                this.lastSpawnTime = currentTime;
                this.enemiesSpawnedInWave++;

                // Finaliza a ativação do spawn se chegar ao limite
                if (this.enemiesSpawnedInWave >= this.enemiesToSpawn) {
                    this.isWaveActive = false;
                }

                return this.generateEnemyData();
            }
        }

        return null;
    }

    /**
     * Escolhe um inimigo aleatório dentre os tipos permitidos para a onda
     */
    generateEnemyData() {
    const rule = this.getCurrentRule();
    const types = rule.types; 
    const selectedTypeKey = types[Math.floor(Math.random() * types.length)];
    
    // Busca os dados no seu catálogo (STANDARD, FAST, TANK)
    const baseStats = ENEMY_TYPES[selectedTypeKey];

    // --- SEGURANÇA CONTRA ERROS DE DIGITAÇÃO ---
    if (!baseStats) {
        console.warn(`Atenção: O tipo "${selectedTypeKey}" não existe em ENEMY_TYPES. Usando STANDARD por padrão.`);
        return ENEMY_TYPES.STANDARD; 
    }
    // -------------------------------------------

    const difficultyMultiplier = 1 + (this.currentWave - 1) * 0.1;

    return {
        ...baseStats, // Copia nome, cor, velocidade, recompensa, etc.
        health: baseStats.health * difficultyMultiplier,
        typeKey: selectedTypeKey
    };
}
}