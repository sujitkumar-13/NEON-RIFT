// NEON RIFT - Input Controller Hook (Keyboard + Virtual Touch controls)
import { useEffect, useRef } from 'react';
import { gameState } from '../gameplay/gameState';
import { soundManager } from '../utils/audioSynthesizer';

export function useKeyboardControls() {
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    drift: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Audio resume on first user interaction
      soundManager.resume();

      if (e.code === 'Escape') {
        const currentPhase = gameState.getState().phase;
        if (currentPhase === 'PLAYING') {
          gameState.pause();
        } else if (currentPhase === 'PAUSED') {
          gameState.resume();
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          controlsRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          controlsRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          controlsRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          controlsRef.current.right = true;
          break;
        case 'Space':
          if (!controlsRef.current.boost) {
            controlsRef.current.boost = true;
            soundManager.playNitro();
          }
          e.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          controlsRef.current.drift = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          controlsRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          controlsRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          controlsRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          controlsRef.current.right = false;
          break;
        case 'Space':
          controlsRef.current.boost = false;
          e.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          controlsRef.current.drift = false;
          break;
        default:
          break;
      }
    };

    const handleWindowBlur = () => {
      controlsRef.current.forward = false;
      controlsRef.current.backward = false;
      controlsRef.current.left = false;
      controlsRef.current.right = false;
      controlsRef.current.boost = false;
      controlsRef.current.drift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return controlsRef;
}

