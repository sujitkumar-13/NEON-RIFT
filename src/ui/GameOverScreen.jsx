// NEON RIFT - Game Over Screen
import { gameState } from '../gameplay/gameState';
import { soundManager } from '../utils/audioSynthesizer';

export function GameOverScreen() {
  const s = gameState.getState();

  const handleRestart = () => {
    soundManager.playClick();
    gameState.startRace();
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    gameState.returnToMenu();
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-dialog">
        <div className="glitch-banner">CRITICAL TELEMETRY LOSS</div>
        <h1 className="game-over-title">VEHICLE DESTROYED</h1>
        <p className="game-over-subtitle">HULL INTEGRITY COMPROMISED // CONNECTION TERMINATED</p>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">FINAL SCORE</span>
            <span className="stat-value highlight">{s.score}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">DISTANCE REACHED</span>
            <span className="stat-value">{Math.round(s.distance)} M</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">MAX SPEED</span>
            <span className="stat-value">{s.maxSpeedReached} KM/H</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">SECTOR REACHED</span>
            <span className="stat-value sector-badge">
              {s.sector === 'NEON_CITY' ? 'SECTOR 01: CITY' : 'SECTOR 02: RIFT'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="end-actions">
          <button className="btn-primary" onClick={handleRestart}>
            REBOOT SYSTEM & RETRY
          </button>
          <button className="btn-secondary" onClick={handleMainMenu}>
            RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
