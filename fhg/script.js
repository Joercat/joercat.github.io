const noviceWords = ['apple', 'grape', 'table', 'chair', 'piano', 'truck', 'stone', 'plant', 'drink', 'fruit'];
const advancedWords = ['android', 'battery', 'charger', 'digital', 'emerald', 'gallery', 'harvest', 'imagine', 'justice', 'kingdom'];
const expertWords = ['adventure', 'backwards', 'challenge', 'discovery', 'elephants', 'fantastic', 'generator', 'happening', 'important', 'juggling'];

let selectedWords = [];
let correctPassword = '';
let attempts = 4;

function startGame() {
    const difficulty = document.getElementById("difficulty").value;
    attempts = 4;
    document.getElementById("attempts").innerText = attempts;
    document.getElementById("result").innerText = '';

    switch (difficulty) {
        case "novice":
            selectedWords = [...noviceWords];
            break;
        case "advanced":
            selectedWords = [...advancedWords];
            break;
        case "expert":
            selectedWords = [...expertWords];
            break;
    }

    correctPassword = selectedWords[Math.floor(Math.random() * selectedWords.length)];

    const wordsList = document.getElementById("words");
    wordsList.innerHTML = '';
    selectedWords.forEach(word => {
        const li = document.createElement("li");
        li.innerText = word;
        wordsList.appendChild(li);
    });

    document.getElementById("game").classList.remove("hidden");
}

function makeGuess() {
    const guess = document.getElementById("guessInput").value;

    if (selectedWords.includes(guess)) {
        if (guess === correctPassword) {
            document.getElementById("result").innerText = "Congratulations! You've guessed the correct password!";
        } else {
            attempts--;
            document.getElementById("attempts").innerText = attempts;
            document.getElementById("result").innerText = `Incorrect password. ${attempts} attempts left.`;
            if (attempts === 0) {
                document.getElementById("result").innerText = "No attempts left. Refresh the page to try again.";
                document.getElementById("guessInput").disabled = true;
            }
        }
    } else {
        document.getElementById("result").innerText = "Invalid guess. Please enter a valid word from the list.";
    }

    document.getElementById("guessInput").value = '';
}

