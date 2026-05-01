/* ============================================
   ENVIRONMENT ENGINE — Biomes, Corridors,
   Non-Euclidean Portals, Stress Zones
   ============================================ */

const Environment = (() => {
    let app = null;
    let rootEntity = null;
    let rooms = [];
    let portalTriggers = [];
    let stressZones = [];
    let wallEntities = [];
    let currentBiome = 'industrial';
    const WALL_THICKNESS = 0.6; // min 0.5 units
    const WALL_HEIGHT = 4;
    const ROOM_SCALE = 1;

    // Texture URLs
    const TEX_URLS = {
        concrete: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=512&q=60',
        metal: 'https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?w=512&q=60',
        wood: 'https://images.unsplash.com/photo-1588854333355-1126adbbd5c1?w=512&q=60'
    };

    let textures = {};
    let materialsCache = {};

    // Biome configs
    const BIOMES = {
        industrial: {
            wallColor: new pc.Color(0.25, 0.25, 0.28),
            floorColor: new pc.Color(0.18, 0.18, 0.2),
            ceilingColor: new pc.Color(0.15, 0.15, 0.17),
            floorTag: 'metal',
            fogColor: new pc.Color(0.02, 0.02, 0.04),
            fogDensity: 0.06,
            ambientLight: new pc.Color(0.03, 0.03, 0.05)
        },
        overgrown: {
            wallColor: new pc.Color(0.15, 0.22, 0.12),
            floorColor: new pc.Color(0.12, 0.18, 0.08),
            ceilingColor: new pc.Color(0.08, 0.12, 0.06),
            floorTag: 'organic',
            fogColor: new pc.Color(0.02, 0.04, 0.02),
            fogDensity: 0.08,
            ambientLight: new pc.Color(0.02, 0.04, 0.02)
        },
        glitch: {
            wallColor: new pc.Color(0.3, 0.05, 0.3),
            floorColor: new pc.Color(0.15, 0.02, 0.15),
            ceilingColor: new pc.Color(0.1, 0.01, 0.1),
            floorTag: 'metal',
            fogColor: new pc.Color(0.05, 0.0, 0.05),
            fogDensity: 0.1,
            ambientLight: new pc.Color(0.05, 0.01, 0.05)
        }
    };

    // Room layout definitions
    // Each room is defined by corridors and connections
    const ROOM_LAYOUTS = [
        { // Room 0 — Start room (industrial)
            biome: 'industrial',
            corridors: [
                { x: 0, z: 0, w: 6, d: 8 },       // main hall
                { x: 0, z: -8, w: 3, d: 6 },       // corridor north
                { x: 5, z: -3, w: 6, d: 3 },       // corridor east
            ],
            walls: [], // auto-generated
            items: [{ type: 'shard', pos: [5, 1, -3] }],
            stressZone: { x: 0, z: -8, w: 3, d: 6, narrowRate: 0.3 }
        },
        { // Room 1 — overgrown
            biome: 'overgrown',
            corridors: [
                { x: 0, z: 0, w: 8, d: 8 },
                { x: -6, z: 0, w: 6, d: 3 },
                { x: 0, z: -8, w: 4, d: 8 },
            ],
            items: [{ type: 'shard', pos: [-6, 1, 0] }],
            stressZone: { x: 0, z: -8, w: 4, d: 8, narrowRate: 0.5 }
        },
        { // Room 2 — glitch
            biome: 'glitch',
            corridors: [
                { x: 0, z: 0, w: 5, d: 5 },
                { x: 0, z: -7, w: 3, d: 4 },
                { x: 4, z: 0, w: 4, d: 4 },
                { x: 4, z: -6, w: 5, d: 3 },
            ],
            items: [
                { type: 'shard', pos: [4, 1, -6] },
                { type: 'fuse', pos: [6, 1, 0] }
            ],
            stressZone: { x: 0, z: -7, w: 3, d: 4, narrowRate: 0.7 }
        },
        { // Room 3 — Exit room
            biome: 'industrial',
            corridors: [
                { x: 0, z: 0, w: 8, d: 6 },
                { x: 0, z: -6, w: 4, d: 4 },
            ],
            items: [
                { type: 'breaker', pos: [3, 1.5, -2] },
                { type: 'exit', pos: [0, 1.5, -8] }
            ]
        }
    ];

    function init(appRef) {
        app = appRef;
        rootEntity = new pc.Entity('Environment');
        app.root.addChild(rootEntity);
        loadTextures();
    }

    function loadTextures() {
        // Create procedural textures instead of loading external images
        // (PlayCanvas texture loading from cross-origin URLs is complex)
        Object.keys(TEX_URLS).forEach(name => {
            const tex = new pc.Texture(app.graphicsDevice, {
                width: 4, height: 4, format: pc.PIXELFORMAT_RGBA8
            });
            const pixels = tex.lock();
            for (let i = 0; i < 4 * 4; i++) {
                if (name === 'concrete') {
                    const v = 100 + Math.random() * 50;
                    pixels[i * 4] = v; pixels[i * 4 + 1] = v; pixels[i * 4 + 2] = v + 10; pixels[i * 4 + 3] = 255;
                } else if (name === 'metal') {
                    const v = 60 + Math.random() * 40;
                    pixels[i * 4] = v + 20; pixels[i * 4 + 1] = v; pixels[i * 4 + 2] = v; pixels[i * 4 + 3] = 255;
                } else {
                    const v = 80 + Math.random() * 50;
                    pixels[i * 4] = v + 10; pixels[i * 4 + 1] = v - 10; pixels[i * 4 + 2] = v - 30; pixels[i * 4 + 3] = 255;
                }
            }
            tex.unlock();
            textures[name] = tex;
        });
    }

    function getMaterial(biome, part) {
        const key = biome + '_' + part;
        if (materialsCache[key]) return materialsCache[key];
        const b = BIOMES[biome] || BIOMES.industrial;
        const mat = new pc.StandardMaterial();
        mat.useLighting = true;

        if (part === 'wall') {
            mat.diffuse = b.wallColor;
            if (textures.concrete) {
                mat.diffuseMap = textures.concrete;
                mat.diffuseMapTiling = new pc.Vec2(2, 2);
            }
            mat.shininess = 10;
        } else if (part === 'floor') {
            mat.diffuse = b.floorColor;
            if (biome === 'overgrown' && textures.wood) {
                mat.diffuseMap = textures.wood;
            } else if (textures.metal) {
                mat.diffuseMap = textures.metal;
            }
            mat.diffuseMapTiling = new pc.Vec2(4, 4);
            mat.shininess = 5;
        } else if (part === 'ceiling') {
            mat.diffuse = b.ceilingColor;
            mat.shininess = 2;
        }

        mat.update();
        materialsCache[key] = mat;
        return mat;
    }

    function buildRoom(layoutIndex, offset) {
        const layout = ROOM_LAYOUTS[layoutIndex];
        if (!layout) return null;
        const biome = layout.biome;
        const roomRoot = new pc.Entity('Room_' + layoutIndex);
        roomRoot.setPosition(offset.x, offset.y, offset.z);
        rootEntity.addChild(roomRoot);

        const roomData = {
            entity: roomRoot,
            biome: biome,
            floorTag: BIOMES[biome].floorTag,
            corridors: [],
            items: layout.items || [],
            stressZone: layout.stressZone || null,
            stressWalls: [],
            offset: offset
        };

        // Set scene fog for this biome
        const b = BIOMES[biome];
        app.scene.fogColor = b.fogColor;
        app.scene.fogDensity = b.fogDensity;
        app.scene.ambientLight = b.ambientLight;
        app.scene.fog = pc.FOG_EXP2;

        // Build corridors
        layout.corridors.forEach((c, ci) => {
            // Floor
            const floor = createBox(c.w, 0.2, c.d, getMaterial(biome, 'floor'));
            floor.setLocalPosition(c.x, -0.1, c.z);
            floor.name = 'Floor_' + ci;
            floor.tags.add('floor');
            floor.tags.add(BIOMES[biome].floorTag);
            addCollider(floor, c.w, 0.2, c.d, 'static');
            roomRoot.addChild(floor);

            // Ceiling
            const ceil = createBox(c.w, 0.2, c.d, getMaterial(biome, 'ceiling'));
            ceil.setLocalPosition(c.x, WALL_HEIGHT, c.z);
            addCollider(ceil, c.w, 0.2, c.d, 'static');
            roomRoot.addChild(ceil);

            // Walls — 4 sides
            const wallConfigs = [
                { x: c.x - c.w / 2 - WALL_THICKNESS / 2, z: c.z, sx: WALL_THICKNESS, sz: c.d + WALL_THICKNESS * 2, side: 'left' },
                { x: c.x + c.w / 2 + WALL_THICKNESS / 2, z: c.z, sx: WALL_THICKNESS, sz: c.d + WALL_THICKNESS * 2, side: 'right' },
                { x: c.x, z: c.z - c.d / 2 - WALL_THICKNESS / 2, sx: c.w, sz: WALL_THICKNESS, side: 'back' },
                { x: c.x, z: c.z + c.d / 2 + WALL_THICKNESS / 2, sx: c.w, sz: WALL_THICKNESS, side: 'front' }
            ];

            wallConfigs.forEach(wc => {
                const wall = createBox(wc.sx, WALL_HEIGHT, wc.sz, getMaterial(biome, 'wall'));
                wall.setLocalPosition(wc.x, WALL_HEIGHT / 2, wc.z);
                wall.name = 'Wall_' + ci + '_' + wc.side;
                wall.tags.add('wall');
                addCollider(wall, wc.sx, WALL_HEIGHT, wc.sz, 'static');
                roomRoot.addChild(wall);
                wallEntities.push(wall);

                // Track stress zone walls
                if (roomData.stressZone && ci === layout.corridors.length - 1) {
                    if (wc.side === 'left' || wc.side === 'right') {
                        roomData.stressWalls.push({ entity: wall, side: wc.side, origX: wc.x });
                    }
                }
            });

            roomData.corridors.push(c);
        });

        // Add dim lights
        const light1 = new pc.Entity('RoomLight1');
        light1.addComponent('light', {
            type: 'point',
            color: biome === 'overgrown' ? new pc.Color(0.2, 0.4, 0.15) :
                   biome === 'glitch' ? new pc.Color(0.4, 0.1, 0.4) :
                   new pc.Color(0.3, 0.25, 0.15),
            intensity: 0.4,
            range: 12,
            castShadows: true,
            shadowResolution: 512
        });
        light1.setLocalPosition(0, WALL_HEIGHT - 0.5, 0);
        roomRoot.addChild(light1);

        // Flickering light in certain rooms
        if (layoutIndex > 0) {
            const flickerLight = new pc.Entity('FlickerLight');
            flickerLight.addComponent('light', {
                type: 'point',
                color: new pc.Color(0.5, 0.3, 0.1),
                intensity: 0.3,
                range: 8,
                castShadows: false
            });
            const lastCorr = layout.corridors[layout.corridors.length - 1];
            flickerLight.setLocalPosition(lastCorr.x, WALL_HEIGHT - 0.5, lastCorr.z);
            roomRoot.addChild(flickerLight);
            // Store for flickering
            flickerLight._flickerTimer = 0;
            flickerLight._flickerBase = 0.3;
            roomData._flickerLight = flickerLight;
        }

        // Pillars for AI cover
        if (layout.corridors.length > 1) {
            for (let pi = 0; pi < 2; pi++) {
                const pillar = createBox(0.6, WALL_HEIGHT, 0.6, getMaterial(biome, 'wall'));
                const c0 = layout.corridors[0];
                pillar.setLocalPosition(
                    c0.x + (pi === 0 ? -1.5 : 1.5),
                    WALL_HEIGHT / 2,
                    c0.z + 1
                );
                pillar.tags.add('cover');
                addCollider(pillar, 0.6, WALL_HEIGHT, 0.6, 'static');
                roomRoot.addChild(pillar);
            }
        }

        rooms.push(roomData);
        return roomData;
    }

    function createBox(sx, sy, sz, material) {
        const entity = new pc.Entity();
        entity.addComponent('render', {
            type: 'box',
            material: material
        });
        entity.setLocalScale(sx, sy, sz);
        return entity;
    }

    function addCollider(entity, sx, sy, sz, type) {
        if (!app.systems.rigidbody) return;
        entity.addComponent('rigidbody', {
            type: type || 'static',
            mass: 0,
            restitution: 0.1,
            friction: 0.8
        });
        entity.addComponent('collision', {
            type: 'box',
            halfExtents: new pc.Vec3(sx / 2, sy / 2, sz / 2)
        });
        // Enable CCD on dynamic bodies
        if (type === 'dynamic' && entity.rigidbody) {
            entity.rigidbody.ccdMotionThreshold = 0.1;
            entity.rigidbody.ccdSweptSphereRadius = 0.2;
        }
    }

    function buildAllRooms() {
        clearRooms();
        buildRoom(0, new pc.Vec3(0, 0, 0));
        buildRoom(1, new pc.Vec3(20, 0, 0));
        buildRoom(2, new pc.Vec3(40, 0, 0));
        buildRoom(3, new pc.Vec3(60, 0, 0));

        // Build portal connections between rooms
        portalTriggers = [
            { from: 0, to: 1, triggerPos: new pc.Vec3(8, 1, -3), targetPos: new pc.Vec3(20, 1, 3) },
            { from: 1, to: 2, triggerPos: new pc.Vec3(20, 1, -14), targetPos: new pc.Vec3(40, 1, 3) },
            { from: 2, to: 3, triggerPos: new pc.Vec3(48, 1, -6), targetPos: new pc.Vec3(60, 1, 3) }
        ];
    }

    function clearRooms() {
        rooms.forEach(r => { if (r.entity) r.entity.destroy(); });
        rooms = [];
        wallEntities = [];
        portalTriggers = [];
    }

    // Non-Euclidean check — when player looks away from a portal
    function checkPortals(playerPos, playerForward) {
        for (const portal of portalTriggers) {
            const dist = playerPos.distance(portal.triggerPos);
            if (dist < 3) {
                // Dot product: if facing away from portal entrance direction
                const toPortal = new pc.Vec3().sub2(portal.triggerPos, playerPos).normalize();
                const dot = playerForward.dot(toPortal);
                if (dot < -0.3) {
                    // Player is looking away from the portal they're near
                    return { teleport: true, target: portal.targetPos, toBiome: rooms[portal.to]?.biome || 'industrial' };
                }
            }
        }
        return null;
    }

    // Stress zone — narrow walls over time
    function updateStressZones(playerPos, dt) {
        rooms.forEach(room => {
            if (!room.stressZone || room.stressWalls.length === 0) return;
            const sz = room.stressZone;
            const worldX = sz.x + room.offset.x;
            const worldZ = sz.z + room.offset.z;

            // Check if player is inside stress zone
            const inZone = Math.abs(playerPos.x - worldX) < sz.w / 2 + 1 &&
                           Math.abs(playerPos.z - worldZ) < sz.d / 2 + 1;

            room.stressWalls.forEach(sw => {
                const pos = sw.entity.getLocalPosition();
                if (inZone) {
                    // Narrow walls toward center
                    const dir = sw.side === 'left' ? 1 : -1;
                    const maxNarrow = 1.2;
                    const target = sw.origX + dir * maxNarrow;
                    const newX = pc.math.lerp(pos.x, target, dt * sz.narrowRate);
                    sw.entity.setLocalPosition(newX, pos.y, pos.z);
                } else {
                    // Return to original
                    const newX = pc.math.lerp(pos.x, sw.origX, dt * 0.5);
                    sw.entity.setLocalPosition(newX, pos.y, pos.z);
                }
            });
        });
    }

    // Flicker lights
    function updateLights(dt) {
        rooms.forEach(room => {
            if (room._flickerLight) {
                const fl = room._flickerLight;
                fl._flickerTimer += dt;
                if (fl._flickerTimer > 0.05 + Math.random() * 0.15) {
                    fl._flickerTimer = 0;
                    const lc = fl.light;
                    if (lc) {
                        lc.intensity = fl._flickerBase * (0.5 + Math.random() * 0.8);
                    }
                }
            }
        });
    }

    // Glitch biome — jitter geometry
    function updateGlitchBiome(dt) {
        rooms.forEach(room => {
            if (room.biome !== 'glitch') return;
            if (Math.random() > 0.95) {
                const children = room.entity.children;
                if (children.length > 0) {
                    const idx = Math.floor(Math.random() * children.length);
                    const child = children[idx];
                    if (child.tags && child.tags.has('wall')) {
                        const pos = child.getLocalPosition();
                        child.setLocalPosition(
                            pos.x + (Math.random() - 0.5) * 0.05,
                            pos.y,
                            pos.z + (Math.random() - 0.5) * 0.05
                        );
                    }
                }
            }
        });
    }

    function getFloorTagAt(pos) {
        // Determine which room the player is in and return floor tag
        for (const room of rooms) {
            for (const c of room.corridors) {
                const wx = c.x + room.offset.x;
                const wz = c.z + room.offset.z;
                if (Math.abs(pos.x - wx) < c.w / 2 + 1 && Math.abs(pos.z - wz) < c.d / 2 + 1) {
                    return room.floorTag;
                }
            }
        }
        return 'concrete';
    }

    function getCurrentBiome(pos) {
        for (const room of rooms) {
            for (const c of room.corridors) {
                const wx = c.x + room.offset.x;
                const wz = c.z + room.offset.z;
                if (Math.abs(pos.x - wx) < c.w / 2 + 2 && Math.abs(pos.z - wz) < c.d / 2 + 2) {
                    return room.biome;
                }
            }
        }
        return 'industrial';
    }

    function getRooms() { return rooms; }
    function getPortals() { return portalTriggers; }

    return {
        init,
        buildAllRooms,
        clearRooms,
        checkPortals,
        updateStressZones,
        updateLights,
        updateGlitchBiome,
        getFloorTagAt,
        getCurrentBiome,
        getRooms,
        getPortals,
        WALL_HEIGHT
    };
})();
