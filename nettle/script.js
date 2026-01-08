let allLinks = [];

// 1. Load the sitemap
fetch('sitemap.txt')
    .then(res => res.text())
    .then(data => {
        [span_1](start_span)// Convert the text file into an array of URLs[span_1](end_span)
        allLinks = data.split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('http'));
        
        displayGames(allLinks);
    });

// 2. Display the Games
function displayGames(links) {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';

    links.forEach(url => {
        [span_2](start_span)const code = url.split('/').pop(); // Extracts 'm20kkepx' from the URL[span_2](end_span)
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<strong>${code}</strong>`;
        
        card.onclick = () => launchGame(url, code);
        grid.appendChild(card);
    });
}

// 3. Implement Search
document.getElementById('gameSearch').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allLinks.filter(url => url.toLowerCase().includes(term));
    displayGames(filtered);
};

// 4. "Unblock" Launch Function
function launchGame(url, title) {
    document.getElementById('main-ui').classList.add('hidden');
    document.getElementById('player-layer').classList.remove('hidden');
    document.getElementById('active-title').innerText = title;
    document.getElementById('game-frame').src = url;
}

function closeGame() {
    document.getElementById('main-ui').classList.remove('hidden');
    document.getElementById('player-layer').classList.add('hidden');
    document.getElementById('game-frame').src = '';
}

