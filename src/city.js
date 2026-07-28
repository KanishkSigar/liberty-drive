// LibertyDrive3D — Procedural City Generator (GTA III Fidelity)

export class City {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];

        this.gridN = 7;
        this.blockW = 72;
        this.roadW = 26;
        this.sidewalkW = 4.5;
        this.step = this.blockW + this.roadW;

        // Seeded RNG
        this._seed = 1337;

        // Palette — GTA III muted industrial tones
        this.palettes = {
            concrete: [0x6b6b6e, 0x5c5c60, 0x737378, 0x646468],
            brick:    [0x7a4433, 0x8b5544, 0x6d3a2c, 0x945f4e],
            glass:    [0x3a5c7a, 0x2e4f6b, 0x4a6c8a, 0x1e3f5b],
            roof:     [0x2a2a2e, 0x1f1f23, 0x333338, 0x252528],
            sidewalk: [0x888890, 0x7e7e86, 0x929298],
            ground:   0x2c2c30,
        };
    }

    _rng() {
        this._seed = (this._seed * 16807) % 2147483647;
        return (this._seed - 1) / 2147483646;
    }

    _pick(arr) { return arr[Math.floor(this._rng() * arr.length)]; }

    roadCenter(col, row) {
        const half = (this.gridN * this.step) / 2;
        return {
            x: -half + col * this.step + this.roadW / 2,
            z: -half + row * this.step + this.roadW / 2
        };
    }

    build() {
        this._sky();
        this._water();
        this._ground();
        this._roads();
        this._sidewalks();
        this._crosswalks();
        this._buildings();
        this._streetLights();
        this._trafficLights();
        this._streetFurniture();
        this._trees();
        this._stormDrains();
        this._manholes();
        this._utilityPoles();
        this._parkingMeters();
        this._fences();
        this._awnings();
        this._hydrants();
        this._stopSigns();
        this._streetSigns();
        this._barriers();
        this._boundaries();
    }

    /* ═══════════════ SKY DOME ═══════════════ */
    _sky() {
        const skyGeo = new THREE.SphereGeometry(500, 32, 16);
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 512;
        const cx = cv.getContext('2d');
        // GTA 3 hazy overcast sky gradient
        const grad = cx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#3c4c5e');    // upper sky — muted blue-grey
        grad.addColorStop(0.3, '#5c6c7c');  // mid sky
        grad.addColorStop(0.55, '#8c8c84'); // horizon haze
        grad.addColorStop(0.7, '#a29c8a');  // warm haze
        grad.addColorStop(1, '#6a6a65');    // bottom
        cx.fillStyle = grad;
        cx.fillRect(0, 0, 256, 512);

        // Subtle cloud streaks
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#ccc';
        for (let i = 0; i < 35; i++) {
            const y = 40 + Math.random() * 200;
            cx.fillRect(0, y, 256, 2 + Math.random() * 6);
        }
        cx.globalAlpha = 1;

        const skyTex = new THREE.CanvasTexture(cv);
        const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
    }

    /* ═══════════════ WATER (surrounds city like GTA 3 island) ═══════════════ */
    _water() {
        const waterGeo = new THREE.PlaneGeometry(2000, 2000);
        const cv = document.createElement('canvas');
        cv.width = 128; cv.height = 128;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#1a3040';
        cx.fillRect(0, 0, 128, 128);
        // Subtle wave highlights
        cx.strokeStyle = 'rgba(80,120,150,0.15)';
        cx.lineWidth = 1;
        for (let y = 0; y < 128; y += 6) {
            cx.beginPath();
            cx.moveTo(0, y + Math.sin(y * 0.3) * 2);
            for (let x = 0; x < 128; x += 4) {
                cx.lineTo(x, y + Math.sin((x + y) * 0.2) * 2);
            }
            cx.stroke();
        }
        const waterTex = new THREE.CanvasTexture(cv);
        waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
        waterTex.repeat.set(20, 20);
        const waterMat = new THREE.MeshStandardMaterial({
            map: waterTex, roughness: 0.25, metalness: 0.15, color: 0x1c3848
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1.5;
        this.scene.add(water);
    }

    /* ═══════════════ GROUND ═══════════════ */
    _ground() {
        const total = this.gridN * this.step + 60;
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 256;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#3a3a3e';
        cx.fillRect(0, 0, 256, 256);
        // Concrete noise
        for (let i = 0; i < 800; i++) {
            const v = 45 + Math.floor(Math.random() * 25);
            cx.fillStyle = `rgb(${v},${v},${v + 2})`;
            cx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
        }
        // Cracks
        cx.strokeStyle = 'rgba(0,0,0,0.2)';
        cx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            cx.beginPath();
            cx.moveTo(Math.random() * 256, Math.random() * 256);
            cx.lineTo(Math.random() * 256, Math.random() * 256);
            cx.stroke();
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(30, 30);
        const g = new THREE.PlaneGeometry(total, total);
        const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 });
        const mesh = new THREE.Mesh(g, m);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -0.02;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
    }

    /* ═══════════════ ROADS ═══════════════ */
    _roads() {
        const total = this.gridN * this.step;
        const half = total / 2;

        // Road texture with lane lines
        const cv = document.createElement('canvas');
        cv.width = 128; cv.height = 512;
        const cx = cv.getContext('2d');
        // Asphalt base
        cx.fillStyle = '#353540';
        cx.fillRect(0, 0, 128, 512);
        // Asphalt grain
        for (let i = 0; i < 600; i++) {
            const v = 40 + Math.floor(Math.random() * 20);
            cx.fillStyle = `rgb(${v},${v},${v})`;
            cx.fillRect(Math.random() * 128, Math.random() * 512, 1, 1);
        }
        // Center dashed yellow line
        cx.strokeStyle = '#ba972c';
        cx.lineWidth = 2.5;
        cx.setLineDash([18, 24]);
        cx.beginPath(); cx.moveTo(64, 0); cx.lineTo(64, 512); cx.stroke();
        // Edge white lines
        cx.strokeStyle = 'rgba(200,200,200,0.3)';
        cx.lineWidth = 1.5;
        cx.setLineDash([]);
        cx.beginPath(); cx.moveTo(6, 0); cx.lineTo(6, 512); cx.stroke();
        cx.beginPath(); cx.moveTo(122, 0); cx.lineTo(122, 512); cx.stroke();

        const roadTex = new THREE.CanvasTexture(cv);
        roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;

        // Vertical roads
        for (let i = 0; i <= this.gridN; i++) {
            const x = -half + i * this.step;
            const t = roadTex.clone();
            t.repeat.set(1, total / 16);
            t.needsUpdate = true;
            const g = new THREE.PlaneGeometry(this.roadW - this.sidewalkW * 2, total);
            const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: 0.88 }));
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(x, 0.02, -half + total / 2);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        // Horizontal roads
        for (let i = 0; i <= this.gridN; i++) {
            const z = -half + i * this.step;
            const t = roadTex.clone();
            t.repeat.set(1, total / 16);
            t.rotation = Math.PI / 2;
            t.needsUpdate = true;
            const g = new THREE.PlaneGeometry(total, this.roadW - this.sidewalkW * 2);
            const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: 0.88 }));
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(-half + total / 2, 0.02, z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }
    }

    /* ═══════════════ SIDEWALKS & CURBS ═══════════════ */
    _sidewalks() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const sw = this.sidewalkW;
        const rw = this.roadW;

        // Sidewalk texture
        const cv = document.createElement('canvas');
        cv.width = 64; cv.height = 64;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#8a8a8e';
        cx.fillRect(0, 0, 64, 64);
        // Tile grid
        cx.strokeStyle = 'rgba(0,0,0,0.12)';
        cx.lineWidth = 1;
        cx.strokeRect(1, 1, 30, 30);
        cx.strokeRect(33, 1, 30, 30);
        cx.strokeRect(1, 33, 30, 30);
        cx.strokeRect(33, 33, 30, 30);
        // Grit
        for (let i = 0; i < 100; i++) {
            cx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`;
            cx.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
        }
        const swTex = new THREE.CanvasTexture(cv);
        swTex.wrapS = swTex.wrapT = THREE.RepeatWrapping;

        const swMat = () => {
            const t = swTex.clone();
            t.needsUpdate = true;
            return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
        };

        const curbMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.85 });

        // Along each road, place sidewalks on both sides
        for (let i = 0; i <= this.gridN; i++) {
            // Vertical roads
            const x = -half + i * this.step;
            [-1, 1].forEach(side => {
                const sx = x + side * (rw / 2 - sw / 2);
                // Sidewalk
                const t = swTex.clone(); t.repeat.set(1, total / 4); t.needsUpdate = true;
                const g = new THREE.PlaneGeometry(sw, total);
                const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
                m.rotation.x = -Math.PI / 2;
                m.position.set(sx, 0.12, -half + total / 2);
                m.receiveShadow = true;
                this.scene.add(m);

                // Curb (thin raised edge)
                const cg = new THREE.BoxGeometry(0.3, 0.15, total);
                const curb = new THREE.Mesh(cg, curbMat);
                curb.position.set(sx - side * sw / 2, 0.07, -half + total / 2);
                curb.receiveShadow = true;
                this.scene.add(curb);
            });

            // Horizontal roads
            const z = -half + i * this.step;
            [-1, 1].forEach(side => {
                const sz = z + side * (rw / 2 - sw / 2);
                const t = swTex.clone(); t.repeat.set(total / 4, 1); t.needsUpdate = true;
                const g = new THREE.PlaneGeometry(total, sw);
                const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
                m.rotation.x = -Math.PI / 2;
                m.position.set(-half + total / 2, 0.12, sz);
                m.receiveShadow = true;
                this.scene.add(m);

                const cg = new THREE.BoxGeometry(total, 0.15, 0.3);
                const curb = new THREE.Mesh(cg, curbMat);
                curb.position.set(-half + total / 2, 0.07, sz - side * sw / 2);
                curb.receiveShadow = true;
                this.scene.add(curb);
            });
        }
    }

    /* ═══════════════ STORM DRAINS ═══════════════ */
    _stormDrains() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const drainMat = new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.9 });
        const grateMat = new THREE.MeshStandardMaterial({ color: 0x444448, roughness: 0.7, metalness: 0.3 });

        for (let r = 0; r <= this.gridN; r++) {
            for (let c = 0; c <= this.gridN; c++) {
                if (this._rng() > 0.3) continue;
                const pos = this.roadCenter(c, r);
                const side = this._rng() > 0.5 ? 1 : -1;
                const drainX = pos.x + side * (this.roadW / 2 - 1);

                // Drain opening
                const drain = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), drainMat);
                drain.position.set(drainX, 0.01, pos.z + side * 3);
                drain.rotation.x = -Math.PI / 2;
                this.scene.add(drain);

                // Grate bars
                for (let i = 0; i < 4; i++) {
                    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.04), grateMat);
                    bar.position.set(drainX, 0.02, pos.z + side * 3 + (i - 1.5) * 0.12);
                    this.scene.add(bar);
                }
            }
        }
    }

    /* ═══════════════ CROSSWALKS ═══════════════ */
    _crosswalks() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const stripMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.85 });

        for (let r = 0; r <= this.gridN; r++) {
            for (let c = 0; c <= this.gridN; c++) {
                const pos = this.roadCenter(c, r);
                // Paint white stripes across intersection approaches
                for (let s = 0; s < 4; s++) {
                    const isVert = s < 2;
                    const sign = s % 2 === 0 ? 1 : -1;
                    for (let stripe = 0; stripe < 5; stripe++) {
                        const g = new THREE.PlaneGeometry(isVert ? 1.2 : 0.4, isVert ? 0.4 : 1.2);
                        const m = new THREE.Mesh(g, stripMat);
                        m.rotation.x = -Math.PI / 2;
                        if (isVert) {
                            m.position.set(pos.x + (stripe - 2) * 2.5, 0.04, pos.z + sign * (this.roadW / 2 - 1));
                        } else {
                            m.position.set(pos.x + sign * (this.roadW / 2 - 1), 0.04, pos.z + (stripe - 2) * 2.5);
                        }
                        this.scene.add(m);
                    }
                }
            }
        }
    }

    /* ═══════════════ BUILDINGS ═══════════════ */
    _buildings() {
        const total = this.gridN * this.step;
        const half = total / 2;

        for (let r = 0; r < this.gridN; r++) {
            for (let c = 0; c < this.gridN; c++) {
                const cx = -half + c * this.step + this.roadW + this.blockW / 2;
                const cz = -half + r * this.step + this.roadW + this.blockW / 2;

                const count = 2 + Math.floor(this._rng() * 4);
                for (let b = 0; b < count; b++) {
                    const w = 16 + this._rng() * 26;
                    const d = 14 + this._rng() * 24;
                    const h = 18 + this._rng() * 80;
                    const ox = (this._rng() - 0.5) * (this.blockW - w - 2);
                    const oz = (this._rng() - 0.5) * (this.blockW - d - 2);

                    const bx = cx + ox;
                    const bz = cz + oz;

                    // Determine building type
                    const type = this._rng();
                    let faceTex;
                    if (type < 0.35) {
                        faceTex = this._brickTex(h);
                    } else if (type < 0.65) {
                        faceTex = this._concreteTex(h);
                    } else {
                        faceTex = this._glassTex(h);
                    }

                    const geo = new THREE.BoxGeometry(w, h, d);
                    const sideMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.75 });
                    const roofMat = new THREE.MeshStandardMaterial({
                        color: this._pick(this.palettes.roof), roughness: 0.95
                    });
                    const mats = [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat];

                    const mesh = new THREE.Mesh(geo, mats);
                    mesh.position.set(bx, h / 2 + 0.1, bz);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    this.scene.add(mesh);

                    // Rooftop details (AC units, water tanks)
                    if (h > 30 && this._rng() > 0.4) {
                        this._rooftopDetails(bx, h, bz, w, d);
                    }

                    // Fire escape on tall buildings
                    if (h > 40 && this._rng() > 0.5) {
                        this._fireEscape(bx, bz, w, d, h);
                    }

                    this.colliders.push({
                        minX: bx - w / 2 - 1, maxX: bx + w / 2 + 1,
                        minZ: bz - d / 2 - 1, maxZ: bz + d / 2 + 1
                    });
                }
            }
        }
    }

    /* ── Brick facade texture ── */
    _brickTex(h) {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 512;
        const cx = cv.getContext('2d');
        const baseColor = this._pick(this.palettes.brick);
        const r = (baseColor >> 16) & 0xff, g = (baseColor >> 8) & 0xff, bl = baseColor & 0xff;
        cx.fillStyle = `rgb(${r},${g},${bl})`;
        cx.fillRect(0, 0, 256, 512);

        // Brick pattern
        const bw = 22, bh = 9, gap = 1.5;
        for (let row = 0; row < 512 / (bh + gap); row++) {
            const offset = row % 2 === 0 ? 0 : bw / 2;
            for (let col = -1; col < 256 / bw + 1; col++) {
                const bx = col * (bw + gap) + offset;
                const by = row * (bh + gap);
                const v = 0.85 + this._rng() * 0.3;
                cx.fillStyle = `rgb(${Math.floor(r * v)},${Math.floor(g * v)},${Math.floor(bl * v)})`;
                cx.fillRect(bx, by, bw, bh);
            }
        }

        // Mortar lines (darker gaps)
        cx.fillStyle = `rgba(0,0,0,0.25)`;
        for (let row = 0; row < 512 / (bh + gap); row++) {
            cx.fillRect(0, row * (bh + gap) + bh, 256, gap);
        }

        // Windows
        this._drawWindows(cx, 256, 512);

        // Stains / weathering
        this._addWeathering(cx, 256, 512);

        return new THREE.CanvasTexture(cv);
    }

    /* ── Concrete facade texture ── */
    _concreteTex(h) {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 512;
        const cx = cv.getContext('2d');
        const shade = this._pick(this.palettes.concrete);
        const r = (shade >> 16) & 0xff, g = (shade >> 8) & 0xff, bl = shade & 0xff;
        cx.fillStyle = `rgb(${r},${g},${bl})`;
        cx.fillRect(0, 0, 256, 512);

        // Concrete panels
        cx.strokeStyle = 'rgba(0,0,0,0.15)';
        cx.lineWidth = 1;
        for (let y = 0; y < 512; y += 64) {
            cx.beginPath(); cx.moveTo(0, y); cx.lineTo(256, y); cx.stroke();
        }

        // Noise
        for (let i = 0; i < 500; i++) {
            const v = this._rng() * 0.1;
            cx.fillStyle = `rgba(0,0,0,${v})`;
            cx.fillRect(this._rng() * 256, this._rng() * 512, 1 + this._rng() * 3, 1 + this._rng() * 3);
        }

        // Windows
        this._drawWindows(cx, 256, 512);
        this._addWeathering(cx, 256, 512);

        return new THREE.CanvasTexture(cv);
    }

    /* ── Glass/commercial facade ── */
    _glassTex(h) {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 512;
        const cx = cv.getContext('2d');
        const shade = this._pick(this.palettes.glass);
        const r = (shade >> 16) & 0xff, g = (shade >> 8) & 0xff, bl = shade & 0xff;
        cx.fillStyle = `rgb(${r},${g},${bl})`;
        cx.fillRect(0, 0, 256, 512);

        // Large glass panels
        const panelW = 26, panelH = 38, gapX = 3, gapY = 5;
        for (let px = gapX; px < 250; px += panelW + gapX) {
            for (let py = gapY; py < 506; py += panelH + gapY) {
                const lit = this._rng() < 0.35;
                if (lit) {
                    const warmth = this._rng();
                    cx.fillStyle = warmth < 0.6 ? '#c4982a' : warmth < 0.8 ? '#88aacc' : '#e8c84a';
                } else {
                    const v = 20 + Math.floor(this._rng() * 30);
                    cx.fillStyle = `rgb(${v + 10},${v + 15},${v + 25})`;
                }
                cx.fillRect(px, py, panelW, panelH);
                // Glass frame
                cx.strokeStyle = 'rgba(0,0,0,0.3)';
                cx.lineWidth = 1;
                cx.strokeRect(px, py, panelW, panelH);
            }
        }

        // Reflective sheen
        cx.fillStyle = 'rgba(120,160,200,0.04)';
        cx.fillRect(0, 0, 128, 512);

        return new THREE.CanvasTexture(cv);
    }

    /* ── Shared window drawing ── */
    _drawWindows(cx, w, h) {
        const winW = 11, winH = 15, gapX = 20, gapY = 26;
        for (let wx = 12; wx < w - 12; wx += gapX) {
            for (let wy = 14; wy < h - 14; wy += gapY) {
                const lit = this._rng() < 0.3;
                if (lit) {
                    cx.fillStyle = this._rng() < 0.7 ? '#c8982a' : '#7899bb';
                } else {
                    const v = 12 + Math.floor(this._rng() * 15);
                    cx.fillStyle = `rgb(${v},${v},${v + 3})`;
                }
                cx.fillRect(wx, wy, winW, winH);
                // Window frame
                cx.strokeStyle = 'rgba(0,0,0,0.2)';
                cx.lineWidth = 0.5;
                cx.strokeRect(wx, wy, winW, winH);
                // Sill
                cx.fillStyle = 'rgba(100,100,100,0.3)';
                cx.fillRect(wx - 1, wy + winH, winW + 2, 2);
            }
        }
    }

    /* ── Weathering stains ── */
    _addWeathering(cx, w, h) {
        // Water streaks down building
        cx.strokeStyle = 'rgba(0,0,0,0.06)';
        cx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const sx = this._rng() * w;
            cx.beginPath();
            cx.moveTo(sx, 0);
            let y = 0;
            while (y < h) {
                y += 5 + this._rng() * 15;
                cx.lineTo(sx + (this._rng() - 0.5) * 6, y);
            }
            cx.stroke();
        }

        // Dark stains at base
        const grad = cx.createLinearGradient(0, h - 40, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.15)');
        cx.fillStyle = grad;
        cx.fillRect(0, h - 40, w, 40);
    }

    /* ── Rooftop AC units / water tanks ── */
    _rooftopDetails(bx, h, bz, w, d) {
        const acMat = new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.8 });
        const count = 1 + Math.floor(this._rng() * 3);
        for (let i = 0; i < count; i++) {
            const size = 1.5 + this._rng() * 2;
            const geo = new THREE.BoxGeometry(size, size * 0.7, size);
            const ac = new THREE.Mesh(geo, acMat);
            ac.position.set(
                bx + (this._rng() - 0.5) * w * 0.6,
                h + size * 0.35 + 0.1,
                bz + (this._rng() - 0.5) * d * 0.6
            );
            ac.castShadow = true;
            this.scene.add(ac);
        }
        // Water tank on some buildings
        if (this._rng() > 0.5) {
            const tankGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 8);
            const tankMat = new THREE.MeshStandardMaterial({ color: 0x666660, roughness: 0.7 });
            const tank = new THREE.Mesh(tankGeo, tankMat);
            tank.position.set(bx, h + 1.5 + 0.1, bz);
            tank.castShadow = true;
            this.scene.add(tank);
        }
    }

    /* ── Fire escape ladders ── */
    _fireEscape(bx, bz, w, d, h) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x444440, roughness: 0.7, metalness: 0.3 });
        const side = Math.floor(this._rng() * 4);
        let fx, fz;
        if (side === 0) { fx = bx - w / 2 - 0.3; fz = bz; }
        else if (side === 1) { fx = bx + w / 2 + 0.3; fz = bz; }
        else if (side === 2) { fx = bx; fz = bz - d / 2 - 0.3; }
        else { fx = bx; fz = bz + d / 2 + 0.3; }

        // Vertical rails
        for (let i = 0; i < 2; i++) {
            const railGeo = new THREE.BoxGeometry(0.12, h * 0.7, 0.12);
            const rail = new THREE.Mesh(railGeo, mat);
            const offset = (side < 2) ? { x: 0, z: (i === 0 ? -1.2 : 1.2) } : { x: (i === 0 ? -1.2 : 1.2), z: 0 };
            rail.position.set(fx + offset.x, h * 0.35 + 3, fz + offset.z);
            this.scene.add(rail);
        }

        // Platforms every few floors
        for (let py = 5; py < h * 0.7; py += 8) {
            const platGeo = new THREE.BoxGeometry(
                side < 2 ? 1.5 : 2.6,
                0.1,
                side < 2 ? 2.6 : 1.5
            );
            const plat = new THREE.Mesh(platGeo, mat);
            plat.position.set(fx, py, fz);
            this.scene.add(plat);
        }
    }

    /* ═══════════════ STREET LIGHTS ═══════════════ */
    _streetLights() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a4a50, roughness: 0.6, metalness: 0.3 });

        for (let r = 0; r <= this.gridN; r++) {
            for (let c = 0; c <= this.gridN; c++) {
                if ((r + c) % 2 !== 0) continue;
                const pos = this.roadCenter(c, r);

                // Four corners of intersection get lights
                [[-1, -1], [1, 1]].forEach(([sx, sz]) => {
                    const px = pos.x + sx * (this.roadW / 2 - 1);
                    const pz = pos.z + sz * (this.roadW / 2 - 1);

                    // Pole
                    const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 10, 6);
                    const pole = new THREE.Mesh(poleGeo, poleMat);
                    pole.position.set(px, 5, pz);
                    pole.castShadow = true;
                    this.scene.add(pole);

                    // Curved arm
                    const armGeo = new THREE.BoxGeometry(3.5, 0.12, 0.12);
                    const arm = new THREE.Mesh(armGeo, poleMat);
                    arm.position.set(px - sx * 1.5, 10, pz);
                    this.scene.add(arm);

                    // Lamp housing
                    const lampGeo = new THREE.BoxGeometry(1.2, 0.3, 0.6);
                    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffdd99 });
                    const lamp = new THREE.Mesh(lampGeo, lampMat);
                    lamp.position.set(px - sx * 3, 9.8, pz);
                    this.scene.add(lamp);

                    // Warm sodium light
                    const light = new THREE.PointLight(0xffcc77, 0.8, 35, 2);
                    light.position.set(px - sx * 3, 9.5, pz);
                    this.scene.add(light);
                });
            }
        }
    }

    /* ═══════════════ TRAFFIC LIGHTS ═══════════════ */
    _trafficLights() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333338, roughness: 0.6 });

        for (let r = 1; r < this.gridN; r += 2) {
            for (let c = 1; c < this.gridN; c += 2) {
                const pos = this.roadCenter(c, r);

                // Traffic light pole
                const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 8, 6);
                const pole = new THREE.Mesh(poleGeo, poleMat);
                pole.position.set(pos.x + this.roadW / 2 - 2, 4, pos.z + this.roadW / 2 - 2);
                this.scene.add(pole);

                // Signal box
                const boxGeo = new THREE.BoxGeometry(0.6, 1.8, 0.4);
                const boxMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.5 });
                const box = new THREE.Mesh(boxGeo, boxMat);
                box.position.set(pos.x + this.roadW / 2 - 2, 8.5, pos.z + this.roadW / 2 - 2);
                this.scene.add(box);

                // Lights (red, yellow, green)
                const lightColors = [0xcc2222, 0xccaa22, 0x22cc44];
                lightColors.forEach((col, i) => {
                    const lg = new THREE.SphereGeometry(0.12, 6, 6);
                    const lm = new THREE.MeshBasicMaterial({ color: col });
                    const l = new THREE.Mesh(lg, lm);
                    l.position.set(pos.x + this.roadW / 2 - 2, 9.2 - i * 0.6, pos.z + this.roadW / 2 - 1.78);
                    this.scene.add(l);
                });
            }
        }
    }

    /* ═══════════════ STREET FURNITURE ═══════════════ */
    _streetFurniture() {
        const total = this.gridN * this.step;
        const half = total / 2;

        for (let r = 0; r < this.gridN; r++) {
            for (let c = 0; c < this.gridN; c++) {
                const cx = -half + c * this.step + this.roadW + this.blockW / 2;
                const cz = -half + r * this.step + this.roadW + this.blockW / 2;

                // Dumpster at some blocks
                if (this._rng() > 0.5) {
                    const dumpMat = new THREE.MeshStandardMaterial({ color: 0x2c5c2c, roughness: 0.7 });
                    const dumpGeo = new THREE.BoxGeometry(2.5, 1.8, 1.5);
                    const dump = new THREE.Mesh(dumpGeo, dumpMat);
                    dump.position.set(cx - this.blockW / 2 + 2, 0.9, cz - this.blockW / 2 + 2);
                    dump.castShadow = true;
                    this.scene.add(dump);
                }

                // Newspaper box
                if (this._rng() > 0.6) {
                    const nbMat = new THREE.MeshStandardMaterial({ color: 0x2446ac, roughness: 0.5 });
                    const nbGeo = new THREE.BoxGeometry(0.6, 1.1, 0.5);
                    const nb = new THREE.Mesh(nbGeo, nbMat);
                    nb.position.set(cx + this.blockW / 2 - 1, 0.55, cz - this.blockW / 2 + 1.5);
                    this.scene.add(nb);
                }

                // Bench
                if (this._rng() > 0.6) {
                    const benchMat = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.8 });
                    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.6), benchMat);
                    seat.position.set(cx + this.blockW / 2 - 1, 0.55, cz);
                    this.scene.add(seat);
                    // Legs
                    const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
                    const legMat = new THREE.MeshStandardMaterial({ color: 0x333330 });
                    [-1, 1].forEach(s => {
                        const leg = new THREE.Mesh(legGeo, legMat);
                        leg.position.set(cx + this.blockW / 2 - 1 + s * 1, 0.25, cz);
                        this.scene.add(leg);
                    });
                }
            }
        }
    }

    /* ═══════════════ TREES ═══════════════ */
    _trees() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4c3722, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x285820, roughness: 0.8 });

        for (let r = 0; r <= this.gridN; r++) {
            for (let c = 0; c <= this.gridN; c++) {
                if (this._rng() > 0.4) continue;
                const pos = this.roadCenter(c, r);
                const tx = pos.x + (this._rng() > 0.5 ? 1 : -1) * (this.roadW / 2 - 1.5);
                const tz = pos.z + (this._rng() > 0.5 ? 1 : -1) * (this.roadW / 2 - 1.5);

                // Trunk
                const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
                const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                trunk.position.set(tx, 2, tz);
                trunk.castShadow = true;
                this.scene.add(trunk);

                // Canopy (irregular dodecahedron for organic look)
                const canopyGeo = new THREE.DodecahedronGeometry(2.5 + this._rng() * 1.5, 1);
                const canopy = new THREE.Mesh(canopyGeo, leafMat);
                canopy.position.set(tx, 5.5 + this._rng() * 1.5, tz);
                canopy.scale.y = 0.7;
                canopy.castShadow = true;
                this.scene.add(canopy);
            }
        }
    }

    /* ═══════════════ CONCRETE BARRIERS ═══════════════ */
    _barriers() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const barrierMat = new THREE.MeshStandardMaterial({ color: 0x999995, roughness: 0.9 });

        // Place jersey barriers at some road edges
        for (let i = 0; i < 12; i++) {
            const x = -half + this._rng() * total;
            const z = -half + Math.floor(this._rng() * (this.gridN + 1)) * this.step;
            const barrier = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.8, 2.5),
                barrierMat
            );
            barrier.position.set(x, 0.4, z + this.roadW / 2 - 2);
            barrier.receiveShadow = true;
            this.scene.add(barrier);
        }
    }

    /* ═══════════════ STREET NAME SIGNS ═══════════════ */
    _streetSigns() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const signMat = new THREE.MeshStandardMaterial({ color: 0x225522, roughness: 0.5 });

        for (let r = 0; r <= this.gridN; r += 2) {
            for (let c = 0; c <= this.gridN; c += 2) {
                const pos = this.roadCenter(c, r);
                const sign = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.06), signMat);
                sign.position.set(pos.x + this.roadW / 2 - 1, 4.2, pos.z + this.roadW / 2 - 1);
                this.scene.add(sign);
            }
        }
    }

    /* ═══════════════ STOP SIGNS ═══════════════ */
    _stopSigns() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, metalness: 0.3 });
        const signMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5 });
        const textMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

        for (let r = 1; r < this.gridN; r += 2) {
            for (let c = 0; c < this.gridN; c += 2) {
                const pos = this.roadCenter(c, r);
                const sx = pos.x + this.roadW / 2 - 1;
                const sz = pos.z + this.roadW / 2 - 1;

                // Pole
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 6), poleMat);
                pole.position.set(sx, 1.75, sz);
                this.scene.add(pole);

                // Sign face (octagon approximated by box)
                const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.04), signMat);
                sign.position.set(sx, 3.5, sz);
                sign.rotation.y = Math.PI / 4;
                this.scene.add(sign);

                // White border
                const border = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.05), textMat);
                border.position.set(sx, 3.5, sz + 0.01);
                border.rotation.y = Math.PI / 4;
                this.scene.add(border);

                // Red inner
                const inner = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.06), signMat);
                inner.position.set(sx, 3.5, sz + 0.02);
                inner.rotation.y = Math.PI / 4;
                this.scene.add(inner);
            }
        }
    }

    /* ═══════════════ FIRE HYDRANTS ═══════════════ */
    _hydrants() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.6 });
        const capMat = new THREE.MeshStandardMaterial({ color: 0xdddd44, roughness: 0.5, metalness: 0.4 });

        for (let r = 0; r <= this.gridN; r++) {
            for (let c = 0; c <= this.gridN; c++) {
                if (this._rng() > 0.25) continue;
                const pos = this.roadCenter(c, r);
                const hx = pos.x + (this._rng() > 0.5 ? 1 : -1) * (this.roadW / 2 - 1);
                const hz = pos.z + 4;

                // Body
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), hydrantMat);
                body.position.set(hx, 0.4, hz);
                this.scene.add(body);

                // Top cap
                const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 0.15, 8), capMat);
                cap.position.set(hx, 0.85, hz);
                this.scene.add(cap);

                // Side nozzles
                [-0.15, 0.15].forEach(zo => {
                    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 6), capMat);
                    nozzle.position.set(hx, 0.55, hz + zo);
                    nozzle.rotation.x = Math.PI / 2;
                    this.scene.add(nozzle);
                });
            }
        }
    }

    /* ═══════════════ BILLBOARDS ═══════════════ */
    _billboards() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x1a2b3c, roughness: 0.4 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x333338, metalness: 0.6 });

        for (let r = 0; r < this.gridN; r += 2) {
            for (let c = 0; c < this.gridN; c += 2) {
                if (this._rng() > 0.4) continue;
                const cx = -half + c * this.step + this.roadW + this.blockW / 2;
                const cz = -half + r * this.step + this.roadW + this.blockW / 2;

                const board = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 0.4), boardMat);
                board.position.set(cx, 32, cz - 12);
                board.castShadow = true;
                this.scene.add(board);

                const frame = new THREE.Mesh(new THREE.BoxGeometry(16.8, 8.8, 0.2), frameMat);
                frame.position.set(cx, 32, cz - 12.1);
                this.scene.add(frame);
            }
        }
    }

    /* ═══════════════ BUILDING AWNINGS ═══════════════ */
    _awnings() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const awningColors = [0xaa3333, 0x33aa55, 0x3355aa, 0xaa8833, 0x883388];

        for (let r = 0; r < this.gridN; r++) {
            for (let c = 0; c < this.gridN; c++) {
                if (this._rng() > 0.3) continue;
                const cx = -half + c * this.step + this.roadW + this.blockW / 2;
                const cz = -half + r * this.step + this.roadW;

                const color = this._pick(awningColors);
                const awningMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide });
                const awning = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.5), awningMat);
                awning.position.set(cx, 4, cz + 1.2);
                awning.rotation.x = -0.4;
                awning.castShadow = true;
                this.scene.add(awning);
            }
        }
    }

    /* ═══════════════ CHAIN LINK FENCES ═══════════════ */
    _fences() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const fenceMat = new THREE.MeshStandardMaterial({
            color: 0x888888, roughness: 0.5, metalness: 0.6,
            transparent: true, opacity: 0.5, side: THREE.DoubleSide
        });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x666668, roughness: 0.6, metalness: 0.4 });

        // Place fences at some block edges
        for (let r = 0; r < this.gridN; r++) {
            for (let c = 0; c < this.gridN; c++) {
                if (this._rng() > 0.2) continue;
                const cx = -half + c * this.step + this.roadW;
                const cz = -half + r * this.step + this.roadW;

                const len = this.blockW;
                const fence = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.5), fenceMat);
                fence.position.set(cx + len / 2, 1.25, cz - 0.5);
                this.scene.add(fence);

                // Posts
                for (let p = 0; p <= len; p += 6) {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 4), postMat);
                    post.position.set(cx + p, 1.4, cz - 0.5);
                    this.scene.add(post);
                }
            }
        }
    }

    /* ═══════════════ PARKING METERS ═══════════════ */
    _parkingMeters() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.6, metalness: 0.4 });
        const headMat = new THREE.MeshStandardMaterial({ color: 0x666670, roughness: 0.5, metalness: 0.5 });

        for (let r = 0; r < this.gridN; r++) {
            for (let c = 0; c < this.gridN; c++) {
                if (this._rng() > 0.35) continue;
                const cx = -half + c * this.step + this.roadW + 2;
                const cz = -half + r * this.step + this.roadW + this.blockW - 2;

                for (let m = 0; m < 3; m++) {
                    const mx = cx + m * 4;
                    // Pole
                    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), poleMat);
                    pole.position.set(mx, 0.6, cz);
                    this.scene.add(pole);
                    // Meter head
                    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), headMat);
                    head.position.set(mx, 1.3, cz);
                    this.scene.add(head);
                }
            }
        }
    }

    /* ═══════════════ UTILITY POLES ═══════════════ */
    _utilityPoles() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.85 });
        const wireMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });

        for (let r = 0; r < this.gridN; r++) {
            for (let c = 0; c <= this.gridN; c += 3) {
                const pos = this.roadCenter(c, r);
                const px = pos.x + this.roadW / 2 - 1.5;
                const pz = pos.z + this.blockW / 2;

                // Pole
                const pole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.2, 14, 6),
                    poleMat
                );
                pole.position.set(px, 7, pz);
                pole.castShadow = true;
                this.scene.add(pole);

                // Crossbar
                const crossbar = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.12, 0.12),
                    poleMat
                );
                crossbar.position.set(px, 14, pz);
                this.scene.add(crossbar);

                // Insulators
                [-1.2, 0, 1.2].forEach(offset => {
                    const ins = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6),
                        new THREE.MeshStandardMaterial({ color: 0x556655, roughness: 0.4 })
                    );
                    ins.position.set(px + offset, 14.15, pz);
                    this.scene.add(ins);
                });
            }
        }
    }

    /* ═══════════════ MANHOLE COVERS ═══════════════ */
    _manholes() {
        const total = this.gridN * this.step;
        const half = total / 2;
        const manholeMat = new THREE.MeshStandardMaterial({ color: 0x555558, roughness: 0.75, metalness: 0.4 });

        for (let r = 0; r <= this.gridN; r += 2) {
            for (let c = 0; c <= this.gridN; c += 2) {
                const pos = this.roadCenter(c, r);
                const cover = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.7, 0.7, 0.06, 12),
                    manholeMat
                );
                cover.position.set(pos.x + 3, 0.03, pos.z - 2);
                this.scene.add(cover);
            }
        }
    }

    /* ═══════════════ WORLD BOUNDARIES ═══════════════ */
    _boundaries() {
        const total = this.gridN * this.step;
        const limit = total / 2 + 20;
        this.colliders.push({ minX: -limit - 10, maxX: limit + 10, minZ: -limit - 10, maxZ: -limit });
        this.colliders.push({ minX: -limit - 10, maxX: limit + 10, minZ: limit, maxZ: limit + 10 });
        this.colliders.push({ minX: -limit - 10, maxX: -limit, minZ: -limit - 10, maxZ: limit + 10 });
        this.colliders.push({ minX: limit, maxX: limit + 10, minZ: -limit - 10, maxZ: limit + 10 });
    }

    /* ═══════════════ COLLISION ═══════════════ */
    hit(x, z, hw, hd) {
        const ax = x - hw, bx = x + hw;
        const az = z - hd, bz = z + hd;
        for (const c of this.colliders) {
            if (bx > c.minX && ax < c.maxX && bz > c.minZ && az < c.maxZ) return true;
        }
        return false;
    }
}
