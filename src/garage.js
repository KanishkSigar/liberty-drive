// Liberty City Chronicles — Vehicle Garage Roster
// Defines playable vehicle classes, performance attributes, and visual themes

export const VEHICLE_ROSTER = [
    {
        id: 'sedan',
        name: 'KURUMA SEDAN',
        desc: 'Balanced street performance with reliable handling.',
        color: 0x3a5878,
        topSpeed: 136,
        accelForce: 108,
        steerRate: 3.2,
        armor: 100
    },
    {
        id: 'sports',
        name: 'STINGER COUPE',
        desc: 'High acceleration sports car with rapid cornering.',
        color: 0xc82020,
        topSpeed: 158,
        accelForce: 125,
        steerRate: 3.6,
        armor: 80
    },
    {
        id: 'enforcer',
        name: 'POLICE ENFORCER',
        desc: 'Reinforced patrol cruiser with heavy armor and ram power.',
        color: 0x1a1a24,
        topSpeed: 142,
        accelForce: 115,
        steerRate: 3.0,
        armor: 150
    }
];

export class GarageManager {
    constructor() {
        this.selectedIdx = 0;
    }

    getSelected() {
        return VEHICLE_ROSTER[this.selectedIdx];
    }

    next() {
        this.selectedIdx = (this.selectedIdx + 1) % VEHICLE_ROSTER.length;
        return this.getSelected();
    }

    prev() {
        this.selectedIdx = (this.selectedIdx - 1 + VEHICLE_ROSTER.length) % VEHICLE_ROSTER.length;
        return this.getSelected();
    }
}
