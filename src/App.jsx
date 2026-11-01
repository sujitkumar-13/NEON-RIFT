// NEON RIFT - Root Application Component
import { useState, useEffect } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { PauseMenu } from './ui/PauseMenu';
import { GameOverScreen } from './ui/GameOverScreen';
import { VictoryScreen } from './ui/VictoryScreen';
import { TouchControls } from './ui/TouchControls';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { gameState } from './gameplay/gameState';
import './App.css';

export default function App() {
  const [phase, setPhase] = useState(gameState.getState().phase);
  const controlsRef = useKeyboardControls();

  useEffect(() => {
    const unsubscribe = gameState.subscribe((state) => {
      setPhase(state.phase);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="game-viewport">
      {/* 3D WebGL Scene & Authentic GLB Hero Car */}
      <CanvasContainer controlsRef={controlsRef} />

      {/* UI Overlays conditioned on game state */}
      {phase === 'MENU' && <MainMenu />}

      {(phase === 'PLAYING' || phase === 'PAUSED') && (
        <>
          <HUD />
          {phase === 'PLAYING' && <TouchControls controlsRef={controlsRef} />}
        </>
      )}

      {phase === 'PAUSED' && <PauseMenu />}
      {phase === 'GAME_OVER' && <GameOverScreen />}
      {phase === 'VICTORY' && <VictoryScreen />}
    </div>
  );
}
