 // novice Words = ['apple', 'grape', 'table', 'chair', 'piano', 'truck', 'stone', 'plant', 'drink', 'fruit'];
 advanced Words = ['android', 'battery', 'charger', 'digital', 'emerald', 'gallery', 'harvest', 'imagine', 'justice', 'kingdom'];
expert Words = ['adventure', 'backwards', 'challenge', 'discovery', 'elephants', 'fantastic', 'generator', 'happening', 'important', 'juggling'];

const wordLists = {
    novice: ['apple', 'bread', 'crane', 'drive', 'eagle'],
    advanced: ['awkward', 'bananas', 'college', 'diamond', 'elastic'],
    expert: ['attention', 'ballistic', 'character', 'dominate', 'elephant']
};

let selectedDifficulty = null;
let selectedWord = '';
let guessesRemaining = 4;
let gameActive = true;

const difficultyButtons = document.querySelectorAll('.difficulty-button');
const wordListContainer = document.getElementById('word-list-container');
const guessesRemainingElement = document.getElementById('guesses-remaining');
const guessBar = document.getElementById('guess-bar');
const messageElement = document.getElementById('message');

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!gameActive) return;
        selectedDifficulty = button.getAttribute('data-difficulty');
        startGame(selectedDifficulty);
        button.disabled = true;
    });
});

function startGame(difficulty) {
    const words = wordLists[difficulty];
    selectedWord = words[Math.floor(Math.random() * words.length)];
    wordListContainer.innerHTML = '';
    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.textContent = word;
        wordElement.addEventListener('mouseover', () => {
            if (gameActive) {
                wordElement.style.backgroundColor = 'green';
            }
        });
        wordElement.addEventListener('mouseout', () => {
            if (gameActive) {
                wordElement.style.backgroundColor = '#444';
            }
        });
        wordElement.addEventListener('click', () => {
            if (gameActive) {
                makeGuess(word);
            }
        });
        wordListContainer.appendChild(wordElement);
    });
}

function makeGuess(word) {
    guessBar.textContent = `Your Guess: ${word}`;
    if (word === selectedWord) {
        messageElement.textContent = 'Congratulations! You guessed the correct password!';
        endGame();
    } else {
        guessesRemaining--;
        guessesRemainingElement.textContent = guessesRemaining;
        if (guessesRemaining === 0) {
            messageElement.textContent = `Game Over! The correct password was: ${selectedWord}`;
            endGame();
        } else {
            messageElement.textContent = `Incorrect! Try again.`;
        }
    }
}

function endGame() {
    gameActive = false;
    document.querySelectorAll('.word').forEach(word => {
        word.style.pointerEvents = 'none';
    });
}

