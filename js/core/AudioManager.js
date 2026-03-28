/**
 * AUDIOMANAGER.JS - Gerencia os efeitos sonoros
 */
export const SFX = {
    shoot: new Audio('assets/sfx/shoot.mp3'),
    explosion: new Audio('assets/sfx/explosion.mp3'),
    damage: new Audio('assets/sfx/damage.mp3'),
    unlock: new Audio('assets/sfx/unlock.mp3')
};

// Ajuste de volumes iniciais
SFX.shoot.volume = 0.2;
SFX.explosion.volume = 0.4;
SFX.damage.volume = 0.6;
SFX.unlock.volume = 0.5;

/**
 * Toca um som do início, mesmo que já esteja tocando
 */
export function playSound(sound) {
    if (!sound) return;
    const click = sound.cloneNode(); // Clone permite sobrepor sons iguais
    click.volume = sound.volume;
    click.play().catch(() => {
        // Navegadores bloqueiam som sem interação prévia do usuário
        // O clique no botão "JOGAR AGORA" resolve isso.
    });
}