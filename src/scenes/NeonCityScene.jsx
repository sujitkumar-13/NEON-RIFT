// NEON RIFT - Neon City Environment (Sector 01)
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../gameplay/gameState';
import { COLORS, ROAD_WIDTH } from '../utils/constants';

const NUM_BUILDING_ROWS = 14;
const ROW_SPACING = 45;
const CITY_LOOP_SPAN = NUM_BUILDING_ROWS * ROW_SPACING; // 630 units

export function NeonCityScene() {
  const cityGroupRef = useRef();
  const rowRefs = useRef([]);

  // Generate building row metadata
  const rows = useMemo(() => {
    return Array.from({ length: NUM_BUILDING_ROWS }, (_, i) => {
      const leftH = 35 + ((i * 17) % 55);
      const rightH = 40 + ((i * 23) % 60);
      const leftW = 16 + (i % 3) * 6;
      const rightW = 18 + (i % 4) * 5;
      const hasSign = i % 2 === 0;
      const signType = i % 4; // 0,1,2,3
      const hasGantry = i % 3 === 0;

      return {
        id: i,
        baseZ: -i * ROW_SPACING,
        leftH,
        rightH,
        leftW,
        rightW,
        hasSign,
        signType,
        hasGantry,
      };
    });
  }, []);

  // Shared reusable geometries and materials
  const resources = useMemo(() => {
    return {
      buildingMat: new THREE.MeshStandardMaterial({
        color: '#080a12',
        roughness: 0.35,
        metalness: 0.85,
      }),
      windowCyanMat: new THREE.MeshBasicMaterial({
        color: '#00f3ff',
      }),
      windowPurpleMat: new THREE.MeshBasicMaterial({
        color: '#b026ff',
      }),
      windowMagentaMat: new THREE.MeshBasicMaterial({
        color: '#ff007f',
      }),
      gantryMetal: new THREE.MeshStandardMaterial({
        color: '#141824',
        roughness: 0.6,
        metalness: 0.8,
      }),
      lightPole: new THREE.CylinderGeometry(0.08, 0.12, 5.5, 6),
      poleArm: new THREE.BoxGeometry(1.8, 0.08, 0.08),
      signBoard: new THREE.BoxGeometry(8, 2.5, 0.3),
      gantryArch: new THREE.BoxGeometry(ROAD_WIDTH + 6, 0.5, 0.8),
      gantryPillar: new THREE.BoxGeometry(0.6, 7.5, 0.6),
    };
  }, []);

  useFrame(() => {
    const s = gameState.getState();
    const isCity = s.sector === 'NEON_CITY' || s.sector === 'PORTAL_WARP';
    if (!cityGroupRef.current) return;

    // Only show city elements during Neon City and Portal Warp
    cityGroupRef.current.visible = isCity;
    if (!isCity) return;

    const scrollOffset = s.distance % ROW_SPACING;

    rows.forEach((row, i) => {
      const el = rowRefs.current[i];
      if (!el) return;

      let zPos = row.baseZ + scrollOffset;
      if (zPos > ROW_SPACING) {
        zPos -= CITY_LOOP_SPAN;
      }
      el.position.z = zPos;
    });
  });

  return (
    <group ref={cityGroupRef}>
      {rows.map((row, idx) => (
        <group
          key={row.id}
          ref={(el) => (rowRefs.current[idx] = el)}
          position={[0, 0, row.baseZ]}
        >
          {/* Left Skyscraper Tower */}
          <group position={[-18 - row.leftW / 2, row.leftH / 2, 0]}>
            <mesh material={resources.buildingMat}>
              <boxGeometry args={[row.leftW, row.leftH, 28]} />
            </mesh>
            {/* Glowing Window Accents / Strips */}
            <mesh
              position={[row.leftW / 2 + 0.05, 0, 0]}
              material={row.id % 2 === 0 ? resources.windowCyanMat : resources.windowPurpleMat}
            >
              <planeGeometry args={[0.3, row.leftH * 0.7]} />
            </mesh>
            {/* Neon Rooftop Beacon */}
            <mesh position={[0, row.leftH / 2 + 1, 0]}>
              <sphereGeometry args={[0.6, 8, 8]} />
              <meshBasicMaterial color={COLORS.cyanNeon} />
            </mesh>
          </group>

          {/* Right Skyscraper Tower */}
          <group position={[18 + row.rightW / 2, row.rightH / 2, 0]}>
            <mesh material={resources.buildingMat}>
              <boxGeometry args={[row.rightW, row.rightH, 28]} />
            </mesh>
            {/* Window strips */}
            <mesh
              position={[-row.rightW / 2 - 0.05, 0, 0]}
              rotation={[0, Math.PI, 0]}
              material={row.id % 3 === 0 ? resources.windowMagentaMat : resources.windowCyanMat}
            >
              <planeGeometry args={[0.3, row.rightH * 0.7]} />
            </mesh>
            {/* Neon Rooftop Beacon */}
            <mesh position={[0, row.rightH / 2 + 1, 0]}>
              <sphereGeometry args={[0.6, 8, 8]} />
              <meshBasicMaterial color={COLORS.purpleNeon} />
            </mesh>
          </group>

          {/* Street Light Poles (Left and Right sides of road) */}
          <group position={[-ROAD_WIDTH / 2 - 0.8, 0, 0]}>
            <mesh
              geometry={resources.lightPole}
              material={resources.gantryMetal}
              position={[0, 2.75, 0]}
            />
            {/* Overhanging lamp head */}
            <mesh
              geometry={resources.poleArm}
              material={resources.gantryMetal}
              position={[0.8, 5.4, 0]}
            />
            <mesh position={[1.5, 5.25, 0]}>
              <boxGeometry args={[0.5, 0.12, 0.3]} />
              <meshBasicMaterial color={COLORS.cyanNeon} />
            </mesh>
          </group>

          <group position={[ROAD_WIDTH / 2 + 0.8, 0, 0]}>
            <mesh
              geometry={resources.lightPole}
              material={resources.gantryMetal}
              position={[0, 2.75, 0]}
            />
            <mesh
              geometry={resources.poleArm}
              material={resources.gantryMetal}
              position={[-0.8, 5.4, 0]}
            />
            <mesh position={[-1.5, 5.25, 0]}>
              <boxGeometry args={[0.5, 0.12, 0.3]} />
              <meshBasicMaterial color={COLORS.purpleNeon} />
            </mesh>
          </group>

          {/* Overhead Highway Gantry */}
          {row.hasGantry && (
            <group position={[0, 0, -10]}>
              {/* Left Pillar */}
              <mesh
                geometry={resources.gantryPillar}
                material={resources.gantryMetal}
                position={[-ROAD_WIDTH / 2 - 1.2, 3.75, 0]}
              />
              {/* Right Pillar */}
              <mesh
                geometry={resources.gantryPillar}
                material={resources.gantryMetal}
                position={[ROAD_WIDTH / 2 + 1.2, 3.75, 0]}
              />
              {/* Horizontal Overhead Beam */}
              <mesh
                geometry={resources.gantryArch}
                material={resources.gantryMetal}
                position={[0, 7.2, 0]}
              />
              {/* Overhead Cyber Sign Board */}
              <mesh
                geometry={resources.signBoard}
                position={[0, 7.2, 0.45]}
              >
                <meshBasicMaterial
                  color={row.id % 2 === 0 ? COLORS.cyanNeon : COLORS.purpleNeon}
                  wireframe
                />
              </mesh>
            </group>
          )}

          {/* Holographic Cyber Billboard Sign */}
          {row.hasSign && (
            <group
              position={[
                row.id % 2 === 0 ? -16 : 16,
                14 + (row.id % 4) * 3,
                0,
              ]}
              rotation={[0, row.id % 2 === 0 ? 0.3 : -0.3, 0]}
            >
              <mesh>
                <boxGeometry args={[14, 4.2, 0.3]} />
                <meshBasicMaterial
                  color={row.id % 2 === 0 ? '#00f3ff' : '#ff007f'}
                  wireframe
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
