import { playSound, SFX } from './AudioManager.js';

export const ScoreSystem = {
    save(name, score) {
        const highScores = JSON.parse(localStorage.getItem('td_highscores')) || [];
        const oldTopScore = highScores.length > 0 ? highScores[0].score : 0;
        const newEntryId = Date.now(); 

        highScores.push({ id: newEntryId, name: name || "Anônimo", score });
        highScores.sort((a, b) => b.score - a.score);
        
        localStorage.setItem('td_highscores', JSON.stringify(highScores.slice(0, 5)));
        
        if (score > oldTopScore) playSound(SFX.victory);
        return newEntryId;
    },

    getTopScores() {
        return JSON.parse(localStorage.getItem('td_highscores')) || [];
    }
};