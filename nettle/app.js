let gameDatabase = [];

// 1. Fetch and Parse your sitemap.txt
fetch('sitemap.txt')
    .then(response => response.text())
    .then(data => {
        // Splitting text file by line and filtering valid URLs
        gameDatabase = data.split('\n').filter(link => link.includes('nettleweb.com/'));
        renderGames(gameDatabase);
    });

// 2. Search Functionality
document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = gameDatabase.filter(link => link.toLowerCase().includes(query));
    renderGames(filtered);
});

// 3. Render Game Cards to the Main Page
function renderGames(links) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; // Clear previous results

    links.forEach(url => {
        const code = url.split('/').pop(); // Gets the unique code like 'm20kkepx'
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div>Game</div><span>${code}</span>`;
        
        // Use the Stealth Unblocker on click
        card.onclick = () => stealthLaunch(url);
        grid.appendChild(card);
    });
}

// 4. The "Actual" Unblocking Method (Tab Cloaking)
function stealthLaunch(url) {
    const win = window.open();
    win.document.body.style.margin = '0';
    win.document.body.style.height = '100vh';
    
    // Create the unblocked element
    const iframe = win.document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = url;
    
    win.document.body.appendChild(iframe);
}
