// NEON RIFT - Cinematic Third-Person Follow Camera
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../gameplay/gameState';

export function FollowCamera() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 2.2, 5.2));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.05, -18));

  useFrame((_, delta) => {
    const s = gameState.getState();
    const isMenu = s.phase === 'MENU';

    if (isMenu) {
      // Cinematic slow turntable showcase camera in Main Menu
      const time = Date.now() * 0.0006;
      const radius = 6.2;
      const targetCamX = Math.sin(time) * radius;
      const targetCamZ = Math.cos(time) * radius + 0.8;
      const targetCamY = 2.0 + Math.sin(time * 0.5) * 0.3;

      camera.position.x += (targetCamX - camera.position.x) * delta * 2.0;
      camera.position.y += (targetCamY - camera.position.y) * delta * 2.0;
      camera.position.z += (targetCamZ - camera.position.z) * delta * 2.0;
      camera.lookAt(0, 0.45, 0);
      return;
    }

    // Racing Follow Camera: Hero car centered, comfortable height & distance
    const targetOffsetZ = s.isBoosting ? 5.8 : 5.1;
    const targetOffsetY = s.isBoosting ? 1.95 : 2.15;
    const targetOffsetX = s.playerX * 0.52;

    // Subtle, balanced camera shake
    const shake = Math.min(0.15, s.cameraShake);
    const shakeOffsetX = (Math.random() - 0.5) * shake * 0.25;
    const shakeOffsetY = (Math.random() - 0.5) * shake * 0.2;

    const desiredCamPos = new THREE.Vector3(
      targetOffsetX + shakeOffsetX,
      targetOffsetY + shakeOffsetY,
      targetOffsetZ
    );

    // Dynamic FOV kick: smoothly widens during nitro boost (60 -> 72 deg)
    const baseFov = 60;
    const boostFov = 72;
    const targetFov = s.isBoosting ? boostFov : (baseFov + (s.speed / 72) * 6);
    camera.fov += (targetFov - camera.fov) * Math.min(1, delta * 6.0);
    camera.updateProjectionMatrix();

    // Smooth position lerp
    currentPos.current.x += (desiredCamPos.x - currentPos.current.x) * Math.min(1, delta * 12.0);
    currentPos.current.y += (desiredCamPos.y - currentPos.current.y) * Math.min(1, delta * 9.0);
    currentPos.current.z += (desiredCamPos.z - currentPos.current.z) * Math.min(1, delta * 10.0);

    camera.position.copy(currentPos.current);

    // Look-at point centered ahead down the road
    const desiredLookAt = new THREE.Vector3(
      s.playerX * 0.68,
      1.05,
      -18
    );

    currentLookAt.current.lerp(desiredLookAt, Math.min(1, delta * 10.0));
    camera.lookAt(currentLookAt.current);

    // Subtle dynamic camera bank tilt during steering & drift
    const targetBank = -s.carYaw * (s.isDrifting ? 0.35 : 0.16);
    camera.rotation.z += (targetBank - camera.rotation.z) * Math.min(1, delta * 8.0);
  });

  return null;
}
