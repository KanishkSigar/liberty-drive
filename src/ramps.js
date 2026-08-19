// Liberty City Chronicles — Mega Stunt Ramp System
// Spawns physical jump launch platforms with neon chevrons across key city locations

export class StuntRampManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.ramps = [
            { x: -80, z: 40, angle: 0, w: 12, h: 4.5, d: 18, name: 'PORTLAND PIER JUMP' },
            { x: 80, z: -80, angle: Math.PI / 2, w: 12, h: 4.5, d: 18, name: 'HEIGHTS ALLEY LAUNCH' },
            { x: 0, z: 120, angle: Math.PI, w: 12, h: 5.0, d: 20, name: 'HARBOR BRIDGE MEGA RAMP' }
        ];
        this._buildRamps();
    }

    _buildRamps() {
        const rampMat = new THREE.MeshStandardMaterial({ color: 0x282830, roughness: 0.7 });
        const chevronMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

        this.ramps.forEach(r => {
            const grp = new THREE.Group();

            // Sloped ramp structure
            const geo = new THREE.BoxGeometry(r.w, r.h, r.d);
            const mesh = new THREE.Mesh(geo, rampMat);
            mesh.position.set(0, r.h / 2, 0);
            mesh.rotation.x = -0.26; // Launch incline
            grp.add(mesh);

            // Glowing neon hazard arrow stripes
            const arrowGeo = new THREE.BoxGeometry(r.w * 0.85, 0.22, 1.5);
            for (let k = 0; k < 3; k++) {
                const arrow = new THREE.Mesh(arrowGeo, chevronMat);
                arrow.position.set(0, (k + 1) * 1.1, (k - 1) * 4.5);
                arrow.rotation.x = -0.24;
                grp.add(arrow);
            }

            grp.position.set(r.x, 0, r.z);
            grp.rotation.y = r.angle;
            this.scene.add(grp);
            r.mesh = grp;
        });
    }

    checkRampLaunch(car, audio, dt) {
        if (Math.abs(car.speed) < 35) return false;

        for (let i = 0; i < this.ramps.length; i++) {
            const r = this.ramps[i];
            const dx = car.x - r.x;
            const dz = car.z - r.z;
            if (Math.abs(dx) < r.w / 2 && Math.abs(dz) < r.d / 2) {
                // Launch boost
                if (audio) audio.playRampLaunch();
                return true;
            }
        }
        return false;
    }
}
