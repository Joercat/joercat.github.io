"use strict";
// ==========================================
// ESCAPE MODE (2 verified reachable doors per round)
// ==========================================
function startEscapeMode() {
    document.getElementById('start-screen').classList.add('hidden');
    gameStarted = true;
    isEscapeMode = true;
    isEndlessMode = false;
    isChaosMode = false;
    escapeRound = 1;
    startTime = Date.now();
    pausedTime = 0;
    lastPauseStart = 0;
    stamina = maxStamina = getMaxStamina();
    sessionCoins = 0;
    resetSprintState();

    document.getElementById('hud-coins').textContent = '💰 0';
    currentMap = resolveSelectedMap();
    GRID_SIZE = getMapSize();

    document.getElementById('minimap').style.display = 'none';
    document.getElementById('minimap-floor').style.display = 'none';
    document.getElementById('escape-hud').style.display = 'block';
    document.getElementById('endless-hud').style.display = 'none';
    document.getElementById('chaos-hud').style.display = 'none';
    document.getElementById('escape-round').textContent = 'Round: ' + escapeRound;
    document.getElementById('escape-door-indicator').textContent = '🚪 FIND AN EXIT!';
    document.getElementById('escape-door-indicator').classList.remove('nearby');

    clearScene();
    generateMaze();
    buildWorld();
    createKanye();
    spawnEntities();
    createEscapeDoors();
    initAudio();
    if (!isMobile) renderer.domElement.requestPointerLock();
}

function createEscapeDoors() {
    for (var di = 0; di < escapeDoors.length; di++) {
        if (escapeDoors[di].mesh) scene.remove(escapeDoors[di].mesh);
    }
    escapeDoors = [];

    var pGrid = worldToGrid(player.x, player.z);
    var pSnap = findNearestPathWalkableGrid(pGrid.x, pGrid.z, 3);
    var candidates = [];

    for (var x = 2; x < GRID_SIZE - 2; x++) {
        for (var z = 2; z < GRID_SIZE - 2; z++) {
            if (maze[x][z] === 1) {
                var adjacentDirs = [
                    { wx: x - 1, wz: z, dir: 'east' },
                    { wx: x + 1, wz: z, dir: 'west' },
                    { wx: x, wz: z - 1, dir: 'south' },
                    { wx: x, wz: z + 1, dir: 'north' }
                ];
                for (var ai = 0; ai < adjacentDirs.length; ai++) {
                    var adj = adjacentDirs[ai];
                    if (adj.wx >= 0 && adj.wx < GRID_SIZE && adj.wz >= 0 && adj.wz < GRID_SIZE &&
                        isPathWalkableGrid(adj.wx, adj.wz)) {

                        // Require an accessible approach from at least two sides so the
                        // door is never placed against an only-tangent wall corner.
                        var openSides = 0;
                        var approach = [
                            { dx: -1, dz: 0 }, { dx: 1, dz: 0 },
                            { dx: 0, dz: -1 }, { dx: 0, dz: 1 }
                        ];
                        for (var ap = 0; ap < approach.length; ap++) {
                            if (isPathWalkableGrid(adj.wx + approach[ap].dx, adj.wz + approach[ap].dz)) openSides++;
                        }
                        if (openSides < 2) continue;

                        var doorPos = gridToWorld(x, z);
                        if (Math.hypot(doorPos.x - player.x, doorPos.z - player.z) < 25) continue;

                        var path = findPath(pSnap.x, pSnap.z, adj.wx, adj.wz, 9000);
                        if (path.length > 0) {
                            candidates.push({ x: x, z: z, adjX: adj.wx, adjZ: adj.wz, dir: adj.dir, pathLen: path.length });
                        }
                    }
                }
            }
        }
    }

    if (candidates.length < 2) {
        console.warn('Not enough door candidates found:', candidates.length);
        if (candidates.length < 1) return;
    }

    candidates.sort(function () { return Math.random() - 0.5; });

    var door1 = candidates[0];
    var d1Pos = gridToWorld(door1.x, door1.z);
    var door2 = null;

    for (var i = 1; i < candidates.length; i++) {
        var d2Pos = gridToWorld(candidates[i].x, candidates[i].z);
        if (Math.hypot(d2Pos.x - d1Pos.x, d2Pos.z - d1Pos.z) > 30) { door2 = candidates[i]; break; }
    }

    if (!door2) {
        for (var j = 1; j < candidates.length; j++) {
            var d2Pos2 = gridToWorld(candidates[j].x, candidates[j].z);
            if (Math.hypot(d2Pos2.x - d1Pos.x, d2Pos2.z - d1Pos.z) > 15) { door2 = candidates[j]; break; }
        }
    }

    if (!door2 && candidates.length >= 2) door2 = candidates[1];
    if (!door2) return;

    var doorsToCreate = [door1, door2];
    for (var di2 = 0; di2 < doorsToCreate.length; di2++) {
        var dd = doorsToCreate[di2];
        var wallWorldPos = gridToWorld(dd.x, dd.z);
        var adjWorldPos = gridToWorld(dd.adjX, dd.adjZ);
        // Place the door mesh at the face midpoint between the wall cell and its open neighbour
        // so it sits flush with the wall surface rather than floating in the centre of the cell.
        var faceX = (wallWorldPos.x + adjWorldPos.x) / 2;
        var faceZ = (wallWorldPos.z + adjWorldPos.z) / 2;
        var mesh = createDoorMesh(faceX, faceZ, dd.dir, 0x44ff44, true);
        scene.add(mesh);
        escapeDoors.push({ mesh: mesh, x: adjWorldPos.x, z: adjWorldPos.z, gridX: dd.x, gridZ: dd.z });
    }
}

function checkEscapeDoors() {
    if (!isEscapeMode) return;

    var nearestDist = Infinity;
    for (var i = 0; i < escapeDoors.length; i++) {
        var door = escapeDoors[i];
        var doorWorldPos = gridToWorld(door.gridX, door.gridZ);
        var dist = Math.hypot(doorWorldPos.x - player.x, doorWorldPos.z - player.z);
        if (dist < nearestDist) nearestDist = dist;
        if (dist < 2.5) { winEscapeRound(); return; }
    }

    var indicator = document.getElementById('escape-door-indicator');
    if (nearestDist < 15) {
        indicator.textContent = '🚪 EXIT NEARBY!';
        indicator.classList.add('nearby');
    } else {
        indicator.textContent = '🚪 FIND AN EXIT!';
        indicator.classList.remove('nearby');
    }
}

function winEscapeRound() {
    escapeRound++;
    sessionCoins += 3;
    document.getElementById('hud-coins').textContent = '💰 ' + sessionCoins;

    if (escapeRound - 1 > saveData.escapeRecord) {
        saveData.escapeRecord = escapeRound - 1;
        saveSaveData();
    }

    var msg = document.getElementById('pickup-msg');
    msg.textContent = '🚪 ESCAPED! +3💰 Round ' + escapeRound;
    msg.style.opacity = '1';
    setTimeout(function () { msg.style.opacity = '0'; }, 2000);

    document.getElementById('escape-round').textContent = 'Round: ' + escapeRound;

    // Reset so the audio/video for the new round starts from the beginning.
    initAudio();
    clearScene();
    currentMap = resolveSelectedMap();
    GRID_SIZE = getMapSize();
    generateMaze();
    buildWorld();
    createKanye();
    spawnEntities();
    createEscapeDoors();
}
