// NEON RIFT - Cinematic Cyberpunk Main Menu
import { useState } from 'react';
import { gameState } from '../gameplay/gameState';
import { soundManager } from '../utils/audioSynthesizer';
import { CONTROLS_INFO } from '../utils/constants';

export function MainMenu() {
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  const handleStart = () => {
    soundManager.resume();
    gameState.startRace();
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="menu-overlay">
      <div className="menu-backdrop-glow" />

      {/* Top Header Bar */}
      <header className="menu-topbar">
        <div className="sys-status">
          <span className="status-dot" />
          <span className="sys-text">GRID LINK: ACTIVE // VI3W PROTOCOL</span>
        </div>
        <button
          className="audio-btn"
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇 AUDIO OFF' : '🔊 AUDIO ON'}
        </button>
      </header>

      {/* Main Hero Branding */}
      <div className="menu-center">
        <div className="brand-container">
          <div className="cyber-glitch-badge">CYBERNETIC SPEED HORIZON</div>
          <h1 className="game-title">
            <span className="title-neon">NEON</span>{' '}
            <span className="title-rift">RIFT</span>
          </h1>
          <p className="game-tagline">THE ROAD DOESN'T END. IT BREAKS.</p>
        </div>

        {/* Action Buttons */}
        <div className="menu-actions">
          <button className="btn-primary" onClick={handleStart}>
            <span className="btn-glitch-effect" />
            <span className="btn-label">ENGAGE OVERDRIVE</span>
            <span className="btn-subtext">ENTER SECTOR 01</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              soundManager.playClick();
              setShowControls(true);
            }}
          >
            CONTROLS & DIRECTIVES
          </button>
        </div>

        {/* Mission Briefing Snippets */}
        <div className="sector-briefings">
          <div className="briefing-card">
            <div className="card-tag">PHASE 1</div>
            <div className="card-title">NEON HIGHWAY</div>
            <div className="card-desc">Navigate high-speed city traffic & avoid laser barricades.</div>
          </div>
          <div className="briefing-card highlight-portal">
            <div className="card-tag">PHASE 2</div>
            <div className="card-title">DIMENSIONAL RIFT</div>
            <div className="card-desc">Breach the spatial rift portal into floating fractured roads.</div>
          </div>
          <div className="briefing-card">
            <div className="card-tag">PHASE 3</div>
            <div className="card-title">OVERDRIVE ESCAPE</div>
            <div className="card-desc">Survive the void collapse and reach the exodus horizon.</div>
          </div>
        </div>
      </div>

      {/* Footer Controls Tip */}
      <footer className="menu-footer">
        <span>PRESS <strong>W / UP</strong> TO ACCELERATE • <strong>SPACE</strong> FOR NITRO • <strong>SHIFT</strong> TO DRIFT</span>
      </footer>

      {/* Controls & Directives Modal */}
      {showControls && (
        <div className="modal-backdrop" onClick={() => setShowControls(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>FLIGHT & DRIVE TELEMETRY</h2>
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
              <div className="directives-box">
                <h3>TACTICAL COMBAT TIPS:</h3>
                <ul>
                  <li>Collect <strong style={{ color: '#00f3ff' }}>Cyan Nitro Orbs</strong> to recharge your boost reserves.</li>
                  <li>Collect <strong style={{ color: '#00ff88' }}>Green Shield Cores</strong> to repair barrier damage.</li>
                  <li>Drifting charges drift momentum and tightens cornering.</li>
                  <li>Surpass Rival #02 before reaching the dimensional breach!</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-close"
                onClick={() => setShowControls(false)}
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
