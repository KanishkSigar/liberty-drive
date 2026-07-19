// Liberty City Chronicles — Weather System
// Controls sky color, fog density, and ambient lighting

export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.current = 'overcast'; // clear, overcast, foggy
        this.transitionSpeed = 0.001;
    }

    setWeather(type) {
        this.current = type;
    }

    update(dt) {
        // Future: animate weather transitions
        switch (this.current) {
            case 'clear':
                this.scene.fog.near = 150;
                this.scene.fog.far = 600;
                break;
            case 'overcast':
                this.scene.fog.near = 100;
                this.scene.fog.far = 500;
                break;
            case 'foggy':
                this.scene.fog.near = 40;
                this.scene.fog.far = 250;
                break;
        }
    }
}
