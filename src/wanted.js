// Liberty City Chronicles — Police Wanted Level System
// Manages crime heat points, wanted star levels, and pursuit AI state

export class WantedManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.stars = 0; // 0 to 3 stars
        this.heat = 0; // Heat points (0 to 100)
        this.policeCars = [];
    }

    getPolicePositions() {
        return this.policeCars.map(p => ({ x: p.mesh.position.x, z: p.mesh.position.z }));
        this.sirenTimer = 0;
        this.audio = audio;
    }

    setAudio(audio) {
        this.audio = audio;
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
            this.heat = Math.max(0, this.heat - dt * 3.0);
            this._updateStars();
        }
    }

    spawnPoliceCruiser(playerX, playerZ) {
        if (this.policeCars.length >= 2) return;
        const pGrp = new THREE.Group();

        // Police Body
        const pMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.4, metalness: 0.4 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f5, roughness: 0.3 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.2 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.3, 8.8), pMat);
        body.position.y = 0.95;
        pGrp.add(body);

        // White door panels
        const door = new THREE.Mesh(new THREE.BoxGeometry(4.65, 1.1, 3.5), whiteMat);
        door.position.set(0, 0.95, 0);
        pGrp.add(door);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.2, 3.6), darkMat);
        cabin.position.set(0, 2.2, -0.3);
        pGrp.add(cabin);

        // Siren light bar (red & blue)
        const redLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.4), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        redLight.position.set(-0.9, 2.9, -0.3);
        pGrp.add(redLight);

        const blueLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.4), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
        blueLight.position.set(0.9, 2.9, -0.3);
        pGrp.add(blueLight);

        // Spawn offset from player
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDist = 120 + Math.random() * 40;
        pGrp.position.set(playerX + Math.cos(spawnAngle) * spawnDist, 0, playerZ + Math.sin(spawnAngle) * spawnDist);

        this.scene.add(pGrp);
        this.policeCars.push({
            mesh: pGrp,
            redLight,
            blueLight,
            speed: 0,
            angle: 0,
            lightTimer: 0
        });
    }

    updatePursuit(playerX, playerZ, dt) {
        if (this.stars > 0 && this.policeCars.length < Math.min(2, this.stars)) {
            this.spawnPoliceCruiser(playerX, playerZ);
        }

        this.policeCars.forEach((p, idx) => {
            // Siren light flash
            p.lightTimer += dt * 10;
            const flash = Math.sin(p.lightTimer) > 0;
            p.redLight.material.color.setHex(flash ? 0xff2222 : 0x440000);
            p.blueLight.material.color.setHex(!flash ? 0x2266ff : 0x001144);

            // Steer toward player
            const dx = playerX - p.mesh.position.x;
            const dz = playerZ - p.mesh.position.z;
            const targetAngle = Math.atan2(dx, dz);
            p.angle = targetAngle;
            p.mesh.rotation.y = p.angle;

            // Move speed
            const dist = Math.sqrt(dx * dx + dz * dz);
            const chaseSpeed = Math.min(75, 40 + this.stars * 14);
            p.mesh.position.x += Math.sin(p.angle) * chaseSpeed * dt;
            p.mesh.position.z += Math.cos(p.angle) * chaseSpeed * dt;
        });
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
