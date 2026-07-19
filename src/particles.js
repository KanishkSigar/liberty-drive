// Liberty City Chronicles — Particle Effects
// Exhaust smoke and collision sparks

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 100;
    }

    emit(x, y, z, type) {
        if (this.particles.length >= this.maxParticles) return;

        const geo = new THREE.SphereGeometry(0.15, 4, 4);
        let mat;

        switch (type) {
            case 'exhaust':
                mat = new THREE.MeshBasicMaterial({
                    color: 0x666666, transparent: true, opacity: 0.3
                });
                break;
            case 'spark':
                mat = new THREE.MeshBasicMaterial({
                    color: 0xffaa33, transparent: true, opacity: 0.8
                });
                break;
            default:
                mat = new THREE.MeshBasicMaterial({
                    color: 0x888888, transparent: true, opacity: 0.4
                });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);

        this.particles.push({
            mesh,
            life: 1.0,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.3 + Math.random() * 0.3,
            vz: (Math.random() - 0.5) * 0.5,
            decay: type === 'spark' ? 3.0 : 1.5
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= p.decay * dt;
            p.mesh.position.x += p.vx * dt;
            p.mesh.position.y += p.vy * dt;
            p.mesh.position.z += p.vz * dt;
            p.mesh.material.opacity = p.life * 0.4;

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
