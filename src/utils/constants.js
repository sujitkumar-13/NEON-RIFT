// NEON RIFT - Core Game Constants & Configuration

export const HERO_CAR_MODEL_PATH = `${import.meta.env.BASE_URL}models/hero-car.glb`.replace('//', '/');

export const COLORS = {
  bgDark: '#080b14',
  bgVoid: '#04020a',
  graphite: '#161c28',
  graphiteLight: '#232b3d',
  roadSurface: '#181e2c',
  curbColor: '#283244',
  cyanNeon: '#00f3ff',
  cyanGlow: 'rgba(0, 243, 255, 0.6)',
  purpleNeon: '#b026ff',
  purpleGlow: 'rgba(176, 38, 255, 0.6)',
  magentaNeon: '#ff007f',
  redHazard: '#ff1744',
  amberWarning: '#ffb703',
  whiteHot: '#e0f7ff',
  roadDark: '#141824',
  roadMarking: '#00f3ff',
  roadBarrierCyan: '#00f3ff',
  roadBarrierPurple: '#b026ff',
};

export const GAME_SECTORS = {
  NEON_CITY: {
    id: 'NEON_CITY',
    name: 'SECTOR 01: NEON HIGHWAY',
    startDist: 0,
    portalDist: 1050, // Where the rift portal starts appearing
    endDist: 1250,    // Where the warp occurs
    fogColor: '#080b14',
    fogNear: 35,
    fogFar: 320,
  },
  PORTAL_WARP: {
    id: 'PORTAL_WARP',
    name: 'DIMENSIONAL BREACH',
    duration: 2.8,
  },
  RIFT_WORLD: {
    id: 'RIFT_WORLD',
    name: 'SECTOR 02: THE RIFT VOID',
    startDist: 1250,
    escapeDist: 2500, // Where final escape horizon starts
    endDist: 2800,    // Victory line!
    fogColor: '#0a0316',
    fogNear: 25,
    fogFar: 300,
  },
  FINAL_ESCAPE: {
    id: 'FINAL_ESCAPE',
    name: 'OVERDRIVE EXODUS',
    startDist: 2500,
    endDist: 2800,
  }
};

export const TOTAL_RACE_DISTANCE = 2800; // Total meters to finish line

export const LANES = [-5.2, 0, 5.2]; // 3 lanes coordinates in X
export const ROAD_WIDTH = 15.6;      // Total road width in world units
export const ROAD_SEGMENT_LENGTH = 50; // Length of each road chunk
export const NUM_ROAD_SEGMENTS = 14;   // Rolling road pool segments ahead

export const PHYSICS = {
  BASE_SPEED: 48,        // Normal cruising speed (~130 km/h)
  MAX_SPEED: 72,         // Normal top speed (~200 km/h)
  NITRO_SPEED: 112,      // Boost top speed (~310 km/h)
  ACCELERATION: 42,      // Units per second^2
  NITRO_ACCEL: 80,       // While boosting
  BRAKING: 60,           // Deceleration when braking
  NATURAL_DECEL: 16,     // Smooth coasting deceleration
  STEER_SPEED: 17.5,     // Responsive lateral movement speed
  STEER_LERP: 14.0,      // Smoothing factor
  DRIFT_FACTOR: 1.45,    // Extra lateral agility during drift
  MAX_STEER_X: 6.4,      // Road boundary limit
  SHIELD_MAX: 100,
  SHIELD_DAMAGE_CRASH: 18, // Fair damage allows ~5 crashes before failure
  NITRO_MAX: 100,
  NITRO_CONSUMPTION: 20, // % per second while boosting (5 full seconds of nitro)
  NITRO_REGEN: 9,        // % per second while not boosting
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
