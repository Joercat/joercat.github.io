/* ============================================
   PLAYER SYSTEM — FPS Controller, Flashlight,
   Sensor, Head Bob, Breathing, Fear Meter
   ============================================ */

const PlayerSystem = (() => {
    let app = null;
    let playerEntity = null;
    let cameraEntity = null;
    let flashlightEntity = null;
    let flashlightOn = true;
    let sensorActive = false;

    // State
    let yaw = 0, pitch = 0;
    let battery = 100;
    let fearLevel = 0;
    let shardsFound = 0;
    let hasFuse = false;
    let fuseInserted = false;
    let blackoutActive = false;
    let blackoutTimer = 30;
    let gameWon = false;
    let dead = false;

    // Head bob
    let headBobTimer = 0;
    let headBobAmount = 0;
    let isMoving = false;
    let isSprinting = false;

    // Breathing sway
    let breathTimer = 0;

    // Footstep timer
    let footstepTimer = 0;
    const FOOTSTEP_INTERVAL = 0.45;
    const SPRINT_FOOTSTEP_INTERVAL = 0.3;

    // Movement
    const MOVE_SPEED = 4.0;
    const SPRINT_MULTIPLIER = 1.6;
    const PLAYER_HEIGHT = 1.7;
    const PLAYER_RADIUS = 0.35;

    // Flashlight
    const BATTERY_DRAIN = 2.5; // per second
    const BATTERY_RECHARGE = 0;

    // Fear
    const FEAR_DECAY = 1.5; // per second when safe
    const FEAR_STALKER_RATE = 15; // per second when near stalker
    const FEAR_DARK_RATE = 3; // per second in dark

    // Previous flashlight/sensor toggle state
    let prevFlashlightKey = false;
    let prevSensorKey = false;

    function init(appRef) {
        app = appRef;

        // Player entity with rigidbody
        playerEntity = new pc.Entity('Player');
        playerEntity.addComponent('rigidbody', {
            type: 'dynamic',
            mass: 80,
            linearDamping: 0.95,
            angularDamping: 1,
            linearFactor: new pc.Vec3(1, 1, 1),
            angularFactor: new pc.Vec3(0, 0, 0), // prevent toppling
            friction: 0.5,
            restitution: 0
        });
        playerEntity.addComponent('collision', {
            type: 'capsule',
            radius: PLAYER_RADIUS,
            height: PLAYER_HEIGHT
        });

        // CCD for tunneling prevention
        if (playerEntity.rigidbody) {
            playerEntity.rigidbody.ccdMotionThreshold = 0.1;
            playerEntity.rigidbody.ccdSweptSphereRadius = PLAYER_RADIUS * 0.8;
        }

        playerEntity.setPosition(0, PLAYER_HEIGHT / 2 + 0.1, 3);
        app.root.addChild(playerEntity);

        // Camera
        cameraEntity = new pc.Entity('Camera');
        cameraEntity.addComponent('camera', {
            clearColor: new pc.Color(0.01, 0.01, 0.02),
            fov: 70,
            nearClip: 0.1,
            farClip: 100
        });
        cameraEntity.setLocalPosition(0, PLAYER_HEIGHT / 2 - 0.1, 0);
        playerEntity.addChild(cameraEntity);

        // Flashlight (spot light on camera)
        flashlightEntity = new pc.Entity('Flashlight');
        flashlightEntity.addComponent('light', {
            type: 'spot',
            color: new pc.Color(0.95, 0.9, 0.7),
            intensity: 2.0,
            range: 20,
            innerConeAngle: 15,
            outerConeAngle: 35,
            castShadows: true,
            shadowResolution: 1024,
            shadowBias: 0.05,
            normalOffsetBias: 0.03,
            falloffMode: pc.LIGHTFALLOFF_INVERSESQUARED
        });
        flashlightEntity.setLocalPosition(0.2, -0.1, 0);
        flashlightEntity.setLocalEulerAngles(0, 0, 0);
        cameraEntity.addChild(flashlightEntity);

        // Create VHS post-process layer (handled in main.js)
    }

    function reset() {
        yaw = 0; pitch = 0;
        battery = 100;
        fearLevel = 0;
        shardsFound = 0;
        hasFuse = false;
        fuseInserted = false;
        blackoutActive = false;
        blackoutTimer = 30;
        gameWon = false;
        dead = false;
        flashlightOn = true;
        sensorActive = false;
        headBobTimer = 0;
        footstepTimer = 0;
        breathTimer = 0;

        if (playerEntity) {
            playerEntity.setPosition(0, PLAYER_HEIGHT / 2 + 0.1, 3);
            if (playerEntity.rigidbody) {
                playerEntity.rigidbody.linearVelocity = pc.Vec3.ZERO;
                playerEntity.rigidbody.angularVelocity = pc.Vec3.ZERO;
                playerEntity.rigidbody.teleport(0, PLAYER_HEIGHT / 2 + 0.1, 3);
            }
        }
        if (flashlightEntity && flashlightEntity.light) {
            flashlightEntity.light.intensity = 2.0;
            flashlightEntity.enabled = true;
        }
        updateHUD();
    }

    function update(dt, stalkerPos) {
        if (dead || gameWon || !playerEntity) return;

        // Mouse look
        const mouse = InputSystem.consumeMouse();
        yaw -= mouse.dx;
        pitch -= mouse.dy;
        pitch = pc.math.clamp(pitch, -89, 89);

        // Apply rotation via rigidbody teleport (keep position, change orientation)
        const pos = playerEntity.getPosition();
        playerEntity.setEulerAngles(0, yaw, 0);
        cameraEntity.setLocalEulerAngles(pitch, 0, 0);

        // Movement
        isMoving = false;
        isSprinting = false;
        const forward = new pc.Vec3();
        const right = new pc.Vec3();
        cameraEntity.getWorldTransform().getZ(forward);
        cameraEntity.getWorldTransform().getX(right);
        forward.y = 0; forward.normalize();
        right.y = 0; right.normalize();
        forward.mulScalar(-1); // camera looks along -Z

        const moveDir = new pc.Vec3(0, 0, 0);
        if (InputSystem.isAction('forward')) { moveDir.add(forward); isMoving = true; }
        if (InputSystem.isAction('backward')) { moveDir.sub(forward); isMoving = true; }
        if (InputSystem.isAction('left')) { moveDir.sub(right); isMoving = true; }
        if (InputSystem.isAction('right')) { moveDir.add(right); isMoving = true; }

        if (isMoving) {
            moveDir.normalize();
            let speed = MOVE_SPEED;
            if (InputSystem.isAction('sprint')) {
                speed *= SPRINT_MULTIPLIER;
                isSprinting = true;
            }

            // Apply velocity via rigidbody
            if (playerEntity.rigidbody) {
                const vel = playerEntity.rigidbody.linearVelocity;
                const targetVel = new pc.Vec3(moveDir.x * speed, vel.y, moveDir.z * speed);
                playerEntity.rigidbody.linearVelocity = targetVel;
            }
        } else {
            // Dampen horizontal velocity
            if (playerEntity.rigidbody) {
                const vel = playerEntity.rigidbody.linearVelocity;
                playerEntity.rigidbody.linearVelocity = new pc.Vec3(vel.x * 0.85, vel.y, vel.z * 0.85);
            }
        }

        // Keep upright
        if (playerEntity.rigidbody) {
            playerEntity.rigidbody.angularVelocity = pc.Vec3.ZERO;
        }

        // Head bob
        if (isMoving) {
            const bobSpeed = isSprinting ? 12 : 8;
            const bobIntensity = isSprinting ? 0.06 : 0.03;
            headBobTimer += dt * bobSpeed;
            headBobAmount = Math.sin(headBobTimer) * bobIntensity;
        } else {
            headBobAmount *= 0.9;
        }

        // Breathing sway
        breathTimer += dt * (1 + fearLevel * 0.02);
        const breathX = Math.sin(breathTimer * 1.2) * 0.005 * (1 + fearLevel * 0.01);
        const breathY = Math.cos(breathTimer * 0.8) * 0.003 * (1 + fearLevel * 0.01);

        cameraEntity.setLocalPosition(
            0.0 + breathX,
            PLAYER_HEIGHT / 2 - 0.1 + headBobAmount + breathY,
            0
        );

        // Footsteps
        if (isMoving) {
            const interval = isSprinting ? SPRINT_FOOTSTEP_INTERVAL : FOOTSTEP_INTERVAL;
            footstepTimer += dt;
            if (footstepTimer >= interval) {
                footstepTimer = 0;
                const floorTag = Environment.getFloorTagAt(pos);
                AudioSystem.playFootstep(floorTag);
            }
        } else {
            footstepTimer = FOOTSTEP_INTERVAL * 0.8; // quick first step on move start
        }

        // Flashlight toggle
        const flashKey = InputSystem.isAction('flashlight');
        if (flashKey && !prevFlashlightKey) {
            flashlightOn = !flashlightOn;
        }
        prevFlashlightKey = flashKey;

        // Flashlight battery
        if (flashlightOn && battery > 0) {
            battery -= BATTERY_DRAIN * dt;
            if (battery <= 0) {
                battery = 0;
                flashlightOn = false;
            }
        }
        if (flashlightEntity) {
            flashlightEntity.enabled = flashlightOn && battery > 0;
            if (flashlightEntity.light && flashlightOn) {
                // Flicker when low battery
                if (battery < 20) {
                    flashlightEntity.light.intensity = 1.0 + Math.random() * 1.5;
                } else {
                    flashlightEntity.light.intensity = 2.0;
                }
            }
        }

        // Sensor toggle
        const sensorKey = InputSystem.isAction('sensor');
        if (sensorKey && !prevSensorKey) {
            sensorActive = !sensorActive;
            if (sensorActive) {
                AudioSystem.startSensor();
                document.getElementById('sensor-display').classList.remove('hidden');
            } else {
                AudioSystem.stopSensor();
                document.getElementById('sensor-display').classList.add('hidden');
            }
        }
        prevSensorKey = sensorKey;

        // Update sensor
        if (sensorActive && stalkerPos) {
            const dist = pos.distance(stalkerPos);
            AudioSystem.updateSensor(dist);
            document.getElementById('sensor-distance').textContent = dist.toFixed(1) + 'm';
        }

        // Fear meter
        if (stalkerPos) {
            const dist = pos.distance(stalkerPos);
            if (dist < 15) {
                fearLevel += FEAR_STALKER_RATE * (1 - dist / 15) * dt;
            }
        }
        if (!flashlightOn) {
            fearLevel += FEAR_DARK_RATE * dt;
        }
        fearLevel -= FEAR_DECAY * dt;
        fearLevel = pc.math.clamp(fearLevel, 0, 100);

        // Heartbeat based on fear
        const bpm = 60 + (fearLevel / 100) * 120;
        AudioSystem.setHeartbeatBPM(bpm);

        // Camera FOV fear effect
        if (cameraEntity.camera) {
            cameraEntity.camera.fov = 70 + fearLevel * 0.1;
        }

        // Blackout
        if (blackoutActive) {
            blackoutTimer -= dt;
            document.getElementById('blackout-timer').textContent = Math.ceil(blackoutTimer);
            if (blackoutTimer <= 0) {
                endBlackout();
            }
        }

        // Portal check (Non-Euclidean)
        const fwd = new pc.Vec3();
        cameraEntity.getWorldTransform().getZ(fwd);
        fwd.mulScalar(-1);
        fwd.y = 0;
        fwd.normalize();
        const portalResult = Environment.checkPortals(pos, fwd);
        if (portalResult && portalResult.teleport) {
            teleportTo(portalResult.target);
            AudioSystem.startAmbience(portalResult.toBiome);
        }

        updateHUD();
    }

    function teleportTo(target) {
        if (playerEntity.rigidbody) {
            playerEntity.rigidbody.teleport(target.x, target.y + PLAYER_HEIGHT / 2, target.z);
            playerEntity.rigidbody.linearVelocity = pc.Vec3.ZERO;
        }
    }

    function collectShard() {
        if (shardsFound < 3) {
            shardsFound++;
            AudioSystem.playPickup();
            setObjective('Memory Shard collected! (' + shardsFound + '/3)');
            if (shardsFound >= 3) {
                setTimeout(() => setObjective('All shards found. Find the Fuse.'), 3000);
            }
        }
    }

    function collectFuse() {
        if (!hasFuse) {
            hasFuse = true;
            AudioSystem.playPickup();
            setObjective('Fuse acquired! Find the Breaker Box.');
        }
    }

    function insertFuse() {
        if (hasFuse && !fuseInserted) {
            fuseInserted = true;
            AudioSystem.playUnlock();
            setObjective('Brace yourself...');
            setTimeout(() => startBlackout(), 2000);
            return true;
        }
        return false;
    }

    function startBlackout() {
        blackoutActive = true;
        blackoutTimer = 30;
        flashlightOn = false;
        if (flashlightEntity) flashlightEntity.enabled = false;
        document.getElementById('blackout-overlay').classList.remove('hidden');
        AudioSystem.playBlackoutAlarm();
        setObjective('SURVIVE THE BLACKOUT!');
    }

    function endBlackout() {
        blackoutActive = false;
        flashlightOn = true;
        if (flashlightEntity) flashlightEntity.enabled = true;
        document.getElementById('blackout-overlay').classList.add('hidden');
        setObjective('The exit is open! ESCAPE!');
        AudioSystem.playUnlock();
    }

    function tryExit() {
        if (fuseInserted && !blackoutActive && shardsFound >= 3) {
            gameWon = true;
            return true;
        }
        return false;
    }

    function triggerJumpscare() {
        if (dead) return;
        AudioSystem.playJumpscare();
        const overlay = document.getElementById('jumpscare-overlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('active');

        // Time dilation
        if (app) app.timeScale = 0.2;

        setTimeout(() => {
            if (app) app.timeScale = 1.0;
            overlay.classList.add('hidden');
            overlay.classList.remove('active');
        }, 500);
    }

    function die() {
        dead = true;
        fearLevel = 100;
        triggerJumpscare();
        setTimeout(() => {
            document.getElementById('death-screen').classList.add('active');
            document.getElementById('death-screen').classList.remove('hidden');
            InputSystem.exitPointerLock();
        }, 600);
    }

    function updateHUD() {
        // Battery
        const bBar = document.getElementById('battery-bar');
        const bLabel = document.getElementById('battery-label');
        if (bBar) {
            bBar.style.width = battery + '%';
            if (battery < 20) {
                bBar.style.background = 'linear-gradient(90deg, #ff4444, #ff8844)';
            } else if (battery < 50) {
                bBar.style.background = 'linear-gradient(90deg, #ffaa44, #ffdd44)';
            } else {
                bBar.style.background = 'linear-gradient(90deg, #44ff44, #88ff88)';
            }
        }
        if (bLabel) bLabel.textContent = Math.ceil(battery) + '%';

        // Fear
        const fBar = document.getElementById('fear-bar');
        const fLabel = document.getElementById('fear-label');
        if (fBar) {
            fBar.style.width = fearLevel + '%';
            if (fearLevel > 75) fBar.classList.add('critical');
            else fBar.classList.remove('critical');
        }
        if (fLabel) fLabel.textContent = Math.floor(fearLevel) + '%';

        // Shards
        const sLabel = document.getElementById('shards-label');
        if (sLabel) sLabel.textContent = shardsFound + ' / 3 Shards';

        // Fuse
        const fuseLabel = document.getElementById('fuse-label');
        if (fuseLabel) {
            if (fuseInserted) fuseLabel.textContent = 'Fuse Inserted';
            else if (hasFuse) fuseLabel.textContent = 'Fuse ✓';
            else fuseLabel.textContent = 'No Fuse';
        }
    }

    function setObjective(text) {
        const el = document.getElementById('objective-text');
        if (el) {
            el.textContent = text;
            el.classList.remove('objective-animate');
            void el.offsetWidth; // reflow
            el.classList.add('objective-animate');
        }
    }

    function showInteractionPrompt(show, text) {
        const el = document.getElementById('interaction-prompt');
        if (el) {
            if (show) {
                el.classList.remove('hidden');
                if (text) el.textContent = text;
            } else {
                el.classList.add('hidden');
            }
        }
    }

    function getPosition() {
        return playerEntity ? playerEntity.getPosition().clone() : new pc.Vec3();
    }

    function getForward() {
        if (!cameraEntity) return new pc.Vec3(0, 0, -1);
        const f = new pc.Vec3();
        cameraEntity.getWorldTransform().getZ(f);
        f.mulScalar(-1);
        return f;
    }

    function getCameraEntity() { return cameraEntity; }
    function getEntity() { return playerEntity; }
    function getFearLevel() { return fearLevel; }
    function isDead() { return dead; }
    function hasWon() { return gameWon; }
    function isBlackout() { return blackoutActive; }
    function getShardsFound() { return shardsFound; }
    function getHasFuse() { return hasFuse; }
    function isFuseInserted() { return fuseInserted; }
    function getBattery() { return battery; }
    function addFear(amount) { fearLevel = pc.math.clamp(fearLevel + amount, 0, 100); }

    return {
        init, reset, update,
        collectShard, collectFuse, insertFuse, tryExit,
        triggerJumpscare, die,
        setObjective, showInteractionPrompt, teleportTo,
        getPosition, getForward, getCameraEntity, getEntity,
        getFearLevel, isDead, hasWon, isBlackout,
        getShardsFound, getHasFuse, isFuseInserted, getBattery,
        addFear
    };
})();
