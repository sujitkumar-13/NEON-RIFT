// NEON RIFT - Dynamic Atmospheric Lighting & Fog
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../gameplay/gameState';
import { COLORS } from '../utils/constants';

export function Lighting() {
  const { scene } = useThree();
  const dirLightRef = useRef();
  const purpleLightRef = useRef();
  const ambientRef = useRef();

  // Initialize scene fog
  useEffect(() => {
    scene.fog = new THREE.FogExp2(COLORS.bgDark, 0.015);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    const s = gameState.getState();
    const isRift = s.sector === 'RIFT_WORLD' || s.sector === 'FINAL_ESCAPE';
    const isWarp = s.sector === 'PORTAL_WARP';

    if (scene.fog) {
      const targetFogColor = isWarp
        ? new THREE.Color(COLORS.purpleNeon)
        : (isRift ? new THREE.Color('#090214') : new THREE.Color(COLORS.bgDark));
      const targetDensity = isWarp ? 0.035 : (isRift ? 0.014 : 0.016);

      scene.fog.color.lerp(targetFogColor, delta * 3.0);
      scene.fog.density += (targetDensity - scene.fog.density) * delta * 3.0;
    }

    if (dirLightRef.current) {
      const targetColor = isRift ? new THREE.Color(COLORS.purpleNeon) : new THREE.Color(COLORS.cyanNeon);
      dirLightRef.current.color.lerp(targetColor, delta * 3.0);
    }
  });

  return (
    <>
      {/* Ambient Base Light */}
      <ambientLight ref={ambientRef} intensity={0.4} color="#1c2438" />

      {/* Main Overhead Directional Light */}
      <directionalLight
        ref={dirLightRef}
        position={[10, 25, 15]}
        intensity={1.2}
        color={COLORS.cyanNeon}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Secondary Electric Purple Rim Light */}
      <directionalLight
        ref={purpleLightRef}
        position={[-15, 12, -20]}
        intensity={0.9}
        color={COLORS.purpleNeon}
      />

      {/* Horizon atmospheric point light */}
      <pointLight position={[0, 15, -120]} intensity={2.5} color={COLORS.cyanNeon} distance={200} />
    </>
  );
}
