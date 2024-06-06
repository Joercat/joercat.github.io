const words = {
    novice: ["apple", "bread", "crane", "drake", "eagle", "flute", "grape", "haste", "irate", "jokes"],
    advanced: ["animal", "battle", "candle", "daring", "effort", "figure", "gather", "humble", "insane", "jungle"],
    expert: ["abdicate", "bachelor", "calendar", "dazzling", "eclipse", "fantasy", "gallery", "harmony", "immunity", "journey"]
};

let selectedDifficulty;
let selectedWords;
let correctPassword;

document.getElementById('startButton').addEventListener('click', () => {
    selectedDifficulty = document.getElementById('difficulty').value;
    selectedWords = words[selectedDifficulty];
    correctPassword = selectedWords[Math.floor(Math.random() * selectedWords.length)];
    
    document.getElementById('wordsList').innerHTML = selectedWords.map(word => `<div class="word">${word}</div>`).join('');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('feedback').textContent = '';
});

document.getElementById('guessButton').addEventListener('click', () => {
    const guess = document.getElementById('guessInput').value.toLowerCase();
    if (!selectedWords.includes(guess)) {
        document.getElementById('feedback').textContent = "Invalid guess. Please try again.";
        return;
    }

    const likeness = calculateLikeness(guess, correctPassword);
    if (guess === correctPassword) {
        document.getElementById('feedback').textContent = `Correct! The password was "${correctPassword}". You win!`;
    } else {
        document.getElementById('feedback').textContent = `Likeness: ${likeness}`;
    }
});

function calculateLikeness(guess, correctPassword) {
    let likeness = 0;
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === correctPassword[i]) {
            likeness++;
        }
    }
    return likeness;
}
