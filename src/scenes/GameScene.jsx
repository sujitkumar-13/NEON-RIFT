// NEON RIFT - Master 3D Game Scene
import { Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Lighting } from '../components/Lighting';
import { FollowCamera } from '../components/FollowCamera';
import { PlayerCar } from '../gameplay/PlayerCar';
import { RivalCar } from '../gameplay/RivalCar';
import { RoadManager } from '../gameplay/RoadManager';
import { NeonCityScene } from './NeonCityScene';
import { RiftPortal } from '../gameplay/RiftPortal';
import { RiftWorldScene } from './RiftWorldScene';
import { ObstacleManager } from '../gameplay/ObstacleManager';
import { Particles } from '../gameplay/Particles';
import { gameState } from '../gameplay/gameState';

function GameLoop({ controlsRef }) {
  useFrame((_, delta) => {
    // Cap delta time to prevent physics explosions on tab switch
    const clampedDelta = Math.min(delta, 0.05);
    gameState.updateFrame(clampedDelta, controlsRef.current);
  });
  return null;
}

export function GameScene({ controlsRef }) {
  return (
    <>
      <GameLoop controlsRef={controlsRef} />
      <FollowCamera />
      <Lighting />

      <Suspense fallback={null}>
        <PlayerCar />
        <RivalCar />
      </Suspense>

      <RoadManager />
      <NeonCityScene />
      <RiftPortal />
      <RiftWorldScene />
      <ObstacleManager />
      <Particles />
    </>
  );
}
