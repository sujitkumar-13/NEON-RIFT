// NEON RIFT - Dimensional Rift Portal Component
// The cinematic setpiece connecting Neon City to Rift World
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS, GAME_SECTORS } from '../utils/constants';

export function RiftPortal() {
  const portalGroupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const horizonRef = useRef();
  const coreLightRef = useRef();

  const targetDist = GAME_SECTORS.NEON_CITY.endDist; // 1300m

  // Geometries for multi-layer portal
  const torus1 = useMemo(() => new THREE.TorusGeometry(12, 0.45, 16, 64), []);
  const torus2 = useMemo(() => new THREE.TorusGeometry(8.5, 0.35, 16, 48), []);
  const torus3 = useMemo(() => new THREE.TorusGeometry(5.0, 0.25, 16, 36), []);
  const discGeom = useMemo(() => new THREE.CircleGeometry(8.2, 48), []);

  useFrame((state) => {
    if (!portalGroupRef.current) return;
    const s = gameState.getState();

    // Calculate relative distance to player car (car is at Z = 0)
    const distToPortal = targetDist - s.distance;

    // Portal is visible when within 400m ahead or slightly after warp
    if (distToPortal < 400 && distToPortal > -150 && (s.sector === 'NEON_CITY' || s.sector === 'PORTAL_WARP')) {
      portalGroupRef.current.visible = true;
      portalGroupRef.current.position.set(0, 5.0, -distToPortal);

      const time = state.clock.getElapsedTime();

      // Animate spinning rings
      if (ring1Ref.current) ring1Ref.current.rotation.z = time * 0.8;
      if (ring2Ref.current) ring2Ref.current.rotation.z = -time * 1.2;
      if (ring3Ref.current) ring3Ref.current.rotation.z = time * 1.6;

      // Pulse event horizon disc scale and opacity
      if (horizonRef.current) {
        const pulse = 1.0 + Math.sin(time * 6) * 0.08;
        horizonRef.current.scale.set(pulse, pulse, pulse);
        horizonRef.current.rotation.z = -time * 0.4;
      }

      if (coreLightRef.current) {
        coreLightRef.current.intensity = 8.0 + Math.sin(time * 8) * 3.0;
      }
    } else {
      portalGroupRef.current.visible = false;
    }
  });

  return (
    <group ref={portalGroupRef} visible={false}>
      {/* Outer Cyan Ring */}
      <mesh ref={ring1Ref} geometry={torus1}>
        <meshBasicMaterial
          color={COLORS.cyanNeon}
          wireframe
        />
      </mesh>

      {/* Middle Electric Purple Ring */}
      <mesh ref={ring2Ref} geometry={torus2}>
        <meshBasicMaterial
          color={COLORS.purpleNeon}
        />
      </mesh>

      {/* Inner Fast Cyan Ring */}
      <mesh ref={ring3Ref} geometry={torus3}>
        <meshBasicMaterial
          color={COLORS.cyanNeon}
          wireframe
        />
      </mesh>

      {/* Dimensional Event Horizon Disc */}
      <mesh ref={horizonRef} geometry={discGeom}>
        <meshBasicMaterial
          color="#040010"
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Accretion Vortex Radial Spokes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[0, 0, (i * Math.PI) / 6]}
          position={[0, 0, 0.05]}
        >
          <planeGeometry args={[0.3, 17]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? COLORS.cyanNeon : COLORS.magentaNeon}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}

      {/* High-intensity Dimensional Core Light */}
      <pointLight
        ref={coreLightRef}
        color={COLORS.cyanNeon}
        intensity={10.0}
        distance={80}
      />
    </group>
  );
}
