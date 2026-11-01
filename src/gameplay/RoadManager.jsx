// NEON RIFT - Modular Road & Highway Streaming System
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from './gameState';
import { COLORS, ROAD_WIDTH, ROAD_SEGMENT_LENGTH } from '../utils/constants';

const NUM_SEGMENTS = 14;
const POOL_SPAN = NUM_SEGMENTS * ROAD_SEGMENT_LENGTH; // 700 units

export function RoadManager() {
  const segmentsGroupRef = useRef();
  const segmentRefs = useRef([]);

  // Generate initial segment data
  const segments = useMemo(() => {
    return Array.from({ length: NUM_SEGMENTS }, (_, i) => ({
      id: i,
      baseZ: -i * ROAD_SEGMENT_LENGTH,
    }));
  }, []);

  // Shared geometries and materials for max performance
  const geometries = useMemo(() => {
    return {
      roadPlane: new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_SEGMENT_LENGTH),
      curb: new THREE.BoxGeometry(0.4, 0.45, ROAD_SEGMENT_LENGTH),
      barrierGlow: new THREE.BoxGeometry(0.12, 0.55, ROAD_SEGMENT_LENGTH),
      laneLine: new THREE.PlaneGeometry(0.18, ROAD_SEGMENT_LENGTH * 0.45),
      speedChevron: new THREE.PlaneGeometry(1.2, 2.5),
      floatingPillar: new THREE.CylinderGeometry(0.6, 0.9, 18, 6),
    };
  }, []);

  const materials = useMemo(() => {
    return {
      cityRoad: new THREE.MeshStandardMaterial({
        color: '#07090e',
        roughness: 0.25,
        metalness: 0.8,
      }),
      riftRoad: new THREE.MeshStandardMaterial({
        color: '#080312',
        roughness: 0.15,
        metalness: 0.9,
      }),
      cyanLane: new THREE.MeshBasicMaterial({
        color: COLORS.cyanNeon,
      }),
      purpleLane: new THREE.MeshBasicMaterial({
        color: COLORS.purpleNeon,
      }),
      cyanBarrier: new THREE.MeshBasicMaterial({
        color: COLORS.cyanNeon,
      }),
      purpleBarrier: new THREE.MeshBasicMaterial({
        color: COLORS.purpleNeon,
      }),
      curbDark: new THREE.MeshStandardMaterial({
        color: '#121624',
        roughness: 0.5,
      }),
      energyGrid: new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      }),
    };
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
        // Fractured road effect: slight roll variation
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
          {/* Main Road Surface */}
          <mesh
            geometry={geometries.roadPlane}
            material={materials.cityRoad}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, -ROAD_SEGMENT_LENGTH / 2]}
            receiveShadow
          />

          {/* Left Lane Divider */}
          <mesh
            geometry={geometries.laneLine}
            material={materials.cyanLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-ROAD_WIDTH / 4, 0.015, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Right Lane Divider */}
          <mesh
            geometry={geometries.laneLine}
            material={materials.cyanLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[ROAD_WIDTH / 4, 0.015, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Center Pulsing Dashes */}
          <mesh
            geometry={geometries.laneLine}
            material={materials.purpleLane}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.015, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Left Outer Curb & Glowing Edge Barrier */}
          <mesh
            geometry={geometries.curb}
            material={materials.curbDark}
            position={[-ROAD_WIDTH / 2, 0.15, -ROAD_SEGMENT_LENGTH / 2]}
          />
          <mesh
            geometry={geometries.barrierGlow}
            material={materials.cyanBarrier}
            position={[-ROAD_WIDTH / 2, 0.4, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Right Outer Curb & Glowing Edge Barrier */}
          <mesh
            geometry={geometries.curb}
            material={materials.curbDark}
            position={[ROAD_WIDTH / 2, 0.15, -ROAD_SEGMENT_LENGTH / 2]}
          />
          <mesh
            geometry={geometries.barrierGlow}
            material={materials.purpleBarrier}
            position={[ROAD_WIDTH / 2, 0.4, -ROAD_SEGMENT_LENGTH / 2]}
          />

          {/* Under-highway support pillars (visible when road floats) */}
          <mesh
            geometry={geometries.floatingPillar}
            material={materials.curbDark}
            position={[0, -9.2, -ROAD_SEGMENT_LENGTH / 2]}
          />
        </group>
      ))}
    </group>
  );
}
