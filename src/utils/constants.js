// NEON RIFT - Core Game Constants & Configuration

export const HERO_CAR_MODEL_PATH = `${import.meta.env.BASE_URL}models/hero-car.glb`.replace('//', '/');

export const COLORS = {
  bgDark: '#07080d',
  bgVoid: '#04020a',
  graphite: '#0e111a',
  graphiteLight: '#1b2030',
  cyanNeon: '#00f3ff',
  cyanGlow: 'rgba(0, 243, 255, 0.6)',
  purpleNeon: '#b026ff',
  purpleGlow: 'rgba(176, 38, 255, 0.6)',
  magentaNeon: '#ff007f',
  redHazard: '#ff1744',
  amberWarning: '#ffb703',
  whiteHot: '#e0f7ff',
  roadDark: '#080a10',
  roadMarking: '#00f3ff',
  roadBarrierCyan: '#00e5ff',
  roadBarrierPurple: '#9d4edd',
};

export const GAME_SECTORS = {
  NEON_CITY: {
    id: 'NEON_CITY',
    name: 'SECTOR 01: NEON HIGHWAY',
    startDist: 0,
    portalDist: 1100, // Where the rift portal starts appearing
    endDist: 1300,    // Where the warp occurs
    fogColor: '#070a14',
    fogDensity: 0.015,
  },
  PORTAL_WARP: {
    id: 'PORTAL_WARP',
    name: 'DIMENSIONAL BREACH',
    duration: 3.5, // seconds of warp event
  },
  RIFT_WORLD: {
    id: 'RIFT_WORLD',
    name: 'SECTOR 02: THE RIFT VOID',
    startDist: 1300,
    escapeDist: 2600, // Where final escape horizon starts
    endDist: 2900,    // Victory line!
    fogColor: '#0a0316',
    fogDensity: 0.012,
  },
  FINAL_ESCAPE: {
    id: 'FINAL_ESCAPE',
    name: 'OVERDRIVE EXODUS',
    startDist: 2600,
    endDist: 2900,
  }
};

export const TOTAL_RACE_DISTANCE = 2900; // Total meters to finish line

export const LANES = [-5.2, 0, 5.2]; // 3 lanes coordinates in X
export const ROAD_WIDTH = 15.0;      // Total road width in world units
export const ROAD_SEGMENT_LENGTH = 50; // Length of each road chunk
export const NUM_ROAD_SEGMENTS = 12;   // Rolling road pool segments ahead

export const PHYSICS = {
  BASE_SPEED: 45,        // Normal cruising speed (approx 120 km/h)
  MAX_SPEED: 70,         // Normal top speed (approx 180 km/h)
  NITRO_SPEED: 110,      // Boost top speed (approx 280 km/h)
  ACCELERATION: 38,      // Units per second^2
  NITRO_ACCEL: 75,       // While boosting
  BRAKING: 55,           // Deceleration when braking
  NATURAL_DECEL: 18,     // Coasting deceleration
  STEER_SPEED: 16.0,     // Lateral movement speed
  STEER_LERP: 12.0,      // Smoothing factor
  DRIFT_FACTOR: 1.4,     // Extra lateral agility during drift
  MAX_STEER_X: 6.2,      // Road boundary limit
  SHIELD_MAX: 100,
  SHIELD_DAMAGE_CRASH: 25,
  NITRO_MAX: 100,
  NITRO_CONSUMPTION: 26, // % per second while boosting
  NITRO_REGEN: 7,        // % per second while not boosting
};

export const CONTROLS_INFO = [
  { key: 'W / ↑', label: 'Accelerate' },
  { key: 'S / ↓', label: 'Brake / Reverse' },
  { key: 'A / ←', label: 'Steer Left' },
  { key: 'D / →', label: 'Steer Right' },
  { key: 'SPACE', label: 'Nitro Overdrive' },
  { key: 'SHIFT', label: 'Cyber Drift' },
  { key: 'ESC', label: 'System Pause' },
];
