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
