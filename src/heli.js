// Liberty City Chronicles — Police Air Support Helicopter
// Spawns overhead LCPD chopper with spotlight tracking and rotor dynamics

export class HelicopterManager {
    constructor(scene) {
        this.scene = scene;
        this.heli = null;
        this.rotor = null;
        this.spotlight = null;
        this.active = false;
        this.rotorSpeed = 0;
        this.x = 0;
        this.z = 0;
        this.altitude = 48;
    }

    spawn(playerX, playerZ) {
        if (this.active) return;
        const grp = new THREE.Group();

        // Helicopter Fuselage
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.3, metalness: 0.4 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f5, roughness: 0.3 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.1, metalness: 0.8 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 9.5), bodyMat);
        grp.add(body);

        // White police stripe
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.65, 1.2, 4.5), whiteMat);
        stripe.position.set(0, 0, 0);
        grp.add(stripe);

        // Cockpit Glass
        const glass = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.2), glassMat);
        glass.position.set(0, 0.4, 3.2);
        grp.add(glass);

        // Tail Boom
        const tail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 7.5), bodyMat);
        tail.position.set(0, 0.6, -7.5);
        grp.add(tail);

        // Main Rotor Blade
        const rotorGeo = new THREE.BoxGeometry(14.5, 0.15, 0.9);
        const rotorMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        this.rotor = new THREE.Mesh(rotorGeo, rotorMat);
        this.rotor.position.set(0, 2.2, 0);
        grp.add(this.rotor);

        // High-Intensity Spotlight Beam
        this.spotlight = new THREE.SpotLight(0xf0f8ff, 4.0, 110, Math.PI / 4.5, 0.35);
        this.spotlight.position.set(0, -1.2, 0);
        grp.add(this.spotlight);
        grp.add(this.spotlight.target);

        this.x = playerX + 40;
        this.z = playerZ + 40;
        grp.position.set(this.x, this.altitude, this.z);

        this.scene.add(grp);
        this.heli = grp;
        this.active = true;
    }

    update(wantedStars, playerX, playerZ, dt, audio) {
        if (wantedStars >= 3) {
            if (!this.active) this.spawn(playerX, playerZ);
        } else {
            if (this.active) this.despawn();
            return;
        }

        if (!this.active || !this.heli) return;

        // Spin rotor
        this.rotorSpeed += dt * 28;
        if (this.rotor) this.rotor.rotation.y = this.rotorSpeed;

        // Track and hover smoothly above player car
        const targetX = playerX + Math.sin(this.rotorSpeed * 0.1) * 15;
        const targetZ = playerZ + Math.cos(this.rotorSpeed * 0.1) * 15;
        this.x += (targetX - this.x) * Math.min(1, 2.2 * dt);
        this.z += (targetZ - this.z) * Math.min(1, 2.2 * dt);

        this.heli.position.set(this.x, this.altitude, this.z);

        // Aim spotlight at player car
        if (this.spotlight) {
            this.spotlight.target.position.set(playerX, 0, playerZ);
        }

        // Rotor audio thumping
        if (audio && Math.sin(this.rotorSpeed) > 0.85) {
            audio.playHeliRotor();
        }
    }

    despawn() {
        if (this.heli) {
            this.scene.remove(this.heli);
            this.heli = null;
            this.active = false;
        }
    }
}
