// NEON RIFT - High-Performance Particle Systems
// Nitro exhaust particles, collision sparks & cosmic speed streaks
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS } from '../utils/constants';

const NUM_NITRO_PARTICLES = 60;
const NUM_WARP_STREAKS = 80;

export function Particles() {
  const nitroPointsRef = useRef();
  const streaksLinesRef = useRef();

  // 1. Nitro Exhaust Particles Pool
  const [nitroGeo, nitroData] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_NITRO_PARTICLES * 3);
    const opacities = new Float32Array(NUM_NITRO_PARTICLES);
    const data = [];

    for (let i = 0; i < NUM_NITRO_PARTICLES; i++) {
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      opacities[i] = 0;
      data.push({
        active: false,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        vx: 0,
        vy: 0,
        vz: 0,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
    return [geo, data];
  }, []);

  // 2. High-Speed Warp Streaks Pool
  const [streakGeo, streakData] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_WARP_STREAKS * 6); // 2 vertices per line streak
    const data = [];

    for (let i = 0; i < NUM_WARP_STREAKS; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = Math.random() * 14 + 0.5;
      const z = -Math.random() * 120;
      const len = 8 + Math.random() * 18;

      positions[i * 6 + 0] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z - len;

      data.push({ x, y, z, len, speed: 70 + Math.random() * 90 });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geo, data];
  }, []);

  useFrame((_, delta) => {
    const s = gameState.getState();
    const isPlaying = s.phase === 'PLAYING';
    const isBoosting = s.isBoosting;

    // --- Update Nitro Particles ---
    if (nitroPointsRef.current) {
      const posAttr = nitroGeo.attributes.position;
      const positions = posAttr.array;

      if (isPlaying && (isBoosting || s.speed > 50)) {
        // Spawn new nitro particles from left and right exhaust nozzles
        const spawnCount = isBoosting ? 4 : 1;
        let spawned = 0;

        for (let i = 0; i < NUM_NITRO_PARTICLES && spawned < spawnCount; i++) {
          const p = nitroData[i];
          if (!p.active) {
            p.active = true;
            p.life = 0;
            const isLeft = Math.random() < 0.5;
            const exhaustX = s.playerX + (isLeft ? -0.45 : 0.45) + (Math.random() - 0.5) * 0.15;
            const exhaustY = 0.25 + (Math.random() - 0.5) * 0.1;
            const exhaustZ = 1.6;

            positions[i * 3 + 0] = exhaustX;
            positions[i * 3 + 1] = exhaustY;
            positions[i * 3 + 2] = exhaustZ;

            p.vx = (Math.random() - 0.5) * 1.5;
            p.vy = Math.random() * 0.8;
            p.vz = 25 + Math.random() * 30; // shoot backward
            spawned++;
          }
        }
      }

      for (let i = 0; i < NUM_NITRO_PARTICLES; i++) {
        const p = nitroData[i];
        if (p.active) {
          p.life += delta;
          if (p.life >= p.maxLife) {
            p.active = false;
            positions[i * 3 + 1] = -100;
          } else {
            positions[i * 3 + 0] += p.vx * delta;
            positions[i * 3 + 1] += p.vy * delta;
            positions[i * 3 + 2] += p.vz * delta;
          }
        }
      }
      posAttr.needsUpdate = true;
    }

    // --- Update Warp Streaks ---
    if (streaksLinesRef.current) {
      const posAttr = streakGeo.attributes.position;
      const positions = posAttr.array;
      const forwardSpeed = isPlaying ? s.speed * (isBoosting ? 2.2 : 1.2) : 25;

      for (let i = 0; i < NUM_WARP_STREAKS; i++) {
        const d = streakData[i];
        d.z += forwardSpeed * delta;

        if (d.z > 15) {
          d.z = -130 - Math.random() * 40;
          d.x = (Math.random() - 0.5) * 35;
          d.y = Math.random() * 12 + 0.5;
        }

        const streakLen = isBoosting ? d.len * 2.2 : d.len;
        positions[i * 6 + 0] = d.x;
        positions[i * 6 + 1] = d.y;
        positions[i * 6 + 2] = d.z;

        positions[i * 6 + 3] = d.x;
        positions[i * 6 + 4] = d.y;
        positions[i * 6 + 5] = d.z - streakLen;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Nitro Particle System */}
      <points ref={nitroPointsRef} geometry={nitroGeo}>
        <pointsMaterial
          size={0.4}
          color={COLORS.cyanNeon}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Warp Speed Lines / Streaks */}
      <lineSegments ref={streaksLinesRef} geometry={streakGeo}>
        <lineBasicMaterial
          color={COLORS.cyanNeon}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
