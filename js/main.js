/**
 * MAIN.JS - Versão Final com Sistema de Estrelas e Progressão
 */
import { SettingsManager } from './SettingsManager.js';
import { SFX, playSound } from './core/AudioManager.js';
import { GAME_CONFIG } from './constants.js';
import { Map } from './core/Map.js';
import { Input } from './core/Input.js';
import { WaveManager } from './core/WaveManager.js';
import { UIManager } from './core/UIManager.js';
import { UpgradeUI } from './core/UpgradeUI.js';
import { UpgradeStore } from './core/UpgradeStore.js';
import { LevelManager } from './core/LevelManager.js'; // Novo
import { Tower } from './entities/Tower.js';
import { Enemy } from './entities/Enemy.js';
import { Particle } from './entities/Particle.js';
import { SpecialAttacks } from './core/SpecialAttacks.js';

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
    SettingsManager.init();

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

    // 1. Limpa o mapa para evitar duplicatas ao re-renderizar
    map.innerHTML = '';

    // Coordenadas para espalhar as fases na vertical do celular (ajuste se necessário)
    const coords = [
        { x: 25, y: 85 }, // Fase 1
        { x: 70, y: 75 }, // Fase 2
        { x: 30, y: 60 }, // Fase 3
        { x: 75, y: 45 }, // Fase 4
        { x: 40, y: 30 }, // Fase 5
        { x: 80, y: 15 }  // Fase 6
    ];

    // 2. Itera sobre os níveis vindos do LevelManager
    Object.values(levelManager.levels).forEach((lvl, index) => {
        const pos = coords[index] || { x: 50, y: 50 };
        const node = document.createElement('div');

        // Define as classes base: 'unlocked' ou 'locked' + ID da fase para animação
        node.className = `level-node ${lvl.unlocked ? 'unlocked' : 'locked'} level-${lvl.id}`;

        // Aplica o posicionamento via CSS Inline (X e Y em porcentagem)
        node.style.left = pos.x + '%';
        node.style.top = pos.y + '%';

        if (lvl.unlocked) {
            // --- LÓGICA DE FASE ABERTA ---

            // Cria o container de estrelas
            let starsHTML = '<div class="node-stars">';
            const starsConquered = lvl.stars || 0;

            // Gera as 3 estrelas (preenchendo as conquistadas)
            for (let i = 1; i <= 3; i++) {
                const statusClass = i <= starsConquered ? 'active' : 'inactive';
                starsHTML += `<span class="star ${statusClass}"></span>`;
            }
            starsHTML += '</div>';

            // Conteúdo: Estrelas + Número da Fase
            node.innerHTML = `
                ${starsHTML} 
                <span class="level-number">${lvl.id}</span>
            `;

            // Evento de clique para entrar na fase
            node.onclick = () => startLevel(lvl.id);

        } else {
            // --- LÓGICA DE FASE TRANQUADA ---

            // Estrutura preparada para a animação de "Cadeado Abrindo"
            node.innerHTML = `
                <div class="lock-wrapper">
                    <span class="lock-icon"></span>
                </div>
                <span class="level-number" style="display: none;">${lvl.id}</span>
            `;

            // Fase trancada não tem onclick
            node.onclick = null;
        }

        // Adiciona o nó ao container do mapa
        map.appendChild(node);
    });

    // 3. ATUALIZAÇÃO DOS CONTADORES GLOBAIS (HUD DO MAPA)
    const currentStars = levelManager.getTotalStars();
    const maxStars = levelManager.getMaxPossibleStars();

    // Atualiza o número de estrelas no elemento específico (se existir)
    const totalStarsElem = document.getElementById('total-stars-count');
    if (totalStarsElem) {
        totalStarsElem.innerText = currentStars;
    }

    // Atualiza a exibição completa "Atual / Total"
    const starsDisplay = document.querySelector('.stars-display');
    if (starsDisplay) {
        starsDisplay.innerHTML = `
            <span id="total-stars-count">${currentStars}</span>/ ${maxStars}
        `;
    }
}


// No seu arquivo de interface ou main.js
window.handleResetUpgrades = () => {
    if (UpgradeStore.resetProgress()) {
        // Se o reset funcionou, redesenha a tela de upgrades
        UpgradeUI.render();
        console.log("Progresso resetado com sucesso.");
    }
};

// Special Atack 
let isPlacingMeteor = false;

window.activateMeteorPlacement = () => {
    if (SpecialAttacks.cooldowns.meteor <= 0) {
        isPlacingMeteor = true;
        document.body.style.cursor = "crosshair";
        // Adiciona classe visual ao botão
        document.getElementById('btn-meteor').classList.add('active-aim');
    }
};

// No seu listener de clique do Canvas
// Função auxiliar para pegar a posição correta (Mouse ou Touch)
function getCanvasCoordinates(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    
    // Se for touch, pega o primeiro dedo (touches[0]), senão pega o evento normal
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // AQUI ESTÁ O SEGREDO: Cálculo de escala para Mobile
    // Se o canvas de 800px estiver sendo exibido em uma tela de 400px, a escala é 2
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Handler único para o disparo do meteoro
function handleMeteorAction(e) {
    if (!isPlacingMeteor) return;

    // Impede o comportamento padrão (scroll/zoom) no mobile
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoordinates(e, canvas);
    
    // Chama a sua função no SpecialAttacks.js
    const success = SpecialAttacks.useMeteor(coords.x, coords.y, enemies, TILE_SIZE);

    if (success) {
        createExplosionEffect(coords.x, coords.y);
        
        // Reseta o estado
        isPlacingMeteor = false;
        document.body.style.cursor = "default";
        const btn = document.getElementById('btn-meteor');
        if (btn) btn.classList.remove('active-aim');
    }
}

// REGISTRA OS DOIS EVENTOS
canvas.addEventListener('click', handleMeteorAction);
canvas.addEventListener('touchstart', handleMeteorAction, { passive: false });
/**
 * CARREGAMENTO DE NÍVEL
 */
function startLevel(levelId) {
    currentLevelId = levelId;
    currentLevelData = levelManager.levels[levelId];

    // 1. CALCULA A VIDA COM UPGRADE
    const VIDA_BASE_DO_JOGO = 10;
    const bonusVida = UpgradeStore.getBonus('health');
    const globalMaxLives = Math.floor(VIDA_BASE_DO_JOGO * bonusVida);

    // --- NOVO: GERENCIAR ATAQUES ESPECIAIS ---
    // Verifica se o meteoro está desbloqueado (Lv 2+)
    const meteorBtn = document.getElementById('btn-meteor');
    if (meteorBtn) {
        const isMeteorUnlocked = UpgradeStore.state.upgrades.meteor?.lvl >= 2;
        meteorBtn.style.display = isMeteorUnlocked ? 'block' : 'none';
    }
    // -----------------------------------------

    // Configura o Mapa e WaveManager
    gameMap.setData(currentLevelData.grid);
    waveManager.configure(currentLevelData);

    // 2. APLICA AO STATUS DA PARTIDA
    money = currentLevelData.startingMoney || 150;
    lives = globalMaxLives;

    score = 0;
    isGameOver = false;
    isPaused = false;
    selectedTowerType = null;

    // Limpeza de arrays e reset de habilidades
    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    
    // Opcional: Resetar o tempo de recarga do meteoro ao iniciar a fase
    if (typeof SpecialAttacks !== 'undefined') {
        SpecialAttacks.cooldowns.meteor = 0;
    }

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
let lastTime = 0; // Variável global para rastrear o tempo anterior

function gameLoop(currentTime) {
    // Calcula quanto tempo passou desde o último quadro
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (!gameStarted || isGameOver) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!isPaused) {
        // 1. Atualiza a lógica de tempo dos ataques especiais (cooldowns)
        if (typeof SpecialAttacks !== 'undefined') {
            SpecialAttacks.update(deltaTime);
            updateAbilityUI(); // Função que cuida do visual do botão
        }

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
    // 1. Esconde todas as telas
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.add('hidden'); // Boa prática para garantir que o CSS aplique
    });

    // 2. Mostra a tela alvo
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'flex';
        target.classList.remove('hidden');
        console.log("Navegando para:", screenId);

        // --- LÓGICA DE INICIALIZAÇÃO ESPECÍFICA ---

        // Toda vez que abrir a tela de upgrade, desenhamos os cards atualizados
        if (screenId === 'upgrade-screen') {
            UpgradeUI.render();
        }

        // Se você tiver uma lógica de resetar o menu de níveis, pode chamar aqui também
        if (screenId === 'level-select') {
            // UIManager.renderLevelMenu(...);
        }
    }
}


/**
 * LÓGICA DE VITÓRIA E ESTRELAS
 */
function handleVictory() {
    gameStarted = false; // Para o processamento do jogo

    // 1. Calcula as estrelas com base na vida atual vs máxima
    const starsEarned = levelManager.calculateStars(lives, globalMaxLives);

    // --- ADIÇÃO PARA ANIMAÇÃO ---
    // Verifica se a próxima fase estava trancada antes de processar a vitória
    const nextLevelId = currentLevelId + 1;
    const nextLevel = levelManager.levels[nextLevelId];

    // Se a próxima fase existe e ainda está trancada, marcamos para animar
    if (nextLevel && !nextLevel.unlocked) {
        window.levelToAnimate = nextLevelId;
    } else {
        window.levelToAnimate = null;
    }
    // ----------------------------

    // 2. Salva o progresso no LevelManager (isso muda o status da próxima fase para unlocked no DATA)
    levelManager.processWin(currentLevelId, starsEarned);

    // 3. Prepara o Modal de Vitória (Visual)
    const starsContainer = document.getElementById('modal-stars');
    const modalMsg = document.getElementById('modal-msg');

    if (starsContainer) {
        starsContainer.innerHTML = ''; // Limpa estrelas anteriores

        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('div');
            // Define a classe active para as estrelas ganhas
            star.className = `star ${i <= starsEarned ? 'active' : 'inactive'}`;
            // Delay cascata para a animação das estrelas no modal
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
    document.getElementById('victory-modal').style.display = 'none';
    showScreen('level-select-screen');
    renderLevelMap();

    if (window.levelToAnimate) {
        const nextId = window.levelToAnimate;

        setTimeout(() => {
            const node = document.querySelector(`.level-${nextId}`);
            if (node) {
                node.classList.add('unlock-animation');

                // TOCA O SOM AQUI 🔊
                playSound(SFX.unlock);

                window.levelToAnimate = null;

                setTimeout(() => {
                    renderLevelMap();
                }, 900);
            }
        }, 100);
    }
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

        // Verifica se é grama (tile 0)
        if (gameMap.getTileAt(col, row) === 0) {
            const ocupado = towers.find(t => t.col === col && t.row === row);

            // Verifica ocupação e se o jogador tem o dinheiro necessário
            if (!ocupado && money >= selectedTowerType.price) {

                // --- AJUSTE AQUI ---
                // Passamos apenas a string do tipo (ex: 'ICE'), 
                // pois a classe Tower agora usa getTowerStats(type) internamente.
                const novaTorre = new Tower(col, row, selectedTowerType.type);
                towers.push(novaTorre);

                // 2. Cobra o preço
                money -= selectedTowerType.price;

                // 3. Reseta a seleção
                const lastUsedType = selectedTowerType; // Guardamos para o updateHUD se necessário
                selectedTowerType = null;

                // 4. ATUALIZAÇÃO DA UI
                // Importante: Passar o novo saldo de 'money' para o UIManager 
                // para que os botões que ficaram caros demais fiquem cinzas (disabled).
                updateHUD();

                // Se o seu updateHUD não chama o UIManager diretamente, você pode forçar aqui:
                // UIManager.createTowerButtons(money, null, onSelectCallback);

                // 5. Limpa a seleção do clique/input
                input.clearSelection();

                console.log(`Construída: ${novaTorre.name} em [${col}, ${row}]`);
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

    // --- SONS DE INTERFACE (Global) ---
    document.addEventListener('click', (e) => {
        // Verifica se o que foi clicado é um botão ou está dentro de um botão
        if (e.target.closest('button')) {
            playSound(SFX.click);
        }
    });

    // --- CONTROLE DA ONDA E PAUSE ---
    const waveBtn = document.getElementById('fab-wave-control');
    if (waveBtn) {
        waveBtn.onclick = () => {
            if (!waveManager.isWaveActive && enemies.length === 0) {
                if (waveManager.startNextWave()) {
                    waveBtn.classList.add('wave-active');
                    updateHUD();
                }
            } else {
                isPaused = !isPaused;
            }
        };
    }

    // --- LÓGICA DE CONFIGURAÇÕES ---
    const settingsScreen = document.getElementById('settings-screen');
    const btnOpen = document.getElementById('btn-open-settings');
    const btnClose = document.getElementById('btn-close-settings');

    if (btnOpen && settingsScreen) {
        btnOpen.onclick = () => {
            settingsScreen.style.display = 'flex';
        };
    }

    if (btnClose && settingsScreen) {
        btnClose.onclick = () => {
            settingsScreen.style.display = 'none';
        };
    }
}

/**
 * ATUALIZA HUD E LOJA EM TEMPO REAL
 */
function updateHUD() {
    // 1. Atualiza textos (Moeda, Vidas, Waves)
    UIManager.updateHUD(money, lives, waveManager.currentWave, waveManager.totalWaves);

    // 2. Atualiza a loja para refletir se o jogador pode comprar as torres
    // Passamos o dinheiro atual, o tipo selecionado e a função de callback
    UIManager.createTowerButtons(money, selectedTowerType, (type) => {
        selectedTowerType = type;
        // Opcional: tocar som de clique ao selecionar
        // playSound(SFX.click); 
    });
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

const restartButton = document.getElementById('btn-restart'); // Use o ID correto do seu HTML

if (restartButton) {
    restartButton.onclick = () => {
        // Agora sim, recarregamos a página para limpar tudo
        location.reload();

        // OU, se quiser um reset suave sem recarregar a página:
        // resetGameVariables(); 
    };
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

function updateAbilityUI() {
    const meteorBtn = document.getElementById('btn-meteor');
    
    // Só atualiza se o botão estiver visível (desbloqueado)
    if (meteorBtn && meteorBtn.style.display !== 'none') {
        const overlay = meteorBtn.querySelector('.cooldown-overlay');
        const currentCD = SpecialAttacks.cooldowns.meteor;
        const maxCD = SpecialAttacks.config.meteor.cooldownTime;

        if (currentCD > 0) {
            // Calcula a altura da sombra (de 100% até 0%)
            const percent = (currentCD / maxCD) * 100;
            overlay.style.height = `${percent}%`;
            meteorBtn.classList.add('on-cooldown');
            meteorBtn.disabled = true;
        } else {
            overlay.style.height = '0%';
            meteorBtn.classList.remove('on-cooldown');
            meteorBtn.disabled = false;
        }
    }
}

// Função para criar o efeito visual da explosão
function createExplosionEffect(x, y) {
    const particleCount = 20;
    playSound(SFX.explosion);
    // 1. Criar as partículas de explosão (Fogo/Fumaça)
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        
        const p = {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.02,
            color: i % 2 === 0 ? '#ff4500' : '#ffae00',
            size: Math.random() * 5 + 2,

            update: function() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
            },

            draw: function(ctx) {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };

        particles.push(p);
    }

    // 2. Criar o Círculo de Impacto (Onda de Choque)
    const shockwave = {
        x: x,
        y: y,
        life: 1.0,
        decay: 0.03, // Velocidade com que some
        radius: 0,   // Começa em 0 e expande
        // Usa o raio configurado no seu sistema ou um padrão de 100
        maxRadius: (typeof SpecialAttacks !== 'undefined') ? SpecialAttacks.config.meteor.radius : 100,

        update: function() {
            this.life -= this.decay;
            // Efeito de expansão: cresce rápido no início e para no maxRadius
            this.radius += (this.maxRadius - this.radius) * 0.15;
        },

        draw: function(ctx) {
            if (this.life <= 0) return;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            // Preenchimento laranja suave
            ctx.fillStyle = `rgba(255, 165, 0, ${this.life * 0.2})`;
            ctx.fill();
            
            // Borda sólida ou tracejada
            ctx.strokeStyle = `rgba(255, 69, 0, ${this.life})`;
            ctx.lineWidth = 2;
            // Opcional: ctx.setLineDash([5, 5]); // Estilo radar
            ctx.stroke();
            
            ctx.restore();
        }
    };

    particles.push(shockwave);
}

init();