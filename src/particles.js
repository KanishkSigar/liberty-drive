// Liberty City Chronicles — Particle Effects
// Exhaust smoke, collision sparks, and tire skid particles

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 650;
    }

    emit(x, y, z, type) {
        if (this.particles.length >= this.maxParticles) return;

        let geo;
        let mat;

        switch (type) {
            case 'exhaust':
                geo = new THREE.SphereGeometry(0.2, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x666666, transparent: true, opacity: 0.35
                });
                break;
            case 'spark':
                geo = new THREE.SphereGeometry(0.12, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0xffbb33, transparent: true, opacity: 0.9
                });
                break;
            case 'damage_smoke':
                geo = new THREE.SphereGeometry(0.35, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x1a1a1a, transparent: true, opacity: 0.7
                });
                break;
            case 'water_geyser':
                geo = new THREE.CylinderGeometry(0.1, 0.25, 1.8, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x99ddff, transparent: true, opacity: 0.8
                });
                break;
            case 'damage_fire':
                geo = new THREE.SphereGeometry(0.18, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0xff5500, transparent: true, opacity: 0.95
                });
                break;
            case 'boost':
                geo = new THREE.ConeGeometry(0.2, 1.2, 4);
                geo.rotateX(-Math.PI / 2);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x00d2ff, transparent: true, opacity: 0.95
                });
                break;
            case 'rain':
                geo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 3);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x99bbdd, transparent: true, opacity: 0.4
                });
                break;
            case 'backfire_flame':
                geo = new THREE.ConeGeometry(0.28, 1.5, 4);
                geo.rotateX(-Math.PI / 2);
                mat = new THREE.MeshBasicMaterial({
                    color: 0xff8800, transparent: true, opacity: 0.95
                });
                break;
            case 'explosion_fire':
                geo = new THREE.SphereGeometry(0.65, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0xff3300, transparent: true, opacity: 0.95
                });
                break;
            case 'drift_smoke':
                geo = new THREE.SphereGeometry(0.35, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0xdddddd, transparent: true, opacity: 0.65
                });
                break;
            case 'skid':
                geo = new THREE.PlaneGeometry(0.4, 0.4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x222222, transparent: true, opacity: 0.5, side: THREE.DoubleSide
                });
                break;
            default:
                geo = new THREE.SphereGeometry(0.15, 4, 4);
                mat = new THREE.MeshBasicMaterial({
                    color: 0x888888, transparent: true, opacity: 0.4
                });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        if (type === 'skid') {
            mesh.rotation.x = -Math.PI / 2;
        }
        this.scene.add(mesh);

        this.particles.push({
            mesh,
            type,
            life: 1.0,
            vx: (Math.random() - 0.5) * (type === 'spark' ? 1.5 : 0.4),
            vy: type === 'spark' ? (0.5 + Math.random() * 0.8) : (type === 'skid' ? 0 : 0.3 + Math.random() * 0.3),
            vz: (Math.random() - 0.5) * (type === 'spark' ? 1.5 : 0.4),
            decay: type === 'spark' ? 3.8 : (type === 'skid' ? 0.9 : 1.4)
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= p.decay * dt;
            p.mesh.position.x += p.vx * dt;
            p.mesh.position.y += p.vy * dt;
            p.mesh.position.z += p.vz * dt;
            
            if (p.type === 'explosion_fire') {
                p.mesh.position.y += 4.5 * dt;
                p.mesh.scale.multiplyScalar(1 + dt * 2.8);
            } else if (p.type === 'drift_smoke') {
                p.mesh.position.y += 0.8 * dt;
                p.mesh.scale.multiplyScalar(1 + dt * 1.6);
            } else if (p.type === 'water_geyser') {
                p.mesh.position.y += 8.0 * dt;
                p.mesh.position.x += (Math.random() - 0.5) * 0.8 * dt;
                p.mesh.position.z += (Math.random() - 0.5) * 0.8 * dt;
            } else if (p.type === 'damage_smoke') {
                p.mesh.position.y += 1.6 * dt;
                p.mesh.scale.multiplyScalar(1 + dt * 1.8);
            } else if (p.type === 'damage_fire') {
                p.mesh.position.y += 2.0 * dt;
            } else if (p.type === 'rain') {
                p.mesh.position.y -= 35 * dt;
                if (p.mesh.position.y < 0) p.life = 0;
            } else if (p.type === 'exhaust') {
                p.mesh.scale.multiplyScalar(1 + dt * 1.2);
            }
            p.mesh.material.opacity = Math.max(0, p.life * (p.type === 'spark' ? 0.9 : 0.4));

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];
    }
}
