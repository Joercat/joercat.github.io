"use strict";
// ==========================================
// ENDLESS MODE (infinite chunk-based procedural world)
// ==========================================
function startEndlessMode() {
    document.getElementById('start-screen').classList.add('hidden');
    gameStarted = true;
    isEndlessMode = true;
    isEscapeMode = false;
    isChaosMode = false;
    startTime = Date.now();
    pausedTime = 0;
    lastPauseStart = 0;
    stamina = maxStamina = getMaxStamina();
    sessionCoins = 0;
    resetSprintState();
    endlessDoorsFound = 0;

    document.getElementById('hud-coins').textContent = '💰 0';
    document.getElementById('minimap').style.display = 'none';
    document.getElementById('minimap-floor').style.display = 'none';
    document.getElementById('escape-hud').style.display = 'none';
    document.getElementById('chaos-hud').style.display = 'none';
    document.getElementById('endless-hud').style.display = 'block';
    document.getElementById('endless-score').textContent = 'Doors: 0';
    document.getElementById('endless-door-indicator').textContent = '🚪 Explore to find doors...';

    clearScene();
    endlessChunks.clear();
    endlessChunkMeshes.clear();
    endlessLRU.length = 0;
    endlessDoorsList = [];
    endlessDecorations = [];

    currentMap = ['backrooms', 'hospital'][Math.floor(Math.random() * 2)];

    var mats = getMapMats();
    scene.background = new THREE.Color(mats.fogColor);
    scene.fog = new THREE.Fog(mats.fogColor, 2, 35);
    ensureAmbientLight();

    player.x = 2 * CELL;
    player.z = 2 * CELL;
    player.y = 1.6;
    player.yaw = 0;
    player.pitch = 0;
    player.vy = 0;
    player.onGround = true;
    resetActiveEffects();

    var shieldEl = document.getElementById('endless-shield-toggle');
    if (shieldEl && shieldEl.checked && saveData.coins >= 5) {
        saveData.coins -= 5;
        player.shieldHits = saveData.upgrades.shield >= 3 ? 2 : 1;
        document.getElementById('shield-indicator').style.opacity = '1';
        document.getElementById('slot-shield').classList.add('active');
        saveSaveData();
        updateUI();
    }

    updateEndlessChunks();
    ensurePlayerWalkable();
    spawnKanyeEndless();
    createKanye();
    createPowerups();
    createCoins();
    camera.position.set(player.x, player.y, player.z);
    initAudio();
    if (!isMobile) renderer.domElement.requestPointerLock();
}

function ensurePlayerWalkable() {
    if (isWalkableWorld(player.x, player.z, 0.35)) return;
    var cells = getEndlessWalkableCellsNear(player.x, player.z, 20);
    if (cells.length > 0) {
        cells.sort(function (a, b) {
            return Math.hypot(a.wx - player.x, a.wz - player.z) - Math.hypot(b.wx - player.x, b.wz - player.z);
        });
        player.x = cells[0].wx;
        player.z = cells[0].wz;
    }
}

function spawnKanyeEndless() {
    var cells = getEndlessWalkableCellsNear(player.x, player.z, 40);
    var farCells = cells.filter(function (c) { return Math.hypot(c.wx - player.x, c.wz - player.z) > 20; });
    var spawn = farCells.length > 0
        ? farCells[Math.floor(Math.random() * farCells.length)]
        : (cells.length > 0 ? cells[0] : null);

    if (spawn) { kanye.x = spawn.wx; kanye.z = spawn.wz; }
    else { kanye.x = player.x + 30; kanye.z = player.z + 30; }

    kanye.vx = 0;
    kanye.vz = 0;
    kanye.pathTimer = 0;
    kanye.path = [];
    kanye.frozen = false;
    kanye.halfSpeed = false;
}

function getChunkSeed(cx, cz) {
    var h = cx * 374761393 + cz * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return Math.abs(h) % 2147483646 + 1;
}

// Verifies that an open cell inside a generated chunk is connected to the chunk's main walkable area.
function chunkCellReachable(data, fromX, fromZ, toX, toZ) {
    if (!data.maze[fromX] || data.maze[fromX][fromZ] !== 0) return false;
    if (!data.maze[toX] || data.maze[toX][toZ] !== 0) return false;
    var visited = {};
    var q = [{ x: fromX, z: fromZ }];
    visited[fromX + ',' + fromZ] = true;
    var dirs = [{ dx: -1, dz: 0 }, { dx: 1, dz: 0 }, { dx: 0, dz: -1 }, { dx: 0, dz: 1 }];
    while (q.length > 0) {
        var cur = q.shift();
        if (cur.x === toX && cur.z === toZ) return true;
        for (var i = 0; i < dirs.length; i++) {
            var nx = cur.x + dirs[i].dx;
            var nz = cur.z + dirs[i].dz;
            var nk = nx + ',' + nz;
            if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) continue;
            if (visited[nk]) continue;
            if (!data.maze[nx] || data.maze[nx][nz] !== 0) continue;
            visited[nk] = true;
            q.push({ x: nx, z: nz });
        }
    }
    return false;
}

function generateEndlessChunk(cx, cz) {
    var key = cx + ',' + cz;
    if (endlessChunks.has(key)) return endlessChunks.get(key);

    var seed = getChunkSeed(cx, cz);
    var data = generateMazeData(CHUNK_SIZE, seed);

    var rng = seed;
    function sr() { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; }

    for (var i = 1; i < CHUNK_SIZE - 1; i += 2) {
        if (sr() < 0.5) {
            data.maze[i][0] = 0;
            if (i + 1 < CHUNK_SIZE - 1) data.maze[i + 1][0] = 0;
            data.maze[i][CHUNK_SIZE - 1] = 0;
            if (i + 1 < CHUNK_SIZE - 1) data.maze[i + 1][CHUNK_SIZE - 1] = 0;
        }
        if (sr() < 0.5) {
            data.maze[0][i] = 0;
            if (i + 1 < CHUNK_SIZE - 1) data.maze[0][i + 1] = 0;
            data.maze[CHUNK_SIZE - 1][i] = 0;
            if (i + 1 < CHUNK_SIZE - 1) data.maze[CHUNK_SIZE - 1][i + 1] = 0;
        }
    }

    var edges = ['top', 'bottom', 'left', 'right'];
    for (var ei = 0; ei < edges.length; ei++) {
        var edge = edges[ei];
        var openCount = 0;
        for (var ii = 1; ii < CHUNK_SIZE - 1; ii++) {
            if (edge === 'top' && data.maze[ii][0] === 0) openCount++;
            if (edge === 'bottom' && data.maze[ii][CHUNK_SIZE - 1] === 0) openCount++;
            if (edge === 'left' && data.maze[0][ii] === 0) openCount++;
            if (edge === 'right' && data.maze[CHUNK_SIZE - 1][ii] === 0) openCount++;
        }
        while (openCount < 2) {
            var mid = Math.floor(CHUNK_SIZE / 2) + Math.floor(sr() * 6) - 3;
            if (mid < 1) mid = 1;
            if (mid >= CHUNK_SIZE - 1) mid = CHUNK_SIZE - 2;

            if (edge === 'top') { data.maze[mid][0] = 0; data.maze[mid][1] = 0; }
            if (edge === 'bottom') { data.maze[mid][CHUNK_SIZE - 1] = 0; data.maze[mid][CHUNK_SIZE - 2] = 0; }
            if (edge === 'left') { data.maze[0][mid] = 0; data.maze[1][mid] = 0; }
            if (edge === 'right') { data.maze[CHUNK_SIZE - 1][mid] = 0; data.maze[CHUNK_SIZE - 2][mid] = 0; }
            openCount++;
        }
    }

    data.walkable = [];
    for (var xx = 0; xx < CHUNK_SIZE; xx++) {
        for (var zz = 0; zz < CHUNK_SIZE; zz++) {
            if (data.maze[xx][zz] === 0) data.walkable.push({ x: xx, z: zz });
        }
    }

    data.hasDoor = false;
    data.doorInfo = null;
    if (sr() < 0.05) {
        // Anchor the door to a cell connected to the center of the local walkable area.
        var centerX = Math.floor(CHUNK_SIZE / 2);
        var centerZ = Math.floor(CHUNK_SIZE / 2);
        var anchor = null;
        var anchorDist = Infinity;
        for (var aw = 0; aw < data.walkable.length; aw++) {
            var cw = data.walkable[aw];
            var cd = Math.hypot(cw.x - centerX, cw.z - centerZ);
            if (cd < anchorDist) { anchorDist = cd; anchor = cw; }
        }

        var wallCandidates = [];
        for (var xi = 2; xi < CHUNK_SIZE - 2; xi++) {
            for (var zi = 2; zi < CHUNK_SIZE - 2; zi++) {
                if (data.maze[xi][zi] === 1) {
                    var adjDirs = [{ dx: -1, dz: 0 }, { dx: 1, dz: 0 }, { dx: 0, dz: -1 }, { dx: 0, dz: 1 }];
                    for (var adi = 0; adi < adjDirs.length; adi++) {
                        var adjDir = adjDirs[adi];
                        var ax = xi + adjDir.dx, az = zi + adjDir.dz;
                        if (ax >= 0 && ax < CHUNK_SIZE && az >= 0 && az < CHUNK_SIZE && data.maze[ax][az] === 0) {
                            // Require the open side to be reachable from the anchor and approachable from 2+ sides.
                            if (anchor && !chunkCellReachable(data, anchor.x, anchor.z, ax, az)) break;
                            var openCount = 0;
                            var apDirs = [{ dx: -1, dz: 0 }, { dx: 1, dz: 0 }, { dx: 0, dz: -1 }, { dx: 0, dz: 1 }];
                            for (var ad2 = 0; ad2 < apDirs.length; ad2++) {
                                var opx = ax + apDirs[ad2].dx;
                                var opz = az + apDirs[ad2].dz;
                                if (opx >= 0 && opx < CHUNK_SIZE && opz >= 0 && opz < CHUNK_SIZE && data.maze[opx][opz] === 0) openCount++;
                            }
                            if (openCount < 2) break;
                            wallCandidates.push({ wx: xi, wz: zi, ax: ax, az: az, dir: adjDir });
                            break;
                        }
                    }
                }
            }
        }
        if (wallCandidates.length > 0) {
            data.hasDoor = true;
            data.doorInfo = wallCandidates[Math.floor(sr() * wallCandidates.length)];
        }
    }

    endlessChunks.set(key, data);

    var lruIdx = endlessLRU.indexOf(key);
    if (lruIdx >= 0) endlessLRU.splice(lruIdx, 1);
    endlessLRU.push(key);

    while (endlessLRU.length > MAX_CACHED_CHUNKS) {
        var oldKey = endlessLRU.shift();
        if (endlessChunkMeshes.has(oldKey)) { endlessLRU.push(oldKey); break; }
        endlessChunks.delete(oldKey);
    }

    return data;
}

function buildEndlessChunkMeshes(cx, cz) {
    var key = cx + ',' + cz;
    if (endlessChunkMeshes.has(key)) return;
    var chunk = endlessChunks.get(key);
    if (!chunk) return;

    var mats = getMapMats();
    var meshes = [];

    // One InstancedMesh per chunk replaces hundreds of individual wall meshes.
    var wallCount = 0;
    var wallXZ = [];
    for (var x = 0; x < CHUNK_SIZE; x++) {
        for (var z = 0; z < CHUNK_SIZE; z++) {
            if (chunk.maze[x][z] === 1) {
                wallXZ.push({ x: x, z: z });
                wallCount++;
            }
        }
    }

    if (wallCount > 0) {
        var wallInst = new THREE.InstancedMesh(getSharedBox(), mats.wallMat, wallCount);
        wallInst.instanceMatrix.setUsage(THREE.StaticDrawUsage || 0);
        var dummy = new THREE.Object3D();
        for (var wi = 0; wi < wallCount; wi++) {
            var cell = wallXZ[wi];
            var wp = endlessLocalToWorld(cell.x, cell.z, cx, cz);
            dummy.position.set(wp.x, WALL_H / 2, wp.z);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            wallInst.setMatrixAt(wi, dummy.matrix);
        }
        wallInst.instanceMatrix.needsUpdate = true;
        scene.add(wallInst);
        meshes.push(wallInst);
    }

    var offsetX = (cx * CHUNK_SIZE + CHUNK_SIZE / 2) * CELL;
    var offsetZ = (cz * CHUNK_SIZE + CHUNK_SIZE / 2) * CELL;

    var floor = new THREE.Mesh(getFloorGeo(CHUNK_SIZE * CELL), mats.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(offsetX, 0.01, offsetZ);
    scene.add(floor);
    meshes.push(floor);

    if (!mats.outdoor && mats.ceilMat) {
        var ceiling = new THREE.Mesh(getFloorGeo(CHUNK_SIZE * CELL), mats.ceilMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(offsetX, WALL_H, offsetZ);
        scene.add(ceiling);
        meshes.push(ceiling);
    }

    if (chunk.hasDoor && chunk.doorInfo) {
        var di = chunk.doorInfo;
        var doorWorldPos = endlessLocalToWorld(di.wx, di.wz, cx, cz);
        var adjWorldPos = endlessLocalToWorld(di.ax, di.az, cx, cz);

        var direction = 'north';
        if (di.dir.dx === -1) direction = 'east';
        else if (di.dir.dx === 1) direction = 'west';
        else if (di.dir.dz === -1) direction = 'south';

        var doorMesh = createDoorMesh(doorWorldPos.x, doorWorldPos.z, direction, 0xc084fc);
        scene.add(doorMesh);
        meshes.push(doorMesh);

        endlessDoorsList.push({ mesh: doorMesh, x: adjWorldPos.x, z: adjWorldPos.z, chunkKey: key, used: false });
    }

    endlessChunkMeshes.set(key, meshes);
}

function disposeMeshOnly(obj) {
    if (!obj) return;
    if (obj.isGroup) {
        obj.traverse(function (child) {
            disposeMeshOnly(child);
        });
        return;
    }
    if (obj.geometry && !(obj.geometry.userData && obj.geometry.userData.shared)) obj.geometry.dispose();
    var mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
    for (var i = 0; i < mats.length; i++) {
        var m = mats[i];
        if (m && !(m.userData && m.userData.shared)) m.dispose();
    }
}

function unloadChunkMeshes(key) {
    var meshes = endlessChunkMeshes.get(key);
    if (!meshes) return;
    for (var i = 0; i < meshes.length; i++) {
        scene.remove(meshes[i]);
        disposeMeshOnly(meshes[i]);
    }
    endlessChunkMeshes.delete(key);
    endlessDoorsList = endlessDoorsList.filter(function (d) { return d.chunkKey !== key; });
}

function updateEndlessChunks() {
    var playerChunk = endlessWorldToChunk(player.x, player.z);

    for (var dx = -endlessLoadRadius; dx <= endlessLoadRadius; dx++) {
        for (var dz = -endlessLoadRadius; dz <= endlessLoadRadius; dz++) {
            var cx = playerChunk.cx + dx;
            var cz = playerChunk.cz + dz;
            var key = cx + ',' + cz;

            if (!endlessChunks.has(key)) generateEndlessChunk(cx, cz);
            if (!endlessChunkMeshes.has(key)) buildEndlessChunkMeshes(cx, cz);

            var lruIdx = endlessLRU.indexOf(key);
            if (lruIdx >= 0) { endlessLRU.splice(lruIdx, 1); endlessLRU.push(key); }
        }
    }

    var toUnload = [];
    endlessChunkMeshes.forEach(function (meshes, key) {
        var parts = key.split(',');
        var chunkCx = parseInt(parts[0]);
        var chunkCz = parseInt(parts[1]);
        if (Math.abs(chunkCx - playerChunk.cx) > endlessUnloadRadius ||
            Math.abs(chunkCz - playerChunk.cz) > endlessUnloadRadius) {
            toUnload.push(key);
        }
    });
    for (var ui = 0; ui < toUnload.length; ui++) unloadChunkMeshes(toUnload[ui]);
}

function checkEndlessDoors() {
    var nearestDist = Infinity;

    for (var i = 0; i < endlessDoorsList.length; i++) {
        var door = endlessDoorsList[i];
        if (door.used) continue;

        var dist = Math.hypot(door.x - player.x, door.z - player.z);
        if (dist < nearestDist) nearestDist = dist;

        if (dist < 2.5) {
            door.used = true;
            endlessDoorsFound++;
            sessionCoins += 3;
            document.getElementById('hud-coins').textContent = '💰 ' + sessionCoins;

            if (endlessDoorsFound > (saveData.endlessRecord || 0)) {
                saveData.endlessRecord = endlessDoorsFound;
                saveSaveData();
            }

            document.getElementById('endless-score').textContent = 'Doors: ' + endlessDoorsFound;

            var msg = document.getElementById('pickup-msg');
            msg.textContent = '🚪 DOOR ' + endlessDoorsFound + '! +3💰';
            msg.style.opacity = '1';
            setTimeout(function () { msg.style.opacity = '0'; }, 2000);

            if (door.mesh) scene.remove(door.mesh);
        }
    }

    var indicator = document.getElementById('endless-door-indicator');
    if (nearestDist < 15) {
        indicator.textContent = '🚪 DOOR NEARBY!';
        indicator.classList.add('nearby');
    } else if (nearestDist < 40) {
        indicator.textContent = '🚪 Door in range...';
        indicator.classList.remove('nearby');
    } else {
        indicator.textContent = '🚪 Explore to find doors...';
        indicator.classList.remove('nearby');
    }
}
