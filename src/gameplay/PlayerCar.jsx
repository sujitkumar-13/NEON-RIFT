// NEON RIFT - Player Hero Car Component
// Loads the authentic Vi3W GLB model via useGLTF from @react-three/drei
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { gameState } from './gameState';
import { COLORS, HERO_CAR_MODEL_PATH } from '../utils/constants';

export function PlayerCar() {
  const groupRef = useRef();
  const carBodyRef = useRef();
  const leftExhaustRef = useRef();
  const rightExhaustRef = useRef();
  const underglowRef = useRef();

  // Load the authentic Vi3W GLB hero car
  const { scene } = useGLTF(HERO_CAR_MODEL_PATH);

  // Clone scene so we can adjust materials/shadows cleanly
  const carScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material = node.material.clone();
          // Boost cyberpunk specular sheen
          node.material.roughness = Math.min(node.material.roughness, 0.4);
          node.material.metalness = Math.max(node.material.metalness || 0, 0.7);
        }
      }
    });
    return cloned;
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    const s = gameState.getState();

    // Position car at current X and relative Z
    groupRef.current.position.x = s.playerX;
    groupRef.current.position.y = 0.38 + (s.isDrifting ? Math.sin(Date.now() * 0.03) * 0.02 : 0);
    groupRef.current.position.z = 0;

    // Apply pitch, yaw, roll from gameState
    if (carBodyRef.current) {
      carBodyRef.current.rotation.y = Math.PI + s.carYaw; // Math.PI ensures car front faces -Z
      carBodyRef.current.rotation.z = s.carRoll;
      carBodyRef.current.rotation.x = s.carPitch;
    }

    // Dynamic Nitro Exhaust visual intensity
    const boostActive = s.isBoosting;
    const boostScale = boostActive ? 1.8 + Math.random() * 0.4 : 0.3;

    if (leftExhaustRef.current && rightExhaustRef.current) {
      leftExhaustRef.current.scale.set(boostScale, boostScale, boostScale * 2.5);
      rightExhaustRef.current.scale.set(boostScale, boostScale, boostScale * 2.5);
      leftExhaustRef.current.visible = boostActive || s.speed > 30;
      rightExhaustRef.current.visible = boostActive || s.speed > 30;
    }

    if (underglowRef.current) {
      underglowRef.current.intensity = boostActive ? 4.5 : 2.0;
      underglowRef.current.color.set(boostActive ? COLORS.cyanNeon : (s.isDrifting ? COLORS.magentaNeon : COLORS.cyanNeon));
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={carBodyRef}>
        {/* Actual Vi3W Hero Car Model */}
        {carScene ? (
          <primitive
            object={carScene}
            scale={[3.2, 3.2, 3.2]}
            position={[0, 0, 0]}
          />
        ) : null}

        {/* Headlight beams (point down the dark highway into -Z) */}
        <spotLight
          position={[-0.6, 0.25, -1.6]}
          target-position={[-0.6, 0, -25]}
          angle={0.4}
          penumbra={0.6}
          intensity={6.0}
          color={COLORS.cyanNeon}
          distance={50}
        />
        <spotLight
          position={[0.6, 0.25, -1.6]}
          target-position={[0.6, 0, -25]}
          angle={0.4}
          penumbra={0.6}
          intensity={6.0}
          color={COLORS.cyanNeon}
          distance={50}
        />

        {/* Cyber Neon Taillights / Exhaust Jets */}
        <mesh
          ref={leftExhaustRef}
          position={[-0.45, 0.25, 1.65]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.08, 0.8, 8]} />
          <meshBasicMaterial
            color={COLORS.cyanNeon}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh
          ref={rightExhaustRef}
          position={[0.45, 0.25, 1.65]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.08, 0.8, 8]} />
          <meshBasicMaterial
            color={COLORS.cyanNeon}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* High-tech Underglow light */}
        <pointLight
          ref={underglowRef}
          position={[0, 0.1, 0]}
          color={COLORS.cyanNeon}
          intensity={2.5}
          distance={4.5}
        />

        {/* Cyber Shield Bubble (subtly pulses when active) */}
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[2.0, 16, 12]} />
          <meshBasicMaterial
            color={COLORS.cyanNeon}
            wireframe
            transparent
            opacity={0.04}
          />
        </mesh>
      </group>
    </group>
  );
}

// Preload hero car GLB
useGLTF.preload(HERO_CAR_MODEL_PATH);
