// NEON RIFT - Cinematic Third-Person Follow Camera
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../gameplay/gameState';

export function FollowCamera() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 3.2, 7.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, -10));

  useFrame((_, delta) => {
    const s = gameState.getState();
    const isMenu = s.phase === 'MENU';

    if (isMenu) {
      // Cinematic slow turntable camera in Main Menu
      const time = Date.now() * 0.0006;
      const radius = 6.8;
      const targetCamX = Math.sin(time) * radius;
      const targetCamZ = Math.cos(time) * radius + 1.5;
      const targetCamY = 2.4 + Math.sin(time * 0.5) * 0.4;

      camera.position.x += (targetCamX - camera.position.x) * delta * 2.0;
      camera.position.y += (targetCamY - camera.position.y) * delta * 2.0;
      camera.position.z += (targetCamZ - camera.position.z) * delta * 2.0;
      camera.lookAt(0, 0.4, 0);
      return;
    }

    // Racing Follow Camera
    // Base camera offset behind player car
    const targetOffsetZ = s.isBoosting ? 8.2 : 6.8;
    const targetOffsetY = s.isBoosting ? 2.6 : 3.0;
    // Camera sways slightly with steer to give sense of momentum
    const targetOffsetX = s.playerX * 0.65;

    // Apply camera shake if any
    const shake = s.cameraShake;
    const shakeOffsetX = (Math.random() - 0.5) * shake * 0.4;
    const shakeOffsetY = (Math.random() - 0.5) * shake * 0.4;

    const desiredCamPos = new THREE.Vector3(
      targetOffsetX + shakeOffsetX,
      targetOffsetY + shakeOffsetY,
      targetOffsetZ
    );

    // Dynamic FOV kick: widening when boosting (e.g. 58 -> 76 deg)
    const baseFov = 60;
    const boostFov = 78;
    const targetFov = s.isBoosting ? boostFov : (baseFov + (s.speed / 70) * 8);
    camera.fov += (targetFov - camera.fov) * Math.min(1, delta * 6.0);
    camera.updateProjectionMatrix();

    // Lerp camera position smoothly
    currentPos.current.x += (desiredCamPos.x - currentPos.current.x) * Math.min(1, delta * 9.0);
    currentPos.current.y += (desiredCamPos.y - currentPos.current.y) * Math.min(1, delta * 7.0);
    currentPos.current.z += (desiredCamPos.z - currentPos.current.z) * Math.min(1, delta * 8.0);

    camera.position.copy(currentPos.current);

    // Target look-at point ahead of car down the road
    const desiredLookAt = new THREE.Vector3(
      s.playerX * 0.8,
      1.2,
      -18
    );

    currentLookAt.current.lerp(desiredLookAt, Math.min(1, delta * 10.0));
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

