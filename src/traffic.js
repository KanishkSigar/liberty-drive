// Liberty City Chronicles — NPC Traffic Manager
// Handles AI-controlled vehicles on the road network

export class TrafficManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.vehicles = [];
        this.carTypes = ["sedan", "van", "taxi"];
        this.colors = [0x884433, 0x445566, 0x666655, 0x553344, 0x556633, 0x773322, 0x334455, 0x665544, 0x445544, 0x554466, 0xd4a017, 0x2b2b2b];
    }

    spawn(count) {
        const total = this.city.gridN * this.city.step;
        const half = total / 2;

        for (let i = 0; i < count; i++) {
            const isVert = Math.random() > 0.5;
            const lane = Math.floor(Math.random() * (this.city.gridN + 1));
            const pos = isVert
                ? { x: -half + lane * this.city.step + 5, z: -half + Math.random() * total }
                : { x: -half + Math.random() * total, z: -half + lane * this.city.step + 5 };

            const npc = (i % 4 === 0) ? this._buildTaxi() : this._buildCar(this.colors[i % this.colors.length]);
            npc.position.set(pos.x, 0, pos.z);
            const angle = isVert ? 0 : Math.PI / 2;
            npc.rotation.y = angle + (Math.random() > 0.5 ? Math.PI : 0);

            this.scene.add(npc);
            this.vehicles.push({
                mesh: npc,
                speed: 0.25 + Math.random() * 0.6,
                angle: npc.rotation.y
            });
        }
    }

    _buildTaxi() {
        const taxi = this._buildCar(0xd4a017);
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.4, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xffea00 })
        );
        sign.position.set(0, 3.0, -0.3);
        taxi.add(sign);
        return taxi;
    }

    _buildCar(color) {
        const npc = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.2 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.3, 8.5), mat);
        body.position.y = 0.95;
        body.castShadow = true;
        npc.add(body);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.2, 3.5), dark);
        cabin.position.set(0, 2.2, -0.3);
        npc.add(cabin);

        // Wheels
        const wGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 8);
        wGeo.rotateZ(Math.PI / 2);
        const wMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        [[-2.2, 2.5], [2.2, 2.5], [-2.2, -2.5], [2.2, -2.5]].forEach(([wx, wz]) => {
            npc.add(new THREE.Mesh(wGeo, wMat).clone().translateX(wx).translateY(0.55).translateZ(wz));
        });

        // Headlights
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });
        [-1.5, 1.5].forEach(xo => {
            const hl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.15), hlMat);
            hl.position.set(xo, 0.95, 4.3);
            npc.add(hl);
        });

        // Tail lights
        const tlMat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
        [-1.5, 1.5].forEach(xo => {
            const tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.1), tlMat);
            tl.position.set(xo, 0.95, -4.3);
            npc.add(tl);
        });

        // Bumpers
        const bMat = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.3, metalness: 0.5 });
        const fb = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 0.3), bMat);
        fb.position.set(0, 0.5, 4.4);
        npc.add(fb);
        const rb = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 0.3), bMat);
        rb.position.set(0, 0.5, -4.4);
        npc.add(rb);

        return npc;
    }

    update(dt) {
        const total = this.city.gridN * this.city.step;
        const half = total / 2;

        this.vehicles.forEach(v => {
            v.mesh.position.x += Math.sin(v.angle) * v.speed;
            v.mesh.position.z += Math.cos(v.angle) * v.speed;

            // Wrap
            if (v.mesh.position.x > half + 20) v.mesh.position.x = -half - 15;
            if (v.mesh.position.x < -half - 20) v.mesh.position.x = half + 15;
            if (v.mesh.position.z > half + 20) v.mesh.position.z = -half - 15;
            if (v.mesh.position.z < -half - 20) v.mesh.position.z = half + 15;
        });
    }

    getPositions() {
        return this.vehicles.map(v => ({
            x: v.mesh.position.x,
            z: v.mesh.position.z
        }));
    }
}
