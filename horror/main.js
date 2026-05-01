/* ============================================
   MAIN.JS — Bootloader, Game Loop, VHS Shader,
   Post-Processing, Menu Orchestration
   ============================================ */

const GameMain = (() => {
    let app = null;
    let gameRunning = false;
    let paused = false;
    let initialized = false;

    // VHS post-process
    let vhsEffect = null;
    let vhsTime = 0;

    // CDN URLs
    const PLAYCANVAS_URL = 'https://code.playcanvas.com/playcanvas-stable.min.js';
    const AMMO_URL = 'https://code.playcanvas.com/ammo/ammo.wasm.js';

    // ---- ASYNC BOOTLOADER ----
    async function boot() {
        showLoadingState('Loading physics engine...');
        await loadScript(AMMO_URL);

        showLoadingState('Loading PlayCanvas engine...');
        await loadScript(PLAYCANVAS_URL);

        showLoadingState('Initializing Ammo.js...');
        if (typeof Ammo === 'function') {
            try {
                await new Promise((resolve, reject) => {
                    Ammo().then((ammoInstance) => {
                        window.Ammo = ammoInstance;
                        resolve();
                    }).catch(reject);
                });
            } catch (e) {
                console.warn('Ammo init warning:', e);
            }
        }

        showLoadingState('Click START GAME to begin.');
        initMenuHandlers();
    }

    function loadScript(url) {
        return new Promise((resolve) => {
            // Check if already loaded
            const existing = document.querySelector(`script[src="${url}"]`);
            if (existing) { resolve(); return; }

            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                console.warn('Failed to load: ' + url + ' — continuing');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    function showLoadingState(msg) {
        const subtitle = document.querySelector('#main-menu .subtitle');
        if (subtitle) subtitle.textContent = msg;
    }

    // ---- GRAPHICS FALLBACK ----
    function createApp() {
        const canvas = document.getElementById('application-canvas');

        // Detect best available graphics API
        let deviceType = 'webgl2';
        const testCanvas = document.createElement('canvas');

        // WebGPU check (PlayCanvas 1.70+ experimental support)
        if (typeof navigator !== 'undefined' && navigator.gpu) {
            console.log('WebGPU detected (using WebGL2 for stability)');
            // deviceType = 'webgpu'; // Enable when stable
        }

        if (!testCanvas.getContext('webgl2')) {
            if (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')) {
                deviceType = 'webgl1';
                console.warn('Falling back to WebGL1');
            } else {
                alert('Your browser does not support WebGL. Cannot run the game.');
                return null;
            }
        }
        testCanvas.remove();

        console.log('Graphics backend:', deviceType);

        app = new pc.Application(canvas, {
            mouse: new pc.Mouse(canvas),
            keyboard: new pc.Keyboard(window),
            graphicsDeviceOptions: {
                preferWebGl2: deviceType === 'webgl2',
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance'
            }
        });

        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        window.addEventListener('resize', () => {
            if (app) app.resizeCanvas();
        });

        // Scene settings
        app.scene.ambientLight = new pc.Color(0.02, 0.02, 0.03);
        app.scene.fog = pc.FOG_EXP2;
        app.scene.fogColor = new pc.Color(0.02, 0.02, 0.04);
        app.scene.fogDensity = 0.06;
        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_ACES;
        app.scene.exposure = 1.0;
        app.scene.skyboxIntensity = 0.0;

        return app;
    }

    // ---- MENU HANDLERS ----
    function initMenuHandlers() {
        document.getElementById('btn-start')?.addEventListener('click', startGame);

        document.getElementById('btn-controls-menu')?.addEventListener('click', () => {
            document.getElementById('main-menu').classList.remove('active');
            document.getElementById('pause-menu').classList.add('active');

            // When viewing controls from main menu, Resume goes back to main menu
            const btnResume = document.getElementById('btn-resume');
            btnResume._fromMainMenu = true;
        });

        document.getElementById('btn-resume')?.addEventListener('click', () => {
            const btnResume = document.getElementById('btn-resume');
            if (btnResume._fromMainMenu && !gameRunning) {
                document.getElementById('pause-menu').classList.remove('active');
                document.getElementById('main-menu').classList.add('active');
                btnResume._fromMainMenu = false;
            } else {
                resumeGame();
            }
        });

        document.getElementById('btn-quit')?.addEventListener('click', quitToMenu);

        document.getElementById('btn-retry')?.addEventListener('click', () => {
            document.getElementById('death-screen').classList.remove('active');
            document.getElementById('death-screen').classList.add('hidden');
            restartGame();
        });

        document.getElementById('btn-menu-return')?.addEventListener('click', () => {
            document.getElementById('win-screen').classList.remove('active');
            document.getElementById('win-screen').classList.add('hidden');
            quitToMenu();
        });
    }

    // ---- START GAME ----
    async function startGame() {
        // Init audio context (requires user gesture in modern browsers)
        AudioSystem.init();

        // Apply saved volume
        const volSlider = document.getElementById('volume-slider');
        if (volSlider) AudioSystem.setMasterVolume(parseFloat(volSlider.value) / 100);

        // Create PlayCanvas app (only once)
        if (!app) {
            const result = createApp();
            if (!result) return;
        }

        // Initialize input system (only once)
        if (!initialized) {
            InputSystem.init();
            initialized = true;
        }

        // Initialize all game systems
        Environment.init(app);
        PlayerSystem.init(app);
        AISystem.init(app);
        GameObjects.init(app);

        // Build the game world
        Environment.buildAllRooms();
        GameObjects.spawnAll();
        PlayerSystem.reset();
        AISystem.reset();

        // Setup VHS post-process shader
        setupVHSPostProcess();

        // Register game loop and start
        app.on('update', gameLoop);
        app.start();

        // Switch UI state
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('hud').classList.remove('hidden');

        // Pointer lock for FPS controls
        InputSystem.requestPointerLock();

        // Start audio subsystems
        AudioSystem.startHeartbeat();
        AudioSystem.startGhostDirector();
        AudioSystem.startAmbience('industrial');

        // First objective
        PlayerSystem.setObjective('Find 3 Memory Shards scattered in the house.');

        gameRunning = true;
        paused = false;

        // Re-lock pointer on canvas click
        document.getElementById('application-canvas').addEventListener('click', () => {
            if (gameRunning && !paused) InputSystem.requestPointerLock();
        });
    }

    // ---- VHS POST-PROCESS ----
    function setupVHSPostProcess() {
        if (!app) return;

        const camera = PlayerSystem.getCameraEntity();
        if (!camera || !camera.camera) return;

        const fragSource = document.getElementById('vhs-frag')?.textContent;
        if (!fragSource) return;

        try {
            // Define a PostEffect constructor
            function VhsPostEffect(graphicsDevice) {
                const vertSource = [
                    'attribute vec2 aPosition;',
                    'varying vec2 vUv0;',
                    'void main(void) {',
                    '    gl_Position = vec4(aPosition, 0.0, 1.0);',
                    '    vUv0 = (aPosition + 1.0) * 0.5;',
                    '}'
                ].join('\n');

                this.shader = new pc.Shader(graphicsDevice, {
                    attributes: { aPosition: pc.SEMANTIC_POSITION },
                    vshader: vertSource,
                    fshader: fragSource
                });

                this.time = 0;
                this.fearLevel = 0;
                this.jumpscare = 0;
                this.blackout = 0;
            }

            VhsPostEffect.prototype = Object.create(pc.PostEffect.prototype);
            VhsPostEffect.prototype.constructor = VhsPostEffect;

            VhsPostEffect.prototype.render = function (inputTarget, outputTarget, rect) {
                const device = this.device;
                const scope = device.scope;
                scope.resolve('uColorBuffer').setValue(inputTarget.colorBuffer);
                scope.resolve('uTime').setValue(this.time);
                scope.resolve('uFearLevel').setValue(this.fearLevel);
                scope.resolve('uJumpscare').setValue(this.jumpscare);
                scope.resolve('uBlackout').setValue(this.blackout);
                this.drawQuad(outputTarget, this.shader, rect);
            };

            vhsEffect = new VhsPostEffect(app.graphicsDevice);

            // Attach to camera's postEffects queue
            const queue = camera.camera.postEffects;
            if (queue) {
                queue.addEffect(vhsEffect);
                console.log('VHS post-process attached.');
            } else {
                console.warn('Camera postEffects queue not available.');
            }
        } catch (e) {
            console.warn('VHS shader setup failed (non-critical):', e);
            vhsEffect = null;
        }
    }

    function updateVHSUniforms(dt) {
        if (!vhsEffect) return;
        vhsEffect.time += dt;
        vhsEffect.fearLevel = PlayerSystem.getFearLevel() / 100;
        vhsEffect.jumpscare = Math.max(0, (vhsEffect.jumpscare || 0) - dt * 2);
        vhsEffect.blackout = PlayerSystem.isBlackout() ? 1.0 : 0.0;
    }

    function triggerVHSJumpscare() {
        if (vhsEffect) vhsEffect.jumpscare = 1.0;
    }

    // ---- GAME LOOP ----
    function gameLoop(dt) {
        if (paused || !gameRunning) return;

        // Clamp dt to prevent physics tunneling on lag spikes
        dt = Math.min(dt, 1 / 20);

        const playerPos = PlayerSystem.getPosition();
        const stalkerPos = AISystem.getPosition();

        // Update all systems in order
        PlayerSystem.update(dt, stalkerPos);
        AISystem.update(dt, playerPos);
        GameObjects.update(dt);
        Environment.updateStressZones(playerPos, dt);
        Environment.updateLights(dt);
        Environment.updateGlitchBiome(dt);

        // Update VHS uniforms each frame
        updateVHSUniforms(dt);

        // End-state checks
        if (PlayerSystem.hasWon()) {
            endGame('win');
        }
        if (PlayerSystem.isDead()) {
            endGame('death');
        }
    }

    // ---- PAUSE / RESUME ----
    function togglePause() {
        if (!gameRunning) return;
        if (paused) resumeGame();
        else pauseGame();
    }

    function pauseGame() {
        paused = true;
        InputSystem.setPaused(true);
        InputSystem.exitPointerLock();
        document.getElementById('pause-menu').classList.add('active');
        document.getElementById('btn-resume')._fromMainMenu = false;
        if (app) app.timeScale = 0;
    }

    function resumeGame() {
        paused = false;
        InputSystem.setPaused(false);
        InputSystem.requestPointerLock();
        document.getElementById('pause-menu').classList.remove('active');
        if (app) app.timeScale = 1;
    }

    function quitToMenu() {
        gameRunning = false;
        paused = false;
        if (app) app.timeScale = 1;
        InputSystem.setPaused(false);
        InputSystem.exitPointerLock();

        AudioSystem.stopHeartbeat();
        AudioSystem.stopGhostDirector();
        AudioSystem.stopAmbience();
        AudioSystem.stopSensor();

        document.getElementById('pause-menu').classList.remove('active');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('blackout-overlay').classList.add('hidden');
        document.getElementById('main-menu').classList.add('active');

        if (app) {
            app.off('update', gameLoop);
        }

        showLoadingState('You shouldn\'t have come here.');
    }

    function restartGame() {
        AudioSystem.stopSensor();
        document.getElementById('blackout-overlay').classList.add('hidden');

        Environment.clearRooms();
        Environment.buildAllRooms();
        GameObjects.spawnAll();
        PlayerSystem.reset();
        AISystem.reset();

        AudioSystem.startAmbience('industrial');
        PlayerSystem.setObjective('Find 3 Memory Shards scattered in the house.');

        InputSystem.requestPointerLock();
        gameRunning = true;
        paused = false;
    }

    function endGame(result) {
        gameRunning = false;
        AudioSystem.stopGhostDirector();
        AudioSystem.stopSensor();
        if (result === 'win') {
            AudioSystem.stopHeartbeat();
        }
    }

    // ---- BOOT ON LOAD ----
    window.addEventListener('DOMContentLoaded', boot);

    return {
        togglePause,
        triggerVHSJumpscare
    };
})();
