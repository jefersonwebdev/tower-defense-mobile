/**
 * MAIN.JS - Versão Definitiva com Menu, Ondas e Efeitos
 */

import { GRID_COLUMNS, GRID_ROWS, GAME_CONFIG } from './constants.js';
import { Map } from './core/Map.js';
import { Input } from './core/Input.js';
import { WaveManager } from './core/WaveManager.js';
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { Particle } from './entities/Particle.js';
import { TOWER_TYPES } from './core/TowerTypes.js';

// 1. Elementos do DOM e Estado Inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const btnStart = document.getElementById('btn-start-game');
const btnNextWave = document.getElementById('btn-next-wave');

let gameStarted = false;
let isGameOver = false;
let money = GAME_CONFIG.STARTING_MONEY;
let lives = GAME_CONFIG.STARTING_LIVES;
let score = 0;
let TILE_SIZE = 0;

// Efeitos de Feedback
let shakeTime = 0;
let shakeIntensity = 0;

// 2. Gerenciadores e Listas
const waveManager = new WaveManager();
const towers = [];      
const enemies = [];     
const projectiles = []; 
const particles = []; 
let selectedTowerType = TOWER_TYPES.BASIC;

// Configuração do Mapa e Input
const levelData = [
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 2], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
const gameMap = new Map(levelData);
const input = new Input(canvas, TILE_SIZE);
const waypoints = [
    {x: 1, y: 0}, {x: 1, y: 2}, {x: 4, y: 2}, {x: 4, y: 4}, 
    {x: 7, y: 4}, {x: 7, y: 7}, {x: 1, y: 7}, {x: 1, y: 9}, {x: 9, y: 9}
];

/**
 * FUNÇÕES DE INTERFACE E EFEITOS
 */
function updateUI() {
    document.getElementById('label-money').innerText = money;
    document.getElementById('label-lives').innerText = lives;
    document.getElementById('label-wave').innerText = `${waveManager.currentWave}/10`;
}

function pulseHeart() {
    const heartIcon = document.getElementById('icon-heart-lives');
    if (heartIcon) {
        heartIcon.classList.remove('damage-taken');
        void heartIcon.offsetWidth; 
        heartIcon.classList.add('damage-taken');
    }
}

function triggerScreenShake(duration = 15, intensity = 8) {
    shakeTime = duration;
    shakeIntensity = intensity;
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) particles.push(new Particle(x, y, color));
}

/**
 * INICIALIZAÇÃO DE BOTÕES
 */
btnStart.onclick = () => {
    gameStarted = true;
    startScreen.style.opacity = '0';
    setTimeout(() => startScreen.style.display = 'none', 500);
};

btnNextWave.onclick = () => {
    if (!waveManager.isWaveActive && enemies.length === 0) {
        waveManager.startNextWave();
        updateUI();
        btnNextWave.disabled = true;
    }
};

function createTowerUI() {
    const menu = document.getElementById('tower-inventory');
    Object.keys(TOWER_TYPES).forEach(key => {
        const type = TOWER_TYPES[key];
        const btn = document.createElement('button');
        btn.className = 'tower-btn';
        if (type === selectedTowerType) btn.classList.add('selected');
        btn.innerHTML = `<strong>${type.name}</strong><br><small>$${type.price}</small>`;
        btn.style.backgroundColor = type.color;
        btn.onclick = () => {
            selectedTowerType = type;
            document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        menu.appendChild(btn);
    });
}

function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    TILE_SIZE = windowWidth / GRID_COLUMNS;
    canvas.width = GRID_COLUMNS * TILE_SIZE;
    canvas.height = GRID_ROWS * TILE_SIZE;
    if (canvas.height > windowHeight) {
        TILE_SIZE = windowHeight / GRID_ROWS;
        canvas.width = GRID_COLUMNS * TILE_SIZE;
        canvas.height = GRID_ROWS * TILE_SIZE;
    }
    input.updateTileSize(TILE_SIZE);
}

/**
 * LOOP PRINCIPAL
 */
function gameLoop(currentTime) {
    if (isGameOver) return;
    if (!gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.save();

    // Aplica Screen Shake
    if (shakeTime > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        shakeTime--;
    }

    ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
    gameMap.draw(ctx, TILE_SIZE);

    // 1. Spawn de Ondas
    const enemyData = waveManager.update(currentTime);
    if (enemyData) {
        const newEnemy = new Enemy(waypoints);
        newEnemy.health = enemyData.health;
        newEnemy.speed = enemyData.speed;
        enemies.push(newEnemy);
    }
    if (!waveManager.isWaveActive && enemies.length === 0) btnNextWave.disabled = false;

    // 2. Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(TILE_SIZE);
        enemy.draw(ctx, TILE_SIZE);

        if (enemy.waypointIndex >= waypoints.length) {
            lives--;
            pulseHeart();
            triggerScreenShake();
            updateUI();
            enemies.splice(i, 1);
            if (lives <= 0) gameOver();
        } else if (enemy.isDead) {
            money += GAME_CONFIG.MONEY_PER_ENEMY;
            score += 10;
            createExplosion(enemy.x, enemy.y, "#e74c3c");
            updateUI();
            enemies.splice(i, 1);
        }
    }

    // 3. Torres, Projéteis e Partículas
    towers.forEach(t => t.update(currentTime, enemies, TILE_SIZE, projectiles));
    towers.forEach(t => t.draw(ctx, TILE_SIZE));

    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update(TILE_SIZE);
        projectiles[i].draw(ctx, TILE_SIZE);
        if (projectiles[i].isDead) projectiles.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx, TILE_SIZE);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // 4. Construção
    if (input.selectedTile) {
        const { col, row } = input.selectedTile;
        const tileType = gameMap.getTileAt(col, row);
        if (tileType === 0) {
            const ocupado = towers.find(t => t.col === col && t.row === row);
            const canAfford = money >= selectedTowerType.price;
            if (!ocupado && canAfford) {
                towers.push(new Tower(col, row, selectedTowerType));
                money -= selectedTowerType.price;
                updateUI();
                input.clearSelection();
            }
            ctx.fillStyle = canAfford ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    isGameOver = true;
    alert(`FIM DE JOGO! Pontos: ${score}`);
    location.reload();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
createTowerUI();
updateUI();
requestAnimationFrame(gameLoop);