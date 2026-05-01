/* ============================================
   AI SYSTEM — The Stalker / Lurker 2.0
   Peeking, Cover-seeking, Patrol, Chase
   ============================================ */

const AISystem = (() => {
    let app = null;
    let stalkerEntity = null;
    let stalkerHead = null;

    // State machine
    const STATES = { IDLE: 0, PATROL: 1, STALK: 2, CHASE: 3, PEEK: 4, RETREAT: 5 };
    let state = STATES.PATROL;
    let stateTimer = 0;
    let aggroLevel = 0;

    // Movement
    let currentTarget = new pc.Vec3(5, 0, -5);
    let patrolPoints = [];
    let patrolIndex = 0;
    let moveSpeed = 1.5;

    // Peek
    let peekTarget = null;
    let peekLean = 0;
    let peekDir = 1;
    let peekTimer = 0;

    // Animation timers
    let twitchTimer = 0;
    let crawlTimer = 0;
    let jitterIntensity = 0;

    // Visibility
    let isVisible = true;
    let visibilityTimer = 0;

    // Blackout mode
    let blackoutMode = false;

    const PATROL_SPEED = 1.5;
    const STALK_SPEED = 2.0;
    const CHASE_SPEED = 4.5;
    const BLACKOUT_CHASE_SPEED = 6.0;
    const DETECTION_RANGE = 25;
    const CHASE_RANGE = 10;
    const ATTACK_RANGE = 1.8;
    const LOSE_INTEREST_RANGE = 35;
    const PEEK_DURATION = 3;

    function init(appRef) {
        app = appRef;

        // Create Stalker entity
        stalkerEntity = new pc.Entity('Stalker');

        // Body (dark, humanoid shape)
        const bodyMat = new pc.StandardMaterial();
        bodyMat.diffuse = new pc.Color(0.05, 0.05, 0.05);
        bodyMat.emissive = new pc.Color(0.02, 0, 0.02);
        bodyMat.shininess = 0;
        bodyMat.update();

        // Torso
        const torso = new pc.Entity('Torso');
        torso.addComponent('render', { type: 'box', material: bodyMat });
        torso.setLocalScale(0.8, 1.4, 0.5);
        torso.setLocalPosition(0, 1.0, 0);
        stalkerEntity.addChild(torso);

        // Head
        stalkerHead = new pc.Entity('Head');
        const headMat = new pc.StandardMaterial();
        headMat.diffuse = new pc.Color(0.08, 0.03, 0.03);
        headMat.emissive = new pc.Color(0.05, 0, 0);
        headMat.update();
        stalkerHead.addComponent('render', { type: 'sphere', material: headMat });
        stalkerHead.setLocalScale(0.5, 0.5, 0.5);
        stalkerHead.setLocalPosition(0, 2.0, 0);
        stalkerEntity.addChild(stalkerHead);

        // Eyes (glowing red)
        const eyeMat = new pc.StandardMaterial();
        eyeMat.diffuse = new pc.Color(1, 0, 0);
        eyeMat.emissive = new pc.Color(1, 0.2, 0);
        eyeMat.emissiveIntensity = 3;
        eyeMat.update();

        const leftEye = new pc.Entity('LeftEye');
        leftEye.addComponent('render', { type: 'sphere', material: eyeMat });
        leftEye.setLocalScale(0.08, 0.08, 0.08);
        leftEye.setLocalPosition(-0.1, 2.05, 0.22);
        stalkerEntity.addChild(leftEye);

        const rightEye = new pc.Entity('RightEye');
        rightEye.addComponent('render', { type: 'sphere', material: eyeMat });
        rightEye.setLocalScale(0.08, 0.08, 0.08);
        rightEye.setLocalPosition(0.1, 2.05, 0.22);
        stalkerEntity.addChild(rightEye);

        // Arms
        for (let side = -1; side <= 1; side += 2) {
            const arm = new pc.Entity('Arm_' + side);
            arm.addComponent('render', { type: 'box', material: bodyMat });
            arm.setLocalScale(0.2, 1.2, 0.2);
            arm.setLocalPosition(side * 0.5, 0.9, 0);
            stalkerEntity.addChild(arm);
        }

        // Legs
        for (let side = -1; side <= 1; side += 2) {
            const leg = new pc.Entity('Leg_' + side);
            leg.addComponent('render', { type: 'box', material: bodyMat });
            leg.setLocalScale(0.25, 1.0, 0.25);
            leg.setLocalPosition(side * 0.25, 0.0, 0);
            stalkerEntity.addChild(leg);
        }

        // Point light for eerie glow
        const glow = new pc.Entity('StalkerGlow');
        glow.addComponent('light', {
            type: 'point',
            color: new pc.Color(0.4, 0.05, 0.05),
            intensity: 0.3,
            range: 5,
            castShadows: false
        });
        glow.setLocalPosition(0, 1.5, 0);
        stalkerEntity.addChild(glow);

        stalkerEntity.setPosition(15, 0, -10);
        app.root.addChild(stalkerEntity);

        // Generate patrol points
        generatePatrolPoints();
    }

    function generatePatrolPoints() {
        const rooms = Environment.getRooms();
        patrolPoints = [];
        rooms.forEach(room => {
            room.corridors.forEach(c => {
                patrolPoints.push(new pc.Vec3(
                    c.x + room.offset.x + (Math.random() - 0.5) * 2,
                    0,
                    c.z + room.offset.z + (Math.random() - 0.5) * 2
                ));
            });
        });
        // Shuffle
        for (let i = patrolPoints.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [patrolPoints[i], patrolPoints[j]] = [patrolPoints[j], patrolPoints[i]];
        }
        if (patrolPoints.length === 0) {
            patrolPoints = [new pc.Vec3(5, 0, -5), new pc.Vec3(25, 0, -5), new pc.Vec3(45, 0, -5)];
        }
    }

    function reset() {
        state = STATES.PATROL;
        stateTimer = 0;
        aggroLevel = 0;
        patrolIndex = 0;
        peekLean = 0;
        twitchTimer = 0;
        blackoutMode = false;
        if (stalkerEntity) stalkerEntity.setPosition(15, 0, -10);
        generatePatrolPoints();
    }

    function setBlackoutMode(active) {
        blackoutMode = active;
        if (active) {
            state = STATES.CHASE;
            moveSpeed = BLACKOUT_CHASE_SPEED;
        }
    }

    function update(dt, playerPos) {
        if (!stalkerEntity || !playerPos) return;

        const stalkerPos = stalkerEntity.getPosition();
        const distToPlayer = stalkerPos.distance(playerPos);
        stateTimer += dt;

        // Aggro management
        if (distToPlayer < DETECTION_RANGE) {
            aggroLevel += dt * (DETECTION_RANGE - distToPlayer) * 0.1;
        } else {
            aggroLevel -= dt * 2;
        }
        aggroLevel = pc.math.clamp(aggroLevel, 0, 100);

        // State transitions
        switch (state) {
            case STATES.IDLE:
                updateIdle(dt, playerPos, distToPlayer);
                break;
            case STATES.PATROL:
                updatePatrol(dt, playerPos, distToPlayer);
                break;
            case STATES.STALK:
                updateStalk(dt, playerPos, distToPlayer);
                break;
            case STATES.CHASE:
                updateChase(dt, playerPos, distToPlayer);
                break;
            case STATES.PEEK:
                updatePeek(dt, playerPos, distToPlayer);
                break;
            case STATES.RETREAT:
                updateRetreat(dt, playerPos, distToPlayer);
                break;
        }

        // Animations
        updateAnimations(dt, distToPlayer);

        // Attack check
        if (distToPlayer < ATTACK_RANGE && state === STATES.CHASE) {
            PlayerSystem.die();
        }

        // Fear contribution if visible and close
        if (distToPlayer < 15) {
            // Check if player can "see" the stalker
            const toStalker = new pc.Vec3().sub2(stalkerPos, playerPos).normalize();
            const playerFwd = PlayerSystem.getForward();
            const dot = playerFwd.dot(toStalker);
            if (dot > 0.3) {
                PlayerSystem.addFear(dt * 8 * (1 - distToPlayer / 15));
            }
        }

        // Jumpscare trigger at fear 100
        if (PlayerSystem.getFearLevel() >= 100 && !PlayerSystem.isDead()) {
            PlayerSystem.triggerJumpscare();
        }
    }

    function updateIdle(dt, playerPos, dist) {
        // Twitchy idle — stay in place, look at player sometimes
        if (dist < DETECTION_RANGE) {
            lookAt(playerPos);
        }

        if (stateTimer > 3 + Math.random() * 4) {
            if (dist < CHASE_RANGE && aggroLevel > 30) {
                changeState(STATES.CHASE);
            } else if (aggroLevel > 15) {
                changeState(STATES.STALK);
            } else {
                changeState(STATES.PATROL);
            }
        }
    }

    function updatePatrol(dt, playerPos, dist) {
        if (patrolPoints.length === 0) return;

        const target = patrolPoints[patrolIndex];
        moveToward(target, PATROL_SPEED, dt);

        const distToTarget = stalkerEntity.getPosition().distance(target);
        if (distToTarget < 2) {
            patrolIndex = (patrolIndex + 1) % patrolPoints.length;
        }

        // Detect player
        if (dist < DETECTION_RANGE && aggroLevel > 10) {
            // Try to find cover first (peek behavior)
            const cover = findNearestCover();
            if (cover && dist > 8) {
                peekTarget = cover;
                changeState(STATES.PEEK);
            } else if (dist < CHASE_RANGE) {
                changeState(STATES.CHASE);
            } else {
                changeState(STATES.STALK);
            }
        }
    }

    function updateStalk(dt, playerPos, dist) {
        // Follow at a distance
        const targetDist = 12;
        const toPlayer = new pc.Vec3().sub2(playerPos, stalkerEntity.getPosition()).normalize();

        if (dist > targetDist + 2) {
            moveToward(playerPos, STALK_SPEED, dt);
        } else if (dist < targetDist - 2) {
            // Back away
            const awayPos = new pc.Vec3().sub2(stalkerEntity.getPosition(), playerPos).normalize().mulScalar(3).add(stalkerEntity.getPosition());
            moveToward(awayPos, STALK_SPEED * 0.5, dt);
        }

        lookAt(playerPos);

        if (dist < CHASE_RANGE || aggroLevel > 60 || blackoutMode) {
            changeState(STATES.CHASE);
        } else if (dist > LOSE_INTEREST_RANGE) {
            changeState(STATES.PATROL);
        }

        // Occasional peek
        if (stateTimer > 5 && Math.random() < 0.01) {
            const cover = findNearestCover();
            if (cover) {
                peekTarget = cover;
                changeState(STATES.PEEK);
            }
        }
    }

    function updateChase(dt, playerPos, dist) {
        const speed = blackoutMode ? BLACKOUT_CHASE_SPEED : CHASE_SPEED;
        moveToward(playerPos, speed, dt);
        lookAt(playerPos);

        if (!blackoutMode && dist > LOSE_INTEREST_RANGE) {
            changeState(STATES.RETREAT);
        }
    }

    function updatePeek(dt, playerPos, dist) {
        // Move to cover position
        if (peekTarget) {
            const coverPos = peekTarget.getPosition();
            const distToCover = stalkerEntity.getPosition().distance(coverPos);

            if (distToCover > 1.5) {
                moveToward(coverPos, STALK_SPEED * 1.5, dt);
            } else {
                // Do peeking lean
                peekTimer += dt;
                peekLean = Math.sin(peekTimer * 2) * 0.8;
                stalkerHead.setLocalPosition(peekLean * peekDir, 2.0, 0.22 + Math.abs(peekLean) * 0.3);
                lookAt(playerPos);
            }
        }

        if (stateTimer > PEEK_DURATION) {
            peekLean = 0;
            stalkerHead.setLocalPosition(0, 2.0, 0);
            if (aggroLevel > 50 || dist < CHASE_RANGE) {
                changeState(STATES.CHASE);
            } else {
                changeState(STATES.STALK);
            }
        }
    }

    function updateRetreat(dt, playerPos, dist) {
        // Move away from player
        const awayDir = new pc.Vec3().sub2(stalkerEntity.getPosition(), playerPos).normalize();
        const retreatTarget = new pc.Vec3().add2(stalkerEntity.getPosition(), awayDir.mulScalar(5));
        moveToward(retreatTarget, PATROL_SPEED, dt);

        if (stateTimer > 4) {
            changeState(STATES.PATROL);
        }
    }

    function changeState(newState) {
        state = newState;
        stateTimer = 0;
        peekTimer = 0;
    }

    function moveToward(target, speed, dt) {
        const pos = stalkerEntity.getPosition();
        const dir = new pc.Vec3().sub2(target, pos);
        dir.y = 0;
        const dist = dir.length();
        if (dist < 0.1) return;
        dir.normalize();
        const step = Math.min(speed * dt, dist);
        const newPos = new pc.Vec3().add2(pos, dir.mulScalar(step));
        newPos.y = 0; // Stay grounded
        stalkerEntity.setPosition(newPos);
    }

    function lookAt(target) {
        const pos = stalkerEntity.getPosition();
        const dir = new pc.Vec3().sub2(target, pos);
        dir.y = 0;
        if (dir.lengthSq() < 0.01) return;
        const angle = Math.atan2(dir.x, dir.z) * pc.math.RAD_TO_DEG;
        stalkerEntity.setEulerAngles(0, angle, 0);
    }

    function findNearestCover() {
        // Find entities tagged as 'cover'
        const coverEntities = app.root.findByTag('cover');
        if (coverEntities.length === 0) return null;

        let nearest = null;
        let nearestDist = Infinity;
        const stalkerPos = stalkerEntity.getPosition();

        coverEntities.forEach(c => {
            const d = stalkerPos.distance(c.getPosition());
            if (d < nearestDist && d < 15) {
                nearestDist = d;
                nearest = c;
            }
        });

        peekDir = Math.random() > 0.5 ? 1 : -1;
        return nearest;
    }

    function updateAnimations(dt, distToPlayer) {
        if (!stalkerEntity) return;

        // Twitchy idle
        twitchTimer += dt;
        if (state === STATES.IDLE || state === STATES.PEEK) {
            if (Math.random() < 0.05) {
                jitterIntensity = 0.3 + Math.random() * 0.5;
            }
        }

        if (state === STATES.CHASE) {
            // Jittery crawl animation
            crawlTimer += dt * 10;
            const bobY = Math.abs(Math.sin(crawlTimer)) * 0.15;
            const swayX = Math.sin(crawlTimer * 0.7) * 0.1;
            stalkerEntity.children.forEach((child, i) => {
                if (child.name === 'Torso') {
                    child.setLocalPosition(swayX, 1.0 + bobY - (blackoutMode ? 0.4 : 0), 0);
                    child.setLocalEulerAngles(Math.sin(crawlTimer) * 3, 0, Math.sin(crawlTimer * 1.3) * 5);
                }
            });
        }

        // Head twitch
        if (jitterIntensity > 0.01) {
            jitterIntensity *= 0.95;
            if (stalkerHead && state !== STATES.PEEK) {
                stalkerHead.setLocalEulerAngles(
                    (Math.random() - 0.5) * jitterIntensity * 30,
                    (Math.random() - 0.5) * jitterIntensity * 40,
                    (Math.random() - 0.5) * jitterIntensity * 20
                );
            }
        }

        // Visibility flickering when in glitch biome
        const biome = Environment.getCurrentBiome(stalkerEntity.getPosition());
        if (biome === 'glitch') {
            visibilityTimer += dt;
            if (visibilityTimer > 0.1) {
                visibilityTimer = 0;
                isVisible = Math.random() > 0.15;
                stalkerEntity.children.forEach(c => { if (c.render) c.render.enabled = isVisible; });
            }
        } else {
            if (!isVisible) {
                stalkerEntity.children.forEach(c => { if (c.render) c.render.enabled = true; });
                isVisible = true;
            }
        }
    }

    function getPosition() {
        return stalkerEntity ? stalkerEntity.getPosition().clone() : new pc.Vec3(999, 0, 999);
    }

    function getState() { return state; }
    function getEntity() { return stalkerEntity; }

    return {
        init, reset, update,
        setBlackoutMode,
        getPosition, getState, getEntity
    };
})();
