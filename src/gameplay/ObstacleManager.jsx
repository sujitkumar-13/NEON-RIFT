// NEON RIFT - Obstacles, Hazards & Pickups Manager
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS, LANES } from '../utils/constants';
import { soundManager } from '../utils/audioSynthesizer';

const NUM_OBSTACLES = 12;

export function ObstacleManager() {
  const groupRef = useRef();
  const obstacleMeshRefs = useRef([]);

  // Generate obstacle pool
  const obstacles = useMemo(() => {
    return Array.from({ length: NUM_OBSTACLES }, (_, i) => {
      const lane = LANES[i % LANES.length];
      const isPickup = i % 4 === 0;
      const type = isPickup ? (i % 8 === 0 ? 'SHIELD' : 'NITRO') : (i % 2 === 0 ? 'BARRIER' : 'PYLON');

      return {
        id: i,
        x: lane,
        z: -70 - i * 45,
        type,
        active: true,
        width: type === 'BARRIER' ? 3.8 : 1.6,
        radius: type === 'NITRO' || type === 'SHIELD' ? 1.5 : 1.8,
      };
    });
  }, []);

  // Shared geometries and materials
  const resources = useMemo(() => {
    return {
      barrierGeom: new THREE.BoxGeometry(4.2, 1.2, 0.4),
      pylonGeom: new THREE.CylinderGeometry(0.3, 0.7, 2.2, 8),
      pickupGeom: new THREE.OctahedronGeometry(0.7, 0),
      shieldGeom: new THREE.BoxGeometry(0.6, 0.6, 0.6),
      barrierMat: new THREE.MeshStandardMaterial({
        color: '#ff0055',
        emissive: '#ff0055',
        emissiveIntensity: 0.8,
        roughness: 0.2,
      }),
      pylonMat: new THREE.MeshStandardMaterial({
        color: '#ffb703',
        emissive: '#ffb703',
        emissiveIntensity: 0.8,
        roughness: 0.3,
      }),
      nitroMat: new THREE.MeshStandardMaterial({
        color: COLORS.cyanNeon,
        emissive: COLORS.cyanNeon,
        emissiveIntensity: 1.0,
      }),
      shieldMat: new THREE.MeshStandardMaterial({
        color: '#00ff88',
        emissive: '#00ff88',
        emissiveIntensity: 1.0,
      }),
      barrierFrameMat: new THREE.MeshStandardMaterial({
        color: '#1a1f2e',
        metalness: 0.9,
      }),
    };
  }, []);

  useFrame((state, delta) => {
    const s = gameState.getState();
    if (s.phase !== 'PLAYING') return;

    const time = state.clock.getElapsedTime();
    const speed = s.speed;
    const playerX = s.playerX;
    // Player car effective bounding box:
    // Car center is at [playerX, 0.38, 0], length ~ 3.0, half-width ~ 0.9, half-length ~ 1.5

    obstacles.forEach((obs, i) => {
      const mesh = obstacleMeshRefs.current[i];
      if (!mesh) return;

      // Obstacle advances towards player (+Z direction)
      obs.z += speed * delta;

      // Check Collision with player when in proximity around Z = 0
      if (obs.active && Math.abs(obs.z) < 1.8) {
        const dx = Math.abs(obs.x - playerX);

        if (obs.type === 'NITRO' && dx < obs.radius + 0.9) {
          // Collected Nitro Core!
          obs.active = false;
          s.nitro = Math.min(100, s.nitro + 35);
          s.score += 400;
          soundManager.playPickup();
          mesh.visible = false;
        } else if (obs.type === 'SHIELD' && dx < obs.radius + 0.9) {
          // Collected Shield Repair!
          obs.active = false;
          s.shield = Math.min(100, s.shield + 25);
          s.score += 300;
          soundManager.playPickup();
          mesh.visible = false;
        } else if ((obs.type === 'BARRIER' || obs.type === 'PYLON') && dx < obs.width * 0.5 + 0.75) {
          // Crashed into hazard!
          obs.active = false;
          gameState.triggerImpact(25);
          mesh.visible = false;
        }
      }

      // If obstacle passes behind player (Z > 12), respawn ahead
      if (obs.z > 12) {
        // Respawn far down the track
        obs.z = -480 - Math.random() * 80;
        obs.x = LANES[Math.floor(Math.random() * LANES.length)];
        obs.active = true;

        // Change type depending on sector
        const isRift = s.sector === 'RIFT_WORLD' || s.sector === 'FINAL_ESCAPE';
        const rand = Math.random();
        if (rand < 0.25) {
          obs.type = 'NITRO';
        } else if (rand < 0.38) {
          obs.type = 'SHIELD';
        } else {
          obs.type = isRift ? (rand < 0.7 ? 'BARRIER' : 'PYLON') : (rand < 0.65 ? 'BARRIER' : 'PYLON');
        }
        mesh.visible = true;
      }

      // Update mesh position
      mesh.position.set(obs.x, 0, obs.z);

      // Rotate pickups
      if (obs.type === 'NITRO' || obs.type === 'SHIELD') {
        mesh.rotation.y = time * 3.5;
        mesh.rotation.x = time * 2.0;
        mesh.position.y = 1.0 + Math.sin(time * 4 + i) * 0.25;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {obstacles.map((obs, idx) => (
        <group
          key={obs.id}
          ref={(el) => (obstacleMeshRefs.current[idx] = el)}
          position={[obs.x, 0, obs.z]}
        >
          {obs.type === 'BARRIER' && (
            <group position={[0, 0.6, 0]}>
              <mesh geometry={resources.barrierGeom} material={resources.barrierMat} />
              {/* Metal side posts */}
              <mesh
                position={[-2.1, 0, 0]}
                geometry={resources.pylonGeom}
                material={resources.barrierFrameMat}
              />
              <mesh
                position={[2.1, 0, 0]}
                geometry={resources.pylonGeom}
                material={resources.barrierFrameMat}
              />
            </group>
          )}

          {obs.type === 'PYLON' && (
            <group position={[0, 1.1, 0]}>
              <mesh geometry={resources.pylonGeom} material={resources.pylonMat} />
              {/* Hazard Warning Ring */}
              <mesh position={[0, 0.4, 0]}>
                <torusGeometry args={[0.7, 0.08, 8, 16]} />
                <meshBasicMaterial color={COLORS.amberWarning} />
              </mesh>
            </group>
          )}

          {obs.type === 'NITRO' && (
            <group position={[0, 1.0, 0]}>
              <mesh geometry={resources.pickupGeom} material={resources.nitroMat} />
              <pointLight color={COLORS.cyanNeon} intensity={2.5} distance={5} />
            </group>
          )}

          {obs.type === 'SHIELD' && (
            <group position={[0, 1.0, 0]}>
              <mesh geometry={resources.shieldGeom} material={resources.shieldMat} />
              <pointLight color="#00ff88" intensity={2.5} distance={5} />
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
