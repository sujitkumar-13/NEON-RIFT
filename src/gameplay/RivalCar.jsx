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
  const wheelFL = useRef();
  const wheelFR = useRef();
  const wheelRL = useRef();
  const wheelRR = useRef();

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
          // Vibrant dark obsidian with purple metallic sheen
          node.material.color = new THREE.Color(0x38184c);
          node.material.metalness = 0.35;
          node.material.roughness = 0.28;
          if (node.material.emissive) {
            node.material.emissive = new THREE.Color(0x9d11ff);
            node.material.emissiveIntensity = 0.45;
          }
        }
      }
    });
    return cloned;
  }, [scene]);

  // AI lane weaving and position tracking
  const aiState = useRef({
    currentLaneIndex: 1,
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
    const targetZ = -s.rivalDistanceOffset;

    // AI Lane Switching Logic
    aiState.current.laneChangeTimer -= delta;
    if (aiState.current.laneChangeTimer <= 0) {
      aiState.current.laneChangeTimer = 3.0 + Math.random() * 4.0;
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
      0.42,
      targetZ
    );

    if (carBodyRef.current) {
      carBodyRef.current.rotation.y = Math.PI + aiState.current.yaw;
    }

    // Wheel rotation
    const rotSpeed = s.speed * delta * 5.0;
    if (wheelFL.current) wheelFL.current.rotation.x += rotSpeed;
    if (wheelFR.current) wheelFR.current.rotation.x += rotSpeed;
    if (wheelRL.current) wheelRL.current.rotation.x += rotSpeed;
    if (wheelRR.current) wheelRR.current.rotation.x += rotSpeed;
  });

  return (
    <group ref={groupRef}>
      <group ref={carBodyRef}>
        {rivalScene && (
          <primitive
            object={rivalScene}
            scale={[3.5, 3.5, 3.5]}
            position={[0, 0, 0]}
          />
        )}

        {/* Dedicated Rival Purple Key & Rim Lights */}
        <pointLight
          position={[0, 2.5, 1.2]}
          intensity={3.0}
          color={COLORS.purpleNeon}
          distance={8}
        />

        {/* 4 Cybernetic Wheels with Glowing Purple Rims */}
        <group ref={wheelFL} position={[-0.78, 0.14, -0.92]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.purpleNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={wheelFR} position={[0.78, 0.14, -0.92]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.purpleNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={wheelRL} position={[-0.78, 0.14, 1.05]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.purpleNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={wheelRR} position={[0.78, 0.14, 1.05]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.purpleNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Rival purple neon taillight thrusters */}
        <mesh position={[-0.48, 0.28, 1.68]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.8, 8]} />
          <meshBasicMaterial color={COLORS.purpleNeon} />
        </mesh>
        <mesh position={[0.48, 0.28, 1.68]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.8, 8]} />
          <meshBasicMaterial color={COLORS.purpleNeon} />
        </mesh>

        {/* Rival underglow */}
        <pointLight
          position={[0, 0.1, 0]}
          color={COLORS.purpleNeon}
          intensity={3.2}
          distance={5.0}
        />
      </group>
    </group>
  );
}
