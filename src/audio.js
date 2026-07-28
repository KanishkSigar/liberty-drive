// Liberty City Chronicles — Web Audio Synthesizer Engine
// Procedural audio generator for vehicle engine, horn, braking, collision thud, and mission pickup chime

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.isMuted = false;
        this.currentGear = 1;
        this.initialized = false;

        // Auto initialize audio context on user interaction
        const init = () => {
            if (this.initialized) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this._initEngineSynth();
                    this.initialized = true;
                }
            } catch (e) {
                console.warn('Web Audio not supported:', e);
            }
            window.removeEventListener('keydown', init);
            window.removeEventListener('click', init);
        };

        window.addEventListener('keydown', init);
        window.addEventListener('click', init);
    }

    _initEngineSynth() {
        if (!this.ctx) return;
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Base idle RPM

        this.engineGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();
    }

    playSqueal() {
        if (!this.initialized || !this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    updateEngine(mph, isAccelerating) {
        if (!this.initialized || !this.ctx || this.isMuted) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Calculate pitch based on speed
        const pitch = 50 + (mph * 2.6) + (isAccelerating ? 18 : 0);
        const gain = 0.03 + Math.min(0.08, mph * 0.001) + (isAccelerating ? 0.04 : 0);

        this.engineOsc.frequency.setTargetAtTime(pitch, this.ctx.currentTime, 0.08);
        this.engineGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
    }

    playHorn() {
        if (!this.initialized || !this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sawtooth';

        osc1.frequency.setValueAtTime(425, now); // G#4
        osc2.frequency.setValueAtTime(520, now); // C5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
    }

    playShift() {
        if (!this.initialized || !this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playCrash() {
        if (!this.initialized || !this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        // Noise buffer for impact thud
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) this.stopEngine();
        return this.isMuted;
    }

    playPickup() {
        if (!this.initialized || !this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.1, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
        });
    }

    stopEngine() {
        if (this.engineGain && this.ctx) {
            this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        }
    }
}
