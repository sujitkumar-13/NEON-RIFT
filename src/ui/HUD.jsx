// NEON RIFT - High-Tech Cyberpunk In-Game HUD (Non-Overlapping Layout)
import { useEffect, useState } from 'react';
import { gameState } from '../gameplay/gameState';
import { soundManager } from '../utils/audioSynthesizer';
import { TOTAL_RACE_DISTANCE } from '../utils/constants';

export function HUD() {
  const [telemetry, setTelemetry] = useState(gameState.getState());
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  useEffect(() => {
    // High-frequency subscription for smooth 60fps telemetry
    const unsubscribe = gameState.subscribeHUD((state) => {
      setTelemetry({ ...state });
    });
    return unsubscribe;
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const progressPct = Math.min(100, Math.round((telemetry.distance / TOTAL_RACE_DISTANCE) * 100));
  const isCriticalShield = telemetry.shield < 30;

  return (
    <div className="hud-root">
      {/* Red screen shake impact flash on collision */}
      <div
        className={`hud-impact-vignette ${telemetry.impactFlash ? 'active' : ''}`}
      />

      {/* Warp Flash Overlay */}
      {telemetry.warpFlashIntensity > 0 && (
        <div
          className="hud-warp-flash"
          style={{ opacity: telemetry.warpFlashIntensity }}
        />
      )}

      {/* Top Banner & Telemetry bar */}
      <div className="hud-topbar">
        <div className="hud-sector-tag">
          <span className="pulsing-sector-beacon" />
          <span className="sector-text">
            {telemetry.sector === 'NEON_CITY' && 'SECTOR 01 // NEON HIGHWAY'}
            {telemetry.sector === 'PORTAL_WARP' && 'BREACHING DIMENSIONAL HORIZON'}
            {telemetry.sector === 'RIFT_WORLD' && 'SECTOR 02 // THE RIFT VOID'}
            {telemetry.sector === 'FINAL_ESCAPE' && 'OVERDRIVE EXODUS // ESCAPE'}
          </span>
        </div>

        {/* Global Progress Track Bar */}
        <div className="hud-progress-container">
          <div className="hud-progress-labels">
            <span>START</span>
            <span>RIFT PORTAL</span>
            <span>EXODUS</span>
          </div>
          <div className="hud-progress-track">
            <div
              className="hud-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
            {/* Portal marker at ~45% */}
            <div className="portal-checkpoint-marker" style={{ left: '45%' }} />
          </div>
        </div>

        {/* Top Actions: Audio & Pause */}
        <div className="hud-top-actions">
          <button
            className="hud-icon-btn"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            className="hud-icon-btn pause-btn"
            onClick={() => gameState.pause()}
            title="Pause [ESC]"
          >
            ⏸ ESC
          </button>
        </div>
      </div>

      {/* Sector Announcement Flash Notification */}
      {telemetry.sectorAnnounce && (
        <div className="hud-announcement">
          <div className="announcement-frame">
            <span className="announcement-glow" />
            <span className="announcement-text">{telemetry.sectorAnnounce}</span>
          </div>
        </div>
      )}

      {/* Rival Relative Tracker */}
      <div className="hud-rival-tracker">
        <span className="rival-label">RIVAL #02:</span>
        <span
          className={`rival-dist ${telemetry.rivalDistanceOffset > 0 ? 'ahead' : 'behind'}`}
        >
          {telemetry.rivalDistanceOffset > 0
            ? `+${Math.round(telemetry.rivalDistanceOffset)}M AHEAD`
            : `${Math.round(Math.abs(telemetry.rivalDistanceOffset))}M BEHIND`}
        </span>
      </div>

      {/* Split Bottom Dashboard: Left and Right corners only, leaving the center 100% open for the car! */}
      <div className="hud-bottom-split">
        {/* BOTTOM LEFT: Hull Shield Integrity & Race Metrics */}
        <div className="hud-corner-group hud-corner-left">
          <div className="hud-panel shield-panel">
            <div className="panel-header">
              <span className="panel-title">HULL INTEGRITY</span>
              <span className={`panel-val ${isCriticalShield ? 'critical' : ''}`}>
                {Math.round(telemetry.shield)}%
              </span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-fill shield-fill ${isCriticalShield ? 'critical' : ''}`}
                style={{ width: `${telemetry.shield}%` }}
              />
            </div>
            {isCriticalShield && (
              <div className="shield-warning-text">⚠️ CRITICAL DAMAGE DETECTED</div>
            )}
          </div>

          <div className="hud-panel mini-metrics-panel">
            <div className="metric-row">
              <span className="metric-lbl">DISTANCE:</span>
              <span className="metric-val">{Math.round(telemetry.distance)} M</span>
            </div>
            <div className="metric-row">
              <span className="metric-lbl">SCORE:</span>
              <span className="metric-val highlight-score">{telemetry.score}</span>
            </div>
          </div>
        </div>

        {/* CENTER IS EMPTY: Complete unobstructed view of hero car, wheels, thrusters and road! */}
        <div className="hud-center-clearance" />

        {/* BOTTOM RIGHT: Speedometer & Nitro Overdrive */}
        <div className="hud-corner-group hud-corner-right">
          <div className="hud-panel speed-panel-corner">
            <div className="speed-number-container">
              <span className={`speed-digits ${telemetry.isBoosting ? 'boosting' : ''}`}>
                {telemetry.kmh}
              </span>
              <span className="speed-unit">KM/H</span>
            </div>
          </div>

          <div className="hud-panel nitro-panel">
            <div className="panel-header">
              <span className="panel-title">NITRO OVERDRIVE</span>
              <span className={`panel-val ${telemetry.isBoosting ? 'boosting' : ''}`}>
                {telemetry.isBoosting ? 'BOOSTING' : `${Math.round(telemetry.nitro)}%`}
              </span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-fill nitro-fill ${telemetry.isBoosting ? 'boosting' : ''}`}
                style={{ width: `${telemetry.nitro}%` }}
              />
            </div>
            <div className="nitro-hint">
              {telemetry.nitro > 10 ? '[SPACE] TO BOOST' : 'CHARGING CORES...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
