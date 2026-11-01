// NEON RIFT - Web Audio API Sound Synthesizer Engine
// Provides high-tech futuristic sound design with zero external asset dependencies

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.engineRunning = false;
    this.bgmRunning = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((_err) => {
        // audio resume failure handled gracefully
      });
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Engine hum with dual oscillator and low-pass filter
  startEngine() {
    if (this.engineRunning || !this.ctx) {
      this.resume();
      if (!this.ctx) return;
    }

    try {
      this.stopEngine();

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.3);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(27.5, this.ctx.currentTime);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.engineRunning = true;
    } catch (e) {
      console.warn('Could not start engine sound:', e);
    }
  }

  updateEnginePitch(speedRatio, isBoosting) {
    if (!this.engineRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 50 + speedRatio * 90 + (isBoosting ? 60 : 0);
      const filterFreq = 180 + speedRatio * 600 + (isBoosting ? 800 : 0);
      
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.08);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.08);
      this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);

      const targetGain = isBoosting ? 0.28 : 0.16;
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    } catch (_e) {
      // ignore update errors
    }
  }

  stopEngine() {
    if (!this.engineRunning) return;
    try {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          try {
            if (this.engineOsc1) this.engineOsc1.stop();
            if (this.engineOsc2) this.engineOsc2.stop();
          } catch (_err) {
            // osc stop handled
          }
          this.engineRunning = false;
        }, 220);
      }
    } catch (_err) {
      this.engineRunning = false;
    }
  }

  // Nitro boost roar
  playNitro() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // White noise roar with sweeping bandpass filter
      const bufferSize = this.ctx.sampleRate * 1.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.5, now);
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(700, now + 1.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      // Sub bass punch
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      whiteNoise.start(now);
      subOsc.start(now);
      subOsc.stop(now + 0.55);
      whiteNoise.stop(now + 1.25);
    } catch (e) {
      console.warn('Error playing nitro sound:', e);
    }
  }

  // Collision crash sound
  playCollision() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Low punch osc
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      // Noise impact crunch
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      osc.connect(gain);
      gain.connect(this.masterGain);

      noise.connect(filter);
      filter.connect(this.masterGain);

      osc.start(now);
      noise.start(now);
      osc.stop(now + 0.35);
      noise.stop(now + 0.3);
    } catch (_e) {
      // collision audio error handled
    }
  }

  // Drift skid sound
  playDriftSkid() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220 + Math.random() * 40, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(4.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (_e) {
      // skid audio error handled
    }
  }

  // Portal dimensional warp sound
  playPortalWarp() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Dimensional shimmer sweep
      const freqs = [220, 330, 440, 660, 880];
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        osc.frequency.exponentialRampToValueAtTime(freq * 3.5, now + 1.8);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.08);
        osc.stop(now + 2.6);
      });

      // Sub-space explosion
      const sub = this.ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(80, now);
      sub.frequency.exponentialRampToValueAtTime(25, now + 2.0);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 2.1);
    } catch (_e) {
      // portal warp audio error handled
    }
  }

  // UI button click
  playClick() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_e) {
      // click audio error handled
    }
  }

  // Shield pickup / chime
  playPickup() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [587.33, 880, 1174.66].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.26);
      });
    } catch (_e) {
      // pickup audio error handled
    }
  }

  // Game over sound
  playGameOver() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [329.63, 293.66, 261.63, 196.00];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.22);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.4);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 0.45);
      });
    } catch (_e) {
      // game over audio error handled
    }
  }

  // Victory fanfare
  playVictory() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.12);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.95);
      });
    } catch (_e) {
      // victory audio error handled
    }
  }

  // Cyberpunk Synthwave Procedural BGM
  startBGM() {
    if (this.bgmRunning || !this.ctx) {
      this.resume();
      if (!this.ctx) return;
    }
    this.bgmRunning = true;
    this.bgmStep = 0;

    const bassNotes = [55, 55, 65.41, 55, 49, 49, 73.42, 55]; // A1, C2, B1, D2
    const arpNotes = [440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88];

    const playStep = () => {
      if (!this.bgmRunning || !this.ctx) return;
      if (!this.isMuted) {
        try {
          const now = this.ctx.currentTime;
          const bassNote = bassNotes[this.bgmStep % bassNotes.length];
          const arpNote = arpNotes[this.bgmStep % arpNotes.length];

          // Bass synth
          const bassOsc = this.ctx.createOscillator();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassNote, now);

          const bassFilter = this.ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(260, now);

          const bassGain = this.ctx.createGain();
          bassGain.gain.setValueAtTime(0.12, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.masterGain);

          bassOsc.start(now);
          bassOsc.stop(now + 0.2);

          // Arp pulse
          if (this.bgmStep % 2 === 0) {
            const arpOsc = this.ctx.createOscillator();
            arpOsc.type = 'triangle';
            arpOsc.frequency.setValueAtTime(arpNote, now);

            const arpGain = this.ctx.createGain();
            arpGain.gain.setValueAtTime(0.05, now);
            arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            arpOsc.connect(arpGain);
            arpGain.connect(this.masterGain);
            arpOsc.start(now);
            arpOsc.stop(now + 0.14);
          }
        } catch (_err) {
          // BGM audio error handled
        }
      }

      this.bgmStep = (this.bgmStep + 1) % 64;
      this.bgmTimer = setTimeout(playStep, 130); // ~115 BPM 16th groove
    };

    playStep();
  }

  stopBGM() {
    this.bgmRunning = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundManager = new SoundEngine();
