// NEON RIFT - High-Visibility Cyberpunk City Environment (Sector 01)
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from './../gameplay/gameState';
import { COLORS, ROAD_WIDTH } from '../utils/constants';

const NUM_BUILDING_ROWS = 14;
const ROW_SPACING = 48;
const CITY_LOOP_SPAN = NUM_BUILDING_ROWS * ROW_SPACING; // 672 units

function makeBillboardTexture(text, primaryColor, secondaryColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0d18';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = 15;
  ctx.fillText(text, 256, 56);

  ctx.fillStyle = secondaryColor;
  ctx.font = 'bold 18px monospace';
  ctx.shadowBlur = 8;
  ctx.fillText('OVERDRIVE PROTOCOL // ACTIVE', 256, 98);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function makeHorizonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Twilight sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#070b16');
  grad.addColorStop(0.55, '#14122d');
  grad.addColorStop(0.88, '#1f163d');
  grad.addColorStop(1, '#00f3ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Distant skyscraper silhouettes
  ctx.fillStyle = '#0c101d';
  for (let x = 0; x < 1024; x += 32) {
    const h = 90 + Math.sin(x * 0.04) * 60 + ((x * 19) % 110);
    ctx.fillRect(x, 512 - h, 28, h);
    // Spire beacon
    ctx.fillStyle = x % 64 === 0 ? '#00f3ff' : '#b026ff';
    ctx.fillRect(x + 13, 512 - h - 16, 2, 16);
    ctx.fillStyle = '#0c101d';
  }

  // Cyan & purple horizon neon haze
  const haze = ctx.createLinearGradient(0, 380, 0, 512);
  haze.addColorStop(0, 'rgba(0, 243, 255, 0)');
  haze.addColorStop(0.7, 'rgba(176, 38, 255, 0.25)');
  haze.addColorStop(1, 'rgba(0, 243, 255, 0.55)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 380, 1024, 132);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function NeonCityScene() {
  const cityGroupRef = useRef();
  const rowRefs = useRef([]);

  // Generate multi-depth building row metadata
  const rows = useMemo(() => {
    return Array.from({ length: NUM_BUILDING_ROWS }, (_, i) => {
      const leftH = 32 + ((i * 19) % 45);
      const rightH = 36 + ((i * 29) % 50);
      const bgLeftH = 80 + ((i * 31) % 65);
      const bgRightH = 85 + ((i * 23) % 70);

      const hasSign = i % 2 === 0;
      const signIdx = (i / 2) % 4;
      const hasGantry = i % 3 === 0;

      return {
        id: i,
        baseZ: -i * ROW_SPACING,
        leftH,
        rightH,
        bgLeftH,
        bgRightH,
        hasSign,
        signIdx,
        hasGantry,
      };
    });
  }, []);

  // Shared reusable geometries and materials for maximum 60fps performance
  const [resources, billboardTextures] = useMemo(() => {
    const isClient = typeof document !== 'undefined';
    const bbTextures = isClient
      ? [
          makeBillboardTexture('NEON RIFT', COLORS.cyanNeon, COLORS.purpleNeon),
          makeBillboardTexture('CYBER CORP', COLORS.purpleNeon, COLORS.cyanNeon),
          makeBillboardTexture('HYPERDRIVE', COLORS.magentaNeon, COLORS.amberWarning),
          makeBillboardTexture('SECTOR 01', COLORS.cyanNeon, '#38bdf8'),
        ]
      : [];

    const res = {
      fgBuildingMat: new THREE.MeshStandardMaterial({
        color: '#1a2233',
        roughness: 0.35,
        metalness: 0.45,
      }),
      bgBuildingMat: new THREE.MeshStandardMaterial({
        color: '#121826',
        roughness: 0.5,
        metalness: 0.6,
      }),
      windowCyanMat: new THREE.MeshStandardMaterial({
        color: COLORS.cyanNeon,
        emissive: COLORS.cyanNeon,
        emissiveIntensity: 1.2,
      }),
      windowPurpleMat: new THREE.MeshStandardMaterial({
        color: COLORS.purpleNeon,
        emissive: COLORS.purpleNeon,
        emissiveIntensity: 1.2,
      }),
      windowAmberMat: new THREE.MeshStandardMaterial({
        color: COLORS.amberWarning,
        emissive: COLORS.amberWarning,
        emissiveIntensity: 1.1,
      }),
      gantryMetal: new THREE.MeshStandardMaterial({
        color: '#222b3e',
        roughness: 0.4,
        metalness: 0.7,
      }),
      lightPoleGeom: new THREE.CylinderGeometry(0.12, 0.16, 6.2, 8),
      poleArmGeom: new THREE.BoxGeometry(2.4, 0.12, 0.12),
      lampHeadGeom: new THREE.BoxGeometry(0.7, 0.16, 0.45),
      signGeom: new THREE.BoxGeometry(11, 2.8, 0.35),
      gantryArchGeom: new THREE.BoxGeometry(ROAD_WIDTH + 6.5, 0.65, 1.2),
      gantryPillarGeom: new THREE.BoxGeometry(0.75, 8.5, 0.75),
      horizonPlaneGeom: new THREE.PlaneGeometry(360, 140),
      horizonMat: new THREE.MeshBasicMaterial({
        map: isClient ? makeHorizonTexture() : null,
      }),
    };

    return [res, bbTextures];
  }, []);

  useFrame(() => {
    const s = gameState.getState();
    const isCity = s.sector === 'NEON_CITY' || s.sector === 'PORTAL_WARP';
    if (!cityGroupRef.current) return;

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
          {/* ================= LEFT FOREGROUND SKYSCRAPER ================= */}
          <group position={[-17.5, row.leftH / 2, 0]}>
            <mesh material={resources.fgBuildingMat}>
              <boxGeometry args={[11, row.leftH, 22]} />
            </mesh>
            {/* Horizontal Illuminated Window Bands */}
            {Array.from({ length: 4 }).map((_, wIdx) => (
              <mesh
                key={wIdx}
                position={[5.55, -row.leftH / 3 + wIdx * 8, 0]}
                rotation={[0, Math.PI / 2, 0]}
                material={row.id % 2 === 0 ? resources.windowCyanMat : resources.windowPurpleMat}
              >
                <planeGeometry args={[18, 0.55]} />
              </mesh>
            ))}
            {/* Rooftop glowing antenna */}
            <mesh position={[0, row.leftH / 2 + 3, 0]}>
              <cylinderGeometry args={[0.08, 0.15, 6, 6]} />
              <meshBasicMaterial color={COLORS.cyanNeon} />
            </mesh>
          </group>

          {/* ================= LEFT MID/BACKGROUND MEGA-TOWER ================= */}
          <group position={[-38, row.bgLeftH / 2, 8]}>
            <mesh material={resources.bgBuildingMat}>
              <boxGeometry args={[22, row.bgLeftH, 30]} />
            </mesh>
            {/* Tower Facade Vertical Neon Accent */}
            <mesh
              position={[11.05, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              material={resources.windowPurpleMat}
            >
              <planeGeometry args={[0.6, row.bgLeftH * 0.85]} />
            </mesh>
          </group>

          {/* ================= RIGHT FOREGROUND SKYSCRAPER ================= */}
          <group position={[17.5, row.rightH / 2, 0]}>
            <mesh material={resources.fgBuildingMat}>
              <boxGeometry args={[11, row.rightH, 22]} />
            </mesh>
            {/* Window bands facing the highway */}
            {Array.from({ length: 4 }).map((_, wIdx) => (
              <mesh
                key={wIdx}
                position={[-5.55, -row.rightH / 3 + wIdx * 8, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                material={row.id % 3 === 0 ? resources.windowAmberMat : resources.windowCyanMat}
              >
                <planeGeometry args={[18, 0.55]} />
              </mesh>
            ))}
            {/* Rooftop antenna spire */}
            <mesh position={[0, row.rightH / 2 + 3, 0]}>
              <cylinderGeometry args={[0.08, 0.15, 6, 6]} />
              <meshBasicMaterial color={COLORS.purpleNeon} />
            </mesh>
          </group>

          {/* ================= RIGHT MID/BACKGROUND MEGA-TOWER ================= */}
          <group position={[38, row.bgRightH / 2, 8]}>
            <mesh material={resources.bgBuildingMat}>
              <boxGeometry args={[22, row.bgRightH, 30]} />
            </mesh>
            <mesh
              position={[-11.05, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              material={resources.windowCyanMat}
            >
              <planeGeometry args={[0.6, row.bgRightH * 0.85]} />
            </mesh>
          </group>

          {/* ================= STREET LIGHT POLES (L & R) ================= */}
          <group position={[-ROAD_WIDTH / 2 - 1.2, 0, 0]}>
            <mesh
              geometry={resources.lightPoleGeom}
              material={resources.gantryMetal}
              position={[0, 3.1, 0]}
            />
            <mesh
              geometry={resources.poleArmGeom}
              material={resources.gantryMetal}
              position={[1.1, 6.1, 0]}
            />
            <mesh
              geometry={resources.lampHeadGeom}
              position={[2.0, 5.95, 0]}
            >
              <meshBasicMaterial color={COLORS.cyanNeon} />
            </mesh>
          </group>

          <group position={[ROAD_WIDTH / 2 + 1.2, 0, 0]}>
            <mesh
              geometry={resources.lightPoleGeom}
              material={resources.gantryMetal}
              position={[0, 3.1, 0]}
            />
            <mesh
              geometry={resources.poleArmGeom}
              material={resources.gantryMetal}
              position={[-1.1, 6.1, 0]}
            />
            <mesh
              geometry={resources.lampHeadGeom}
              position={[-2.0, 5.95, 0]}
            >
              <meshBasicMaterial color={COLORS.purpleNeon} />
            </mesh>
          </group>

          {/* ================= OVERHEAD HIGHWAY GANTRY ================= */}
          {row.hasGantry && (
            <group position={[0, 0, -8]}>
              <mesh
                geometry={resources.gantryPillarGeom}
                material={resources.gantryMetal}
                position={[-ROAD_WIDTH / 2 - 1.5, 4.25, 0]}
              />
              <mesh
                geometry={resources.gantryPillarGeom}
                material={resources.gantryMetal}
                position={[ROAD_WIDTH / 2 + 1.5, 4.25, 0]}
              />
              <mesh
                geometry={resources.gantryArchGeom}
                material={resources.gantryMetal}
                position={[0, 8.2, 0]}
              />
              {/* Traffic Display Banner on Arch */}
              <mesh position={[0, 8.2, 0.65]}>
                <planeGeometry args={[ROAD_WIDTH - 2, 1.0]} />
                <meshStandardMaterial
                  color="#00f3ff"
                  emissive="#00f3ff"
                  emissiveIntensity={1.4}
                />
              </mesh>
              {/* Downward highway spotlight */}
              <spotLight
                position={[0, 8.0, 0]}
                target-position={[0, 0, 0]}
                angle={0.65}
                penumbra={0.6}
                intensity={4.0}
                color="#00f3ff"
                distance={20}
              />
            </group>
          )}

          {/* ================= HOLOGRAPHIC BILLBOARD SIGNS ================= */}
          {row.hasSign && billboardTextures.length > 0 && (
            <group
              position={[
                row.id % 2 === 0 ? -14.5 : 14.5,
                16 + (row.id % 3) * 4,
                0,
              ]}
              rotation={[0, row.id % 2 === 0 ? 0.35 : -0.35, 0]}
            >
              <mesh geometry={resources.signGeom}>
                <meshStandardMaterial
                  map={billboardTextures[row.signIdx % billboardTextures.length]}
                  emissive="#ffffff"
                  emissiveIntensity={0.65}
                  emissiveMap={billboardTextures[row.signIdx % billboardTextures.length]}
                  roughness={0.2}
                />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Atmospheric Horizon Skyline Glow at End of Highway */}
      <mesh
        geometry={resources.horizonPlaneGeom}
        material={resources.horizonMat}
        position={[0, 48, -280]}
      />
    </group>
  );
}
