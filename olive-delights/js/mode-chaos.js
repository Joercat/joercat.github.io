"use strict";
// ==========================================
// CHAOS MODE (3 nextbots at once)
// ==========================================
function pickChaosSkins() {
    var owned = saveData.ownedSkins.slice();
    var selected = saveData.selectedSkin;
    var result = [selected];

    var others = owned.filter(function (s) { return s !== selected; });
    others.sort(function () { return Math.random() - 0.5; });

    if (owned.length <= 1) {
        result = [selected, selected, selected];
    } else if (owned.length === 2) {
        var useOther = Math.random() < 0.5 ? 2 : 1;
        for (var i = 0; i < 2; i++) {
            if (useOther > 0 && others.length > 0) { result.push(others[0]); useOther--; }
            else result.push(selected);
        }
    } else {
        result.push(others[0] || selected);
        result.push(others[1] || others[0] || selected);
    }
    return result;
}

function startChaosMode() {
    document.getElementById('start-screen').classList.add('hidden');
    gameStarted = true;
    isChaosMode = true;
    isEscapeMode = false;
    isEndlessMode = false;
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
    document.getElementById('escape-hud').style.display = 'none';
    document.getElementById('endless-hud').style.display = 'none';
    document.getElementById('chaos-hud').style.display = 'block';

    clearScene();
    generateMaze();
    buildWorld();

    if (walkableCells.length < 10) return;

    var pIdx = Math.floor(Math.random() * walkableCells.length);
    var pPos = gridToWorld(walkableCells[pIdx].x, walkableCells[pIdx].z);
    player.x = pPos.x;
    player.z = pPos.z;
    player.y = 1.6;
    player.yaw = 0;
    player.pitch = 0;
    player.vy = 0;
    player.onGround = true;
    resetActiveEffects();

    var shieldEl = document.getElementById('chaos-shield-toggle');
    if (shieldEl && shieldEl.checked && saveData.coins >= 5) {
        saveData.coins -= 5;
        player.shieldHits = saveData.upgrades.shield >= 3 ? 2 : 1;
        document.getElementById('shield-indicator').style.opacity = '1';
        document.getElementById('slot-shield').classList.add('active');
        saveSaveData();
        updateUI();
    }

    var skins = pickChaosSkins();
    chaosNextbots = [];
    var usedPositions = [{ x: player.x, z: player.z }];

    for (var i = 0; i < 3; i++) {
        var nb = {
            x: 0, z: 0, y: 1.25, vx: 0, vz: 0, sprite: null,
            pathTimer: Math.random() * 0.3, path: [], pathIndex: 0,
            frozen: false, frozenTimer: 0, halfSpeed: false, halfSpeedTimer: 0,
            usesVideo: false, usesCustomAudio: false, skinId: skins[i]
        };

        var validSpawns = walkableCells.filter(function (c) {
            var p = gridToWorld(c.x, c.z);
            var farEnough = true;
            for (var ui = 0; ui < usedPositions.length; ui++) {
                if (Math.hypot(p.x - usedPositions[ui].x, p.z - usedPositions[ui].z) < 15) { farEnough = false; break; }
            }
            return farEnough;
        }).sort(function () { return Math.random() - 0.5; });

        var kCell = validSpawns[0] || walkableCells[Math.floor(Math.random() * walkableCells.length)];
        var kPos = gridToWorld(kCell.x, kCell.z);
        nb.x = kPos.x;
        nb.z = kPos.z;
        usedPositions.push({ x: nb.x, z: nb.z });
        chaosNextbots.push(nb);

        (function (nbRef, skinId) {
            createSpriteFromSkin(skinId, function (sprite, isVideo) {
                nbRef.sprite = sprite;
                nbRef.usesVideo = isVideo;
                scene.add(nbRef.sprite);
                nbRef.sprite.position.set(nbRef.x, 1.25, nbRef.z);
            });
        })(nb, skins[i]);
    }

    var skinNames = skins.map(function (id) {
        var s = SKINS.find(function (x) { return x.id === id; });
        return s ? s.name : id;
    });
    document.getElementById('chaos-chasers').textContent = skinNames.join(' | ');

    camera.position.set(player.x, player.y, player.z);
    createPowerups();
    createCoins();
    initAudio();
    if (!isMobile) renderer.domElement.requestPointerLock();
}

function updateChaosNextbots(dt) {
    var closestDist = Infinity;
    var anyLineOfSight = false;

    for (var i = 0; i < chaosNextbots.length; i++) {
        var nb = chaosNextbots[i];
        var distToPlayer = updateSingleNextbot(nb, dt);
        if (distToPlayer === undefined) continue;

        if (distToPlayer < closestDist) closestDist = distToPlayer;
        if (hasClearLineOfSight(nb.x, nb.z, player.x, player.z)) anyLineOfSight = true;

        if (distToPlayer < 1.2) {
            if (handleNextbotCatch(nb)) { killPlayer(); return; }
        }
    }

    var audioRange = 70;
    var vol = closestDist < audioRange ? Math.pow(1 - (closestDist / audioRange), 0.5) : 0;
    setAudioVolume(vol);

    var fear = document.getElementById('fear-overlay');
    var warn = document.getElementById('warning');
    updateCloseDanger(fear, warn, closestDist, anyLineOfSight);
}
