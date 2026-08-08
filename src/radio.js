// Liberty City Chronicles — Procedural Retro FM Radio Synthesizer
// Synthesizes retro synth basslines, leads, and drum pulses

export class RadioManager {
    constructor(audioCtx) {
        this.ctx = audioCtx;
        this.stations = [
            { name: 'OFF', genre: 'Muted' },
            { name: 'FLASHBACK FM', genre: '80s Synthwave' },
            { name: 'HEAD RADIO', genre: 'Liberty Funk' },
            { name: 'RISE FM', genre: 'Atmospheric Techno' }
        ];
        this.currentStation = 1; // Default to Flashback FM
        this.isPlaying = false;
        this.step = 0;
        this.timer = null;
    }

    setAudioContext(ctx) {
        this.ctx = ctx;
    }

    toggleStation() {
        this.currentStation = (this.currentStation + 1) % this.stations.length;
        if (this.currentStation === 0) {
            this.stop();
        } else {
            this.start();
        }
        return this.stations[this.currentStation];
    }

    start() {
        if (this.currentStation === 0 || this.isPlaying) return;
        this.isPlaying = true;
        this._scheduleNote();
    }

    _scheduleNote() {
        if (!this.isPlaying || !this.ctx || this.currentStation === 0) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const station = this.currentStation;

        if (station === 1) {
            // Flashback FM: 80s Synthwave bassline
            const bassNotes = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 98];
            const freq = bassNotes[this.step % bassNotes.length];
            this._playSynthBass(freq, now, 0.18);
        } else if (station === 2) {
            // Head Radio: Funky staccato groove
            const funkNotes = [130.81, 164.81, 196.00, 220.00, 196.00, 164.81];
            const freq = funkNotes[this.step % funkNotes.length];
            this._playFunkPluck(freq, now, 0.12);
        } else if (station === 3) {
            // Rise FM: Deep techno kick & sub
            const technoNotes = [55, 55, 65.41, 55, 55, 73.42, 55, 82.41];
            const freq = technoNotes[this.step % technoNotes.length];
            this._playTechnoSub(freq, now, 0.22);
        }

        this.step++;
        this.timer = setTimeout(() => this._scheduleNote(), 175);
    }

    _playSynthBass(freq, time, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.045, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    }

    _playFunkPluck(freq, time, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    }

    _playTechnoSub(freq, time, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.07, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) clearTimeout(this.timer);
    }
}
