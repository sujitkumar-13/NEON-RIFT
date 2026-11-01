// NEON RIFT - Central Reactive Game State Manager
import { GAME_SECTORS, PHYSICS, TOTAL_RACE_DISTANCE } from '../utils/constants';
import { soundManager } from '../utils/audioSynthesizer';

class GameStateManager {
  constructor() {
    this.listeners = new Set();
    this.hudListeners = new Set();
    this.resetState();
  }

  resetState() {
    this.state = {
      phase: 'MENU', // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY'
      sector: 'NEON_CITY', // 'NEON_CITY' | 'PORTAL_WARP' | 'RIFT_WORLD' | 'FINAL_ESCAPE'
      speed: 0,
      kmh: 0,
      distance: 0,
      score: 0,
      shield: PHYSICS.SHIELD_MAX,
      nitro: PHYSICS.NITRO_MAX,
      isBoosting: false,
      isDrifting: false,
      playerX: 0,
      playerZ: 0,
      carYaw: 0,
      carRoll: 0,
      carPitch: 0,
      rivalDistanceOffset: 35, // starts 35m ahead
      portalProgress: 0,
      cameraShake: 0,
      timeElapsed: 0,
      maxSpeedReached: 0,
      nitroUsedCount: 0,
      impactFlash: false,
      sectorAnnounce: null,
      warpFlashIntensity: 0,
      isAudioMuted: soundManager.isMuted,
    };
  }

  getState() {
    return this.state;
  }

  // Subscribe to major state changes (phases, sectors, game over)
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // Subscribe to high-frequency HUD telemetry updates (speed, nitro, shield, score)
  subscribeHUD(fn) {
    this.hudListeners.add(fn);
    return () => this.hudListeners.delete(fn);
  }

  notifyMajor() {
    const s = { ...this.state };
    for (const fn of this.listeners) {
      fn(s);
    }
  }

  notifyHUD() {
    for (const fn of this.hudListeners) {
      fn(this.state);
    }
  }

  setPhase(phase) {
    if (this.state.phase === phase) return;
    this.state.phase = phase;

    if (phase === 'PLAYING') {
      soundManager.startEngine();
      soundManager.startBGM();
    } else if (phase === 'PAUSED') {
      soundManager.stopEngine();
    } else if (phase === 'GAME_OVER') {
      soundManager.stopEngine();
      soundManager.stopBGM();
      soundManager.playGameOver();
    } else if (phase === 'VICTORY') {
      soundManager.stopEngine();
      soundManager.stopBGM();
      soundManager.playVictory();
    } else if (phase === 'MENU') {
      soundManager.stopEngine();
      soundManager.stopBGM();
    }

    this.notifyMajor();
  }

  startRace() {
    this.resetState();
    this.state.phase = 'PLAYING';
    soundManager.playClick();
    soundManager.startEngine();
    soundManager.startBGM();
    this.setAnnouncement('ENGAGE OVERDRIVE - SECTOR 01');
    this.notifyMajor();
    this.notifyHUD();
  }

  pause() {
    if (this.state.phase === 'PLAYING') {
      this.setPhase('PAUSED');
    }
  }

  resume() {
    if (this.state.phase === 'PAUSED') {
      this.setPhase('PLAYING');
    }
  }

  returnToMenu() {
    this.resetState();
    this.setPhase('MENU');
  }

  setAnnouncement(text, duration = 3000) {
    this.state.sectorAnnounce = text;
    this.notifyMajor();
    if (this.announceTimer) clearTimeout(this.announceTimer);
    if (text) {
      this.announceTimer = setTimeout(() => {
        this.state.sectorAnnounce = null;
        this.notifyMajor();
      }, duration);
    }
  }

  triggerImpact(damage = PHYSICS.SHIELD_DAMAGE_CRASH) {
    this.state.shield = Math.max(0, this.state.shield - damage);
    this.state.speed = Math.max(15, this.state.speed * 0.45);
    this.state.cameraShake = 1.0;
    this.state.impactFlash = true;

    soundManager.playCollision();

    setTimeout(() => {
      this.state.impactFlash = false;
      this.notifyHUD();
    }, 250);

    if (this.state.shield <= 0) {
      this.setPhase('GAME_OVER');
    } else {
      this.notifyHUD();
    }
  }

  triggerWarp() {
    if (this.state.sector === 'PORTAL_WARP' || this.state.sector === 'RIFT_WORLD') return;
    this.state.sector = 'PORTAL_WARP';
    this.state.warpFlashIntensity = 1.0;
    this.state.cameraShake = 1.5;
    this.setAnnouncement('DIMENSIONAL HORIZON BREACHED! ENTERING RIFT VOID', 4000);
    soundManager.playPortalWarp();
    this.notifyMajor();

    // After warp duration, switch to Rift World
    setTimeout(() => {
      this.state.sector = 'RIFT_WORLD';
      this.state.warpFlashIntensity = 0.3;
      this.notifyMajor();
      setTimeout(() => {
        this.state.warpFlashIntensity = 0;
        this.notifyMajor();
      }, 1000);
    }, 1800);
  }

  triggerVictory() {
    if (this.state.phase === 'VICTORY') return;
    this.setAnnouncement('FINAL ESCAPE SUCCESSFUL - RIFT OVERCOME!', 5000);
    this.setPhase('VICTORY');
  }

  updateFrame(delta, controls) {
    if (this.state.phase !== 'PLAYING') return;

    const s = this.state;
    s.timeElapsed += delta;

    // Throttle / Brake / Boost calculations
    let targetSpeed;
    const isAccelerating = controls.forward;
    const isBraking = controls.backward;
    const wantsBoost = controls.boost && s.nitro > 5;
    const isDrifting = controls.drift;

    if (wantsBoost) {
      targetSpeed = PHYSICS.NITRO_SPEED;
      s.isBoosting = true;
      s.nitro = Math.max(0, s.nitro - PHYSICS.NITRO_CONSUMPTION * delta);
      s.nitroUsedCount += delta;
      s.cameraShake = Math.max(s.cameraShake, 0.15);
      s.score += Math.round(180 * delta);
    } else {
      s.isBoosting = false;
      // Nitro recharges when cruising
      if (s.nitro < PHYSICS.NITRO_MAX) {
        s.nitro = Math.min(PHYSICS.NITRO_MAX, s.nitro + PHYSICS.NITRO_REGEN * delta);
      }

      if (isAccelerating) {
        targetSpeed = PHYSICS.MAX_SPEED;
        s.score += Math.round(100 * delta);
      } else if (isBraking) {
        targetSpeed = 12;
      } else {
        targetSpeed = PHYSICS.BASE_SPEED;
        s.score += Math.round(50 * delta);
      }
    }

    // Accelerate or decelerate smoothly towards target
    const accelRate = s.isBoosting ? PHYSICS.NITRO_ACCEL : (isAccelerating ? PHYSICS.ACCELERATION : (isBraking ? PHYSICS.BRAKING : PHYSICS.NATURAL_DECEL));
    if (s.speed < targetSpeed) {
      s.speed = Math.min(targetSpeed, s.speed + accelRate * delta);
    } else if (s.speed > targetSpeed) {
      s.speed = Math.max(targetSpeed, s.speed - accelRate * delta);
    }

    // Update KM/H display
    s.kmh = Math.round(s.speed * 2.8);
    if (s.kmh > s.maxSpeedReached) {
      s.maxSpeedReached = s.kmh;
    }

    // Sound updates
    soundManager.updateEnginePitch(s.speed / PHYSICS.MAX_SPEED, s.isBoosting);

    // Lateral Steering
    let steerInput = 0;
    if (controls.left) steerInput -= 1;
    if (controls.right) steerInput += 1;

    const lateralAgility = isDrifting ? PHYSICS.STEER_SPEED * PHYSICS.DRIFT_FACTOR : PHYSICS.STEER_SPEED;
    s.playerX += steerInput * lateralAgility * delta;
    s.playerX = Math.max(-PHYSICS.MAX_STEER_X, Math.min(PHYSICS.MAX_STEER_X, s.playerX));

    // Car visual attitude lerping
    const targetYaw = -steerInput * (isDrifting ? 0.38 : 0.22);
    const targetRoll = -steerInput * (isDrifting ? 0.25 : 0.14);
    const targetPitch = isBraking ? 0.08 : (s.isBoosting ? -0.06 : (isAccelerating ? -0.03 : 0));

    s.carYaw += (targetYaw - s.carYaw) * Math.min(1, delta * PHYSICS.STEER_LERP);
    s.carRoll += (targetRoll - s.carRoll) * Math.min(1, delta * PHYSICS.STEER_LERP);
    s.carPitch += (targetPitch - s.carPitch) * Math.min(1, delta * 8.0);
    s.isDrifting = isDrifting && Math.abs(steerInput) > 0.1;

    if (s.isDrifting && Math.random() < 0.2) {
      soundManager.playDriftSkid();
    }

    // Longitudinal advance
    const distDelta = s.speed * delta;
    s.distance += distDelta;
    s.playerZ -= distDelta; // Car moves in -Z direction or road moves past

    // Camera shake decay
    if (s.cameraShake > 0) {
      s.cameraShake = Math.max(0, s.cameraShake - delta * 3.5);
    }

    // Sector Progression Checks
    if (s.distance >= GAME_SECTORS.NEON_CITY.portalDist && s.distance < GAME_SECTORS.NEON_CITY.endDist) {
      if (s.sector === 'NEON_CITY' && !this.portalWarned) {
        this.portalWarned = true;
        this.setAnnouncement('WARNING: DIMENSIONAL RIFT ANOMALY APPROACHING', 3500);
      }
    }

    // Portal warp trigger
    if (s.distance >= GAME_SECTORS.NEON_CITY.endDist && s.sector === 'NEON_CITY') {
      this.triggerWarp();
    }

    // Final Escape trigger
    if (s.distance >= GAME_SECTORS.RIFT_WORLD.escapeDist && s.sector === 'RIFT_WORLD') {
      s.sector = 'FINAL_ESCAPE';
      this.setAnnouncement('CRITICAL OVERDRIVE! ESCAPE HORIZON DETECTED', 3000);
      this.notifyMajor();
    }

    // Victory finish trigger
    if (s.distance >= TOTAL_RACE_DISTANCE) {
      this.triggerVictory();
    }

    // Rival car AI progress
    // Rival maintains a relative position with dynamic rubber-banding
    const rivalBaseSpeed = s.sector === 'RIFT_WORLD' ? 62 : 55;
    const rivalSpeedDelta = (rivalBaseSpeed - s.speed) * delta;
    s.rivalDistanceOffset = Math.max(-50, Math.min(80, s.rivalDistanceOffset + rivalSpeedDelta));

    // Notify HUD listeners
    this.notifyHUD();
  }
}

export const gameState = new GameStateManager();
