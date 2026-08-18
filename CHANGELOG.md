# Changelog

## v1.7.0 — Police Air Support Helicopter & Turbo Backfire
- LCPD Air Support Helicopter (`src/heli.js`) with rotating rotors and tracking searchlight at Wanted 3+ Stars
- Helicopter heavy rotor thumping audio synthesizer (`playHeliRotor`)
- Turbo Backfire Exhaust Pops (`src/particles.js`) and snappy pop audio synthesizer (`playBackfire`)
- Checkpoint vertical sky beacon columns and levitating bobbing animation
- Expanded particle buffer capacity to 650 units and skid decals to 160 units

## v1.6.0 � Release — Police Roadblocks, Spike Strips & Chassis Underglow
- Police Barricades & Spike Strip Traps (`src/roadblocks.js`) spawning at Wanted 2+ Stars
- Dynamic Tire Puncture physics with handling instability and top speed penalty
- Chassis Underglow Neon Lighting with customizable vehicle roster color glows (Cyan, Crimson, Electric Blue)
- Ground neon reflection plane decals beneath vehicles
- Police Radio Dispatch chatter audio synthesizer (`playPoliceRadio`)
- Urgent Countdown audio tick synthesizer (`playUrgentTick`)
- Dynamic Toast alert styling (Danger, Success) with icon badges
- Expanded particle capacity buffer to 550 units and skid decals to 150 ribbons

## v1.5.0 — Drive-By Weapons & Explosions Overhaul
- Uzi 9mm Drive-By Shooting system (`src/weapons.js`) with Q (Left) and E (Right) window firing
- High-velocity bullet tracers and muzzle flash spark emitters
- Automatic gunfire audio synthesizer (`playGunfire`) in Web Audio engine
- Vehicle explosion blast synthesizer and expanding radial fire shockwaves (`src/particles.js`)
- HUD UZI 9MM weapon and live ammo counter display (`150 / 150`)
- Rebindable drive-by shoot keys in Settings menu
- Expanded particle capacity buffer to 480 units

## v1.4.0 — Pay 'n' Spray Garages & Thunderstorm Weather
- Pay 'n' Spray Garages (`src/spray.js`) at Portland Docks and Hepburn Heights for vehicle repair, wanted heat wipe, and custom resprays
- Dynamic Sky Lightning Flashes and sub-bass Thunder Rumble synthesizer (`src/weather.js`)
- Spray paint hiss pressure sound synthesizer
- Billowing white tire friction drift smoke (`src/particles.js`)
- Dynamic tire squeal pitch modulation scaling with drift slip ratio
- Expanded particle buffer capacity to 400 units and skid decals to 120 units

## v1.3.0 — Pedestrians, Dynamic Day/Night & Stunts Overhaul
- Full Pedestrian AI simulation (`src/pedestrians.js`) with walk animations and vehicle avoidance
- Dynamic Celestial Lighting (`src/lighting.js`) with sun/moon orbits and day/night transitions
- Stunt Jump & Airtime Tracker (`src/stunts.js`) with insane stunt bonuses & airtime scoring
- Live In-Game Digital Clock HUD display with 12-hour AM/PM formatting
- Projected vehicle headlight spotlight cones and street lamp point lights
- Pedestrian panic screech sound synthesizer
- Stunt victory arpeggio chime fanfare

## v1.2.0 — Destructible Street Props & Dynamic Skid Marks
- Destructible Fire Hydrants with vertical pressurized water geyser fountains on collision
- Dynamic Road Skid Marks (`src/skid.js`) with persistent rubber tire decal ribbons on asphalt
- Water splash audio synthesizer in Web Audio engine
- Mission Passed 3-Star Performance Rating System based on remaining time & vehicle health
- Expanded particle buffer capacity to 300 units
- Enhanced street furniture materials (dumpsters, newspaper boxes, park benches)

## v1.1.0 — Police Pursuit AI & Vehicle Garage Overhaul
- Added 3 Playable Vehicle Classes: Kuruma Sedan, Stinger Sports Coupe, and Police Enforcer
- Interactive Garage Carousel selector in Start Screen with live vehicle specs
- Active AI Police Cruiser Pursuit vehicles spawning at wanted stars with flashing siren bars
- Dynamic vehicle engine damage smoke & fire ember particle systems
- Police radar blip indicators (flashing red/blue dots on minimap)
- Vehicle armor scaling and customized handling profiles per car class

## v1.0.0 — Police Pursuit, Radio & Nitro Milestone Release
- Added Police Wanted Level System (1 to 3 Stars) with crime heat accumulation and active star meter
- Procedural Web Audio Radio Synthesizer (Flashback FM, Head Radio, Rise FM) on R key
- Nitro Boost Acceleration System (Shift key) with top speed surge (160 MPH) and cyan exhaust flame particles
- Dynamic camera speed warp effects during active nitro
- Added dual-tone sweeping Police Siren audio synthesizer
- Added Wanted Star HUD meter and Radio station overlay notification
- Added Nitro fuel gauge bar to HUD stats

## v0.9.0 — Glassmorphic UI & Dynamics Overhaul
- Glassmorphic UI design system with backdrop blur filters and gold glow accents
- Added vehicle armor condition meter with dynamic color transition (Green -> Yellow -> Red)
- Added live engine RPM gauge bar track to speed stat box
- Added radar cardinal direction indicators (N, E, S, W) around minimap
- Added GPS dashed route path line on radar targeting package checkpoints
- Overhauled Start, Wasted, and Mission Passed overlay panels with badge tags & divider lines
- Upgraded buttons with metallic gold gradients and elevation hover effects
- Cyan player radar blip with expanded glow effects

## v0.8.0 — Audio & Visual Dynamics Release
- Procedural audio synthesizer additions: gear shift thuds, tire squeals, and mute controls
- Dynamic vehicle body roll and pitch tilt physics during hard acceleration, braking, and cornering
- Expanded traffic system with Taxi cabs and expanded color palette
- Added rooftop billboard advertisements across commercial blocks
- Added 6th mission: LIBERTY OVERHAUL (6 checkpoints)
- Gear indicator (R, N, 1-5) integrated into HUD
- Expanded max particle capacity to 200 with rain particle support
- Performance and visual polish pass

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
