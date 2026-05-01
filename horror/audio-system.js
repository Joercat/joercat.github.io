/* ============================================
   AUDIO SYSTEM — Procedural Sound, "The Creak"
   System, Heartbeat, Ghost Director, Sensor
   ============================================ */

const AudioSystem = (() => {
    let ctx = null;
    let masterGain = null;
    let initialized = false;
    let heartbeatTimeout = null;
    let heartbeatBPM = 60;
    let ghostDirectorTimeout = null;
    let ambienceNode = null;
    let ambienceGain = null;

    // Sensor state
    let sensorBeepInterval = null;
    let sensorDistance = 999;

    function init() {
        if (initialized) return;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.7;
            masterGain.connect(ctx.destination);
            initialized = true;
            console.log('AudioContext initialized, sampleRate:', ctx.sampleRate);
        } catch (e) {
            console.warn('AudioContext failed:', e);
        }
    }

    function setMasterVolume(v) {
        if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
    }

    // ---- NOISE BUFFER GENERATORS ----
    function createNoiseBuffer(duration, type) {
        if (!ctx) return null;
        const sampleRate = ctx.sampleRate;
        const length = Math.floor(sampleRate * duration);
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        } else if (type === 'brown') {
            let last = 0;
            for (let i = 0; i < length; i++) {
                const w = Math.random() * 2 - 1;
                data[i] = (last + 0.02 * w) / 1.02;
                last = data[i];
                data[i] *= 3.5;
            }
        } else if (type === 'pink') {
            // Simple pink noise approximation
            let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
            for (let i = 0; i < length; i++) {
                const w = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + w * 0.0555179;
                b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.96900 * b2 + w * 0.1538520;
                b3 = 0.86650 * b3 + w * 0.3104856;
                b4 = 0.55000 * b4 + w * 0.5329522;
                b5 = -0.7616 * b5 - w * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
                b6 = w * 0.115926;
            }
        }
        return buffer;
    }

    // ---- PLAY A TONE ----
    function playTone(freq, duration, vol, type = 'sine', pan = 0) {
        if (!ctx || !masterGain) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        panner.pan.value = Math.max(-1, Math.min(1, pan));

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(masterGain);
        osc.start(now);
        osc.stop(now + duration + 0.01);
    }

    // ---- FOOTSTEP SOUNDS (Floor-tagged) ----
    function playFootstep(floorType) {
        if (!ctx) return;
        const pitchVar = 0.8 + Math.random() * 0.4; // ±20% pitch variance

        switch (floorType) {
            case 'wood': {
                // Creaky wood — resonant bandpass filtered noise
                const buf = createNoiseBuffer(0.3, 'brown');
                if (!buf) return;
                const src = ctx.createBufferSource();
                src.buffer = buf;
                src.playbackRate.value = pitchVar;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 250 + Math.random() * 500;
                filter.Q.value = 6 + Math.random() * 12;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
                src.connect(filter); filter.connect(gain); gain.connect(masterGain);
                src.start();

                // Occasional extra creak overtone
                if (Math.random() > 0.5) {
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.value = 400 + Math.random() * 300;
                    const g2 = ctx.createGain();
                    g2.gain.setValueAtTime(0.04, ctx.currentTime);
                    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    osc.connect(g2); g2.connect(masterGain);
                    osc.start(); osc.stop(ctx.currentTime + 0.16);
                }
                break;
            }
            case 'metal': {
                // Metallic ring
                playTone(700 * pitchVar, 0.12, 0.06, 'square');
                playTone(1400 * pitchVar, 0.08, 0.04, 'sawtooth');
                // Impact thud
                playTone(80, 0.08, 0.08, 'sine');
                break;
            }
            case 'organic': {
                // Crunchy leaf/dirt
                const buf = createNoiseBuffer(0.18, 'white');
                if (!buf) return;
                const src = ctx.createBufferSource();
                src.buffer = buf;
                src.playbackRate.value = pitchVar * 0.5;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1200 + Math.random() * 600;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                src.connect(filter); filter.connect(gain); gain.connect(masterGain);
                src.start();
                break;
            }
            default: {
                // Concrete / generic
                const buf = createNoiseBuffer(0.1, 'white');
                if (!buf) return;
                const src = ctx.createBufferSource();
                src.buffer = buf;
                src.playbackRate.value = pitchVar * 0.4;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 700;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
                src.connect(filter); filter.connect(gain); gain.connect(masterGain);
                src.start();
                break;
            }
        }
    }

    // ---- HEARTBEAT (Dynamic BPM: 60→180) ----
    function startHeartbeat() {
        if (heartbeatTimeout) return;
        heartbeatBPM = 60;

        const beat = () => {
            if (!ctx) return;
            // Double-thump heartbeat
            const now = ctx.currentTime;

            // Thump 1
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine'; osc1.frequency.value = 55;
            const g1 = ctx.createGain();
            g1.gain.setValueAtTime(0.2, now);
            g1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc1.connect(g1); g1.connect(masterGain);
            osc1.start(now); osc1.stop(now + 0.11);

            // Thump 2 (slightly delayed, slightly lower)
            const osc2 = ctx.createOscillator();
            osc2.type = 'sine'; osc2.frequency.value = 45;
            const g2 = ctx.createGain();
            g2.gain.setValueAtTime(0.15, now + 0.12);
            g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc2.connect(g2); g2.connect(masterGain);
            osc2.start(now + 0.12); osc2.stop(now + 0.23);

            // Schedule next beat
            const interval = (60 / heartbeatBPM) * 1000;
            heartbeatTimeout = setTimeout(beat, interval);
        };

        heartbeatTimeout = setTimeout(beat, 1000);
    }

    function stopHeartbeat() {
        if (heartbeatTimeout) { clearTimeout(heartbeatTimeout); heartbeatTimeout = null; }
    }

    function setHeartbeatBPM(bpm) {
        heartbeatBPM = Math.max(40, Math.min(200, bpm));
    }

    // ---- GHOST DIRECTOR (Random spatial stingers every 30-90s) ----
    function startGhostDirector() {
        stopGhostDirector();
        const scheduleNext = () => {
            const delay = 30000 + Math.random() * 60000;
            ghostDirectorTimeout = setTimeout(() => {
                playStinger();
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }

    function stopGhostDirector() {
        if (ghostDirectorTimeout) { clearTimeout(ghostDirectorTimeout); ghostDirectorTimeout = null; }
    }

    function playStinger() {
        if (!ctx) return;
        const type = Math.floor(Math.random() * 5);
        const pan = Math.random() * 2 - 1;

        switch (type) {
            case 0: {
                // Whisper — shaped noise
                const buf = createNoiseBuffer(2, 'brown');
                if (!buf) return;
                const src = ctx.createBufferSource(); src.buffer = buf;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1800 + Math.random() * 1200;
                filter.Q.value = 12 + Math.random() * 8;
                const gain = ctx.createGain();
                const panner = ctx.createStereoPanner(); panner.pan.value = pan;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.4);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
                src.connect(filter); filter.connect(gain); gain.connect(panner); panner.connect(masterGain);
                src.start();
                break;
            }
            case 1: {
                // Distant bang
                playTone(55, 0.35, 0.3, 'square', pan);
                playTone(30, 0.6, 0.15, 'sine', pan);
                break;
            }
            case 2: {
                // Scratching in walls
                const buf = createNoiseBuffer(2.5, 'white');
                if (!buf) return;
                const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = 0.25;
                const filter = ctx.createBiquadFilter();
                filter.type = 'highpass'; filter.frequency.value = 2500;
                const gain = ctx.createGain();
                const panner = ctx.createStereoPanner(); panner.pan.value = pan;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.6);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.2);
                src.connect(filter); filter.connect(gain); gain.connect(panner); panner.connect(masterGain);
                src.start();
                break;
            }
            case 3: {
                // Low sub-bass drone
                playTone(30 + Math.random() * 25, 4, 0.08, 'sawtooth', pan);
                break;
            }
            case 4: {
                // Dissonant chime
                const f = 300 + Math.random() * 200;
                playTone(f, 1.5, 0.06, 'sine', pan);
                playTone(f * 1.059, 1.2, 0.04, 'sine', pan); // minor 2nd = creepy
                break;
            }
        }
    }

    // ---- AMBIENCE LOOP ----
    function startAmbience(biome) {
        stopAmbience();
        if (!ctx) return;

        const buf = createNoiseBuffer(6, 'brown');
        if (!buf) return;
        ambienceNode = ctx.createBufferSource();
        ambienceNode.buffer = buf;
        ambienceNode.loop = true;

        const filter = ctx.createBiquadFilter();
        ambienceGain = ctx.createGain();

        switch (biome) {
            case 'industrial':
                filter.type = 'lowpass'; filter.frequency.value = 350;
                ambienceGain.gain.value = 0.04;
                ambienceNode.playbackRate.value = 0.4;
                break;
            case 'overgrown':
                filter.type = 'bandpass'; filter.frequency.value = 600; filter.Q.value = 2;
                ambienceGain.gain.value = 0.035;
                ambienceNode.playbackRate.value = 0.3;
                break;
            case 'glitch':
                filter.type = 'highpass'; filter.frequency.value = 1500;
                ambienceGain.gain.value = 0.05;
                ambienceNode.playbackRate.value = 1.2;
                break;
            default:
                filter.type = 'lowpass'; filter.frequency.value = 400;
                ambienceGain.gain.value = 0.035;
                break;
        }

        ambienceNode.connect(filter);
        filter.connect(ambienceGain);
        ambienceGain.connect(masterGain);
        ambienceNode.start();
    }

    function stopAmbience() {
        if (ambienceNode) {
            try { ambienceNode.stop(); } catch (e) {}
            ambienceNode = null;
            ambienceGain = null;
        }
    }

    // ---- SENSOR (proximity beep) ----
    function startSensor() {
        stopSensor();
        sensorDistance = 999;

        // Beep at intervals that decrease with proximity
        const beepOnce = () => {
            if (!ctx || !masterGain) return;
            const maxDist = 40;
            const ratio = Math.max(0, Math.min(1, 1 - sensorDistance / maxDist));
            if (ratio > 0.01) {
                const freq = 800 + ratio * 1000;
                const vol = 0.03 + ratio * 0.12;
                playTone(freq, 0.05, vol, 'sine');
            }
            // Next beep: 800ms when far, 80ms when very close
            const nextDelay = 800 - ratio * 720;
            sensorBeepInterval = setTimeout(beepOnce, Math.max(60, nextDelay));
        };
        sensorBeepInterval = setTimeout(beepOnce, 500);
    }

    function updateSensor(distance) {
        sensorDistance = distance;
    }

    function stopSensor() {
        if (sensorBeepInterval) {
            clearTimeout(sensorBeepInterval);
            sensorBeepInterval = null;
        }
    }

    // ---- JUMPSCARE BURST ----
    function playJumpscare() {
        if (!ctx) return;
        // Static noise burst
        const buf = createNoiseBuffer(0.6, 'white');
        if (buf) {
            const src = ctx.createBufferSource(); src.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.45, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            src.connect(gain); gain.connect(masterGain);
            src.start();
        }
        // Low boom
        playTone(28, 0.9, 0.4, 'sine');
        playTone(50, 0.6, 0.3, 'square');
        // High screech
        playTone(2000, 0.3, 0.15, 'sawtooth');

        // Trigger VHS jumpscare
        if (typeof GameMain !== 'undefined') GameMain.triggerVHSJumpscare();
    }

    // ---- UI SOUNDS ----
    function playPickup() {
        if (!ctx) return;
        playTone(600, 0.08, 0.1, 'sine');
        setTimeout(() => playTone(900, 0.12, 0.08, 'sine'), 80);
        setTimeout(() => playTone(1200, 0.1, 0.06, 'sine'), 160);
    }

    function playError() {
        if (!ctx) return;
        playTone(200, 0.15, 0.1, 'square');
        setTimeout(() => playTone(150, 0.2, 0.08, 'square'), 100);
    }

    function playUnlock() {
        if (!ctx) return;
        playTone(500, 0.08, 0.1, 'sine');
        setTimeout(() => playTone(700, 0.08, 0.1, 'sine'), 100);
        setTimeout(() => playTone(1000, 0.15, 0.12, 'sine'), 200);
    }

    function playBlackoutAlarm() {
        if (!ctx) return;
        playTone(180, 0.4, 0.25, 'sawtooth');
        setTimeout(() => playTone(280, 0.4, 0.25, 'sawtooth'), 450);
        setTimeout(() => playTone(180, 0.4, 0.2, 'sawtooth'), 900);
    }

    return {
        init,
        setMasterVolume,
        playFootstep,
        startHeartbeat,
        stopHeartbeat,
        setHeartbeatBPM,
        startGhostDirector,
        stopGhostDirector,
        playStinger,
        startAmbience,
        stopAmbience,
        startSensor,
        updateSensor,
        stopSensor,
        playJumpscare,
        playPickup,
        playError,
        playUnlock,
        playBlackoutAlarm
    };
})();
