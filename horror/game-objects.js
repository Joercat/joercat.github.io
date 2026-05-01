/* ============================================
   GAME OBJECTS — Shards, Fuse, Breaker Box,
   Exit Door, Interaction Raycasting
   ============================================ */

const GameObjects = (() => {
    let app = null;
    let objects = [];
    const INTERACT_RANGE = 3.0;

    const TYPES = {
        SHARD: 'shard',
        FUSE: 'fuse',
        BREAKER: 'breaker',
        EXIT: 'exit'
    };

    // Edge-detection for interact key
    let prevInteractKey = false;

    function init(appRef) {
        app = appRef;
    }

    function spawnAll() {
        clearAll();
        prevInteractKey = false;

        const rooms = Environment.getRooms();
        rooms.forEach(room => {
            if (!room.items) return;
            room.items.forEach(item => {
                const worldPos = new pc.Vec3(
                    item.pos[0] + room.offset.x,
                    item.pos[1],
                    item.pos[2] + room.offset.z
                );
                createObject(item.type, worldPos);
            });
        });
    }

    function createObject(type, pos) {
        const entity = new pc.Entity('Obj_' + type + '_' + objects.length);

        switch (type) {
            case TYPES.SHARD: {
                // Glowing crystal shard
                const mat = new pc.StandardMaterial();
                mat.diffuse = new pc.Color(0.15, 0.3, 1.0);
                mat.emissive = new pc.Color(0.3, 0.5, 1.0);
                mat.emissiveIntensity = 2.5;
                mat.opacity = 0.85;
                mat.blendType = pc.BLEND_ADDITIVE;
                mat.update();

                entity.addComponent('render', { type: 'box', material: mat });
                entity.setLocalScale(0.25, 0.5, 0.25);

                // Rotate 45 degrees for diamond look
                entity.setLocalEulerAngles(0, 45, 0);

                // Point light glow
                const glow = new pc.Entity('ShardGlow');
                glow.addComponent('light', {
                    type: 'point',
                    color: new pc.Color(0.2, 0.35, 1.0),
                    intensity: 0.7,
                    range: 5,
                    castShadows: false
                });
                entity.addChild(glow);
                break;
            }
            case TYPES.FUSE: {
                // Small metallic fuse cylinder
                const mat = new pc.StandardMaterial();
                mat.diffuse = new pc.Color(0.7, 0.55, 0.15);
                mat.emissive = new pc.Color(0.35, 0.28, 0.05);
                mat.emissiveIntensity = 1.5;
                mat.shininess = 70;
                mat.update();

                entity.addComponent('render', { type: 'cylinder', material: mat });
                entity.setLocalScale(0.12, 0.35, 0.12);

                const glow = new pc.Entity('FuseGlow');
                glow.addComponent('light', {
                    type: 'point',
                    color: new pc.Color(0.6, 0.45, 0.1),
                    intensity: 0.5,
                    range: 3.5,
                    castShadows: false
                });
                entity.addChild(glow);
                break;
            }
            case TYPES.BREAKER: {
                // Breaker box mounted on wall
                const mat = new pc.StandardMaterial();
                mat.diffuse = new pc.Color(0.25, 0.25, 0.3);
                mat.shininess = 15;
                mat.update();

                entity.addComponent('render', { type: 'box', material: mat });
                entity.setLocalScale(0.7, 0.9, 0.25);

                // Detail — handle on the box
                const handleMat = new pc.StandardMaterial();
                handleMat.diffuse = new pc.Color(0.4, 0.15, 0.1);
                handleMat.update();
                const handle = new pc.Entity('Handle');
                handle.addComponent('render', { type: 'box', material: handleMat });
                handle.setLocalScale(0.15, 0.4, 0.12);
                handle.setLocalPosition(0.15, 0.1, 0.15);
                entity.addChild(handle);

                // Status indicator light (red/green)
                const indicator = new pc.Entity('Indicator');
                indicator.addComponent('light', {
                    type: 'point',
                    color: new pc.Color(1, 0, 0),
                    intensity: 0.35,
                    range: 2,
                    castShadows: false
                });
                indicator.setLocalPosition(0, 0.55, 0.2);
                entity.addChild(indicator);
                entity._indicator = indicator;
                break;
            }
            case TYPES.EXIT: {
                // Exit door frame
                const mat = new pc.StandardMaterial();
                mat.diffuse = new pc.Color(0.12, 0.3, 0.12);
                mat.emissive = new pc.Color(0.03, 0.1, 0.03);
                mat.update();

                entity.addComponent('render', { type: 'box', material: mat });
                entity.setLocalScale(2.2, 3.2, 0.35);

                // "EXIT" sign light
                const exitLight = new pc.Entity('ExitLight');
                exitLight.addComponent('light', {
                    type: 'point',
                    color: new pc.Color(0.1, 0.5, 0.1),
                    intensity: 0.5,
                    range: 6,
                    castShadows: false
                });
                exitLight.setLocalPosition(0, 2, 1);
                entity.addChild(exitLight);
                entity._exitLight = exitLight;
                break;
            }
        }

        entity.setPosition(pos.x, pos.y, pos.z);
        entity.tags.add(type);
        entity.tags.add('interactive');
        app.root.addChild(entity);

        objects.push({
            entity: entity,
            type: type,
            collected: false,
            active: true
        });

        // Float/rotate animation seed
        entity._floatPhase = Math.random() * Math.PI * 2;
        entity._baseY = pos.y;
    }

    function clearAll() {
        objects.forEach(obj => { if (obj.entity) obj.entity.destroy(); });
        objects = [];
        prevInteractKey = false;
    }

    function update(dt) {
        if (PlayerSystem.isDead() || PlayerSystem.hasWon()) return;

        const playerPos = PlayerSystem.getPosition();
        const playerFwd = PlayerSystem.getForward();

        let nearestObj = null;
        let nearestDist = INTERACT_RANGE;

        for (const obj of objects) {
            if (!obj.active || obj.collected) continue;
            const entity = obj.entity;

            // Floating & rotating animation for pickups
            if (obj.type === TYPES.SHARD || obj.type === TYPES.FUSE) {
                entity._floatPhase += dt * 2.2;
                const floatY = Math.sin(entity._floatPhase) * 0.12;
                const pos = entity.getPosition();
                entity.setPosition(pos.x, entity._baseY + floatY, pos.z);
                const euler = entity.getLocalEulerAngles();
                entity.setLocalEulerAngles(euler.x, euler.y + dt * 50, euler.z);
            }

            // Breaker indicator color update
            if (obj.type === TYPES.BREAKER && entity._indicator) {
                const isInserted = PlayerSystem.isFuseInserted();
                const indicatorLight = entity._indicator.light;
                if (indicatorLight) {
                    indicatorLight.color = isInserted
                        ? new pc.Color(0, 1, 0)
                        : new pc.Color(1, 0, 0);
                }
            }

            // Exit pulsing
            if (obj.type === TYPES.EXIT && entity._exitLight) {
                const canExit = PlayerSystem.isFuseInserted() &&
                                !PlayerSystem.isBlackout() &&
                                PlayerSystem.getShardsFound() >= 3;
                const el = entity._exitLight.light;
                if (el) {
                    el.intensity = canExit ? (0.5 + Math.sin(Date.now() * 0.004) * 0.35) : 0.1;
                    el.color = canExit ? new pc.Color(0, 1, 0) : new pc.Color(0.5, 0, 0);
                }
            }

            // Check if player is looking at this object (dot-product cone check)
            const dist = playerPos.distance(entity.getPosition());
            if (dist < nearestDist) {
                const toObj = new pc.Vec3().sub2(entity.getPosition(), playerPos).normalize();
                const dot = playerFwd.dot(toObj);
                if (dot > 0.65) { // ~50° cone
                    nearestDist = dist;
                    nearestObj = obj;
                }
            }
        }

        // Show/hide interaction prompt
        if (nearestObj) {
            let prompt = '[E] Interact';
            switch (nearestObj.type) {
                case TYPES.SHARD:
                    prompt = '[E] Collect Memory Shard';
                    break;
                case TYPES.FUSE:
                    prompt = '[E] Pick Up Fuse';
                    break;
                case TYPES.BREAKER:
                    prompt = PlayerSystem.getHasFuse()
                        ? (PlayerSystem.isFuseInserted() ? '[E] Breaker (Fuse Inserted)' : '[E] Insert Fuse')
                        : '[E] Breaker Box (Need Fuse)';
                    break;
                case TYPES.EXIT: {
                    const canExit = PlayerSystem.isFuseInserted() &&
                                    !PlayerSystem.isBlackout() &&
                                    PlayerSystem.getShardsFound() >= 3;
                    prompt = canExit ? '[E] ESCAPE!' : '[E] Exit (Locked)';
                    break;
                }
            }
            PlayerSystem.showInteractionPrompt(true, prompt);

            // Edge-detect interact key (press, not hold)
            const interactDown = InputSystem.isAction('interact');
            if (interactDown && !prevInteractKey) {
                interact(nearestObj);
            }
            prevInteractKey = interactDown;
        } else {
            PlayerSystem.showInteractionPrompt(false);
            prevInteractKey = InputSystem.isAction('interact');
        }
    }

    function interact(obj) {
        switch (obj.type) {
            case TYPES.SHARD:
                if (!obj.collected) {
                    obj.collected = true;
                    obj.entity.enabled = false;
                    PlayerSystem.collectShard();
                }
                break;

            case TYPES.FUSE:
                if (!obj.collected) {
                    obj.collected = true;
                    obj.entity.enabled = false;
                    PlayerSystem.collectFuse();
                }
                break;

            case TYPES.BREAKER:
                if (PlayerSystem.getHasFuse() && !PlayerSystem.isFuseInserted()) {
                    PlayerSystem.insertFuse();
                    AISystem.setBlackoutMode(true);
                    // End blackout mode after the timer expires
                    setTimeout(() => {
                        if (!PlayerSystem.isDead()) AISystem.setBlackoutMode(false);
                    }, 32000);
                } else if (!PlayerSystem.getHasFuse()) {
                    AudioSystem.playError();
                    PlayerSystem.setObjective('You need a Fuse for the Breaker Box.');
                } else {
                    // Already inserted
                    AudioSystem.playError();
                }
                break;

            case TYPES.EXIT:
                if (PlayerSystem.tryExit()) {
                    // WIN
                    document.getElementById('win-screen').classList.add('active');
                    document.getElementById('win-screen').classList.remove('hidden');
                    InputSystem.exitPointerLock();
                } else {
                    AudioSystem.playError();
                    if (PlayerSystem.getShardsFound() < 3) {
                        PlayerSystem.setObjective('Collect all 3 Memory Shards first. (' + PlayerSystem.getShardsFound() + '/3)');
                    } else if (!PlayerSystem.getHasFuse()) {
                        PlayerSystem.setObjective('Find the Fuse.');
                    } else if (!PlayerSystem.isFuseInserted()) {
                        PlayerSystem.setObjective('Insert the Fuse into the Breaker Box.');
                    } else if (PlayerSystem.isBlackout()) {
                        PlayerSystem.setObjective('Survive the Blackout first!');
                    }
                }
                break;
        }
    }

    return {
        init, spawnAll, clearAll, update
    };
})();
