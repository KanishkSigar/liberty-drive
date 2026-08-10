// Liberty City Chronicles — Dynamic Road Skid Mark Decal Manager
// Renders persistent rubber tire skid tracks on the road surface during drifts

export class SkidMarkManager {
    constructor(scene) {
        this.scene = scene;
        this.skids = [];
        this.maxSkids = 80;
    }

    addSkid(x, z, angle, width = 0.5) {
        if (this.skids.length >= this.maxSkids) {
            const old = this.skids.shift();
            this.scene.remove(old.mesh);
        }

        const geo = new THREE.PlaneGeometry(width, 1.4);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x181818,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = angle;
        mesh.position.set(x, 0.05, z);

        this.scene.add(mesh);
        this.skids.push({ mesh, life: 8.0 });
    }

    update(dt) {
        for (let i = this.skids.length - 1; i >= 0; i--) {
            const s = this.skids[i];
            s.life -= dt;
            if (s.life < 2.0) {
                s.mesh.material.opacity = (s.life / 2.5) * 0.42;
            }
            if (s.life <= 0) {
                this.scene.remove(s.mesh);
                this.skids.splice(i, 1);
            }
        }
    }

    clear() {
        this.skids.forEach(s => this.scene.remove(s.mesh));
        this.skids = [];
    }
}
