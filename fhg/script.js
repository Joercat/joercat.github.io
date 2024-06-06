const words = ["ARRAY", "BRAIN", "CRANE", "DRAIN", "EAGER", "FABLE"];
const correctPassword = words[Math.floor(Math.random(), words.length)];
const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const feedback = document.getElementById('feedback');
const wordsList = document.getElementById('wordsList');

// Display the list of words
words.forEach(word => {
    const wordElement = document.createElement('div');
    wordElement.textContent = word;
    wordsList.appendChild(wordElement);
});

function getMatchCount(guess, correct) {
    let count = 0;
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === correct[i]) {
            count++;
        }
    }
    return count;
}

guessButton.addEventListener('click', () => {
    const guess = guessInput.value.toUpperCase();
    if (!words.includes(guess)) {
        feedback.textContent = "Invalid guess. Please choose a word from the list.";
        return;
    }
    
    if (guess === correctPassword) {
        feedback.textContent = `Congratulations! You guessed the correct password: ${correctPassword}`;
    } else {
        const matchCount = getMatchCount(guess, correctPassword);
        feedback.textContent = `Incorrect! You have ${matchCount} correct letters.`;
    }
    
    guessInput.value = '';
});
