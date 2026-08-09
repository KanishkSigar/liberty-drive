# Liberty City Chronicles (v1.1.0)

A GTA III-inspired 3D driving game built entirely with Three.js and vanilla JavaScript.

![Liberty City Chronicles](https://img.shields.io/badge/engine-Three.js-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Vehicle Garage Roster** — 3 playable car classes (Kuruma Sedan, Stinger Sports Coupe, Police Enforcer) with unique handling & armor
- **AI Police Pursuit System** — Cruiser squad cars chase and ram player vehicles with flashing siren light bars at high wanted levels
- **Dynamic Vehicle Damage** — Engine bay smoke & flame ember particle emitters when vehicle armor drops below critical thresholds
- **Police Wanted Level System** — 1-3 Stars wanted meter with collision heat accumulation and siren alerts
- **Procedural Retro Radio** — 3 synthwave/funk/techno stations (Flashback FM, Head Radio, Rise FM) on R key
- **Nitro Boost System** — High-speed nitrous boost (160 MPH) with blue exhaust flame particles on Shift key
- **Glassmorphic HUD & UI** — Modern glass panels with armor meter, RPM gauge, and nitro bar
- **Minimap Radar with GPS & Compass** — Rotating minimap with N/E/S/W compass ring, target GPS route line, and police blips

- **Police Wanted Level System** — 1-3 Stars wanted meter with collision heat accumulation and siren alerts
- **Procedural Retro Radio** — 3 synthwave/funk/techno stations (Flashback FM, Head Radio, Rise FM) on R key
- **Nitro Boost System** — High-speed nitrous boost (160 MPH) with blue exhaust flame particles on Shift key
- **Glassmorphic HUD & UI** — Modern glass panels with armor meter, RPM gauge, and nitro bar
- **Minimap Radar with GPS & Compass** — Rotating minimap with N/E/S/W compass ring and target GPS route line
- **GTA III-style city** — Procedurally generated with brick, concrete, glass facades, and rooftop billboards
- **Detailed car model & physics** — Metallic paint, glass windows, dynamic chassis body roll & pitch tilt
- **Procedural Sound Engine** — Real-time Web Audio synth for engine RPM, tire squeals, gear shifts, horn, and crash thuds
- **Mission system** — 6 package collection missions with dynamic timers

- **Glassmorphic HUD & UI (v0.9.0)** — Modern glass panels with backdrop blur, glow accents, armor meter, and RPM gauge
- **Minimap Radar with GPS & Compass** — Rotating minimap with N/E/S/W compass ring, target GPS route line, and cyan player blip
- **GTA III-style city** — Procedurally generated with brick, concrete, glass facades, and rooftop billboards
- **Detailed car model & physics** — Metallic paint, glass windows, dynamic chassis body roll & pitch tilt
- **Procedural Sound Engine** — Real-time Web Audio synth for engine RPM, tire squeals, gear shifts, horn, and crash thuds
- **NPC traffic system** — AI sedans and yellow taxi cabs driving through the city grid
- **Mission system** — 6 package collection missions with dynamic timers

- **GTA III-style city** — Procedurally generated with brick, concrete, glass facades, and rooftop billboards
- **Detailed car model & physics** — Metallic paint, glass windows, chrome trim, dynamic chassis body roll & pitch tilt
- **Procedural Sound Engine** — Real-time Web Audio synth for engine RPM, tire squeals, gear shifts, horn, and crash thuds
- **NPC traffic system** — AI sedans and yellow taxi cabs driving through the city grid
- **Mission system** — 6 package collection missions with dynamic timers
- **Minimap radar & HUD** — Rotating overhead radar map with gear indicator (R, N, 1-5) and checkpoint distance markers

- **GTA III-style city** — Procedurally generated with brick, concrete, and glass facades
- **Detailed car model** — Chrome trim, glass windows, working headlights and brake lights
- **Frame-rate independent physics** — Smooth driving at any refresh rate
- **NPC traffic** — AI cars driving through the streets
- **Mission system** — 4 package collection missions with time limits
- **Minimap radar** — Rotating overhead map with checkpoint markers
- **Customizable controls** — Rebind any key through the settings menu
- **Environmental detail** — Trees, fire hydrants, stop signs, traffic lights, dumpsters, benches, utility poles, awnings, and more
- **GTA III atmosphere** — Hazy overcast sky, distance fog, warm sodium street lights, water surrounding the island city

## Controls

| Key | Action |
|-----|--------|
| W | Accelerate |
| S | Brake / Reverse |
| A / D | Steer Left / Right |
| Space | Handbrake |
| H | Horn |
| C | Toggle Camera View |
| R | Toggle Radio Station |
| Shift | Nitro Boost |
| < / > | Select Vehicle in Menu |
| C | Camera Toggle |

## Tech Stack

- **Three.js (r128)** — 3D rendering
- **Vanilla JS (ES Modules)** — Game logic
- **Canvas 2D** — Procedural textures and minimap
- **CSS3** — UI overlay and HUD

## Running Locally

```bash
# Any static file server will work
npx serve .
# Or Python
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Architecture

```
src/
  controls.js  — Input manager with rebinding
  car.js       — Vehicle model, physics, rendering
  city.js      — Procedural city generator
  game.js      — Main game loop, camera, missions, HUD
index.html     — Entry point with UI overlays
style.css      — GTA III-themed dark UI
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT
