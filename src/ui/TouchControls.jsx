// NEON RIFT - Virtual Touch Controls for Mobile / Touchscreen Support
import { soundManager } from '../utils/audioSynthesizer';

export function TouchControls({ controlsRef }) {
  const setKey = (key, val) => {
    soundManager.resume();
    if (controlsRef.current) {
      if (key === 'boost' && val && !controlsRef.current.boost) {
        soundManager.playNitro();
      }
      controlsRef.current[key] = val;
    }
  };

  return (
    <div className="touch-controls-container">
      {/* Left side: Steer Left / Right */}
      <div className="touch-group touch-left-group">
        <button
          className="touch-btn steer-btn"
          onTouchStart={(e) => { e.preventDefault(); setKey('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); setKey('left', false); }}
          onMouseDown={() => setKey('left', true)}
          onMouseUp={() => setKey('left', false)}
          onMouseLeave={() => setKey('left', false)}
        >
          ◀
        </button>
        <button
          className="touch-btn steer-btn"
          onTouchStart={(e) => { e.preventDefault(); setKey('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); setKey('right', false); }}
          onMouseDown={() => setKey('right', true)}
          onMouseUp={() => setKey('right', false)}
          onMouseLeave={() => setKey('right', false)}
        >
          ▶
        </button>
      </div>

      {/* Right side: Brake, Drift, Nitro, Gas */}
      <div className="touch-group touch-right-group">
        <button
          className="touch-btn drift-btn"
          onTouchStart={(e) => { e.preventDefault(); setKey('drift', true); }}
          onTouchEnd={(e) => { e.preventDefault(); setKey('drift', false); }}
          onMouseDown={() => setKey('drift', true)}
          onMouseUp={() => setKey('drift', false)}
          onMouseLeave={() => setKey('drift', false)}
        >
          DRIFT
        </button>

        <button
          className="touch-btn nitro-btn"
          onTouchStart={(e) => { e.preventDefault(); setKey('boost', true); }}
          onTouchEnd={(e) => { e.preventDefault(); setKey('boost', false); }}
          onMouseDown={() => setKey('boost', true)}
          onMouseUp={() => setKey('boost', false)}
          onMouseLeave={() => setKey('boost', false)}
        >
          NITRO
        </button>

        <button
          className="touch-btn brake-btn"
          onTouchStart={(e) => { e.preventDefault(); setKey('backward', true); }}
          onTouchEnd={(e) => { e.preventDefault(); setKey('backward', false); }}
          onMouseDown={() => setKey('backward', true)}
          onMouseUp={() => setKey('backward', false)}
          onMouseLeave={() => setKey('backward', false)}
        >
          BRAKE
        </button>

        <button
          className="touch-btn gas-btn"
          onTouchStart={(e) => { e.preventDefault(); setKey('forward', true); }}
          onTouchEnd={(e) => { e.preventDefault(); setKey('forward', false); }}
          onMouseDown={() => setKey('forward', true)}
          onMouseUp={() => setKey('forward', false)}
          onMouseLeave={() => setKey('forward', false)}
        >
          GAS
        </button>
      </div>
    </div>
  );
}
