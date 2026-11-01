// NEON RIFT - Rival Racing Car
// Uses a duplicate of the hero GLB with electric purple / crimson cyber styling and scripted AI movement
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS, HERO_CAR_MODEL_PATH } from '../utils/constants';

export function RivalCar() {
  const groupRef = useRef();
  const carBodyRef = useRef();
  const { scene } = useGLTF(HERO_CAR_MODEL_PATH);

  // Duplicate hero car with distinct electric purple & crimson cyber styling
  const rivalScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material = node.material.clone();
          // Dark metallic graphite finish with crimson/purple sheen
          node.material.color = new THREE.Color(0x221133);
          node.material.metalness = 0.95;
          node.material.roughness = 0.25;
          if (node.material.emissive) {
            node.material.emissive = new THREE.Color(0x9d11ff);
            node.material.emissiveIntensity = 0.35;
          }
        }
      }
    });
    return cloned;
  }, [scene]);

  // AI lane weaving and position tracking
  const aiState = useRef({
    currentLaneIndex: 1, // 0, 1, or 2
    currentX: 0,
    targetX: 0,
    laneChangeTimer: 2.0,
    yaw: 0,
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const s = gameState.getState();

    // Only update active AI in game
    if (s.phase !== 'PLAYING') {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;

    // Relative distance offset ahead of or behind player
    // player is at Z = 0, so rival is at -s.rivalDistanceOffset
    const targetZ = -s.rivalDistanceOffset;

    // AI Lane Switching Logic
    aiState.current.laneChangeTimer -= delta;
    if (aiState.current.laneChangeTimer <= 0) {
      aiState.current.laneChangeTimer = 3.0 + Math.random() * 4.0;
      // Pick a lane
      const lanes = [-5.2, 0, 5.2];
      aiState.current.targetX = lanes[Math.floor(Math.random() * lanes.length)];
    }

    // Lerp rival X towards target lane
    const steerDelta = aiState.current.targetX - aiState.current.currentX;
    aiState.current.currentX += steerDelta * Math.min(1, delta * 4.0);
    const targetYaw = -Math.sign(steerDelta) * Math.min(0.2, Math.abs(steerDelta) * 0.08);
    aiState.current.yaw += (targetYaw - aiState.current.yaw) * delta * 8.0;

    // Position rival
    groupRef.current.position.set(
      aiState.current.currentX,
      0.38,
      targetZ
    );

    if (carBodyRef.current) {
      carBodyRef.current.rotation.y = Math.PI + aiState.current.yaw;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={carBodyRef}>
        {rivalScene && (
          <primitive
            object={rivalScene}
            scale={[3.2, 3.2, 3.2]}
            position={[0, 0, 0]}
          />
        )}

        {/* Rival purple neon taillight thrusters */}
        <mesh position={[-0.45, 0.25, 1.65]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.07, 0.7, 8]} />
          <meshBasicMaterial color={COLORS.purpleNeon} />
        </mesh>
        <mesh position={[0.45, 0.25, 1.65]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.07, 0.7, 8]} />
          <meshBasicMaterial color={COLORS.purpleNeon} />
        </mesh>

        {/* Rival underglow */}
        <pointLight
          position={[0, 0.1, 0]}
          color={COLORS.purpleNeon}
          intensity={3.0}
          distance={4.5}
        />
      </group>
    </group>
  );
}
