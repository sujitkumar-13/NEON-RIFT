// NEON RIFT - Modular Road & Highway Streaming System
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS, ROAD_WIDTH, ROAD_SEGMENT_LENGTH } from '../utils/constants';

const NUM_SEGMENTS = 14;
const POOL_SPAN = NUM_SEGMENTS * ROAD_SEGMENT_LENGTH; // 700 units

function generateRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base asphalt slate
  ctx.fillStyle = '#1a2030';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle asphalt grain texture
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const val = 28 + Math.floor(Math.random() * 22);
    ctx.fillStyle = `rgb(${val}, ${val + 4}, ${val + 12})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // High-tech subtle longitudinal cyber grooves
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 0); ctx.lineTo(128, 512);
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(384, 0); ctx.lineTo(384, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  return texture;
}

export function RoadManager() {
  const segmentsGroupRef = useRef();
  const segmentRefs = useRef([]);

  // Generate initial segment metadata
  const segments = useMemo(() => {
    return Array.from({ length: NUM_SEGMENTS }, (_, i) => ({
      id: i,
      baseZ: -i * ROAD_SEGMENT_LENGTH,
    }));
  }, []);

  // Shared geometries and materials for optimal 60fps performance
  const [geometries, materials] = useMemo(() => {
    const roadTexture = typeof document !== 'undefined' ? generateRoadTexture() : null;

    const geos = {
      roadPlane: new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_SEGMENT_LENGTH),
      curb: new THREE.BoxGeometry(0.5, 0.35, ROAD_SEGMENT_LENGTH),
      barrierGlow: new THREE.BoxGeometry(0.16, 0.65, ROAD_SEGMENT_LENGTH),
      laneLine: new THREE.PlaneGeometry(0.24, ROAD_SEGMENT_LENGTH * 0.55),
      centerChevron: new THREE.PlaneGeometry(0.35, ROAD_SEGMENT_LENGTH * 0.35),
      speedArrow: new THREE.ConeGeometry(0.6, 1.8, 3),
      floatingPillar: new THREE.CylinderGeometry(0.8, 1.2, 22, 6),
    };

    const mats = {
      cityRoad: new THREE.MeshStandardMaterial({
        color: '#1a2030',
        map: roadTexture,
        roughness: 0.38,
        metalness: 0.15,
      }),
      riftRoad: new THREE.MeshStandardMaterial({
        color: '#120724',
        roughness: 0.22,
        metalness: 0.45,
      }),
      cyanLane: new THREE.MeshStandardMaterial({
        color: COLORS.cyanNeon,
        emissive: COLORS.cyanNeon,
        emissiveIntensity: 1.2,
      }),
      purpleLane: new THREE.MeshStandardMaterial({
        color: COLORS.purpleNeon,
        emissive: COLORS.purpleNeon,
        emissiveIntensity: 1.2,
      }),
      cyanBarrier: new THREE.MeshBasicMaterial({
        color: COLORS.cyanNeon,
      }),
      purpleBarrier: new THREE.MeshBasicMaterial({
        color: COLORS.purpleNeon,
      }),
      curbDark: new THREE.MeshStandardMaterial({
        color: '#283348',
        roughness: 0.45,
        metalness: 0.3,
      }),
    };

    return [geos, mats];
  }, []);

  useFrame(() => {
    const s = gameState.getState();
    const isRift = s.sector === 'RIFT_WORLD' || s.sector === 'FINAL_ESCAPE';

    // Total distance traveled translates to cyclic road scrolling
    const scrollOffset = (s.distance) % ROAD_SEGMENT_LENGTH;

    segments.forEach((seg, i) => {
      const mesh = segmentRefs.current[i];
      if (!mesh) return;

      // Calculate rolling Z position
      let zPos = seg.baseZ + scrollOffset;
      if (zPos > ROAD_SEGMENT_LENGTH) {
        zPos -= POOL_SPAN;
      }
      mesh.position.z = zPos;

      // In Rift World, add floating road elevation oscillation and fractured tilt
      if (isRift) {
        mesh.position.y = Math.sin((s.distance * 0.05) + i) * 0.35;
        mesh.rotation.z = Math.sin(i * 1.5) * 0.02;
      } else {
        mesh.position.y = 0;
        mesh.rotation.z = 0;
      }
    });
  });

  return (
    <group ref={segmentsGroupRef}>
      {segments.map((seg, idx) => (
        <group
          key={seg.id}
          ref={(el) => (segmentRefs.current[idx] = el)}
          position={[0, 0, seg.baseZ]}
        >
          {/* Main Road Surface - Clearly visible textured asphalt slate */}
          <mesh
            geometry={geometries.roadPlane}
            material={materials.cityRoad}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, -ROAD_SEGMENT_LENGTH / 2]}
            receiveShadow
          />

          {/* Left Lane Divider Markings */}
          <mesh
            geometry={geometries.laneLine}
            material={materials.cyanLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-ROAD_WIDTH / 4, 0.02, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Right Lane Divider Markings */}
          <mesh
            geometry={geometries.laneLine}
            material={materials.cyanLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[ROAD_WIDTH / 4, 0.02, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Center Pulsing Speed Markers */}
          <mesh
            geometry={geometries.centerChevron}
            material={materials.purpleLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Directional Velocity Arrows painted on road */}
          <mesh
            geometry={geometries.speedArrow}
            material={materials.cyanLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.025, -ROAD_SEGMENT_LENGTH * 0.25]}
          />

          {/* Left Outer Elevated Curb */}
          <mesh
            geometry={geometries.curb}
            material={materials.curbDark}
            position={[-ROAD_WIDTH / 2 - 0.25, 0.16, -ROAD_SEGMENT_LENGTH / 2]}
          />
          {/* Left Glowing Cyan Neon Guardrail */}
          <mesh
            geometry={geometries.barrierGlow}
            material={materials.cyanBarrier}
            position={[-ROAD_WIDTH / 2 - 0.25, 0.45, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Right Outer Elevated Curb */}
          <mesh
            geometry={geometries.curb}
            material={materials.curbDark}
            position={[ROAD_WIDTH / 2 + 0.25, 0.16, -ROAD_SEGMENT_LENGTH / 2]}
          />
          {/* Right Glowing Purple Neon Guardrail */}
          <mesh
            geometry={geometries.barrierGlow}
            material={materials.purpleBarrier}
            position={[ROAD_WIDTH / 2 + 0.25, 0.45, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Under-highway support pillars (visible when floating in Rift World) */}
          <mesh
            geometry={geometries.floatingPillar}
            material={materials.curbDark}
            position={[0, -11, -ROAD_SEGMENT_LENGTH / 2]}
          />
        </group>
      ))}
    </group>
  );
}
