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
  const hemiLightRef = useRef();

  // Initialize scene fog with wide linear range so horizon and skyline are clearly visible
  useEffect(() => {
    scene.fog = new THREE.Fog(COLORS.bgDark, 45, 340);
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
        : (isRift ? new THREE.Color('#0c031a') : new THREE.Color(COLORS.bgDark));
      const targetNear = isWarp ? 15 : (isRift ? 30 : 45);
      const targetFar = isWarp ? 180 : (isRift ? 280 : 340);

      scene.fog.color.lerp(targetFogColor, delta * 3.0);
      scene.fog.near += (targetNear - scene.fog.near) * delta * 2.5;
      scene.fog.far += (targetFar - scene.fog.far) * delta * 2.5;
    }

    if (dirLightRef.current) {
      const targetColor = isRift ? new THREE.Color(COLORS.purpleNeon) : new THREE.Color('#edf6ff');
      dirLightRef.current.color.lerp(targetColor, delta * 3.0);
    }
  });

  return (
    <>
      {/* Balanced Sky/Ground Hemisphere Light - Eliminates dark void crush */}
      <hemisphereLight
        ref={hemiLightRef}
        skyColor="#5a75a0"
        groundColor="#222d42"
        intensity={1.8}
      />

      {/* Main Overhead Directional Sunlight / City Glow */}
      <directionalLight
        ref={dirLightRef}
        position={[16, 36, 20]}
        intensity={2.5}
        color="#edf6ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Secondary Electric Purple Cross-Light */}
      <directionalLight
        ref={purpleLightRef}
        position={[-16, 18, -25]}
        intensity={1.5}
        color={COLORS.purpleNeon}
      />

      {/* Forward Road Horizon Glow Light */}
      <pointLight
        position={[0, 14, -60]}
        intensity={3.5}
        color={COLORS.cyanNeon}
        distance={220}
      />

      {/* Camera fill light to guarantee immediate player surroundings are visible */}
      <pointLight
        position={[0, 4, 8]}
        intensity={1.6}
        color="#c8e4ff"
        distance={35}
      />
    </>
  );
}
