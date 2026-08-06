// Liberty City Chronicles — HUD Utilities
// Manages on-screen display elements

export class HUD {
    constructor() {
        this.elements = {
            speed: document.getElementById('txt-speed'),
            time: document.getElementById('txt-time'),
            mission: document.getElementById('txt-mission'),
            missionNum: document.getElementById('txt-mission-num'),
            gear: document.getElementById('txt-gear'),
            healthBar: document.getElementById('hud-health-bar'),
            rpmBar: document.getElementById('hud-rpm-bar'),
            gear: document.getElementById('txt-gear'),
        };
    }

    updateArmor(healthRatio) {
        if (!this.elements.healthBar) return;
        const pct = Math.max(0, Math.min(100, Math.round(healthRatio * 100)));
        this.elements.healthBar.style.width = pct + '%';
        if (pct < 30) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #d33, #f50)';
            this.elements.healthBar.style.boxShadow = '0 0 12px rgba(221,51,51,0.8)';
        } else if (pct < 65) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #f0c540, #f80)';
            this.elements.healthBar.style.boxShadow = '0 0 8px rgba(240,197,64,0.6)';
        } else {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #4c4, #8f4)';
            this.elements.healthBar.style.boxShadow = '0 0 8px rgba(68,204,68,0.5)';
        }
    }

    updateRPM(rpmRatio) {
        if (!this.elements.rpmBar) return;
        const pct = Math.max(0, Math.min(100, Math.round(rpmRatio * 100)));
        this.elements.rpmBar.style.width = pct + '%';
    }

    updateGear(speed) {
        if (!this.elements.gear) return;
        let g = '1';
        if (speed === 0) g = 'N';
        else if (speed < -0.1) g = 'R';
        else if (speed > 100) g = '5';
        else if (speed > 70) g = '4';
        else if (speed > 45) g = '3';
        else if (speed > 20) g = '2';
        this.elements.gear.textContent = g;
    }

    updateSpeed(mph) {
        this.elements.speed.innerHTML = mph + ' <small>MPH</small>';
    }
        this.elements.speed.innerHTML = mph + ' <small>MPH</small>';
    }

    updateTime(seconds) {
        const el = this.elements.time;
        el.textContent = Math.ceil(seconds);
        if (seconds < 10) {
            el.style.color = '#ff4444';
            el.style.textShadow = '0 0 12px rgba(255,68,68,0.8)';
        } else if (seconds < 20) {
            el.style.color = '#ffaa44';
            el.style.textShadow = '0 0 8px rgba(255,170,68,0.6)';
        } else {
            el.style.color = '#f0c540';
            el.style.textShadow = '0 0 8px rgba(240,197,64,0.4)';
        }
    }
        const el = this.elements.time;
        el.textContent = Math.ceil(seconds);
        if (seconds < 10) el.style.color = '#ff4444';
        else if (seconds < 20) el.style.color = '#ffaa44';
        else el.style.color = '#f0c540';
    }

    updateMission(title, distance) {
        this.elements.mission.textContent = distance !== undefined
            ? title + ' - ' + distance + 'm'
            : title;
    }

    updateMissionCount(current, total) {
        if (this.elements.missionNum) {
            this.elements.missionNum.textContent = current + '/' + total;
        }
    }
}
