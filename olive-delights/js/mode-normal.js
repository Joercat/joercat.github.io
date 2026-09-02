"use strict";
// ==========================================
// NORMAL ("PLAY") MODE
// ==========================================
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    gameStarted = true;
    isEscapeMode = false;
    isEndlessMode = false;
    isChaosMode = false;
    startTime = Date.now();
    pausedTime = 0;
    lastPauseStart = 0;
    stamina = maxStamina = getMaxStamina();
    sessionCoins = 0;
    resetSprintState();

    document.getElementById('hud-coins').textContent = '💰 0';
    currentMap = resolveSelectedMap();
    GRID_SIZE = getMapSize();

    if (saveData.settings.minimapEnabled !== false) {
        document.getElementById('minimap').style.display = 'block';
        document.getElementById('minimap-floor').style.display = 'block';
    }
    document.getElementById('escape-hud').style.display = 'none';
    document.getElementById('endless-hud').style.display = 'none';
    document.getElementById('chaos-hud').style.display = 'none';

    clearScene();
    generateMaze();
    buildWorld();
    createKanye();
    spawnEntities();
    initAudio();
    if (!isMobile) renderer.domElement.requestPointerLock();
}
