// Liberty City Chronicles — HUD Utilities
// Manages on-screen display elements

export class HUD {
    constructor() {
        this.currentTheme = 'gold';
        this.elements = {}; // gold, vice, emerald
    }

    toggleTheme(audio) {
        if (this.currentTheme === 'gold') this.currentTheme = 'vice';
        else if (this.currentTheme === 'vice') this.currentTheme = 'emerald';
        else this.currentTheme = 'gold';

        this.applyTheme(this.currentTheme);
        if (audio) audio.playThemeSwitch();
        return this.currentTheme;
    }

    applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'vice') {
            root.style.setProperty('--yellow', '#ff2a8d');
            root.style.setProperty('--radar-border', 'rgba(255,42,141,0.85)');
            root.style.setProperty('--glass-border', 'rgba(255,42,141,0.25)');
        } else if (theme === 'emerald') {
            root.style.setProperty('--yellow', '#22e066');
            root.style.setProperty('--radar-border', 'rgba(34,224,102,0.85)');
            root.style.setProperty('--glass-border', 'rgba(34,224,102,0.25)');
        } else {
            root.style.setProperty('--yellow', '#f0c540');
            root.style.setProperty('--radar-border', 'rgba(242,197,64,0.8)');
            root.style.setProperty('--glass-border', 'rgba(240,197,64,0.15)');
        }
    }
    constructor() {
        this.elements = {
            speed: document.getElementById('txt-speed'),
            time: document.getElementById('txt-time'),
            mission: document.getElementById('txt-mission'),
            missionNum: document.getElementById('txt-mission-num'),
            gear: document.getElementById('txt-gear'),
            healthBar: document.getElementById('hud-health-bar'),
            rpmBar: document.getElementById('hud-rpm-bar'),
            nitroBar: document.getElementById('hud-nitro-bar'),
            clock: document.getElementById('txt-clock'),
            gear: document.getElementById('txt-gear'),
        };
    }

    updateArmor(healthRatio) {
        if (!this.elements.healthBar) return;
        const pct = Math.max(0, Math.min(100, Math.round(healthRatio * 100)));
        this.elements.healthBar.title = pct + "% ARMOR";
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

    updateClock(timeStr) {
        if (this.elements.clock) this.elements.clock.textContent = timeStr;
    }

    updateNitro(nitroRatio) {
        if (!this.elements.nitroBar) return;
        const pct = Math.max(0, Math.min(100, Math.round(nitroRatio * 100)));
        this.elements.nitroBar.style.width = pct + '%';
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
        if (mph > 120) {
            this.elements.speed.style.color = '#ff3344';
            this.elements.speed.style.textShadow = '0 0 14px rgba(255,51,68,0.8)';
        } else {
            this.elements.speed.style.color = '#ffffff';
            this.elements.speed.style.textShadow = 'none';
        }
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
        if (distance !== undefined) {
            this.elements.mission.innerHTML = `${title} &bull; <span class="dist-badge">${distance}m</span>`;
        } else {
            this.elements.mission.textContent = title;
        }
    }
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
