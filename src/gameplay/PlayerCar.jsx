// NEON RIFT - Player Hero Car Component
// Loads the authentic Vi3W GLB model via useGLTF from @react-three/drei
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS, HERO_CAR_MODEL_PATH } from '../utils/constants';

export function PlayerCar() {
  const groupRef = useRef();
  const carBodyRef = useRef();
  const leftExhaustRef = useRef();
  const rightExhaustRef = useRef();
  const underglowRef = useRef();

  // 4 Wheel refs for visual wheel rotation
  const wheelFL = useRef();
  const wheelFR = useRef();
  const wheelRL = useRef();
  const wheelRR = useRef();

  // Load the authentic Vi3W GLB hero car
  const { scene } = useGLTF(HERO_CAR_MODEL_PATH);

  // Clone scene and calibrate materials for high visibility & vivid reflection
  const carScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material = node.material.clone();
          // Glossy black metallic finish with subtle cyber cyan ambient sheen
          node.material.color = new THREE.Color('#ffffff');
          node.material.metalness = 0.42;
          node.material.roughness = 0.22;
          // Emissive lift so the black metallic body panels have prominent shape and edge definition
          node.material.emissive = new THREE.Color('#002433');
          node.material.emissiveIntensity = 0.45;
          if (node.material.map) {
            node.material.map.colorSpace = THREE.SRGBColorSpace;
            node.material.map.needsUpdate = true;
          }
        }
      }
    });
    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const s = gameState.getState();

    // Position car at current X and relative Z
    groupRef.current.position.x = s.playerX;
    groupRef.current.position.y = 0.42 + (s.isDrifting ? Math.sin(Date.now() * 0.03) * 0.02 : 0);
    groupRef.current.position.z = 0;

    // Apply pitch, yaw, roll from gameState
    if (carBodyRef.current) {
      // Rotation order YXZ: Math.PI ensures car front faces -Z down the road
      carBodyRef.current.rotation.y = Math.PI + s.carYaw;
      carBodyRef.current.rotation.z = s.carRoll;
      carBodyRef.current.rotation.x = s.carPitch;

      // Invulnerability visual blink when recovering from a collision
      if (s.invulnerableTimer > 0) {
        const blink = Math.floor(Date.now() * 0.02) % 2 === 0;
        carBodyRef.current.visible = blink;
      } else {
        carBodyRef.current.visible = true;
      }
    }

    // Visual Wheel Rotation based on forward speed
    const wheelRotDelta = (s.speed * delta * 5.0);
    if (wheelFL.current) wheelFL.current.rotation.x += wheelRotDelta;
    if (wheelFR.current) wheelFR.current.rotation.x += wheelRotDelta;
    if (wheelRL.current) wheelRL.current.rotation.x += wheelRotDelta;
    if (wheelRR.current) wheelRR.current.rotation.x += wheelRotDelta;

    // Dynamic Nitro Exhaust visual intensity
    const boostActive = s.isBoosting;
    const boostScale = boostActive ? 2.2 + Math.random() * 0.4 : 0.45;

    if (leftExhaustRef.current && rightExhaustRef.current) {
      leftExhaustRef.current.scale.set(boostScale, boostScale, boostScale * 2.6);
      rightExhaustRef.current.scale.set(boostScale, boostScale, boostScale * 2.6);
      leftExhaustRef.current.visible = boostActive || s.speed > 35;
      rightExhaustRef.current.visible = boostActive || s.speed > 35;
    }

    if (underglowRef.current) {
      underglowRef.current.intensity = boostActive ? 5.0 : 2.8;
      underglowRef.current.color.set(boostActive ? COLORS.cyanNeon : (s.isDrifting ? COLORS.magentaNeon : COLORS.cyanNeon));
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={carBodyRef}>
        {/* Actual Vi3W Hero Car Model - Scaled for prominent road presence */}
        {carScene ? (
          <primitive
            object={carScene}
            scale={[3.5, 3.5, 3.5]}
            position={[0, 0, 0]}
          />
        ) : null}

        {/* Dedicated Vehicle Key Light (Illuminates hood, cabin and rear spoiler) */}
        <pointLight
          position={[0, 3.2, 1.2]}
          intensity={3.5}
          color="#edf6ff"
          distance={10}
        />

        {/* Cyan Left Rim Light - Accents driver side curves and black metallic sheen */}
        <pointLight
          position={[-2.2, 1.2, 0.4]}
          intensity={3.5}
          color={COLORS.cyanNeon}
          distance={7}
        />

        {/* Purple Right Rim Light - Accents passenger side curves */}
        <pointLight
          position={[2.2, 1.2, 0.4]}
          intensity={3.5}
          color={COLORS.purpleNeon}
          distance={7}
        />

        {/* Glowing Cyan Front Headlight Lenses */}
        <mesh position={[-0.56, 0.24, -1.58]}>
          <boxGeometry args={[0.22, 0.08, 0.06]} />
          <meshStandardMaterial
            color={COLORS.cyanNeon}
            emissive={COLORS.cyanNeon}
            emissiveIntensity={3.0}
          />
        </mesh>
        <mesh position={[0.56, 0.24, -1.58]}>
          <boxGeometry args={[0.22, 0.08, 0.06]} />
          <meshStandardMaterial
            color={COLORS.cyanNeon}
            emissive={COLORS.cyanNeon}
            emissiveIntensity={3.0}
          />
        </mesh>

        {/* Glowing Rear Cyber Taillight Lightbar */}
        <mesh position={[0, 0.32, 1.58]}>
          <boxGeometry args={[1.15, 0.06, 0.06]} />
          <meshStandardMaterial
            color={COLORS.cyanNeon}
            emissive={COLORS.cyanNeon}
            emissiveIntensity={3.0}
          />
        </mesh>
        <mesh position={[-0.5, 0.26, 1.58]}>
          <boxGeometry args={[0.18, 0.08, 0.06]} />
          <meshStandardMaterial
            color="#ff007f"
            emissive="#ff007f"
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0.5, 0.26, 1.58]}>
          <boxGeometry args={[0.18, 0.08, 0.06]} />
          <meshStandardMaterial
            color="#ff007f"
            emissive="#ff007f"
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* 4 Visible Cybernetic Wheels with Glowing Rims and Disc Calipers */}
        {/* Front Left Wheel */}
        <group ref={wheelFL} position={[-0.78, 0.14, -0.92]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.cyanNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Front Right Wheel */}
        <group ref={wheelFR} position={[0.78, 0.14, -0.92]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.cyanNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Rear Left Wheel */}
        <group ref={wheelRL} position={[-0.78, 0.14, 1.05]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.cyanNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Rear Right Wheel */}
        <group ref={wheelRR} position={[0.78, 0.14, 1.05]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#121722" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.15, 0.23, 16]} />
            <meshBasicMaterial color={COLORS.cyanNeon} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Soft Ambient Ground Shadow underneath car */}
        <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 3.8]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.65} />
        </mesh>

        {/* Forward Headlight Beams */}
        <spotLight
          position={[-0.65, 0.28, -1.6]}
          target-position={[-0.65, 0, -40]}
          angle={0.45}
          penumbra={0.5}
          intensity={8.0}
          color={COLORS.cyanNeon}
          distance={65}
        />
        <spotLight
          position={[0.65, 0.28, -1.6]}
          target-position={[0.65, 0, -40]}
          angle={0.45}
          penumbra={0.5}
          intensity={8.0}
          color={COLORS.cyanNeon}
          distance={65}
        />

        {/* Cyber Neon Taillights / Exhaust Jets */}
        <mesh
          ref={leftExhaustRef}
          position={[-0.48, 0.28, 1.68]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.09, 0.9, 8]} />
          <meshBasicMaterial
            color={COLORS.cyanNeon}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh
          ref={rightExhaustRef}
          position={[0.48, 0.28, 1.68]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.09, 0.9, 8]} />
          <meshBasicMaterial
            color={COLORS.cyanNeon}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* High-tech Ground Underglow Light */}
        <pointLight
          ref={underglowRef}
          position={[0, 0.1, 0]}
          color={COLORS.cyanNeon}
          intensity={3.0}
          distance={5.5}
        />
      </group>
    </group>
  );
}

// Preload hero car GLB
useGLTF.preload(HERO_CAR_MODEL_PATH);
