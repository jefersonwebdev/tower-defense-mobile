/**
 * MAIN.JS - Versão Master: FAB, Pause, Som e Sistema de Recordes
 */

import { GRID_COLUMNS, GRID_ROWS, GAME_CONFIG } from './constants.js';
import { Map } from './core/Map.js';
import { Input } from './core/Input.js';
import { WaveManager } from './core/WaveManager.js';
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { Particle } from './entities/Particle.js';
import { TOWER_TYPES } from './core/TowerTypes.js';
import { SFX, playSound } from './core/AudioManager.js';

// 1. Elementos do DOM e Estado Inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const btnStart = document.getElementById('btn-start-game');
const fabControl = document.getElementById('fab-wave-control');

// Elementos do Modal de Fim de Jogo
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreLabel = document.getElementById('final-score');
const btnSaveScore = document.getElementById('btn-save-score');
const btnRestart = document.getElementById('btn-restart');
const playerNameInput = document.getElementById('player-name');

let gameStarted = false;
let isGameOver = false;
let isPaused = false;
let newHighScoreEntry = null; // ID temporário para destacar o recorde novo
let money = GAME_CONFIG.STARTING_MONEY;
let lives = GAME_CONFIG.STARTING_LIVES;
let score = 0;
let TILE_SIZE = 0;

// Variáveis de Feedback (Shake)
let shakeTime = 0;
let shakeIntensity = 0;

// 2. Gerenciadores e Listas
const waveManager = new WaveManager();
const towers = [];      
const enemies = [];     
const projectiles = []; 
const particles = []; 
let selectedTowerType = TOWER_TYPES.BASIC;

// Mapa e Waypoints
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
 * LÓGICA DE RECORDES (LOCAL STORAGE)
 */
// js/main.js

function saveScore() {
    const name = playerNameInput.value.trim() || "Anônimo";
    const highScores = JSON.parse(localStorage.getItem('td_highscores')) || [];
    
    // 1. Identifica o melhor score antigo
    const oldTopScore = highScores.length > 0 ? highScores[0].score : 0;
    
    // 2. Cria o novo registro com um ID único (timestamp) para podermos destacar
    const newEntryId = Date.now(); 
    highScores.push({ id: newEntryId, name, score });
    
    // 3. Ordena e limita o Top 5
    highScores.sort((a, b) => b.score - a.score);
    const topScores = highScores.slice(0, 5);
    
    // 4. Salva de volta
    localStorage.setItem('td_highscores', JSON.stringify(topScores));
    
    // 5. Verifica se o novo score é maior que o antigo melhor
    if (score > oldTopScore) {
        newHighScoreEntry = newEntryId; // Marca este ID para brilhar
        playSound(SFX.victory); // Toca som de vitória (se você tiver)
    }

    document.getElementById('name-input-section').style.display = 'none';
    displayHighScores();
}

// js/main.js

function displayHighScores() {
    const list = document.getElementById('high-scores-list');
    const highScores = JSON.parse(localStorage.getItem('td_highscores')) || [];
    
    list.innerHTML = highScores.map(entry => {
        // Verifica se esta entrada é o recorde novo que deve brilhar
        const isNewRecord = entry.id === newHighScoreEntry;
        const glowClass = isNewRecord ? 'class="new-high-score-glow"' : '';
        
        return `<li ${glowClass}>
                  <span>${entry.name}</span>
                  <strong>${entry.score} pts</strong>
                </li>`;
    }).join('');
    
    // Reseta o ID após exibir, para não brilhar nas próximas vezes que abrir
    newHighScoreEntry = null; 
}

/**
 * UI E FEEDBACK
 */
function updateUI() {
    document.getElementById('label-money').innerText = money;
    document.getElementById('label-lives').innerText = lives;
    document.getElementById('label-wave').innerText = `${waveManager.currentWave}/10`;
}

function triggerScreenShake(duration = 15, intensity = 8) {
    shakeTime = duration;
    shakeIntensity = intensity;
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) particles.push(new Particle(x, y, color));
}

/**
 * INICIALIZAÇÃO E EVENTOS
 */
btnStart.onclick = () => {
    gameStarted = true;
    startScreen.style.opacity = '0';
    setTimeout(() => startScreen.style.display = 'none', 500);
};

fabControl.onclick = () => {
    if (!waveManager.isWaveActive && enemies.length === 0) {
        waveManager.startNextWave();
        updateUI();
        fabControl.classList.add('wave-active');
        isPaused = false;
    } else if (waveManager.isWaveActive) {
        isPaused = !isPaused;
        fabControl.style.background = isPaused ? '#f39c12' : '';
    }
};

btnSaveScore.onclick = saveScore;
btnRestart.onclick = () => location.reload();

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
    if (isGameOver || !gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial Black";
        ctx.textAlign = "center";
        ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.save();
    if (shakeTime > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        shakeTime--;
    }

    ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
    gameMap.draw(ctx, TILE_SIZE);

    // 1. Ondas e Reset do FAB
    const enemyData = waveManager.update(currentTime);
    if (enemyData) {
        const newEnemy = new Enemy(waypoints);
        newEnemy.health = enemyData.health;
        newEnemy.speed = enemyData.speed;
        enemies.push(newEnemy);
    }

    if (!waveManager.isWaveActive && enemies.length === 0) {
        fabControl.classList.remove('wave-active');
        fabControl.style.background = '';
        isPaused = false;
    }

    // 2. Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(TILE_SIZE);
        enemy.draw(ctx, TILE_SIZE);

        if (enemy.waypointIndex >= waypoints.length) {
            lives--;
            playSound(SFX.damage);
            triggerScreenShake();
            updateUI();
            enemies.splice(i, 1);
            if (lives <= 0) gameOver();
            continue;
        }

        if (enemy.isDead) {
            money += GAME_CONFIG.MONEY_PER_ENEMY;
            score += 10;
            playSound(SFX.explosion);
            createExplosion(enemy.x, enemy.y, "#e74c3c");
            updateUI();
            enemies.splice(i, 1);
        }
    }

    // 3. Torres e Projéteis
    towers.forEach(t => {
        t.update(currentTime, enemies, TILE_SIZE, projectiles);
        t.draw(ctx, TILE_SIZE);
    });

    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update(TILE_SIZE);
        projectiles[i].draw(ctx, TILE_SIZE);
        if (projectiles[i].isDead) projectiles.splice(i, 1);
    }

    // 4. Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx, TILE_SIZE);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // 5. Construção
    if (input.selectedTile) {
        const { col, row } = input.selectedTile;
        if (gameMap.getTileAt(col, row) === 0) {
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
    finalScoreLabel.innerText = score;
    gameOverScreen.style.display = 'flex';
    displayHighScores();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
createTowerUI();
updateUI();
requestAnimationFrame(gameLoop);