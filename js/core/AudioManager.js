import { SettingsManager } from '../SettingsManager.js';

/**
 * AUDIOMANAGER.JS - Gerencia os efeitos sonoros e música
 */
export const SFX = {
    shoot: new Audio('assets/sfx/shoot.mp3'),
    explosion: new Audio('assets/sfx/explosion.mp3'),
    damage: new Audio('assets/sfx/damage.mp3'),
    unlock: new Audio('assets/sfx/unlock.mp3'),
    click: new Audio('assets/sfx/ui_click.mp3')
    //build: new Audio('assets/sfx/build.mp3') // Adicionado para upgrades
};

// Ajuste de volumes iniciais
SFX.shoot.volume = 0.2;
SFX.explosion.volume = 0.4;
SFX.damage.volume = 0.6;
SFX.unlock.volume = 0.5;
SFX.click.volume = 0.3;

/**
 * Toca um som respeitando as configurações do usuário
 */
export function playSound(sound) {
    // SÓ TOCA SE: o som existir E o SFX estiver ligado no SettingsManager
    if (!sound || !SettingsManager.settings.sfx) return;

    try {
        const click = sound.cloneNode(); 
        click.volume = sound.volume;
        click.play().catch(e => console.warn("Áudio bloqueado pelo navegador:", e));
    } catch (err) {
        console.error("Erro ao reproduzir som:", err);
    }
}

export const Music = {
    bgm: new Audio('assets/music/battle-theme.mp3')
};
Music.bgm.loop = true;
Music.bgm.volume = 0.3;

export function updateMusic() {
    if (SettingsManager.settings.music) {
        Music.bgm.play().catch(() => {});
    } else {
        Music.bgm.pause();
    }
}