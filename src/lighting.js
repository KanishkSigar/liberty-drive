// Liberty City Chronicles — Dynamic Celestial Lighting Manager
// Controls sun/moon orbital trajectory, sky gradient transitions, and street lamp glows

export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.time = 0.35; // 0.0 (midnight) to 1.0 (midnight next day)
        this.speed = 0.0095; // Day length speed
        this.sun = null;
        this.ambient = null;
        this.hemi = null;
    }

    init(sun, ambient, hemi) {
        this.sun = sun;
        this.ambient = ambient;
        this.hemi = hemi;
    }

    update(dt) {
        this.time = (this.time + this.speed * dt) % 1.0;
        const angle = this.time * Math.PI * 2;

        // Orbital sun position
        if (this.sun) {
            this.sun.position.x = Math.cos(angle) * 220;
            this.sun.position.y = Math.sin(angle) * 260;
            this.sun.position.z = Math.sin(angle * 0.5) * 120;

            const isDay = Math.sin(angle) > 0;
            this.sun.intensity = isDay ? Math.sin(angle) * 0.75 : 0.05;
        }

        // Ambient sky tint modulation
        if (this.ambient) {
            const isDay = Math.sin(angle) > 0;
            const ambColor = isDay ? 0x556677 : 0x141824;
            this.ambient.color.setHex(ambColor);
            this.ambient.intensity = isDay ? 0.42 : 0.19;
        }
    }

    getFormattedTime() {
        const totalMinutes = Math.floor(this.time * 24 * 60);
        const hours24 = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const period = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12;
        return `${String(hours12).padStart(2,'0')}:${String(mins).padStart(2,'0')} ${period}`;
    }
}
