// Liberty City Chronicles — Pedestrian AI Simulation
// Spawns and manages low-poly animated pedestrians walking on city sidewalks

export class PedestrianManager {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.pedestrians = [];
        this.panicScreamed = false;
        this.clothingColors = [0x3a5878, 0x884433, 0x446644, 0x775533, 0x2b2b2b, 0x553355, 0x666655];
    }

    spawn(count = 24) {
        const total = this.city.gridN * this.city.step;
        const half = total / 2;

        for (let i = 0; i < count; i++) {
            const blockX = Math.floor(Math.random() * this.city.gridN);
            const blockZ = Math.floor(Math.random() * this.city.gridN);
            const isHorizontal = Math.random() > 0.5;

            const cx = -half + blockX * this.city.step + this.city.roadW + (isHorizontal ? Math.random() * this.city.blockW : 1.5);
            const cz = -half + blockZ * this.city.step + this.city.roadW + (isHorizontal ? 1.5 : Math.random() * this.city.blockW);

            const color = this.clothingColors[i % this.clothingColors.length];
            const pedMesh = this._buildPedestrian(color);
            pedMesh.position.set(cx, 0, cz);
            this.scene.add(pedMesh);

            this.pedestrians.push({
                mesh: pedMesh,
                x: cx,
                z: cz,
                speed: 1.2 + Math.random() * 0.8,
                dir: isHorizontal ? (Math.random() > 0.5 ? 1 : -1) : 0,
                dirZ: !isHorizontal ? (Math.random() > 0.5 ? 1 : -1) : 0,
                animTimer: Math.random() * Math.PI,
                leftLeg: pedMesh.userData.leftLeg,
                rightLeg: pedMesh.userData.rightLeg,
                leftArm: pedMesh.userData.leftArm,
                rightArm: pedMesh.userData.rightArm,
                isPanicking: false
            });
        }
    }

    _buildPedestrian(shirtColor) {
        const ped = new THREE.Group();
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.8 });

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), shirtMat);
        torso.position.y = 1.35;
        torso.castShadow = true;
        ped.add(torso);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat);
        head.position.y = 2.05;
        ped.add(head);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.35);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.2, 0.45, 0);
        ped.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.2, 0.45, 0);
        ped.add(rightLeg);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.25);
        const leftArm = new THREE.Mesh(armGeo, skinMat);
        leftArm.position.set(-0.48, 1.35, 0);
        ped.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, skinMat);
        rightArm.position.set(0.48, 1.35, 0);
        ped.add(rightArm);

        ped.userData = { leftLeg, rightLeg, leftArm, rightArm };
        return ped;
    }

    update(dt, playerX, playerZ) {
        this.pedestrians.forEach(p => {
            p.animTimer += dt * (p.isPanicking ? 8.0 : 4.0);

            // Arm/leg swinging walk animation
            const swing = Math.sin(p.animTimer) * 0.4;
            p.leftLeg.rotation.x = swing;
            p.rightLeg.rotation.x = -swing;
            p.leftArm.rotation.x = -swing;
            p.rightArm.rotation.x = swing;

            // Panic check near player car
            const dx = playerX - p.x;
            const dz = playerZ - p.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 18) {
                p.isPanicking = true;
                // Move away from car
                p.x -= (dx / (dist + 0.1)) * (p.speed * 2.5) * dt;
                p.z -= (dz / (dist + 0.1)) * (p.speed * 2.5) * dt;
            } else {
                p.isPanicking = false;
                p.x += p.dir * p.speed * dt;
                p.z += p.dirZ * p.speed * dt;
            }

            p.mesh.position.set(p.x, 0, p.z);
            if (p.dir !== 0 || p.dirZ !== 0) {
                p.mesh.rotation.y = Math.atan2(p.dir, p.dirZ);
            }
        });
    }
}
