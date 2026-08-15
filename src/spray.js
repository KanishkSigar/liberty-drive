// Liberty City Chronicles — Pay 'n' Spray Repair & Respray Garages
// Restores vehicle armor, clears wanted heat levels, and applies fresh paint coats

export class SprayGarageManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.garages = [
            { x: -140, z: -140, w: 24, d: 24, name: 'PORTLAND DOCKS SPRAY' },
            { x: 140, z: 140, w: 24, d: 24, name: 'HEPBURN HEIGHTS SPRAY' }
            { x: -140, z: -140, w: 22, d: 22, name: 'PORTLAND DOCKS SPRAY' },
            { x: 140, z: 140, w: 22, d: 22, name: 'HEPBURN HEIGHTS SPRAY' }
            
        ];
        this.resprayColors = [0x00d2ff, 0xff3344, 0x22cc55, 0x991111, 0x113388, 0x116633, 0xddaa11, 0x441166, 0x111111, 0xcccccc];
        this.isRespraying = false;
        this.resprayTimer = 0;
        this.activeGarage = null;
        this.hudBanner = document.getElementById('hud-respray');
        this._buildGarages();
    }

    _buildGarages() {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.8 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.55, metalness: 0.35 });
        const signMat = new THREE.MeshBasicMaterial({ color: 0xf0c540 });

        this.garages.forEach(g => {
            const grp = new THREE.Group();
            // Garage building structure
            const bldg = new THREE.Mesh(new THREE.BoxGeometry(g.w, 8, g.d), wallMat);
            bldg.position.y = 4;
            grp.add(bldg);

            // Roof
            const roof = new THREE.Mesh(new THREE.BoxGeometry(g.w + 2, 1, g.d + 2), roofMat);
            roof.position.y = 8.5;
            grp.add(roof);

            // Glowing Pay 'n' Spray sign
            const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 1.8, 0.4), signMat);
            sign.position.set(0, 7, g.d / 2 + 0.3);
            grp.add(sign);

            grp.position.set(g.x, 0, g.z);
            this.scene.add(grp);
            g.mesh = grp;
        });
    }

    checkEntrance(car, wanted, audio, dt) {
        if (this.isRespraying) {
            this.resprayTimer -= dt;
            if (this.resprayTimer <= 0) {
                this.isRespraying = false;
                this._finishRespray(car, wanted);
            }
            return true;
        }

        for (let i = 0; i < this.garages.length; i++) {
            const g = this.garages[i];
            const dx = car.x - g.x;
            const dz = car.z - g.z;
            if (Math.abs(dx) < g.w / 2 && Math.abs(dz) < g.d / 2) {
                if (!this.isRespraying && (car.health < car.maxHealth || wanted.stars > 0)) {
                    this._startRespray(g, car, audio);
                    return true;
                }
            }
        }
        return false;
    }

    _startRespray(garage, car, audio) {
        this.isRespraying = true;
        this.resprayTimer = 1.9;
        this.activeGarage = garage;
        car.speed = 0;
        if (audio) audio.playSprayPaint();
        if (this.hudBanner) {
            this.hudBanner.classList.remove('hidden');
            const txt = document.getElementById('txt-respray-title');
            if (txt) txt.textContent = `RESPRAYING AT ${garage.name}...`;
        }
    }

    _finishRespray(car, wanted) {
        car.health = car.maxHealth;
        wanted.reset();
        car.tiresPopped = false;
        car.maxSpeed = 138;
        car.accelForce = 110;
        const newColor = this.resprayColors[Math.floor(Math.random() * this.resprayColors.length)];
        car.bodyMat.color.setHex(newColor);
        if (this.hudBanner) {
            const txt = document.getElementById('txt-respray-title');
            if (txt) txt.textContent = 'VEHICLE REPAIRED & HEAT CLEARED! ($100)';
            setTimeout(() => {
                if (this.hudBanner) this.hudBanner.classList.add('hidden');
            }, 2500);
        }
    }
}
