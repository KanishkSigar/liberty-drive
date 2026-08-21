// Liberty City Chronicles — Traffic Signal Lights Controller
// Manages 3-stage traffic lights (Red, Yellow, Green) and intersection signal states

export class TrafficLightManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.signals = [];
        this.timer = 0;
        this.state = 'GREEN'; // GREEN, YELLOW, RED
        this._buildSignals();
    }

    _buildSignals() {
        const total = this.city.gridN * this.city.step;
        const half = total / 2;

        for (let ix = 0; ix < this.city.gridN; ix++) {
            for (let iz = 0; iz < this.city.gridN; iz++) {
                const rx = -half + ix * this.city.step + this.city.roadW / 2;
                const rz = -half + iz * this.city.step + this.city.roadW / 2;

                const grp = new THREE.Group();
                const poleMat = new THREE.MeshStandardMaterial({ color: 0x333338, roughness: 0.5, metalness: 0.3 });

                // Signal pole
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 14, 8), poleMat);
                pole.position.y = 7;
                grp.add(pole);

                // Signal Housing
                const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 1.2), poleMat);
                box.position.set(0, 12, 0);
                grp.add(box);

                // Lenses (Red, Yellow, Green)
                const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
                redLens.position.set(0, 12.8, 0.61);
                grp.add(redLens);

                const yelLens = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0x443300 }));
                yelLens.position.set(0, 12.0, 0.61);
                grp.add(yelLens);

                const grnLens = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0x004411 }));
                grnLens.position.set(0, 11.2, 0.61);
                grp.add(grnLens);

                grp.position.set(rx, 0, rz);
                this.scene.add(grp);

                this.signals.push({
                    mesh: grp,
                    redLens,
                    yelLens,
                    grnLens,
                    x: rx,
                    z: rz
                });
            }
        }
    }

    update(dt, audio) {
        this.timer += dt;

        let prevState = this.state;
        if (this.timer < 10.0) {
            this.state = 'GREEN';
        } else if (this.timer < 13.0) {
            this.state = 'YELLOW';
        } else if (this.timer < 22.0) {
            this.state = 'RED';
        } else {
            this.timer = 0;
            this.state = 'GREEN';
        }

        if (this.state !== prevState) {
            this._updateLenses();
            if (audio) audio.playSignalClick();
        }
    }

    _updateLenses() {
        this.signals.forEach(s => {
            if (this.state === 'GREEN') {
                s.redLens.material.color.setHex(0x440000);
                s.yelLens.material.color.setHex(0x443300);
                s.grnLens.material.color.setHex(0x22cc55);
                s.grnLens.material.emissive = new THREE.Color(0x22cc55);
            } else if (this.state === 'YELLOW') {
                s.redLens.material.color.setHex(0x440000);
                s.yelLens.material.color.setHex(0xffaa00);
                s.yelLens.material.emissive = new THREE.Color(0xffaa00);
                s.grnLens.material.color.setHex(0x004411);
            } else if (this.state === 'RED') {
                s.redLens.material.color.setHex(0xff2222);
                s.redLens.material.emissive = new THREE.Color(0xff2222);
                s.yelLens.material.color.setHex(0x443300);
                s.grnLens.material.color.setHex(0x004411);
            }
        });
    }
}
