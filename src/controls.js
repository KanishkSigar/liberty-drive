// Liberty City Chronicles — Input Manager
// Supports rebinding, preventDefault, and justPressed detection — Input Manager
// Frame-rate independent input with smooth interpolation

export class InputManager {
    constructor() {
        this.bindings = {
            accelerate: 'KeyW',
            reverse: 'KeyS',
            steerLeft: 'KeyA',
            steerRight: 'KeyD',
            handbrake: 'Space',
            horn: 'KeyH',
            cameraToggle: 'KeyC'
        };

        this.pressed = {};
        this.justPressed = {};
        this._load();

        window.addEventListener('keydown', e => {
            if (!this.pressed[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.pressed[e.code] = true;
            // Prevent default for game keys to avoid page scroll
            const gameKeys = Object.values(this.bindings);
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            this.pressed[e.code] = false;
            this.justPressed[e.code] = false;
        });
        window.addEventListener('blur', () => {
            this.pressed = {};
            this.justPressed = {};
        });
    }

    _load() {
        try {
            const s = localStorage.getItem('lcc-keys');
            if (s) Object.assign(this.bindings, JSON.parse(s));
        } catch(_) {}
    }

    save() {
        localStorage.setItem('lcc-keys', JSON.stringify(this.bindings));
    }

    rebind(action, code) {
        this.bindings[action] = code;
        this.save();
    }

    is(action) {
        return !!this.pressed[this.bindings[action]];
    }

    wasJustPressed(action) {
        const code = this.bindings[action];
        if (this.justPressed[code]) {
            this.justPressed[code] = false;
            return true;
        }
        return false;
    }

    label(action) {
        const c = this.bindings[action];
        if (!c) return '?';
        if (c.startsWith('Key')) return c.slice(3);
        if (c === 'Space') return 'SPACE';
        if (c.startsWith('Arrow')) return c.slice(5).toUpperCase();
        if (c.startsWith('Digit')) return c.slice(5);
        return c;
    }
}
