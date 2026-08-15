// Liberty City Chronicles — Main Game Engine
// GTA III-inspired 3D driving game

import { InputManager } from './controls.js';
import { City } from './city.js';
import { Car } from './car.js';
import { TrafficManager } from './traffic.js';
import { ParticleSystem } from './particles.js';
import { WeatherSystem } from './weather.js';
import { HUD } from './hud.js';
import { WantedManager } from './wanted.js';
import { RadioManager } from './radio.js';
import { GarageManager } from './garage.js';
import { SkidMarkManager } from './skid.js';
import { PedestrianManager } from './pedestrians.js';
import { LightingManager } from './lighting.js';
import { StuntManager } from './stunts.js';
import { SprayGarageManager } from './spray.js';
import { WeaponManager } from './weapons.js';
import { RoadblockManager } from './roadblocks.js';
import { AudioManager } from './audio.js';

/* ── Mission definitions ── */
const MISSIONS = [
    {
        title: 'COURIER RUN',
        desc: 'Drive to the yellow marker and collect the package.',
        time: 70,
        points: [{ x: 90, z: -130 }]
    },
    {
        title: 'PORT PICKUP',
        desc: 'Two packages across town. Hustle!',
        time: 95,
        points: [{ x: -180, z: 70 }, { x: 120, z: 180 }]
    },
    {
        title: 'DISTRICT DASH',
        desc: 'Three drops, tight deadline. Show what you got.',
        time: 125,
        points: [{ x: 180, z: 180 }, { x: -180, z: -180 }, { x: 0, z: 220 }]
    },
    {
        title: 'COAST TO COAST',
        desc: 'Deliver five packages across the entire island. No time to waste!',
        time: 185,
        points: [
            { x: -250, z: 0 },
            { x: 250, z: 0 },
            { x: 0, z: -250 },
            { x: 0, z: 250 },
            { x: -200, z: -200 }
        ]
    },
    {
        title: 'LIBERTY OVERHAUL',
        desc: 'Six high priority drops across the full city grid. Push it to the limit!',
        time: 190,
        points: [
            { x: -220, z: -220 },
            { x: 220, z: -220 },
            { x: 220, z: 220 },
            { x: -220, z: 220 },
            { x: 0, z: 0 },
            { x: 140, z: -140 }
        ]
    },
    {
        title: 'CITYWIDE BLITZ',
        desc: 'Four packages all over Liberty City. Floor it!',
        time: 145,
        points: [{ x: -200, z: 200 }, { x: 200, z: -200 }, { x: -200, z: -100 }, { x: 200, z: 100 }]
    }
];

class Game {
    constructor() {
        this.vp = document.getElementById('viewport');
        this.radarCv = document.getElementById('radar');
        this.radarCtx = this.radarCv.getContext('2d');

        this.input = new InputManager();
        this.hud = new HUD();
        this.audio = new AudioManager();
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.city = null;
        this.car = null;
        this.traffic = null;
        this.particles = null;
        this.weather = null;
        this.wanted = null;
        this.radio = null;
        this.garage = new GarageManager();
        this.skids = new SkidMarkManager(this.scene);
        this.pedestrians = new PedestrianManager(this.scene, this.city);
        this.pedestrians.spawn(30);

        this.state = 'MENU';
        this.missionIdx = 0;
        this.cpIdx = 0;
        this.timeLeft = 0;
        this.cpMeshes = [];

        this.rebindAction = null;
        this.lastT = 0;
        this.elapsed = 0;

        // Camera smoothing & modes
        this.camPos = new THREE.Vector3(0, 15, -30);
        this.camTarget = new THREE.Vector3();
        this.camMode = 0; // 0: Normal Chase, 1: Far Chase, 2: Bumper Cam

        this._initThree();
        this._bindUI();
        this._refreshBindLabels();
        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    /* ────────── Three.js Setup ────────── */
    _initThree() {
        this.scene = new THREE.Scene();
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

        // Lights
        this.scene.add(new THREE.AmbientLight(0x556677, 0.42));
        this.scene.add(new THREE.HemisphereLight(0x8899aa, 0x333322, 0.38));

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
        this.lighting.init(sun, this.scene.children.find(c => c.isAmbientLight), this.scene.children.find(c => c.isHemisphereLight));

        // Build City
        this.city = new City(this.scene);
        this.city.build();

        // Subsystems
        this.traffic = new TrafficManager(this.scene, this.city);
        this.traffic.spawn(12);

        this.particles = new ParticleSystem(this.scene);
        this.weather = new WeatherSystem(this.scene);
        this.weather.setAudio(this.audio);
        this.wanted = new WantedManager(this.scene, this.city);
        this.wanted.setAudio(this.audio);
        this.radio = new RadioManager(this.audio.ctx);

        // Resize
        window.addEventListener('resize', () => {
            const w2 = this.vp.clientWidth, h2 = this.vp.clientHeight;
            this.camera.aspect = w2 / h2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w2, h2);
        });
    }

    /* ────────── UI Bindings ────────── */
    _bindUI() {
        const $ = id => document.getElementById(id);

        $('btn-play').onclick = () => this._startMission(0);
        
        const updateGarageUI = (v) => {
            const nameEl = document.getElementById('txt-veh-name');
            const descEl = document.getElementById('txt-veh-desc');
            if (nameEl) nameEl.textContent = v.name;
            if (descEl) descEl.textContent = v.desc;
        };

        const prevBtn = $('btn-veh-prev');
        const nextBtn = $('btn-veh-next');
        if (prevBtn) prevBtn.onclick = () => updateGarageUI(this.garage.prev());
        if (nextBtn) nextBtn.onclick = () => updateGarageUI(this.garage.next());
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
            } else if (this.state === 'PLAY') {
                if (this.input.wasJustPressed('cameraToggle')) {
                    this.camMode = (this.camMode + 1) % 3;
                    this._toast(`CAMERA: ${['CHASE', 'FAR CHASE', 'BUMPER'][this.camMode]}`);
                }
                if (this.input.wasJustPressed('horn')) {
                    this.audio.playHorn();
                    this.wanted.addHeat(2);
                    if (this.audio) this.audio.playPedPanic();
                }
                    this.audio.playHorn();
                    this.wanted.addHeat(2);
                }
                if (this.input.wasJustPressed('radio')) {
                    if (!this.radio.ctx && this.audio.ctx) this.radio.setAudioContext(this.audio.ctx);
                    const station = this.radio.toggleStation();
                    const rEl = document.getElementById('txt-radio-station');
                    const rWrap = document.getElementById('hud-radio');
                    if (rEl) rEl.textContent = station.name;
                    if (rWrap) {
                        rWrap.classList.remove('hidden');
                        clearTimeout(this._radioTimer);
                        this._radioTimer = setTimeout(() => rWrap.classList.add('hidden'), 3500);
                    }
                }
                    this.audio.playHorn();
                }
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

        this.hud.updateMission(m.title);
        this.hud.updateMissionCount(idx + 1, MISSIONS.length);

        if (this.car) this.car.destroy();
        this.particles.clear();
        if (this.roadblocks) this.roadblocks.clear();
        if (this.skids) this.skids.clear();
        this._clearCPs();

        const spawn = this.city.roadCenter(
            Math.floor(this.city.gridN / 2),
            Math.floor(this.city.gridN / 2)
        );
        this.car = new Car(this.scene, spawn.x, spawn.z, 0, this.garage.getSelected());

        this.camPos.set(
            this.car.x - Math.sin(this.car.angle) * 22,
            12,
            this.car.z - Math.cos(this.car.angle) * 22
        );

        this._spawnCP();

        ['screen-start', 'screen-fail', 'screen-win', 'screen-settings'].forEach(s => this._hideScreen(s));
        this.state = 'PLAY';
        this.wanted.reset();
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
        arrow.rotation.x = Math.PI;
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
        this.audio.stopEngine();
        document.getElementById('fail-reason').textContent = reason;
        this._showScreen('screen-fail');
    }

    _calculateStars() {
        const m = MISSIONS[this.missionIdx];
        const timeRatio = this.timeLeft / m.time;
        if (timeRatio > 0.45 && (this.car.health || 100) > 70) return 3;
        if (timeRatio > 0.2) return 2;
        return 1;
    }

    _win() {
        this.state = 'WIN';
        this._clearCPs();
        this.audio.stopEngine();
        const stars = this._calculateStars();
        const starEls = document.querySelectorAll('#win-stars .rating-star');
        if (starEls) {
            starEls.forEach((el, idx) => {
                if (idx < stars) el.classList.add('active');
                else el.classList.remove('active');
            });
        }
        document.getElementById('win-stats').innerHTML = `Time remaining: <strong>${this.timeLeft.toFixed(1)}s</strong> &bull; Rating: <strong>${stars}/3 Stars</strong>`;
        this._showScreen('screen-win');
    }

    /* ────────── Game Loop ────────── */
    _loop(t) {
        requestAnimationFrame(this._loop);
        if (!this.lastT) this.lastT = t;
        let dt = (t - this.lastT) / 1000;
        if (dt > 0.1) dt = 0.016;
        this.lastT = t;
        this.elapsed = t;

        this.traffic.update(dt);
        this.particles.update(dt);
        this.skids.update(dt);
        if (this.pedestrians) this.pedestrians.update(dt, this.car ? this.car.x : 0, this.car ? this.car.z : 0);
        this.weather.update(dt);
        if (this.lighting) this.lighting.update(dt);

        if (this.state !== 'PLAY') {
            this.audio.stopEngine();
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Timer
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.timeLeft = 0; this._fail('OUT OF TIME'); return; }

        // Update car & audio engine pitch
        const wasCollided = const wasCollided = this.car.update(this.input, this.city, dt);
        
        // Calculate engine RPM ratio for HUD
        const rpmRatio = Math.min(1.0, (Math.abs(this.car.speed) / this.car.maxSpeed) * 0.85 + (this.input.is('accelerate') ? 0.15 : 0));
        this.hud.updateRPM(rpmRatio);
        this.hud.updateArmor(this.car.armorRatio || 1.0);
        this.hud.updateNitro((this.car.nitro || 0) / (this.car.maxNitro || 100));
        this.wanted.coolDown(dt);
        this.wanted.updatePursuit(this.car.x, this.car.z, dt);
        if (this.roadblocks) {
            this.roadblocks.update(this.wanted.stars, this.car.x, this.car.z, dt);
            if (this.roadblocks.checkSpikes(this.car.x, this.car.z, 2.5) && !this.car.tiresPopped) {
                this.car.popTires();
                if (this.audio) this.audio.playTirePop();
                this.hud.showToast('⚠️ TIRES PUNCTURED BY SPIKE STRIP!', 'danger');
            }
        }
        this.audio.updateEngine(this.car.mph, this.input.is('accelerate'));

        // Check destructible prop hit
        const propHit = this.city.checkPropHit(this.car.x, this.car.z, 2.5);
        if (propHit && propHit.type === 'hydrant') {
            this.audio.playSplash();
            this.activeGeysers.push({ x: propHit.x, z: propHit.z, timer: 6.0 });
        }

        if (wasCollided) {
            this.wanted.addHeat(15);
            this._screenShake = 0.4;
            this.audio.playCrash();
            // Spawn sparks at car front
            const sparkX = this.car.x + Math.sin(this.car.angle) * 5;
            const sparkZ = this.car.z + Math.cos(this.car.angle) * 5;
            for (let i = 0; i < 6; i++) {
                this.particles.emit(sparkX, 1.0, sparkZ, 'spark');
            }
        }

        // Nitro boost flame particle burst
        if (this.car.isBoosting) {
            const bx = this.car.x - Math.sin(this.car.angle) * 5.4 + 1.8;
            const bz = this.car.z - Math.cos(this.car.angle) * 5.4;
            this.particles.emit(bx, 0.4, bz, 'boost');
        }

        // Critical engine damage smoke & fire
        if (this.car.isDamaged) {
            const hx = this.car.x + Math.sin(this.car.angle) * 3.8;
            const hz = this.car.z + Math.cos(this.car.angle) * 3.8;
            if (Math.random() < 0.6) {
                this.particles.emit(hx, 1.4, hz, 'damage_smoke');
            }
            if (this.car.isCritical && Math.random() < 0.3) {
                this.particles.emit(hx + (Math.random() - 0.5), 1.2, hz + (Math.random() - 0.5), 'damage_fire');
            }
        }

        // Exhaust smoke while accelerating
        if (Math.abs(this.car.speed) > 2) {
            const exX = this.car.x - Math.sin(this.car.angle) * 5.2 + 1.8;
            const exZ = this.car.z - Math.cos(this.car.angle) * 5.2;
            if (Math.random() < 0.4) {
                this.particles.emit(exX, 0.4, exZ, 'exhaust');
            }
        }

        // Tire skid smoke during handbrake/tight turns
        if (this.input.is('handbrake') && Math.abs(this.car.speed) > 15) {
            this.particles.emit(this.car.x, 0.1, this.car.z, 'skid');
            this.particles.emit(offLeftX, 0.3, offLeftZ, 'drift_smoke');
            this.particles.emit(offRightX, 0.3, offRightZ, 'drift_smoke');
            const offLeftX = this.car.x - Math.cos(this.car.angle) * 1.8;
            const offLeftZ = this.car.z + Math.sin(this.car.angle) * 1.8;
            const offRightX = this.car.x + Math.cos(this.car.angle) * 1.8;
            const offRightZ = this.car.z - Math.sin(this.car.angle) * 1.8;
            this.skids.addSkid(offLeftX, offLeftZ, this.car.angle);
            this.skids.addSkid(offRightX, offRightZ, this.car.angle);
            if (this.audio) this.audio.playSqueal();
        }
            this.particles.emit(this.car.x, 0.1, this.car.z, 'skid');
        }

        // Animate checkpoint
        if (this.cpMeshes.length >= 5) {
            const pkg = this.cpMeshes[4];
            pkg.rotation.y += 0.03;
            pkg.position.y = 3.5 + Math.sin(t * 0.004) * 0.5;
            const arrow = this.cpMeshes[2];
            arrow.position.y = 8 + Math.sin(t * 0.003) * 1.5;
            this.cpMeshes[0].material.opacity = 0.12 + 0.08 * Math.sin(t * 0.005);
        }

        // Checkpoint pickup
        const m = MISSIONS[this.missionIdx];
        const cp = m.points[this.cpIdx];
        const dx = this.car.x - cp.x;
        const dz = this.car.z - cp.z;
        const distToCp = Math.round(Math.sqrt(dx * dx + dz * dz));
        
        if (distToCp < 10) {
            this.cpIdx++;
            this.audio.playPickup();
            if (this.cpIdx >= m.points.length) {
                this._win();
            } else {
                this._spawnCP();
                this._toast('PACKAGE COLLECTED! ' + (m.points.length - this.cpIdx) + ' LEFT');
            }
        }

        // ── Camera Modes ──
        let camDist = 19.5;
        let camH = 8.8;
        let camLead = 10;

        if (this.camMode === 1) { // Far Chase
            camDist = 28;
            camH = 14;
            camLead = 12;
        } else if (this.camMode === 2) { // Bumper / Hood
            camDist = 1.5;
            camH = 2.2;
            camLead = 15;
        }

        const idealX = this.car.x - Math.sin(this.car.angle) * camDist;
        const idealZ = this.car.z - Math.cos(this.car.angle) * camDist;

        const lerpSpeed = 0.06;
        this.camPos.x += (idealX - this.camPos.x) * lerpSpeed;
        this.camPos.z += (idealZ - this.camPos.z) * lerpSpeed;
        this.camPos.y += (camH - this.camPos.y) * lerpSpeed;

        this.camera.position.copy(this.camPos);

        this.camTarget.set(
            this.car.x + Math.sin(this.car.angle) * camLead,
            this.camMode === 2 ? 2.0 : 2.5,
            this.car.z + Math.cos(this.car.angle) * camLead
        );
        this.camera.lookAt(this.camTarget);

        // HUD updates
        this.hud.updateMission(m.title, distToCp);
        this.hud.updateSpeed(this.car.mph);
        this.hud.updateGear(this.car.speed);
        this.hud.updateTime(this.timeLeft);
        if (this.timeLeft < 10 && this.timeLeft > 0 && Math.floor(this.timeLeft) !== Math.floor(this.timeLeft + dt)) {
            if (this.audio) this.audio.playUrgentTick();
        }
        if (this.lighting) this.hud.updateClock(this.lighting.getFormattedTime());
        if (this.stunts) this.stunts.update(this.car.speed, wasCollided, dt);
        if (this.sprayGarages) this.sprayGarages.checkEntrance(this.car, this.wanted, this.audio, dt);
        if (this.weapons) {
            this.weapons.update(dt);
            if (this.input.is('fireLeft')) {
                this.weapons.fire(this.car.x, 0, this.car.z, this.car.angle, -1, this.audio, this.particles);
                this.wanted.addHeat(1);
            } else if (this.input.is('fireRight')) {
                this.weapons.fire(this.car.x, 0, this.car.z, this.car.angle, 1, this.audio, this.particles);
                this.wanted.addHeat(1);
            }
        }

        // Screen shake
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
        ctx.strokeStyle = "#353545";
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

        // NPC blips
        ctx.fillStyle = '#888899';
        const npcPos = this.traffic.getPositions();
        npcPos.forEach(p => {
            const nx = p.x * scale + offX;
            const nz = p.z * scale + offZ;
            ctx.beginPath(); ctx.arc(nx, nz, 2.5, 0, Math.PI * 2); ctx.fill();
        });

        // Draw GPS route line to active checkpoint
        const activeMission = MISSIONS[this.missionIdx];
        if (activeMission && this.cpIdx < activeMission.points.length) {
            const targetPt = activeMission.points[this.cpIdx];
            const targetPx = targetPt.x * scale + offX;
            const targetPy = targetPt.z * scale + offZ;

            ctx.strokeStyle = 'rgba(240, 197, 64, 0.45)';
            ctx.lineWidth = 4.2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(offX, offZ);
            ctx.lineTo(targetPx, targetPy);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Police radar blips (flashing red/blue dots)
        const policePos = this.wanted ? this.wanted.getPolicePositions() : [];
        policePos.forEach(p => {
            const px = p.x * scale + offX;
            const pz = p.z * scale + offZ;
            ctx.fillStyle = (t % 400 < 200) ? '#ff2222' : '#0088ff';
            ctx.beginPath(); ctx.arc(px, pz, 3.5, 0, Math.PI * 2); ctx.fill();
        });

        // Pay 'n' Spray garage radar blips (gold squares)
        if (this.sprayGarages && this.sprayGarages.garages) {
            this.sprayGarages.garages.forEach(g => {
                const gx = g.x * scale + offX;
                const gz = g.z * scale + offZ;
                ctx.fillStyle = '#ffdd44';
                ctx.fillRect(gx - 3.5, gz - 3.5, 7, 7);
            });
        }

        // Roadblock hazard radar blips (red warning diamonds)
        if (this.roadblocks && this.roadblocks.roadblocks) {
            this.roadblocks.roadblocks.forEach(rb => {
                const rx = rb.x * scale + offX;
                const rz = rb.z * scale + offZ;
                ctx.fillStyle = '#ff2222';
                ctx.beginPath();
                ctx.moveTo(rx, rz - 4);
                ctx.lineTo(rx + 4, rz);
                ctx.lineTo(rx, rz + 4);
                ctx.lineTo(rx - 4, rz);
                ctx.closePath();
                ctx.fill();
            });
        }

        // Checkpoint blip
        const m = MISSIONS[this.missionIdx];
        if (m && this.cpIdx < m.points.length) {
            const pt = m.points[this.cpIdx];
            const px = pt.x * scale + offX;
            const py = pt.z * scale + offZ;
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 14;
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // Player triangle
        ctx.fillStyle = '#3399ff';
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
