// Liberty City Chronicles — Weather & Day/Night System
// Controls sky color, fog density, sun lighting, and ambient atmosphere

export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.current = 'overcast'; // clear, overcast, foggy, night
        this.timeOfDay = 0.5; // 0.0 (midnight) to 1.0 (noon)
        this.cycleSpeed = 0.005; // speed of day/night progression
        this.autoCycle = true;
    }

    setWeather(type) {
        this.current = type;
    }

    update(dt) {
        if (this.autoCycle) {
            this.timeOfDay = (this.timeOfDay + this.cycleSpeed * dt) % 1.0;
        }

        // Atmosphere modulation based on time of day and weather mode
        switch (this.current) {
            case 'clear':
                this.scene.fog.near = 150;
                this.scene.fog.far = 600;
                break;
            case 'overcast':
                this.scene.fog.near = 125;
                this.scene.fog.far = 580;
                break;
            case 'foggy':
                this.scene.fog.near = 35;
                this.scene.fog.far = 220;
                break;
            case 'night':
                this.scene.fog.near = 60;
                this.scene.fog.far = 380;
                break;
        }
    }
}
