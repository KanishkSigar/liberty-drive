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
        };
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

    updateTime(seconds) {
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
