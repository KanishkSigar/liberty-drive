// LibertyDrive3D — Main Game Engine (GTA III atmosphere)

// Liberty City Chronicles — Main Game Engine
// GTA III-inspired 3D driving game

import { InputManager } from './controls.js';
import { City } from './city.js';
import { Car } from './car.js';

/* ── Mission definitions ── */
const MISSIONS = [
    {
        title: 'COURIER RUN',
        desc: 'Drive to the yellow marker and collect the package.',
        time: 65,
        points: [{ x: 90, z: -130 }]
    },
    {
        title: 'PORT PICKUP',
        desc: 'Two packages across town. Hustle!',
        time: 90,
        points: [{ x: -180, z: 70 }, { x: 120, z: 180 }]
    },
    {
        title: 'DISTRICT DASH',
        desc: 'Three drops, tight deadline. Show what you got.',
        time: 120,
        points: [{ x: 180, z: 180 }, { x: -180, z: -180 }, { x: 0, z: 220 }]
    },
    {
        title: 'COAST TO COAST',
        desc: 'Deliver five packages across the entire island. No time to waste!',
        time: 180,
        points: [
            { x: -250, z: 0 },
            { x: 250, z: 0 },
            { x: 0, z: -250 },
            { x: 0, z: 250 },
            { x: -200, z: -200 }
        ]
    },
    {
        title: 'CITYWIDE BLITZ',
        desc: 'Four packages all over Liberty City. Floor it!',
        time: 140,
        points: [{ x: -200, z: 200 }, { x: 200, z: -200 }, { x: -200, z: -100 }, { x: 200, z: 100 }]
    }
];

class Game {
    constructor() {
        this.vp = document.getElementById('viewport');
        this.radarCv = document.getElementById('radar');
        this.radarCtx = this.radarCv.getContext('2d');

        this.input = new InputManager();
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.city = null;
        this.car = null;

        this.state = 'MENU';
        this.missionIdx = 0;
        this.cpIdx = 0;
        this.timeLeft = 0;
        this.cpMeshes = [];
        this.npcCars = [];

        this.rebindAction = null;
        this.lastT = 0;
        this.elapsed = 0;

        // Camera smoothing
        this.camPos = new THREE.Vector3(0, 15, -30);
        this.camTarget = new THREE.Vector3();

        this._initThree();
        this._bindUI();
        this._refreshBindLabels();
        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    /* ────────── Three.js Setup ────────── */
    _initThree() {
        this.scene = new THREE.Scene();
        // GTA 3 hazy fog — distance-based
        this.scene.fog = new THREE.Fog(0x6c7c84, 110, 520);
        this.scene.background = new THREE.Color(0x5e6e76);

        const w = this.vp.clientWidth, h = this.vp.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.5, 600);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.92;
        this.vp.appendChild(this.renderer.domElement);

        // Ambient — cool overcast
        this.scene.add(new THREE.AmbientLight(0x556677, 0.42));

        // Hemisphere — sky/ground color bleed
        this.scene.add(new THREE.HemisphereLight(0x8899aa, 0x333322, 0.38));

        // Directional "sun" — hazy overcast sun
        const sun = new THREE.DirectionalLight(0xddccaa, 0.7);
        sun.position.set(100, 200, 80);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        const s = 300;
        sun.shadow.camera.left = -s;
        sun.shadow.camera.right = s;
        sun.shadow.camera.top = s;
        sun.shadow.camera.bottom = -s;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 600;
        sun.shadow.bias = -0.001;
        this.scene.add(sun);

        // Build city
        this.city = new City(this.scene);
        this.city.build();

        // Spawn NPC traffic
        this._spawnNPCs();

        // Resize
        window.addEventListener('resize', () => {
            const w2 = this.vp.clientWidth, h2 = this.vp.clientHeight;
            this.camera.aspect = w2 / h2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w2, h2);
        });
    }

    /* ────────── NPC Traffic ────────── */
    _spawnNPCs() {
        const npcColors = [0x884433, 0x445566, 0x666655, 0x553344, 0x556633, 0x773322, 0x334455];
        const total = this.city.gridN * this.city.step;
        const half = total / 2;

        for (let i = 0; i < 10; i++) {
            const isVertical = Math.random() > 0.5;
            const laneIdx = Math.floor(Math.random() * (this.city.gridN + 1));
            const pos = isVertical
                ? { x: -half + laneIdx * this.city.step + 5, z: -half + Math.random() * total }
                : { x: -half + Math.random() * total, z: -half + laneIdx * this.city.step + 5 };

            const npc = new THREE.Group();
            const color = npcColors[Math.floor(Math.random() * npcColors.length)];
            const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
            const dark = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.2 });

            // Simple car shape
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
                const wheel = new THREE.Mesh(wGeo, wMat);
                wheel.position.set(wx, 0.55, wz);
                npc.add(wheel);
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

            npc.position.set(pos.x, 0, pos.z);
            const angle = isVertical ? 0 : Math.PI / 2;
            npc.rotation.y = angle + (Math.random() > 0.5 ? Math.PI : 0);

            this.scene.add(npc);
            this.npcCars.push({
                mesh: npc,
                speed: 0.3 + Math.random() * 0.5,
                angle: npc.rotation.y,
                vertical: isVertical,
                laneIdx
            });
        }
    }

    _updateNPCs(dt) {
        const total = this.city.gridN * this.city.step;
        const half = total / 2;

        this.npcCars.forEach(npc => {
            const dx = Math.sin(npc.angle) * npc.speed;
            const dz = Math.cos(npc.angle) * npc.speed;
            npc.mesh.position.x += dx;
            npc.mesh.position.z += dz;

            // Wrap around city
            if (npc.mesh.position.x > half + 20) npc.mesh.position.x = -half - 15;
            if (npc.mesh.position.x < -half - 20) npc.mesh.position.x = half + 15;
            if (npc.mesh.position.z > half + 20) npc.mesh.position.z = -half - 15;
            if (npc.mesh.position.z < -half - 20) npc.mesh.position.z = half + 15;
        });
    }

    /* ────────── UI Bindings ────────── */
    _bindUI() {
        const $ = id => document.getElementById(id);

        $('btn-play').onclick = () => this._startMission(0);
        $('btn-retry').onclick = () => this._startMission(this.missionIdx);
        $('btn-next').onclick = () => {
            const next = this.missionIdx + 1;
            if (next < MISSIONS.length) this._startMission(next);
            else this._showScreen('screen-start');
        };

        $('btn-settings').onclick = () => this._showScreen('screen-settings');
        $('btn-close-settings').onclick = () => this._hideScreen('screen-settings');

        document.querySelectorAll('.bind-key').forEach(btn => {
            btn.onclick = () => {
                this.rebindAction = btn.dataset.action;
                this._showScreen('screen-rebind');
            };
        });

        window.addEventListener('keydown', e => {
            if (this.rebindAction) {
                this.input.rebind(this.rebindAction, e.code);
                this.rebindAction = null;
                this._hideScreen('screen-rebind');
                this._refreshBindLabels();
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    _refreshBindLabels() {
        document.querySelectorAll('.bind-key').forEach(btn => {
            btn.textContent = this.input.label(btn.dataset.action);
        });
    }

    _showScreen(id) { document.getElementById(id).classList.add('active'); }
    _hideScreen(id) { document.getElementById(id).classList.remove('active'); }

    _toast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
    }

    /* ────────── Mission Lifecycle ────────── */
    _startMission(idx) {
        this.missionIdx = idx;
        this.cpIdx = 0;
        const m = MISSIONS[idx];
        this.timeLeft = m.time;

        document.getElementById('txt-mission').textContent = m.title;
        document.getElementById('txt-mission-num').textContent = (idx + 1) + '/' + MISSIONS.length;

        if (this.car) this.car.destroy();
        this._clearCPs();

        const spawn = this.city.roadCenter(
            Math.floor(this.city.gridN / 2),
            Math.floor(this.city.gridN / 2)
        );
        this.car = new Car(this.scene, spawn.x, spawn.z, 0);

        // Reset camera instantly behind car
        this.camPos.set(
            this.car.x - Math.sin(this.car.angle) * 22,
            12,
            this.car.z - Math.cos(this.car.angle) * 22
        );

        this._spawnCP();

        ['screen-start', 'screen-fail', 'screen-win', 'screen-settings'].forEach(s => this._hideScreen(s));
        this.state = 'PLAY';
        this._toast('GO TO THE MARKER!');
    }

    _spawnCP() {
        this._clearCPs();
        const m = MISSIONS[this.missionIdx];
        if (this.cpIdx >= m.points.length) return;
        const pt = m.points[this.cpIdx];

        // Yellow beacon
        const cylGeo = new THREE.CylinderGeometry(5, 5, 45, 16, 1, true);
        const cylMat = new THREE.MeshBasicMaterial({
            color: 0xffcc00, transparent: true, opacity: 0.18,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending
        });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        cyl.position.set(pt.x, 22, pt.z);
        this.scene.add(cyl);

        // Ground circle
        const ringGeo = new THREE.RingGeometry(3, 6, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(pt.x, 0.08, pt.z);
        this.scene.add(ring);

        // Arrow pointing down
        const arrowGeo = new THREE.ConeGeometry(1.5, 3, 4);
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.position.set(pt.x, 8, pt.z);
        arrow.rotation.x = Math.PI; // point down
        this.scene.add(arrow);

        // Light
        const light = new THREE.PointLight(0xffcc00, 2, 25);
        light.position.set(pt.x, 3, pt.z);
        this.scene.add(light);

        // Briefcase
        const pkg = new THREE.Group();
        const bMat = new THREE.MeshStandardMaterial({ color: 0xc89830, roughness: 0.3, metalness: 0.4 });
        const bBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.5), bMat);
        pkg.add(bBody);
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.12), bMat);
        handle.position.y = 0.85;
        pkg.add(handle);
        // Latches
        const latchMat = new THREE.MeshStandardMaterial({ color: 0xccaa55, metalness: 0.7, roughness: 0.2 });
        [-0.5, 0.5].forEach(xo => {
            const latch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.08), latchMat);
            latch.position.set(xo, 0.0, 0.28);
            pkg.add(latch);
        });
        pkg.position.set(pt.x, 3.5, pt.z);
        this.scene.add(pkg);

        this.cpMeshes = [cyl, ring, arrow, light, pkg];
    }

    _clearCPs() {
        this.cpMeshes.forEach(o => this.scene.remove(o));
        this.cpMeshes = [];
    }

    _fail(reason) {
        this.state = 'FAIL';
        this._clearCPs();
        document.getElementById('fail-reason').textContent = reason;
        this._showScreen('screen-fail');
    }

    _win() {
        this.state = 'WIN';
        this._clearCPs();
        document.getElementById('win-stats').textContent = `Time remaining: ${this.timeLeft.toFixed(1)}s`;
        this._showScreen('screen-win');
    }

    /* ────────── Game Loop ────────── */
    _loop(t) {
        requestAnimationFrame(this._loop);
        if (!this.lastT) this.lastT = t;
        let dt = (t - this.lastT) / 1000;
        if (dt > 0.1) dt = 0.016; // cap delta for tab-switch
        this.lastT = t;
        this.elapsed = t;

        // Always update NPCs for background movement
        this._updateNPCs(dt);

        if (this.state !== 'PLAY') {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Timer
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.timeLeft = 0; this._fail('OUT OF TIME'); return; }

        // Update car
        this.car.update(this.input, this.city, dt);

        // Animate checkpoint
        if (this.cpMeshes.length >= 5) {
            const pkg = this.cpMeshes[4];
            pkg.rotation.y += 0.03;
            pkg.position.y = 3.5 + Math.sin(t * 0.004) * 0.5;
            // Arrow bob
            const arrow = this.cpMeshes[2];
            arrow.position.y = 8 + Math.sin(t * 0.003) * 1.5;
            // Beacon pulse
            this.cpMeshes[0].material.opacity = 0.12 + 0.08 * Math.sin(t * 0.005);
        }

        // Checkpoint pickup
        const m = MISSIONS[this.missionIdx];
        const cp = m.points[this.cpIdx];
        const dx = this.car.x - cp.x;
        const dz = this.car.z - cp.z;
        if (Math.sqrt(dx * dx + dz * dz) < 10) {
            this.cpIdx++;
            if (this.cpIdx >= m.points.length) {
                this._win();
            } else {
                this._spawnCP();
                this._toast('PACKAGE COLLECTED! ' + (m.points.length - this.cpIdx) + ' LEFT');
            }
        }

        // ── Camera (GTA III Chase Cam) ──
        const camDist = 19.5;
        const camH = 8.8;
        const camLead = 10;

        // Ideal position behind car
        const idealX = this.car.x - Math.sin(this.car.angle) * camDist;
        const idealZ = this.car.z - Math.cos(this.car.angle) * camDist;

        // Smooth follow with slight lag
        const lerpSpeed = 0.06;
        this.camPos.x += (idealX - this.camPos.x) * lerpSpeed;
        this.camPos.z += (idealZ - this.camPos.z) * lerpSpeed;
        this.camPos.y += (camH - this.camPos.y) * lerpSpeed;

        this.camera.position.copy(this.camPos);

        // Look ahead of car
        this.camTarget.set(
            this.car.x + Math.sin(this.car.angle) * camLead,
            2,
            this.car.z + Math.cos(this.car.angle) * camLead
        );
        this.camera.lookAt(this.camTarget);

        // HUD
        // Distance to checkpoint
        const cpDist = Math.round(Math.sqrt(dx * dx + dz * dz));
        document.getElementById('txt-mission').textContent = MISSIONS[this.missionIdx].title + ' - ' + cpDist + 'm';

        document.getElementById('txt-speed').innerHTML = this.car.mph + ' <small>MPH</small>';
        const timeColor = this.timeLeft < 10 ? '#ff4444' : (this.timeLeft < 20 ? '#ffaa44' : '#f2c744');
        const timeEl = document.getElementById('txt-time');
        timeEl.textContent = Math.ceil(this.timeLeft);
        timeEl.style.color = timeColor;

        // Screen shake effect
        if (this._screenShake && this._screenShake > 0) {
            this._screenShake -= dt;
            const intensity = this._screenShake * 0.5;
            this.camera.position.x += (Math.random() - 0.5) * intensity;
            this.camera.position.y += (Math.random() - 0.5) * intensity * 0.5;
        }

        // Render
        this.renderer.render(this.scene, this.camera);
        this._drawRadar();
    }

    /* ────────── Radar ────────── */
    _drawRadar() {
        const ctx = this.radarCtx;
        const W = this.radarCv.width, H = this.radarCv.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);

        // Dark background
        ctx.fillStyle = '#0c0c10';
        ctx.beginPath(); ctx.arc(cx, cy, cx, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-this.car.angle);

        const scale = 0.22;
        const offX = -this.car.x * scale;
        const offZ = -this.car.z * scale;
        const step = this.city.step;
        const total = this.city.gridN * step;
        const half = total / 2;

        // Roads
        ctx.strokeStyle = '#2a2a35';
        ctx.lineWidth = this.city.roadW * scale;
        for (let i = 0; i <= this.city.gridN; i++) {
            const rx = (-half + i * step) * scale + offX;
            ctx.beginPath();
            ctx.moveTo(rx, -half * scale + offZ);
            ctx.lineTo(rx, half * scale + offZ);
            ctx.stroke();
        }
        for (let i = 0; i <= this.city.gridN; i++) {
            const ry = (-half + i * step) * scale + offZ;
            ctx.beginPath();
            ctx.moveTo(-half * scale + offX, ry);
            ctx.lineTo(half * scale + offX, ry);
            ctx.stroke();
        }

        // Buildings
        ctx.fillStyle = '#0a0a0e';
        for (let r = 0; r < this.city.gridN; r++) {
            for (let c = 0; c < this.city.gridN; c++) {
                const bx = (-half + c * step + this.city.roadW) * scale + offX;
                const bz = (-half + r * step + this.city.roadW) * scale + offZ;
                const bw = this.city.blockW * scale;
                ctx.fillRect(bx, bz, bw, bw);
            }
        }

        // NPC blips (small grey dots)
        ctx.fillStyle = '#666';
        this.npcCars.forEach(npc => {
            const nx = npc.mesh.position.x * scale + offX;
            const nz = npc.mesh.position.z * scale + offZ;
            ctx.beginPath(); ctx.arc(nx, nz, 2, 0, Math.PI * 2); ctx.fill();
        });

        // Checkpoint blip
        const m = MISSIONS[this.missionIdx];
        if (m && this.cpIdx < m.points.length) {
            const pt = m.points[this.cpIdx];
            const px = pt.x * scale + offX;
            const py = pt.z * scale + offZ;
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // Player triangle
        ctx.fillStyle = '#4488ff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx - 4, cy + 5);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx + 4, cy + 5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
    }
}

window.addEventListener('DOMContentLoaded', () => new Game());
