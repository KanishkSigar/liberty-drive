# Changelog

## v0.7.0 — Sound Engine & Multi-Cam Release
- Procedural Web Audio API sound synthesizer engine (`audio.js`)
- Real-time engine rev audio pitch scaling with vehicle speed
- Vehicle horn sound on H key, crash impact thud, and package pickup chime
- Multi-view camera switching (Chase Cam, Far Chase, Bumper/Hood Cam) via C key
- Particle system integration for exhaust smoke, tire skid marks, and collision sparks
- Full integration of TrafficManager, WeatherSystem, ParticleSystem, and HUD controllers
- Enhanced collision detection with visual spark emitters and dynamic audio thud

## v0.6.0 — Expanded World
- Expanded city grid to 7x7 blocks
- Wider roads (26 units) for better driving
- 5th mission: COAST TO COAST
- Extracted traffic system to dedicated module
- Added weather system module
- Added particle system module
- Added HUD utility module
- Physics fine-tuning pass
- UI polish and transitions

## v0.5.0 — Graphics Overhaul
- Sky dome with hazy overcast gradient
- Water plane surrounding city island
- Three building facade types: brick, concrete, glass
- Weathering and water stain effects on buildings
- Rooftop AC units and water tanks
- Fire escape ladders
- Sidewalks with curbs and crosswalks
- Traffic lights with RGB signals
- Street furniture: dumpsters, benches, newspaper boxes
- Trees with organic dodecahedron canopies
- Storm drains and manhole covers

## v0.4.0 — Controls Fix
- Frame-rate independent physics with delta time
- preventDefault on game keys
- Smooth steering interpolation
- Camera smoothing improvements
- Horn and camera toggle bindings

## v0.3.0 — Car Detail
- Windshield wipers
- Front splitter
- Rain gutters
- Fuel cap
- Chrome body molding
- Rear badge emblem
- Wheel well arch trim
- Third brake light
- Improved tire and rim geometry

## v0.2.0 — UI Polish
- Screen shake on collision
- Mission counter HUD
- Distance to checkpoint display
- Improved panel styling
- Better toast notifications

## v0.1.0 — Initial Release
- 3D city with procedural buildings
- Driveable car with WASD controls
- Mission-based gameplay
- Minimap radar
