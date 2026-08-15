// Liberty City Chronicles — Drive-By Ballistics & Weapon Manager
// Manages submachine gun projectile physics, muzzle flashes, and target hit scans

export class WeaponManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.ammo = 150;
        this.maxAmmo = 160;
        this.fireCooldown = 0;
        this.fireRate = 0.085; // 660 rounds/min
    }

    fire(carX, carY, carZ, carAngle, side = 1, audio, particles) {
        if (this.fireCooldown > 0 || this.ammo <= 0) return false;
        this.fireCooldown = this.fireRate;
        this.ammo--;

        // Projectile spawn at window
        const offAngle = carAngle + (side > 0 ? Math.PI / 2 : -Math.PI / 2);
        const sx = carX + Math.sin(offAngle) * 2.2;
        const sz = carZ + Math.cos(offAngle) * 2.2;
        const sy = carY + 1.2;

        const bulletSpeed = 210;
        const vx = Math.sin(offAngle) * bulletSpeed;
        const vz = Math.cos(offAngle) * bulletSpeed;

        const geo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 4);
        geo.rotateX(Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(sx, sy, sz);
        mesh.rotation.y = offAngle;

        this.scene.add(mesh);
        this.bullets.push({ mesh, vx, vz, life: 0.8 });

        if (audio) audio.playGunfire();
        if (particles) particles.emit(sx, sy, sz, 'spark');

        this._updateHUD();
        return true;
    }

    update(dt) {
        if (this.fireCooldown > 0) this.fireCooldown -= dt;

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.life -= dt;
            b.mesh.position.x += b.vx * dt;
            b.mesh.position.z += b.vz * dt;

            // Hitscan collision check against city bounds & props
            if (b.mesh.position.y < 0.2 || b.mesh.position.y > 15) {
                b.life = 0;
            }

            if (b.life <= 0) {
                this.scene.remove(b.mesh);
                this.bullets.splice(i, 1);
            }
        }
    }

    _updateHUD() {
        const ammoEl = document.getElementById('txt-ammo');
        if (ammoEl) ammoEl.textContent = `${this.ammo} / ${this.maxAmmo}`;
    }
}
