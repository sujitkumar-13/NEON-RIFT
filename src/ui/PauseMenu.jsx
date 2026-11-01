// NEON RIFT - Pause Menu
import { useState } from 'react';
import { gameState } from '../gameplay/gameState';
import { soundManager } from '../utils/audioSynthesizer';
import { CONTROLS_INFO } from '../utils/constants';

export function PauseMenu() {
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  const handleResume = () => {
    soundManager.playClick();
    gameState.resume();
  };

  const handleRestart = () => {
    soundManager.playClick();
    gameState.startRace();
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    gameState.returnToMenu();
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="pause-overlay">
      <div className="pause-dialog">
        <div className="pause-header">
          <div className="pause-sub">FLIGHT TELEMETRY SUSPENDED</div>
          <h2 className="pause-title">SYSTEM PAUSED</h2>
        </div>

        <div className="pause-actions">
          <button className="btn-primary" onClick={handleResume}>
            RESUME RACE [ESC]
          </button>
          <button className="btn-secondary" onClick={handleRestart}>
            RESTART RACE
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              soundManager.playClick();
              setShowControls(true);
            }}
          >
            CONTROLS GUIDE
          </button>
          <button className="btn-secondary" onClick={handleToggleMute}>
            {isMuted ? '🔇 UNMUTE AUDIO' : '🔊 MUTE AUDIO'}
          </button>
          <button className="btn-secondary danger" onClick={handleMainMenu}>
            ABORT TO MAIN MENU
          </button>
        </div>
      </div>

      {showControls && (
        <div className="modal-backdrop" onClick={() => setShowControls(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>CONTROLS MANUAL</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowControls(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="controls-grid">
                {CONTROLS_INFO.map((item, idx) => (
                  <div key={idx} className="control-row">
                    <span className="control-key">{item.key}</span>
                    <span className="control-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-close"
                onClick={() => setShowControls(false)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
