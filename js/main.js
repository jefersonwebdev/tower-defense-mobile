/**
 * MAIN.JS - Versão Final com Sistema de Estrelas e Progressão
 */

import { GAME_CONFIG } from './constants.js';
import { Map } from './core/Map.js';
import { Input } from './core/Input.js';
import { WaveManager } from './core/WaveManager.js';
import { UIManager } from './core/UIManager.js';
import { LevelManager } from './core/LevelManager.js'; // Novo
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { Particle } from './entities/Particle.js';

// 1. Contexto e Motores
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMap = new Map([]); 
const waveManager = new WaveManager();
const levelManager = new LevelManager(); // Instância do novo manager
const input = new Input(canvas, 0);

// 2. Estado Global do Jogador (Upgradable)
let globalMaxLives = 10; 
let gameStarted = false;
let isGameOver = false;
let isPaused = false;
let currentLevelId = null;
let currentLevelData = null;

// Estado da Partida
let money = 0;
let lives = 0;
let score = 0;
let TILE_SIZE = 0;
let shakeTime = 0;
let shakeIntensity = 0;
let draggedTower = null; 
let originalPos = { col: 0, row: 0 };
let selectedTowerType = null; 

// Listas de Entidades
const towers = [];
const enemies = [];
const projectiles = [];
const particles = [];

/**
 * INICIALIZAÇÃO
 */
function init() {
    // Ao clicar em JOGAR, abre o Level Select (o Mapa)
    document.getElementById('btn-start-game').onclick = () => {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('level-select-screen').style.display = 'flex';
        renderLevelMap();
    };

    setupGlobalEvents();
    requestAnimationFrame(gameLoop);
}

/**
 * RENDERIZAÇÃO DO MAPA DE FASES (Caminho em S)
 */
function renderLevelMap() {
    const map = document.getElementById('levels-map');
    if (!map) return;
    map.innerHTML = ''; 

    // Coordenadas para espalhar as fases na vertical do celular
    const coords = [
        { x: 25, y: 85 }, // Fase 1
        { x: 70, y: 75 }, // Fase 2
        { x: 30, y: 60 }, // Fase 3
        { x: 75, y: 45 }, // Fase 4
        { x: 40, y: 30 }, // Fase 5
        { x: 80, y: 15 }  // Fase 6
    ];

    Object.values(levelManager.levels).forEach((lvl, index) => {
        const pos = coords[index] || { x: 50, y: 50 };
        const node = document.createElement('div');
        
        // Define se a fase está aberta ou trancada
        node.className = `level-node ${lvl.unlocked ? 'unlocked' : 'locked'}`;
        
        // Aplica o posicionamento via CSS Inline
        node.style.left = pos.x + '%';
        node.style.top = pos.y + '%';

        if (lvl.unlocked) {
            // Cria o container de estrelas
            let starsHTML = '<div class="node-stars">';
            const starsConquered = lvl.stars || 0;

            // Gera sempre 3 estrelas, mudando a classe conforme a conquista
            for (let i = 1; i <= 3; i++) {
                const statusClass = i <= starsConquered ? 'active' : 'inactive';
                starsHTML += `<span class="star ${statusClass}"></span>`;
            }
            starsHTML += '</div>';

            // Insere as estrelas e o número da fase
            node.innerHTML = `${starsHTML} <span class="level-number">${lvl.id}</span>`;
            node.onclick = () => startLevel(lvl.id);
        } else {
            // Ícone para fase trancada
            node.innerHTML = '<span class="lock-icon"></span>';
        }

        map.appendChild(node);
    });

    // Atualiza o contador global no topo da tela
    const totalStarsElem = document.getElementById('total-stars-count');
    if (totalStarsElem) {
        totalStarsElem.innerText = levelManager.getTotalStars();
    }

    // 1. Pega os valores do LevelManager
    const currentStars = levelManager.getTotalStars();
    const maxStars = levelManager.getMaxPossibleStars();

    // 2. Seleciona o elemento do placar
    const starsDisplay = document.querySelector('.stars-display');
    
    // 3. Atualiza o conteúdo mantendo o ID para o número atual
    // e preenchendo o total de forma dinâmica
    if (starsDisplay) {
        starsDisplay.innerHTML = `
            <span id="total-stars-count">${currentStars}</span>/ ${maxStars}
        `;
    }
}

/**
 * CARREGAMENTO DE NÍVEL
 */
function startLevel(levelId) {
    currentLevelId = levelId;
    currentLevelData = levelManager.levels[levelId];

    // Configura o Mapa e WaveManager
    gameMap.setData(currentLevelData.grid);
    waveManager.configure(currentLevelData);
    
    // Reseta Status usando Vida Global
    money = currentLevelData.startingMoney || 150;
    lives = globalMaxLives; // <-- Usa o upgrade do jogador
    score = 0;
    isGameOver = false;
    isPaused = false;
    selectedTowerType = null;
    
    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    particles.length = 0;

    resizeCanvas();
    UIManager.createTowerButtons(null, (type) => selectedTowerType = type);

    document.getElementById('level-select-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    gameStarted = true;
    updateHUD();
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
    
    if (shakeTime > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        shakeTime--;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameMap.draw(ctx, TILE_SIZE);

    // 1. Spawn
    const enemyData = waveManager.update(currentTime);
    if (enemyData) {
        enemies.push(new Enemy(currentLevelData.waypoints, enemyData));
    }

    // 2. Inimigos
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

    // --- FINAL DE ONDA / VITÓRIA ---
    if (waveManager.spawningComplete && enemies.length === 0) {
        if (waveManager.currentWave >= waveManager.totalWaves) {
            handleVictory();
        } else {
            waveManager.isWaveActive = false;
            document.getElementById('fab-wave-control').classList.remove('wave-active');
        }
    }

    // 3. Entidades
    towers.forEach(t => {
        t.update(currentTime, enemies, TILE_SIZE, projectiles);
        t.draw(ctx, TILE_SIZE, gameMap);
    });

    handleProjectiles();
    handleParticles();
    handleDragLogic();  
    handleBuildLogic();

    ctx.restore();
}


// 1. Verifique se essa função existe no seu arquivo
export function showScreen(screenId) {
    // Esconde todas as divs que têm a classe "screen"
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
    });

    // Mostra a tela desejada
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'flex';
        console.log("Tela atual:", screenId);
    }
}


/**
 * LÓGICA DE VITÓRIA E ESTRELAS
 */
function handleVictory() {
    gameStarted = false; // Para o processamento do jogo
    
    // 1. Calcula as estrelas com base na vida atual vs máxima
    const starsEarned = levelManager.calculateStars(lives, globalMaxLives);
    
    // 2. Salva o progresso no LevelManager (desbloqueia próxima fase)
    levelManager.processWin(currentLevelId, starsEarned);
    
    // 3. Prepara o Modal de Vitória
    const starsContainer = document.getElementById('modal-stars');
    const modalMsg = document.getElementById('modal-msg');
    
    if (starsContainer) {
        starsContainer.innerHTML = ''; // Limpa estrelas anteriores
        
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('div');
            // Usa as classes CSS que configuramos com SVGs
            star.className = `star ${i <= starsEarned ? 'active' : 'inactive'}`;
            // Adiciona um pequeno atraso para a animação de "pop" em cascata
            star.style.animationDelay = `${i * 0.15}s`; 
            starsContainer.appendChild(star);
        }
    }

    if (modalMsg) {
        modalMsg.innerText = `Você conquistou ${starsEarned} de 3 estrelas!`;
    }
    
    // 4. Exibe o Modal e esconde a UI de jogo
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('victory-modal').style.display = 'flex';
}

// Função para o botão "Continuar" do Modal
// Função para fechar o modal e IR para a seleção de fases
export function closeVictoryModal() {
    // 1. Esconde o modal
    document.getElementById('victory-modal').style.display = 'none';
    
    // 2. Muda para a tela de seleção de fases
    showScreen('level-select-screen');
    
    // 3. Atualiza o mapa (estrelas e cadeados)
    renderLevelMap();
}

// IMPORTANTE: Torne-as globais para o HTML (onclick) funcionar!
window.showScreen = showScreen;
window.closeVictoryModal = closeVictoryModal;

/**
 * ARRASTE E CONSTRUÇÃO (Resumido para o main)
 */
function handleBuildLogic() {
    if (input.selectedTile && selectedTowerType) {
        const { col, row } = input.selectedTile;
        if (gameMap.getTileAt(col, row) === 0) {
            const ocupado = towers.find(t => t.col === col && t.row === row);
            if (!ocupado && money >= selectedTowerType.price) {
                towers.push(new Tower(col, row, selectedTowerType));
                money -= selectedTowerType.price;
                selectedTowerType = null; 
                UIManager.createTowerButtons(null, (t) => selectedTowerType = t);
                updateHUD();
                input.clearSelection();
            }
        }
    }
}

function handleDragLogic() {
    if (input.isDown && !draggedTower && !selectedTowerType && !waveManager.isWaveActive) {
        const { col, row } = input.getTileCoords();
        const towerFound = towers.find(t => t.col === col && t.row === row);
        if (towerFound) {
            draggedTower = towerFound;
            originalPos = { col: towerFound.col, row: towerFound.row };
            draggedTower.isDragging = true;
        }
    }
    if (draggedTower && input.isDown) {
        const { col, row } = input.getTileCoords();
        draggedTower.col = col;
        draggedTower.row = row;
    }
    if (!input.isDown && draggedTower) {
        const { col, row } = draggedTower;
        const valid = gameMap.getTileAt(col, row) === 0 && !towers.find(t => t !== draggedTower && t.col === col && t.row === row);
        if (!valid) {
            draggedTower.col = originalPos.col;
            draggedTower.row = originalPos.row;
        }
        draggedTower.isDragging = false;
        draggedTower = null;
    }
}

/**
 * AUXILIARES
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
}

function updateHUD() {
    UIManager.updateHUD(money, lives, waveManager.currentWave, waveManager.totalWaves);
}

function resizeCanvas() {
    if (!currentLevelData) return;
    const rows = currentLevelData.grid.length;
    const cols = currentLevelData.grid[0].length;
    TILE_SIZE = Math.min(window.innerWidth / cols, window.innerHeight / rows);
    canvas.width = cols * TILE_SIZE;
    canvas.height = rows * TILE_SIZE;
    input.updateTileSize(TILE_SIZE);
}

function endGame() {
    isGameOver = true;
    document.getElementById('game-over-screen').style.display = 'flex';
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

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) particles.push(new Particle(x, y, color));
}

function drawPauseOverlay() {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
}

init();