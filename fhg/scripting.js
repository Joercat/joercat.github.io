const wordsList = {
    novice: ["APPLE", "BREAD", "CRANE", "DRINK", "EARTH"],
    advanced: ["ANTIDOTE", "BULLETIN", "CAPTIVATE", "DUPLICATE", "ELEPHANT", "FALCONRY", "GROUNDED"],
    expert: ["APPROPRIATE", "CIRCUMSTANCE", "DETERMINATION", "EXTRAORDINARY", "FORMIDABLE", "GUARANTEED", "HYDROGENATE", "INCREDIBLY", "JURISDICTION"]
};

let currentWords = [];
let correctWord = "";
let attemptsLeft = 3;

function startGame() {
    const difficulty = document.getElementById("difficulty-select").value;
    currentWords = wordsList[difficulty];
    correctWord = currentWords[Math.floor(Math.random(), currentWords.length)];

    document.getElementById("words").innerHTML = currentWords.map(word => `<span onclick="makeGuess('${word}')">${word}</span>`).join("");
    document.getElementById("words").classList.remove("hidden");
    document.getElementById("guess-bar").classList.remove("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("attempts-left").innerText = attemptsLeft;
    document.getElementById("current-guess").innerText = "";
}

function makeGuess(word) {
    document.getElementById("current-guess").innerText = word;
    if (word === correctWord) {
        document.getElementById("feedback").innerText = "Correct! You hacked the terminal!";
        document.getElementById("feedback").classList.remove("hidden");
    } else {
        attemptsLeft--;
        document.getElementById("attempts-left").innerText = attemptsLeft;
        if (attemptsLeft === 0) {
            document.getElementById("feedback").innerText = "You've been locked out of the terminal!";
            document.getElementById("feedback").classList.remove("hidden");
            disableGame();
        } else {
            document.getElementById("feedback").innerText = `Incorrect. ${word.length - correctWord.length} letters correct.`;
            document.getElementById("feedback").classList.remove("hidden");
        }
    }
}

function disableGame() {
    const wordElements = document.querySelectorAll("#words span");
    wordElements.forEach(element => {
        element.onclick = null;
    });
}
