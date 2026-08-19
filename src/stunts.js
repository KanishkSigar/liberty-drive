// Liberty City Chronicles — Stunt Jump & Speed Trap Tracker
// Monitors vehicle airtime, jump distance, and high-speed drift awards

export class StuntManager {
    constructor() {
        this.airtime = 0;
        this.isAirborne = false;
        this.stuntScore = 0;
        this.element = document.getElementById('hud-stunt');
        this.scoreEl = document.getElementById('txt-stunt-score');
    }

    update(carSpeed, isCollided, dt) {
        // Airborne detection: high speed without ground resistance
        if (Math.abs(carSpeed) > 70 && !isCollided && Math.random() < 0.1) {
            this.airtime += dt;
            if (this.airtime > 0.35) {
                this.isAirborne = true;
                this._showStuntBanner();
            }
        } else {
            if (this.isAirborne && this.airtime > 0.6) {
                this._awardStunt();
            }
            this.airtime = 0;
            this.isAirborne = false;
        }
    }

    _showStuntBanner() {
        if (this.element) {
            this.element.classList.remove('hidden');
            if (this.scoreEl) this.scoreEl.textContent = `AIRTIME: ${this.airtime.toFixed(1)}s`;
        }
    }

    _awardStunt() {
        const bonus = Math.round(this.airtime * 380);
        this.stuntScore += bonus;
        if (this.element) {
            if (this.scoreEl) this.scoreEl.textContent = `INSANE STUNT BONUS! +${bonus} PTS`;
            setTimeout(() => {
                if (this.element) this.element.classList.add('hidden');
            }, 2800);
        }
    }
}
