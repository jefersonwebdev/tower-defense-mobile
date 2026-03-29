// SettingsManager.js
const SETTINGS_KEY = 'megaTD_settings';

export const SettingsManager = {
    settings: {
        sfx: true,
        music: true,
        language: 'pt-br'
    },

    init() {
        this.load();
        this.applyToUI();
        this.setupListeners();
    },

    load() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    },

    save() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    },

    // Vincula os IDs do HTML aos valores do objeto
    setupListeners() {
        const checkSfx = document.getElementById('check-sfx');
        const checkMusic = document.getElementById('check-music');
        const btnReset = document.getElementById('btn-reset-storage');

        if (checkSfx) {
            checkSfx.onchange = (e) => {
                this.settings.sfx = e.target.checked;
                this.save();
            };
        }

        if (checkMusic) {
            checkMusic.onchange = (e) => {
                this.settings.music = e.target.checked;
                this.save();
                // Aqui você poderia disparar um evento para pausar/tocar a música globalmente
            };
        }

        if (btnReset) {
            btnReset.onclick = () => {
                if (confirm("Deseja apagar todos os dados do jogo?")) {
                    localStorage.clear();
                    location.reload();
                }
            };
        }
    },

    applyToUI() {
        const checkSfx = document.getElementById('check-sfx');
        const checkMusic = document.getElementById('check-music');
        
        if (checkSfx) checkSfx.checked = this.settings.sfx;
        if (checkMusic) checkMusic.checked = this.settings.music;
    }
};