// Liberty City Chronicles — Police Roadblocks & Spike Strip Manager
// Spawns barricaded cruiser checkpoints and tire-popping spike strips during high wanted levels

export class RoadblockManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.roadblocks = [];
        this.spawnTimer = 0;
    }

    update(wantedStars, playerX, playerZ, dt) {
        if (wantedStars < 2) {
            this.clear();
            return;
        }

        this.spawnTimer += dt;
        if (this.spawnTimer > 18.0 && this.roadblocks.length < 2) {
            this.spawnTimer = 0;
            this._spawnRoadblock(playerX, playerZ);
        }
    }

    _spawnRoadblock(px, pz) {
        const grp = new THREE.Group();
        const bMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.35, metalness: 0.4 });
        const wMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f5, roughness: 0.3 });
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.85, roughness: 0.2 });

        // Two barricade police cruisers blocking lane
        const car1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.3, 8.8), bMat);
        car1.position.set(-6, 0.95, 0);
        car1.rotation.y = Math.PI / 2;
        grp.add(car1);

        const car2 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.3, 8.8), bMat);
        car2.position.set(6, 0.95, 0);
        car2.rotation.y = Math.PI / 2;
        grp.add(car2);

        // Spike strip across road center
        const spike = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 1.2), spikeMat);
        spike.position.set(0, 0.1, 0);
        grp.add(spike);

        // Position 140 units ahead of player
        const spawnDist = 150;
        const angle = Math.random() * Math.PI * 2;
        const rx = px + Math.cos(angle) * spawnDist;
        const rz = pz + Math.sin(angle) * spawnDist;
        grp.position.set(rx, 0, rz);

        this.scene.add(grp);
        this.roadblocks.push({
            mesh: grp,
            x: rx,
            z: rz,
            spikesActive: true
        });
    }

    checkSpikes(carX, carZ, carRadius) {
        for (let i = 0; i < this.roadblocks.length; i++) {
            const rb = this.roadblocks[i];
            if (!rb.spikesActive) continue;
            const dx = carX - rb.x;
            const dz = carZ - rb.z;
            if (dx * dx + dz * dz < (carRadius + 4.5) * (carRadius + 4.5)) {
                rb.spikesActive = false;
                return true;
            }
        }
        return false;
    }

    clear() {
        this.roadblocks.forEach(rb => this.scene.remove(rb.mesh));
        this.roadblocks = [];
        this.spawnTimer = 0;
    }
}
