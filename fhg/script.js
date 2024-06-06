const words = {
    novice: ['apple', 'grape', 'table', 'chair', 'piano', 'truck', 'stone', 'plant', 'drink', 'fruit'],
    advanced: ['android', 'battery', 'charger', 'digital', 'emerald', 'gallery', 'harvest', 'imagine', 'justice', 'kingdom'],
    expert: ['adventure', 'backwards', 'challenge', 'discovery', 'elephants', 'fantastic', 'generator', 'happening', 'important', 'juggling']
};

let secretWord = '';
let level = '';

function startGame(difficulty) {
    level = difficulty;
    const wordList = words[level];
    secretWord = wordList[Math.floor(Math.random() * wordList.length)];

    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('wordList').innerHTML = wordList.join(', ');
    document.getElementById('feedback').innerHTML = '';
}

function makeGuess() {
    const guess = document.getElementById('guessInput').value.toLowerCase();
    if (guess.length !== secretWord.length) {
        document.getElementById('feedback').innerHTML = 'Invalid guess length.';
        return;
    }

    let matchCount = 0;
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secretWord[i]) {
            matchCount++;
        }
    }

    if (guess === secretWord) {
        document.getElementById('feedback').innerHTML = 'Congratulations! You guessed the password!';
    } else {
        document.getElementById('feedback').innerHTML = `Incorrect guess. Matching letters: ${matchCount}`;
    }
}
