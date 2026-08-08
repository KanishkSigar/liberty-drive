// Liberty City Chronicles — Police Wanted Level System
// Manages crime heat points, wanted star levels, and pursuit AI state

export class WantedManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.stars = 0; // 0 to 3 stars
        this.heat = 0; // Heat points (0 to 100)
        this.policeCars = [];
        this.elements = {
            container: document.getElementById('hud-wanted'),
            stars: document.querySelectorAll('.wanted-star')
        };
    }

    addHeat(amount) {
        this.heat = Math.min(100, this.heat + amount);
        this._updateStars();
    }

    coolDown(dt) {
        if (this.heat > 0) {
            this.heat = Math.max(0, this.heat - dt * 2.5);
            this._updateStars();
        }
    }

    _updateStars() {
        let prevStars = this.stars;
        if (this.heat >= 75) this.stars = 3;
        else if (this.heat >= 40) this.stars = 2;
        else if (this.heat >= 15) this.stars = 1;
        else this.stars = 0;

        if (this.elements.stars) {
            this.elements.stars.forEach((star, idx) => {
                if (idx < this.stars) star.classList.add('active');
                else star.classList.remove('active');
            });
        }
    }

    reset() {
        this.heat = 0;
        this.stars = 0;
        this._updateStars();
        this.policeCars.forEach(p => this.scene.remove(p.mesh));
        this.policeCars = [];
    }
}
