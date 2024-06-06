const wordLists = {
    novice: ["apple", "bread", "candy", "delta", "earth"],
    advanced: ["journey", "kitchen", "landing", "machine", "network"],
    expert: ["adventure", "bandwidth", "commander", "dynamical", "evolution"]
};

let chosenDifficulty = null;
let selectedWord = "";
let guessesLeft = 4;

function chooseDifficulty(level) {
    chosenDifficulty = level;
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    displayWords();
}

function displayWords() {
    const wordList = wordLists[chosenDifficulty];
    const wordListElement = document.getElementById('word-list');
    wordListElement.innerHTML = '';
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    wordList.forEach(word => {
        const wordElement = document.createElement('span');
        wordElement.textContent = word;
        wordElement.onmouseover = () => {
            wordElement.style.backgroundColor = 'green';
        };
        wordElement.onmouseout = () => {
            wordElement.style.backgroundColor = '';
        };
        wordElement.onclick = () => {
            document.getElementById('guess-input').value = word;
        };
        wordListElement.appendChild(wordElement);
    });
}

function submitGuess() {
    const guess = document.getElementById('guess-input').value;
    if (!guess) {
        alert('Please select a word to guess.');
        return;
    }
    guessesLeft--;
    document.getElementById('guesses-left').textContent = guessesLeft;
    if (guess === selectedWord) {
        document.getElementById('result-message').textContent = 'Congratulations! You guessed the password!';
        endGame();
    } else if (guessesLeft === 0) {
        document.getElementById('result-message').textContent = 'No more guesses left! You failed to guess the password.';
        endGame();
    } else {
        document.getElementById('result-message').textContent = `Incorrect! ${guessesLeft} guesses left.`;
    }
}

function endGame() {
    document.getElementById('guess-input').value = '';
    document.getElementById('guess-input').setAttribute('readonly', true);
    document.getElementById('submit-guess').disabled = true;
    document.querySelectorAll('#word-list span').forEach(span => {
        span.style.pointerEvents = 'none';
    });
}
