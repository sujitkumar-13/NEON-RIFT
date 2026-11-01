// NEON RIFT - Rift World Void Environment (Sector 02 & Final Escape)
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../gameplay/gameState';
import { COLORS, ROAD_WIDTH, TOTAL_RACE_DISTANCE } from '../utils/constants';

const NUM_STRUCTURES = 18;
const SPACING = 40;
const LOOP_SPAN = NUM_STRUCTURES * SPACING; // 720 units

export function RiftWorldScene() {
  const riftGroupRef = useRef();
  const structureRefs = useRef([]);
  const finishGateRef = useRef();

  // Procedural floating void structures metadata
  const structures = useMemo(() => {
    return Array.from({ length: NUM_STRUCTURES }, (_, i) => {
      const isLeft = i % 2 === 0;
      const xPos = isLeft ? -18 - (i % 4) * 5 : 18 + (i % 4) * 5;
      const yPos = 4 + (i % 5) * 4;
      const height = 20 + (i % 6) * 8;
      const type = i % 3; // 0: Monolith, 1: Octahedron cluster, 2: Energy Pylon
      return {
        id: i,
        baseZ: -i * SPACING,
        xPos,
        yPos,
        height,
        type,
      };
    });
  }, []);

  const resources = useMemo(() => {
    return {
      voidMat: new THREE.MeshStandardMaterial({
        color: '#05020c',
        roughness: 0.15,
        metalness: 0.95,
      }),
      wireCyanMat: new THREE.MeshBasicMaterial({
        color: COLORS.cyanNeon,
        wireframe: true,
      }),
      wirePurpleMat: new THREE.MeshBasicMaterial({
        color: COLORS.purpleNeon,
        wireframe: true,
      }),
      coreGlowMat: new THREE.MeshBasicMaterial({
        color: COLORS.magentaNeon,
      }),
      monolithGeom: new THREE.BoxGeometry(3.5, 25, 3.5),
      octaGeom: new THREE.OctahedronGeometry(4.0, 0),
      ringGeom: new THREE.TorusGeometry(8, 0.25, 8, 24),
    };
  }, []);

  useFrame((state) => {
    const s = gameState.getState();
    const isRiftActive = s.sector === 'RIFT_WORLD' || s.sector === 'FINAL_ESCAPE';
    if (!riftGroupRef.current) return;

    riftGroupRef.current.visible = isRiftActive;
    if (!isRiftActive) return;

    const time = state.clock.getElapsedTime();
    const scrollOffset = s.distance % SPACING;

    // Animate floating structures
    structures.forEach((st, i) => {
      const el = structureRefs.current[i];
      if (!el) return;

      let zPos = st.baseZ + scrollOffset;
      if (zPos > SPACING) {
        zPos -= LOOP_SPAN;
      }
      el.position.z = zPos;
      // Floating hover bobbing
      el.position.y = st.yPos + Math.sin(time * 1.5 + i) * 1.5;
      el.rotation.y = time * 0.4 + i * 0.5;
      el.rotation.x = Math.sin(time * 0.8 + i) * 0.15;
    });

    // Final Escape Finish Gateway positioning
    if (finishGateRef.current) {
      const distToFinish = TOTAL_RACE_DISTANCE - s.distance;
      if (distToFinish < 500 && distToFinish > -100) {
        finishGateRef.current.visible = true;
        finishGateRef.current.position.set(0, 6.0, -distToFinish);
        finishGateRef.current.rotation.z = Math.sin(time * 2.0) * 0.05;
      } else {
        finishGateRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={riftGroupRef} visible={false}>
      {/* Floating Void Structures */}
      {structures.map((st, idx) => (
        <group
          key={st.id}
          ref={(el) => (structureRefs.current[idx] = el)}
          position={[st.xPos, st.yPos, st.baseZ]}
        >
          {st.type === 0 && (
            <mesh geometry={resources.monolithGeom} material={resources.voidMat}>
              {/* Glowing Wireframe Border */}
              <mesh
                geometry={resources.monolithGeom}
                material={st.id % 2 === 0 ? resources.wireCyanMat : resources.wirePurpleMat}
                scale={[1.02, 1.02, 1.02]}
              />
            </mesh>
          )}

          {st.type === 1 && (
            <group>
              <mesh geometry={resources.octaGeom} material={resources.voidMat} />
              <mesh
                geometry={resources.octaGeom}
                material={resources.wireCyanMat}
                scale={[1.08, 1.08, 1.08]}
              />
              <mesh geometry={resources.ringGeom} material={resources.wirePurpleMat} />
            </group>
          )}

          {st.type === 2 && (
            <group>
              <mesh geometry={resources.ringGeom} material={resources.wireCyanMat} />
              <mesh
                geometry={resources.octaGeom}
                material={resources.coreGlowMat}
                scale={[0.4, 0.4, 0.4]}
              />
            </group>
          )}
        </group>
      ))}

      {/* Massive Final Escape Gateway Beacon (The finish line) */}
      <group ref={finishGateRef} visible={false}>
        {/* Massive Archway */}
        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[ROAD_WIDTH + 8, 1.5, 2.5]} />
          <meshBasicMaterial color={COLORS.cyanNeon} wireframe />
        </mesh>
        <mesh position={[-ROAD_WIDTH / 2 - 3, 4, 0]}>
          <boxGeometry args={[2.0, 12, 2.0]} />
          <meshBasicMaterial color={COLORS.cyanNeon} wireframe />
        </mesh>
        <mesh position={[ROAD_WIDTH / 2 + 3, 4, 0]}>
          <boxGeometry args={[2.0, 12, 2.0]} />
          <meshBasicMaterial color={COLORS.cyanNeon} wireframe />
        </mesh>
        {/* Finish Energy Curtain */}
        <mesh position={[0, 4, 0]}>
          <planeGeometry args={[ROAD_WIDTH + 4, 8]} />
          <meshBasicMaterial
            color={COLORS.cyanNeon}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight
          color={COLORS.cyanNeon}
          intensity={12}
          distance={80}
          position={[0, 4, 0]}
        />
      </group>
    </group>
  );
}
