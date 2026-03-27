/**
 * MAIN.JS - Versão Master Modularizada
 * Foco: Orquestração de Sistemas e Game Loop
 */

import { GRID_COLUMNS, GAME_CONFIG } from './constants.js';
import { LEVEL_DATA, WAYPOINTS } from './core/LevelConfig.js';
import { Map } from './core/Map.js';
import { Input } from './core/Input.js';
import { WaveManager } from './core/WaveManager.js';
import { UIManager } from './core/UIManager.js';
import { ScoreSystem } from './core/ScoreSystem.js';
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { Particle } from './entities/Particle.js';
import { TOWER_TYPES } from './core/TowerTypes.js';
import { SFX, playSound } from './core/AudioManager.js';

// 1. Configurações de Contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 2. Estado Global do Jogo
let gameStarted = false;
let isGameOver = false;
let isPaused = false;
let money = GAME_CONFIG.STARTING_MONEY;
let lives = GAME_CONFIG.STARTING_LIVES;
let score = 0;
let TILE_SIZE = 0;

// Feedback Visual
let shakeTime = 0;
let shakeIntensity = 0;

// 3. Instâncias dos Motores
const gameMap = new Map(LEVEL_DATA);
const waveManager = new WaveManager();
const input = new Input(canvas, 0);

// Listas de Entidades
const towers = [];
const enemies = [];
const projectiles = [];
const particles = [];
let selectedTowerType = TOWER_TYPES.BASIC;

/**
 * INICIALIZAÇÃO
 */
function init() {
    resizeCanvas();
    
    // Criar interface de torres passando o callback de seleção
    UIManager.createTowerButtons(selectedTowerType, (type) => {
        selectedTowerType = type;
        // Opcional: tocar um som de clique aqui
    });

    setupEventListeners();
    updateHUD();
    requestAnimationFrame(gameLoop);
}

function updateHUD() {
    UIManager.updateHUD(money, lives, waveManager.currentWave);
}

function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);

    document.getElementById('btn-start-game').onclick = () => {
        gameStarted = true;
        const screen = document.getElementById('start-screen');
        screen.style.opacity = '0';
        setTimeout(() => screen.style.display = 'none', 500);
    };

    document.getElementById('fab-wave-control').onclick = handleFabClick;
    document.getElementById('btn-save-score').onclick = handleSaveScore;
    document.getElementById('btn-restart').onclick = () => location.reload();
}

/**
 * LÓGICA DE INPUT E BOTÕES
 */
function handleFabClick() {
    const fab = document.getElementById('fab-wave-control');
    if (!waveManager.isWaveActive && enemies.length === 0) {
        waveManager.startNextWave();
        updateHUD();
        fab.classList.add('wave-active');
        isPaused = false;
    } else {
        isPaused = !isPaused;
        fab.style.background = isPaused ? '#f39c12' : '';
    }
}

function handleSaveScore() {
    const nameInput = document.getElementById('player-name');
    const newId = ScoreSystem.save(nameInput.value, score);
    document.getElementById('name-input-section').style.display = 'none';
    UIManager.displayHighScores(newId);
}

/**
 * GAME LOOP
 */
function gameLoop(currentTime) {
    if (isGameOver || !gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (isPaused) {
        drawPauseOverlay();
        requestAnimationFrame(gameLoop);
        return;
    }

    updateAndRender(currentTime);
    requestAnimationFrame(gameLoop);
}

function updateAndRender(currentTime) {
    ctx.save();
    
    // Aplicar Shake
    if (shakeTime > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        shakeTime--;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameMap.draw(ctx, TILE_SIZE);

    // 1. Gerenciar Invasores
    const enemyConfig = waveManager.update(currentTime);
    if (enemyConfig) {
        enemies.push(new Enemy(WAYPOINTS, enemyConfig));
    }

    // Reset automático do botão de wave
    if (!waveManager.isWaveActive && enemies.length === 0) {
        const fab = document.getElementById('fab-wave-control');
        fab.classList.remove('wave-active');
        fab.style.background = '';
    }

    // 2. Processar Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(TILE_SIZE);
        enemy.draw(ctx, TILE_SIZE);

        if (enemy.waypointIndex >= WAYPOINTS.length) {
            lives--;
            playSound(SFX.damage);
            shakeTime = 15; shakeIntensity = 8;
            updateHUD();
            enemies.splice(i, 1);
            if (lives <= 0) triggerGameOver();
            continue;
        }

        if (enemy.isDead) {
            money += enemy.reward || 10;
            score += 10;
            playSound(SFX.explosion);
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

    handleProjectiles();
    handleParticles();
    handleBuildLogic();

    ctx.restore();
}

/**
 * SISTEMAS AUXILIARES
 */
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

function handleBuildLogic() {
    if (input.selectedTile) {
        const { col, row } = input.selectedTile;
        if (gameMap.getTileAt(col, row) === 0) {
            const ocupado = towers.find(t => t.col === col && t.row === row);
            const canAfford = money >= selectedTowerType.price;
            
            if (!ocupado && canAfford) {
                towers.push(new Tower(col, row, selectedTowerType));
                money -= selectedTowerType.price;
                updateHUD();
                input.clearSelection();
            }
            // Preview de construção
            ctx.fillStyle = canAfford ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function drawPauseOverlay() {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
}

function triggerGameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').style.display = 'flex';
    UIManager.displayHighScores();
}

function resizeCanvas() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // O mapa tem 15 linhas (GRID_ROWS pode ser importado ou fixo)
    TILE_SIZE = windowHeight / 15; 
    canvas.width = 10 * TILE_SIZE; // GRID_COLUMNS = 10
    canvas.height = 15 * TILE_SIZE;

    if (canvas.width > windowWidth) {
        TILE_SIZE = windowWidth / 10;
        canvas.width = windowWidth;
        canvas.height = 15 * TILE_SIZE;
    }
    input.updateTileSize(TILE_SIZE);
}

// Iniciar o jogo
init();