// Liberty City Chronicles — Vehicle Model & Physics
// Frame-rate independent with delta-time scaling — Vehicle Model & Physics
// Frame-rate independent physics with proper delta-time scaling

export class Car {
    constructor(scene, x, z, angle, vehConfig = null) {
        this.scene = scene;
        this.x = x;
        this.z = z;
        this.angle = angle || 0;

        // Physics constants (per-second values)
        this.speed = 0;
        this.maxSpeed = vehConfig ? vehConfig.topSpeed : 136;        // units per second
        this.maxReverse = 50;
        this.accelForce = vehConfig ? vehConfig.accelForce : 108;       // acceleration per second
        this.brakeForce = 180;
        this.friction = 19;
        this.handbrakeForce = 255;
        this.steer = 0;
        this.bodyRoll = 0;
        this.bodyPitch = 0;
        this.maxSteerRate = vehConfig ? vehConfig.steerRate : 3.2;    // radians per second at low speed
        this.steerSmooth = 12;       // steering return speed

        // Collision
        this.hw = 2.8;
        this.hd = 5.2;
        this.health = 100;
        this.maxHealth = 100;
        this.nitro = 100;
        this.maxNitro = 100;
        this.isBoosting = false;
        this.hd = 5.2;

        this.mesh = null;
        this.wheels = [];
        this.brakeLights = [];
        this.isBraking = false;
        // Nitro management
        if (input.is('nitro') && this.nitro > 0 && this.speed > 5) {
            this.isBoosting = true;
            this.nitro = Math.max(0, this.nitro - dt * 25);
        } else {
            this.isBoosting = false;
            if (!input.is('nitro') && this.nitro < this.maxNitro) {
                this.nitro = Math.min(this.maxNitro, this.nitro + dt * 10);
            }
        }

        this._build();
    }

    _build() {
        this.mesh = new THREE.Group();

        const bodyColor = vehConfig ? vehConfig.color : 0x3a5878;
        const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.52 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.3, metalness: 0.2 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.12, metalness: 0.85 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2535, roughness: 0.04, metalness: 0.4, transparent: true, opacity: 0.58 });
        const interiorMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.9 });

        // Main body
        const bodyGeo = new THREE.BoxGeometry(5.4, 1.5, 10.4);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.05;
        body.castShadow = true; body.receiveShadow = true;
        this.mesh.add(body);

        // Undercarriage
        const under = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.3, 9.8), darkMat);
        under.position.y = 0.15;
        this.mesh.add(under);

        // Hood
        const hood = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 3.2), bodyMat);
        hood.position.set(0, 2.0, 2.8);
        hood.rotation.x = -0.12;
        hood.castShadow = true;
        this.mesh.add(hood);

        // Hood line
        const hoodLine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 2.8), chromeMat);
        hoodLine.position.set(0, 2.2, 2.8);
        this.mesh.add(hoodLine);

        // Pillars
        this._pillar(-2.2, 2.7, 1.0, 0.15, 1.5, 0.15, bodyMat, 0.25);
        this._pillar(2.2, 2.7, 1.0, 0.15, 1.5, 0.15, bodyMat, -0.25);
        this._pillar(-2.35, 2.7, -0.8, 0.12, 1.4, 0.12, bodyMat, 0);
        this._pillar(2.35, 2.7, -0.8, 0.12, 1.4, 0.12, bodyMat, 0);
        this._pillar(-2.2, 2.6, -2.2, 0.15, 1.3, 0.15, bodyMat, -0.2);
        this._pillar(2.2, 2.6, -2.2, 0.15, 1.3, 0.15, bodyMat, 0.2);

        // Roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.15, 3.6), bodyMat);
        roof.position.set(0, 3.4, -0.6);
        roof.castShadow = true;
        this.mesh.add(roof);

        // Roof trim
        const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.06, 3.7), chromeMat);
        roofTrim.position.set(0, 3.34, -0.6);
        this.mesh.add(roofTrim);

        // Rain gutters along roof edge
        const gutterMat = new THREE.MeshStandardMaterial({ color: 0x333338, roughness: 0.5 });
        [-2.35, 2.35].forEach(xo => {
            const gutter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 3.8), gutterMat);
            gutter.position.set(xo, 3.42, -0.6);
            this.mesh.add(gutter);
        });

        // Windshield
        const ws = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.5), glassMat);
        ws.position.set(0, 2.85, 1.15);
        ws.rotation.x = -0.35;
        this.mesh.add(ws);

        // Rear window
        const rw = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.3), glassMat);
        rw.position.set(0, 2.75, -2.4);
        rw.rotation.x = 0.3;
        this.mesh.add(rw);

        // Side windows
        const swGeo = new THREE.PlaneGeometry(3.0, 1.1);
        const swL = new THREE.Mesh(swGeo, glassMat);
        swL.position.set(-2.71, 2.7, -0.5);
        swL.rotation.y = Math.PI / 2;
        this.mesh.add(swL);
        const swR = new THREE.Mesh(swGeo, glassMat);
        swR.position.set(2.71, 2.7, -0.5);
        swR.rotation.y = -Math.PI / 2;
        this.mesh.add(swR);

        // Interior
        const interior = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 3.4), interiorMat);
        interior.position.set(0, 2.1, -0.5);
        this.mesh.add(interior);

        // Dashboard
        const dash = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 0.8), interiorMat);
        dash.position.set(0, 2.3, 0.8);
        this.mesh.add(dash);

        // Trunk
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.6, 2.4), bodyMat);
        trunk.position.set(0, 1.9, -3.8);
        trunk.rotation.x = 0.06;
        trunk.castShadow = true;
        this.mesh.add(trunk);

        // Front bumper
        this.mesh.add(this._box(5.6, 0.45, 0.6, chromeMat, 0, 0.55, 5.3));
        this.mesh.add(this._box(5.4, 0.3, 0.3, darkMat, 0, 0.25, 5.35));

        // Rear bumper
        this.mesh.add(this._box(5.6, 0.45, 0.5, chromeMat, 0, 0.55, -5.2));

        // Front splitter
        const splitterMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.6 });
        this.mesh.add(this._box(5.8, 0.12, 0.8, splitterMat, 0, 0.15, 5.5, true));

        // Grille
        const grilleMat = new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.35, metalness: 0.55 });
        this.mesh.add(this._box(3.2, 0.6, 0.15, grilleMat, 0, 1.1, 5.28));
        for (let i = 0; i < 5; i++) {
            this.mesh.add(this._box(2.8, 0.04, 0.08, chromeMat, 0, 0.88 + i * 0.1, 5.33));
        }

        // Headlights
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xfff0dd });
        const hlHousing = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.6 });
        [-2.0, 2.0].forEach(xo => {
            this.mesh.add(this._box(1.3, 0.65, 0.3, hlHousing, xo, 1.15, 5.28));
            this.mesh.add(this._box(1.1, 0.5, 0.25, hlMat, xo, 1.15, 5.35));
        });

        // Headlight beams
        const spotTarget = new THREE.Object3D();
        spotTarget.position.set(0, -2, 50);
        this.mesh.add(spotTarget);
        [-2.0, 2.0].forEach(xo => {
            const spot = new THREE.SpotLight(0xffeedd, 3.5, 90, Math.PI / 7, 0.45, 1.6);
            spot.position.set(xo, 1.15, 5.35);
            spot.target = spotTarget;
            this.mesh.add(spot);
        });

        // Turn signals
        const tsMat = new THREE.MeshBasicMaterial({ color: 0xffb040 });
        [-2.65, 2.65].forEach(xo => {
            this.mesh.add(this._box(0.35, 0.25, 0.15, tsMat, xo, 1.0, 5.3));
        });

        // Tail lights
        const tlMat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
        [-2.0, 2.0].forEach(xo => {
            this.mesh.add(this._box(1.2, 0.55, 0.3, darkMat, xo, 1.05, -5.22));
            const tl = this._box(1.0, 0.4, 0.2, tlMat, xo, 1.05, -5.28);
            this.mesh.add(tl);
            this.brakeLights.push(tl);
        });

        // Third brake light (center high mount)
        const thirdBrake = this._box(1.0, 0.15, 0.1, tlMat, 0, 2.05, -5.15);
        this.mesh.add(thirdBrake);
        this.brakeLights.push(thirdBrake);

        // Reverse lights
        const rvMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        [-0.8, 0.8].forEach(xo => {
            this.mesh.add(this._box(0.4, 0.25, 0.1, rvMat, xo, 0.85, -5.25));
        });

        // License plates
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xe0e0c8, roughness: 0.5 });
        this.mesh.add(this._box(1.6, 0.5, 0.06, plateMat, 0, 0.55, 5.38));
        this.mesh.add(this._box(1.6, 0.5, 0.06, plateMat, 0, 0.55, -5.28));

        // Side mirrors
        [-2.9, 2.9].forEach(xo => {
            this.mesh.add(this._box(0.5, 0.1, 0.1, bodyMat, xo, 2.0, 1.2));
            this.mesh.add(this._box(0.15, 0.35, 0.5, darkMat, xo + (xo > 0 ? 0.2 : -0.2), 2.0, 1.2));
        });

        // Fenders
        [-2.6, 2.6].forEach(xo => {
            this.mesh.add(this._box(0.5, 0.8, 2.5, bodyMat, xo, 0.8, 3.2, true));
            this.mesh.add(this._box(0.5, 0.7, 2.2, bodyMat, xo, 0.75, -3.2, true));
        });

        // Body side molding (chrome strip)
        [-2.72, 2.72].forEach(xo => {
            const molding = new THREE.Mesh(
                new THREE.BoxGeometry(0.03, 0.06, 7.0),
                chromeMat
            );
            molding.position.set(xo, 1.35, -0.2);
            this.mesh.add(molding);
        });

        // Fuel cap
        const fuelCapMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.5 });
        const fuelCap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), fuelCapMat);
        fuelCap.position.set(2.72, 1.3, -2.8);
        fuelCap.rotation.z = Math.PI / 2;
        this.mesh.add(fuelCap);

        // Door lines & handles
        [-2.71, 2.71].forEach(xo => {
            const dlMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
            this.mesh.add(this._box(0.01, 1.2, 0.02, dlMat, xo, 1.6, 0.4));
            this.mesh.add(this._box(0.01, 1.2, 0.02, dlMat, xo, 1.6, -1.8));
            this.mesh.add(this._box(0.04, 0.08, 0.3, chromeMat, xo + (xo > 0 ? 0.02 : -0.02), 1.6, 0.0));
            this.mesh.add(this._box(0.04, 0.08, 0.3, chromeMat, xo + (xo > 0 ? 0.02 : -0.02), 1.6, -2.2));
        });

        // Rear badge emblem
        const badgeMat = new THREE.MeshStandardMaterial({ color: 0xccaa55, metalness: 0.7, roughness: 0.2 });
        const badge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.04), badgeMat);
        badge.position.set(0, 1.5, -5.22);
        this.mesh.add(badge);

        // Exhaust
        const exGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 6);
        exGeo.rotateX(Math.PI / 2);
        const ex = new THREE.Mesh(exGeo, new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.3 }));
        ex.position.set(1.8, 0.3, -5.4);
        this.mesh.add(ex);

        // Windshield wipers
        const wiperMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
        [-1.2, 1.2].forEach(xo => {
            const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.8), wiperMat);
            wiper.position.set(xo, 2.15, 1.5);
            wiper.rotation.x = -0.25;
            this.mesh.add(wiper);
        });

        // Antenna
        const ant = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 2.5, 4),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 })
        );
        ant.position.set(-1.8, 4.2, -1.5);
        ant.rotation.z = 0.15;
        this.mesh.add(ant);

        // Wheel well arches
        const archMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.8 });
        [3.3, -3.3].forEach(zpos => {
            [-2.8, 2.8].forEach(xpos => {
                const arch = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.15, 2.0),
                    archMat
                );
                arch.position.set(xpos, 1.5, zpos);
                this.mesh.add(arch);
            });
        });

        // Wheels
        this._buildWheels();

        this.mesh.position.set(this.x, 0, this.z);
        this.mesh.rotation.y = this.angle;

        // Dynamic chassis lean & pitch
        const targetRoll = -this.steer * (this.speed / this.maxSpeed) * 0.18;
        const targetPitch = (this.isBraking ? -0.04 : (input.is('accelerate') ? 0.03 : 0));
        this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1, 12 * dt);
        this.bodyPitch += (targetPitch - this.bodyPitch) * Math.min(1, 12 * dt);

        this.mesh.rotation.z = this.bodyRoll;
        this.mesh.rotation.x = this.bodyPitch;
        this.scene.add(this.mesh);
    }

    _box(w, h, d, mat, x, y, z, shadow) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        if (shadow) m.castShadow = true;
        return m;
    }

    _pillar(x, y, z, w, h, d, mat, rz) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        if (rz) m.rotation.z = rz;
        this.mesh.add(m);
    }

    _buildWheels() {
        const tireGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.55, 16);
        tireGeo.rotateZ(Math.PI / 2);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.88 });
        const rimGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.57, 12);
        rimGeo.rotateZ(Math.PI / 2);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.72, roughness: 0.2 });
        const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.58, 6);
        hubGeo.rotateZ(Math.PI / 2);
        const hubMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.82, roughness: 0.15 });

        [{ x: -2.7, z: 3.3, f: true }, { x: 2.7, z: 3.3, f: true },
         { x: -2.7, z: -3.3, f: false }, { x: 2.7, z: -3.3, f: false }].forEach(wp => {
            const g = new THREE.Group();
            const t = new THREE.Mesh(tireGeo, tireMat); t.castShadow = true; g.add(t);
            g.add(new THREE.Mesh(rimGeo, rimMat));
            g.add(new THREE.Mesh(hubGeo, hubMat));
            g.position.set(wp.x, 0.72, wp.z);
            this.mesh.add(g);
            this.wheels.push({ grp: g, front: wp.f });
        });
    }

    update(input, city, dt) {
        // dt = seconds since last frame
        if (!dt || dt > 0.1) dt = 0.016; // cap at ~60fps equivalent

        this.isBraking = (input.is('reverse') && this.speed > 5) || input.is('handbrake');

        // Throttle (frame-rate independent)
        if (input.is('accelerate')) {
            const boostMult = this.isBoosting ? 1.45 : 1.0;
            this.speed += this.accelForce * boostMult * dt;
        } else if (input.is('reverse')) {
            if (this.speed > 5) {
                this.speed -= this.brakeForce * dt;
            } else {
                this.speed -= this.accelForce * 0.6 * dt;
            }
        } else {
            // Coast friction
            if (Math.abs(this.speed) < this.friction * dt * 2) {
                this.speed = 0;
            } else {
                this.speed -= Math.sign(this.speed) * this.friction * dt;
            }
        }

        // Handbrake
        if (input.is('handbrake') && Math.abs(this.speed) > 1) {
            this.speed -= Math.sign(this.speed) * this.handbrakeForce * dt;
            if (Math.abs(this.speed) < 2) this.speed = 0;
        }

        // Clamp speed
        const topSpeedCap = this.isBoosting ? 160 : this.maxSpeed;
        this.speed = Math.max(-this.maxReverse, Math.min(topSpeedCap, this.speed));

        // Steering (frame-rate independent)
        let steerInput = 0;
        if (input.is('steerLeft')) steerInput = 1;
        if (input.is('steerRight')) steerInput = -1;

        const speedRatio = Math.abs(this.speed) / this.maxSpeed;
        const steerTarget = steerInput * this.maxSteerRate * (1 - speedRatio * 0.55);

        // Smooth steer toward target
        this.steer += (steerTarget - this.steer) * Math.min(1, this.steerSmooth * dt);

        // Turn (only when moving)
        if (Math.abs(this.speed) > 2) {
            const dir = this.speed > 0 ? 1 : -1;
            this.angle += this.steer * dt * dir;
        }

        // Movement
        const moveSpeed = this.speed * dt;
        const prevX = this.x, prevZ = this.z;
        this.x += Math.sin(this.angle) * moveSpeed;
        this.z += Math.cos(this.angle) * moveSpeed;

        // Collision
        let collided = false;
        if (city.hit(this.x, this.z, this.hw, this.hd)) {
            this.health = Math.max(0, this.health - 6);
            this.x = prevX;
            this.z = prevZ;
            this.speed *= -0.2;
            collided = true;
        }

        // Sync mesh
        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
        this.mesh.rotation.y = this.angle;

        // Wheel animation
        const wheelSpin = moveSpeed * 0.5;
        this.wheels.forEach(w => {
            if (w.front) w.grp.rotation.y = this.steer * 0.3;
            w.grp.children.forEach(c => { c.rotation.x += wheelSpin; });
        });

        // Brake lights
        this.brakeLights.forEach(bl => {
            bl.material.color.setHex(this.isBraking ? 0xff3333 : 0xcc2222);
        });

        return collided;
    }

    get isCritical() { return this.health < 30; }
    get isDamaged() { return this.health < 60; }
    get armorRatio() { return Math.max(0, this.health / this.maxHealth); }
    get mph() { return Math.round(Math.abs(this.speed) * 0.6); }

    destroy() { this.scene.remove(this.mesh); }
}
