/* ============================================
   INPUT SYSTEM — Keybinding, Mouse, Remapping
   ============================================ */

const InputSystem = (() => {
    // Default keybindings (stored as KeyboardEvent.code)
    const DEFAULT_BINDINGS = {
        forward: 'KeyW',
        backward: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        sprint: 'ShiftLeft',
        interact: 'KeyE',
        flashlight: 'KeyF',
        sensor: 'KeyQ'
    };

    let bindings = {};
    let keysDown = {};
    let mouseDX = 0, mouseDY = 0;
    let sensitivity = 10;
    let remapCallback = null;
    let remapAction = null;
    let paused = false;
    let pointerLocked = false;

    function init() {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('hh_keybindings');
        if (saved) {
            try { bindings = JSON.parse(saved); } catch (e) { bindings = { ...DEFAULT_BINDINGS }; }
        } else {
            bindings = { ...DEFAULT_BINDINGS };
        }

        const savedSens = localStorage.getItem('hh_sensitivity');
        if (savedSens) sensitivity = parseFloat(savedSens);

        // Keyboard
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Mouse
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('pointerlockchange', onPointerLockChange);

        // Init UI
        updateKeybindUI();
        const slider = document.getElementById('sensitivity-slider');
        if (slider) {
            slider.value = sensitivity;
            document.getElementById('sensitivity-value').textContent = sensitivity;
            slider.addEventListener('input', (e) => {
                sensitivity = parseFloat(e.target.value);
                document.getElementById('sensitivity-value').textContent = sensitivity;
                localStorage.setItem('hh_sensitivity', sensitivity);
            });
        }

        // Volume slider
        const volSlider = document.getElementById('volume-slider');
        if (volSlider) {
            const savedVol = localStorage.getItem('hh_volume');
            if (savedVol) volSlider.value = savedVol;
            document.getElementById('volume-value').textContent = volSlider.value;
            volSlider.addEventListener('input', (e) => {
                document.getElementById('volume-value').textContent = e.target.value;
                AudioSystem.setMasterVolume(parseFloat(e.target.value) / 100);
                localStorage.setItem('hh_volume', e.target.value);
            });
        }

        // Keybind buttons
        document.querySelectorAll('.keybind-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (remapAction) cancelRemap();
                remapAction = btn.dataset.action;
                btn.classList.add('listening');
                btn.textContent = '...';
                remapCallback = (code) => {
                    bindings[remapAction] = code;
                    localStorage.setItem('hh_keybindings', JSON.stringify(bindings));
                    updateKeybindUI();
                    btn.classList.remove('listening');
                    remapAction = null;
                    remapCallback = null;
                };
            });
        });
    }

    function cancelRemap() {
        if (remapAction) {
            document.querySelectorAll('.keybind-btn').forEach(b => b.classList.remove('listening'));
            updateKeybindUI();
            remapAction = null;
            remapCallback = null;
        }
    }

    function updateKeybindUI() {
        document.querySelectorAll('.keybind-btn').forEach(btn => {
            const action = btn.dataset.action;
            if (bindings[action]) {
                btn.textContent = codeToLabel(bindings[action]);
            }
        });
    }

    function codeToLabel(code) {
        const map = {
            'ShiftLeft': 'SHIFT', 'ShiftRight': 'RSHIFT',
            'ControlLeft': 'CTRL', 'Space': 'SPACE',
            'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→'
        };
        if (map[code]) return map[code];
        return code.replace('Key', '').replace('Digit', '');
    }

    function onKeyDown(e) {
        if (remapCallback) {
            remapCallback(e.code);
            e.preventDefault();
            return;
        }
        keysDown[e.code] = true;

        // Pause toggle
        if (e.code === 'Escape') {
            if (typeof GameMain !== 'undefined') GameMain.togglePause();
        }
    }

    function onKeyUp(e) {
        keysDown[e.code] = false;
    }

    function onMouseMove(e) {
        if (!pointerLocked || paused) return;
        mouseDX += e.movementX || 0;
        mouseDY += e.movementY || 0;
    }

    function onPointerLockChange() {
        pointerLocked = !!document.pointerLockElement;
    }

    function consumeMouse() {
        const dx = mouseDX;
        const dy = mouseDY;
        mouseDX = 0;
        mouseDY = 0;
        return { dx: dx * sensitivity * 0.002, dy: dy * sensitivity * 0.002 };
    }

    function isAction(action) {
        return !!keysDown[bindings[action]];
    }

    function requestPointerLock() {
        const canvas = document.getElementById('application-canvas');
        if (canvas && canvas.requestPointerLock) canvas.requestPointerLock();
    }

    function exitPointerLock() {
        if (document.exitPointerLock) document.exitPointerLock();
    }

    function setPaused(v) { paused = v; }
    function isPointerLocked() { return pointerLocked; }
    function getSensitivity() { return sensitivity; }

    return {
        init,
        consumeMouse,
        isAction,
        requestPointerLock,
        exitPointerLock,
        setPaused,
        isPointerLocked,
        getSensitivity
    };
})();
