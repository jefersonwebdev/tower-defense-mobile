/**
 * MAIN.JS - Versão Final Otimizada
 */

import { GAME_CONFIG } from './constants.js';
import { LEVELS } from './core/Levels.js';
import { LevelProvider } from './core/LevelProvider.js';
import { Map } from './core/Map.js';
import { Input } from './core/Input.js';
import { WaveManager } from './core/WaveManager.js';
import { UIManager } from './core/UIManager.js';
import { ScoreSystem } from './core/ScoreSystem.js';
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { Particle } from './entities/Particle.js';
import { TOWER_TYPES } from './core/TowerTypes.js';
import { ENEMY_TYPES } from './core/EnemyTypes.js';

// 1. Contexto e Motores
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMap = new Map([]); 
const waveManager = new WaveManager();
const input = new Input(canvas, 0);

// 2. Estado Global
let gameStarted = false;
let isGameOver = false;
let isPaused = false;
let currentLevelData = null;

let money = 0;
let lives = 0;
let score = 0;
let TILE_SIZE = 0;
let shakeTime = 0;
let shakeIntensity = 0;

// Listas de Entidades
const towers = [];
const enemies = [];
const projectiles = [];
const particles = [];

// Começa como NULL para o jogador ter que clicar no menu antes de construir
let selectedTowerType = null; 

/**
 * INICIALIZAÇÃO
 */
function init() {
    // Configura o clique do botão "JOGAR AGORA" da Tela Inicial
    document.getElementById('btn-start-game').onclick = () => {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('level-selection-screen').style.display = 'flex';
        
        UIManager.renderLevelMenu((levelConfig) => {
            startLevel(levelConfig);
        });
    };

    setupGlobalEvents();
    requestAnimationFrame(gameLoop);
}

/**
 * CARREGAMENTO DE NÍVEL
 */
function startLevel(levelConfig) {
    // 1. Processa o mapa e gera waypoints automáticos
    currentLevelData = LevelProvider.parse(levelConfig);

    // 2. Configura os Motores
    gameMap.setData(currentLevelData.grid);
    waveManager.configure(currentLevelData);
    
    // 3. Reseta Status do Jogo
    money = levelConfig.startingMoney || GAME_CONFIG.STARTING_MONEY;
    lives = GAME_CONFIG.STARTING_LIVES;
    score = 0;
    isGameOver = false;
    isPaused = false;
    selectedTowerType = null; // Garante que começa sem seleção
    
    // Limpa entidades
    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    particles.length = 0;

    // 4. Prepara Interface (Passa NULL para nenhum botão brilhar no início)
    resizeCanvas();
    UIManager.createTowerButtons(null, onTowerSelected);

    // 5. Exibe o Jogo
    document.getElementById('level-selection-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    gameStarted = true;
    updateHUD();
}

/**
 * CALLBACK DE SELEÇÃO DE TORRE
 */
function onTowerSelected(type) {
    selectedTowerType = type;
}

/**
 * LOOP PRINCIPAL
 */
function gameLoop(currentTime) {
    if (!gameStarted || isGameOver) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!isPaused) {
        updateAndRender(currentTime);
    } else {
        drawPauseOverlay();
    }
    requestAnimationFrame(gameLoop);
}

function updateAndRender(currentTime) {
    ctx.save();
    
    // Efeito de Tela (Shake)
    if (shakeTime > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        shakeTime--;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameMap.draw(ctx, TILE_SIZE);

    // 1. Spawn de Inimigos (Seguro contra erros de ENEMY_TYPES)
    const enemyData = waveManager.update(currentTime);
    if (enemyData) {
        enemies.push(new Enemy(currentLevelData.waypoints, enemyData));
    }

    // 2. Processar Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(TILE_SIZE);
        enemy.draw(ctx, TILE_SIZE);

        if (enemy.waypointIndex >= currentLevelData.waypoints.length) {
            lives--;
            shakeTime = 15; shakeIntensity = 8;
            updateHUD();
            enemies.splice(i, 1);
            if (lives <= 0) endGame();
            continue;
        }

        if (enemy.isDead) {
            money += enemy.reward;
            score += 10;
            createExplosion(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE, enemy.color);
            updateHUD();
            enemies.splice(i, 1);
        }
    }

    // 3. Torres e Combate
    towers.forEach(t => {
        t.update(currentTime, enemies, TILE_SIZE, projectiles);
        t.draw(ctx, TILE_SIZE);
    });

    // 4. Projéteis e Partículas
    handleProjectiles();
    handleParticles();

    // 5. Lógica de Construção com RESET
    handleBuildLogic();

    // Sincroniza estado do botão FAB
    const fab = document.getElementById('fab-wave-control');
    if (!waveManager.isWaveActive && enemies.length === 0) {
        fab.classList.remove('wave-active');
    }

    ctx.restore();
}

/**
 * LÓGICA DE CONSTRUÇÃO COM AUTO-RESET
 */
function handleBuildLogic() {
    if (input.selectedTile && selectedTowerType) {
        const { col, row } = input.selectedTile;
        
        // Verifica se o terreno é grama (0)
        if (gameMap.getTileAt(col, row) === 0) {
            const ocupado = towers.find(t => t.col === col && t.row === row);
            const canAfford = money >= selectedTowerType.price;
            
            if (!ocupado && canAfford) {
                // Constrói
                towers.push(new Tower(col, row, selectedTowerType));
                money -= selectedTowerType.price;
                
                // --- RESET DE SELEÇÃO ---
                selectedTowerType = null; 
                UIManager.createTowerButtons(null, onTowerSelected);
                // ------------------------

                updateHUD();
                input.clearSelection();
            } else if (ocupado || !canAfford) {
                // Preview de erro
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        } else {
            // Se clicar no caminho (1) ou base (2), limpa seleção
            input.clearSelection();
        }
    }
}

/**
 * EVENTOS GLOBAIS
 */
function setupGlobalEvents() {
    window.addEventListener('resize', resizeCanvas);
    
    document.getElementById('fab-wave-control').onclick = () => {
        if (!waveManager.isWaveActive && enemies.length === 0) {
            if (waveManager.startNextWave()) {
                document.getElementById('fab-wave-control').classList.add('wave-active');
                updateHUD();
            }
        } else {
            isPaused = !isPaused;
        }
    };

    document.getElementById('btn-save-score').onclick = () => {
        const name = document.getElementById('player-name').value;
        const newId = ScoreSystem.save(name, score);
        UIManager.displayHighScores(newId);
    };

    document.getElementById('btn-restart').onclick = () => location.reload();
}

function handleProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update(TILE_SIZE);
        projectiles[i].draw(ctx, TILE_SIZE);
        if (projectiles[i].isDead) projectiles.splice(i, 1);
    }
}

function handleParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx, TILE_SIZE);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
}

function updateHUD() {
    UIManager.updateHUD(money, lives, waveManager.currentWave, waveManager.totalWaves);
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function resizeCanvas() {
    if (!currentLevelData) return;
    const rows = currentLevelData.grid.length;
    const cols = currentLevelData.grid[0].length;
    
    TILE_SIZE = window.innerHeight / rows;
    canvas.width = cols * TILE_SIZE;
    canvas.height = rows * TILE_SIZE;

    if (canvas.width > window.innerWidth) {
        TILE_SIZE = window.innerWidth / cols;
        canvas.width = window.innerWidth;
        canvas.height = rows * TILE_SIZE;
    }
    input.updateTileSize(TILE_SIZE);
}

function drawPauseOverlay() {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
}

function endGame() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').style.display = 'flex';
    UIManager.displayHighScores();
}

init();