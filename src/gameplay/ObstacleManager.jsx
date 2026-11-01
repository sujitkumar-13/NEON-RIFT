// NEON RIFT - Obstacles, Hazards & Pickups Manager (Fair Hitboxes & Balanced Spawning)
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

  // Generate obstacle pool with guaranteed open lanes
  const obstacles = useMemo(() => {
    return Array.from({ length: NUM_OBSTACLES }, (_, i) => {
      // Alternate lanes deterministically to ensure open lanes
      const lane = LANES[i % LANES.length];
      const isPickup = i % 3 === 0;
      const type = isPickup ? (i % 6 === 0 ? 'SHIELD' : 'NITRO') : (i % 2 === 0 ? 'BARRIER' : 'PYLON');

      return {
        id: i,
        x: lane,
        z: -80 - i * 50,
        type,
        active: true,
        width: type === 'BARRIER' ? 2.8 : 1.2,
        radius: type === 'NITRO' || type === 'SHIELD' ? 2.0 : 1.2,
      };
    });
  }, []);

  // Shared geometries and materials
  const resources = useMemo(() => {
    return {
      barrierGeom: new THREE.BoxGeometry(3.2, 1.1, 0.35),
      barrierFrameGeom: new THREE.BoxGeometry(0.3, 1.4, 0.5),
      pylonGeom: new THREE.CylinderGeometry(0.35, 0.65, 2.0, 8),
      pickupGeom: new THREE.OctahedronGeometry(0.75, 0),
      shieldGeom: new THREE.BoxGeometry(0.7, 0.7, 0.7),
      barrierMat: new THREE.MeshStandardMaterial({
        color: '#ff0055',
        emissive: '#ff0055',
        emissiveIntensity: 1.2,
        roughness: 0.2,
      }),
      pylonMat: new THREE.MeshStandardMaterial({
        color: '#ffb703',
        emissive: '#ffb703',
        emissiveIntensity: 1.1,
        roughness: 0.25,
      }),
      nitroMat: new THREE.MeshStandardMaterial({
        color: COLORS.cyanNeon,
        emissive: COLORS.cyanNeon,
        emissiveIntensity: 1.4,
      }),
      shieldMat: new THREE.MeshStandardMaterial({
        color: '#00ff88',
        emissive: '#00ff88',
        emissiveIntensity: 1.4,
      }),
      metalPostMat: new THREE.MeshStandardMaterial({
        color: '#283348',
        metalness: 0.8,
        roughness: 0.3,
      }),
    };
  }, []);

  useFrame((state, delta) => {
    const s = gameState.getState();
    if (s.phase !== 'PLAYING') return;

    const time = state.clock.getElapsedTime();
    const speed = s.speed;
    const playerX = s.playerX;

    obstacles.forEach((obs, i) => {
      const mesh = obstacleMeshRefs.current[i];
      if (!mesh) return;

      // Obstacle advances towards player (+Z direction)
      obs.z += speed * delta;

      // Fair Collision Detection when passing player car (Z around 0)
      if (obs.active && Math.abs(obs.z) < 1.6) {
        const dx = Math.abs(obs.x - playerX);

        if (obs.type === 'NITRO' && dx < obs.radius) {
          // Collected Nitro Core!
          obs.active = false;
          s.nitro = Math.min(100, s.nitro + 40);
          s.score += 400;
          soundManager.playPickup();
          mesh.visible = false;
        } else if (obs.type === 'SHIELD' && dx < obs.radius) {
          // Collected Shield Repair Core!
          obs.active = false;
          s.shield = Math.min(100, s.shield + 25);
          s.score += 350;
          soundManager.playPickup();
          mesh.visible = false;
        } else if (obs.type === 'BARRIER' && dx < obs.width * 0.5 + 0.55) {
          // Hit laser barrier - triggers damage & recovery grace period
          obs.active = false;
          gameState.triggerImpact(18);
          mesh.visible = false;
        } else if (obs.type === 'PYLON' && dx < obs.width * 0.5 + 0.45) {
          // Hit pylon
          obs.active = false;
          gameState.triggerImpact(18);
          mesh.visible = false;
        }
      }

      // If obstacle passes behind player (Z > 12), respawn far ahead
      if (obs.z > 12) {
        obs.z = -500 - Math.random() * 80;
        // Pick one of the 3 lanes
        obs.x = LANES[Math.floor(Math.random() * LANES.length)];
        obs.active = true;

        // Balanced distribution between pickups and hazards
        const rand = Math.random();
        if (rand < 0.28) {
          obs.type = 'NITRO';
        } else if (rand < 0.45) {
          obs.type = 'SHIELD';
        } else if (rand < 0.75) {
          obs.type = 'BARRIER';
        } else {
          obs.type = 'PYLON';
        }
        mesh.visible = true;
      }

      // Update mesh position
      mesh.position.set(obs.x, 0, obs.z);

      // Animate pickups with floating rotation & bobbing
      if (obs.type === 'NITRO' || obs.type === 'SHIELD') {
        mesh.rotation.y = time * 3.2;
        mesh.rotation.x = time * 1.8;
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
            <group position={[0, 0.65, 0]}>
              <mesh geometry={resources.barrierGeom} material={resources.barrierMat} />
              {/* Left and Right Sturdy Posts */}
              <mesh
                position={[-1.7, 0, 0]}
                geometry={resources.barrierFrameGeom}
                material={resources.metalPostMat}
              />
              <mesh
                position={[1.7, 0, 0]}
                geometry={resources.barrierFrameGeom}
                material={resources.metalPostMat}
              />
            </group>
          )}

          {obs.type === 'PYLON' && (
            <group position={[0, 1.0, 0]}>
              <mesh geometry={resources.pylonGeom} material={resources.pylonMat} />
              <mesh position={[0, 0.35, 0]}>
                <torusGeometry args={[0.65, 0.08, 8, 16]} />
                <meshBasicMaterial color={COLORS.amberWarning} />
              </mesh>
            </group>
          )}

          {obs.type === 'NITRO' && (
            <group position={[0, 1.0, 0]}>
              <mesh geometry={resources.pickupGeom} material={resources.nitroMat} />
              <pointLight color={COLORS.cyanNeon} intensity={3.0} distance={6} />
            </group>
          )}

          {obs.type === 'SHIELD' && (
            <group position={[0, 1.0, 0]}>
              <mesh geometry={resources.shieldGeom} material={resources.shieldMat} />
              <pointLight color="#00ff88" intensity={3.0} distance={6} />
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
