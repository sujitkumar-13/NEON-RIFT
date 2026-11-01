// NEON RIFT - Victory Screen
import { gameState } from '../gameplay/gameState';
import { soundManager } from '../utils/audioSynthesizer';

export function VictoryScreen() {
  const s = gameState.getState();

  const handleRestart = () => {
    soundManager.playClick();
    gameState.startRace();
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    gameState.returnToMenu();
  };

  const minutes = Math.floor(s.timeElapsed / 60);
  const seconds = Math.floor(s.timeElapsed % 60);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="victory-overlay">
      <div className="victory-dialog">
        <div className="victory-badge">OVERDRIVE EXODUS COMPLETE</div>
        <h1 className="victory-title">RIFT BREACHED</h1>
        <p className="victory-subtitle">YOU HAVE CONQUERED THE FRACTURED HORIZON</p>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">FINAL SCORE</span>
            <span className="stat-value highlight-cyan">{s.score}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">TOTAL DISTANCE</span>
            <span className="stat-value">{Math.round(s.distance)} M</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">RACE TIME</span>
            <span className="stat-value">{timeFormatted}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">PEAK SPEED</span>
            <span className="stat-value">{s.maxSpeedReached} KM/H</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="end-actions">
          <button className="btn-primary victory-btn" onClick={handleRestart}>
            RACE AGAIN
          </button>
          <button className="btn-secondary" onClick={handleMainMenu}>
            RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
