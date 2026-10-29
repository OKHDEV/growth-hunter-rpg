// Web Audio API Procedural Sound Engine with 3D Boxing & Combat Sounds & iOS Silent Mode Bypass
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.unmuteHandle = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.bgmPlaying = false;
    this.bgmType = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.iosUnlocked = false;

    if (typeof window !== 'undefined') {
      this.ensureContext();
      this.setupIOSSilentBypass();
    }
  }

  // Ensure AudioContext is created and attached to unmute.js
  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {
          console.warn("AudioContext instantiation error:", e);
        }
      }
    }

    if (this.ctx && !this.unmuteHandle && typeof window !== 'undefined' && typeof window.unmute === 'function') {
      try {
        this.unmuteHandle = window.unmute(this.ctx);
      } catch (e) {
        console.warn("unmute(context) attach error:", e);
      }
    }

    if (typeof window !== 'undefined' && typeof window.applyAudioSessionPlayback === 'function') {
      window.applyAudioSessionPlayback();
    }

    return this.ctx;
  }

  // iOS Safari hardware silent/mute switch bypass (forces media playback channel instead of ambient/ringer)
  setupIOSSilentBypass() {
    const onUserInteraction = () => {
      this.unlockIOSSilentMode();
    };

    ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, onUserInteraction, { passive: true, capture: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        if (typeof window !== 'undefined' && typeof window.applyAudioSessionPlayback === 'function') {
          window.applyAudioSessionPlayback();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }
    });
  }

  unlockIOSSilentMode() {
    this.ensureContext();

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      try {
        // Warm up Web Audio buffer node
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(this.ctx.destination);
        src.start(0);
        this.iosUnlocked = true;
      } catch (e) {}
    }
  }

  init() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.unlockIOSSilentMode();
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- 3D Boxing SFX ---

  // Snappy Fast Jab Whoosh
  playJab() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Heavy Power Straight / Hook Punch Impact Thud
  playPunchImpact(isHeavy = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Sub bass punch boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 180 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

    gain.gain.setValueAtTime(this.volume * (isHeavy ? 0.8 : 0.55), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Leather glove snap noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.value = 2.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Deep Earth-Shaking Boss Heavy Smash
  playHeavySmash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.playPunchImpact(true);
    
    // Add sub-bass impact boom
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // High-Impact Counter Punch Crack!
  playCounterCrack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Sharp high crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

    gain.gain.setValueAtTime(this.volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);

    this.playPunchImpact(true);
  }

  // Glove Guard Block Thud
  playGuardBlock() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Boxing Slip / Duck Whoosh
  playDodgeWhoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.14);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Boxing Ring Bell: "DING! DING! DING!"
  playBoxingBell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    [0, 0.2, 0.4].forEach((delay) => {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1900, now);
      osc.frequency.exponentialRampToValueAtTime(1880, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  playBossRoar() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.7);

    osc2.frequency.setValueAtTime(115, now);
    osc2.frequency.exponentialRampToValueAtTime(38, now + 0.7);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.7);
    filter.Q.value = 5.0;

    gain.gain.setValueAtTime(this.volume * 0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  // Grand Mythic Entrance Sound for True Ultimate Final Boss (Omega Chronos)
  playCosmicGodIntro() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Deep Sub-Bass Rumble
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(55, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 1.8);
    subGain.gain.setValueAtTime(this.volume * 0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 1.8);

    // 2. Divine Ominous Brass Fanfare (Chords of Eternity)
    const freqs = [110, 164.81, 220, 277.18, 329.63, 440];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 2.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.8);
      filter.frequency.exponentialRampToValueAtTime(600, now + 2.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + 0.1);
      osc.stop(now + 2.2);
    });

    // 3. Thunder Crash Impact
    setTimeout(() => {
      this.playHeavySmash();
    }, 450);
  }

  playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      [261.63, 329.63, 392.00],
      [329.63, 392.00, 493.88],
      [392.00, 523.25, 659.25],
      [523.25, 659.25, 783.99, 1046.50]
    ];

    const now = this.ctx.currentTime;
    chords.forEach((chord, cIdx) => {
      const startTime = now + cIdx * 0.15;
      const duration = cIdx === chords.length - 1 ? 0.7 : 0.18;

      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(this.volume * 0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    });
  }

  playQuestComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(this.volume * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.2 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.15 },
      { f: 1046.50, d: 0.6 }
    ];

    let t = this.ctx.currentTime;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(this.volume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d * 0.9;
    });
  }

  playDefeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 415.30, 392, 349.23];
    let t = this.ctx.currentTime;

    notes.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(this.volume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
      t += 0.28;
    });
  }

  // --- Procedural Synth BGM ---

  startBGM(type = 'ambient') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.bgmPlaying && this.bgmType === type) return;
    this.stopBGM();

    this.bgmPlaying = true;
    this.bgmType = type;
    this.bgmStep = 0;

    // Special: Dark Cinematic Boss Symphony
    if (type === 'boss') {
      this.startCinematicBossLoop();
      return;
    }

    const tempo = type === 'battle' ? 144 : 96;
    const stepInterval = (60 / tempo / 2) * 1000;

    const battleBass = [55, 55, 65.41, 55, 73.42, 55, 65.41, 58.27];
    const ambientBass = [65.41, 65.41, 77.78, 65.41, 87.31, 87.31, 98.00, 77.78];

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

      const now = this.ctx.currentTime;
      const bassSeq = type === 'battle' ? battleBass : ambientBass;
      const freq = bassSeq[this.bgmStep % bassSeq.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type === 'battle' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'battle' ? 480 : 250, now);

      gain.gain.setValueAtTime(this.volume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      if (type === 'battle' && this.bgmStep % 2 === 1) {
        this.playHiHat(now);
      }

      this.bgmStep++;
    }, stepInterval);
  }

  // --- Grand Cinematic Dark Fantasy Boss Symphony (Zero Arcade Bleeps) ---
  startCinematicBossLoop() {
    // 82 BPM Epic March (16th note = 183ms)
    const stepInterval = 183;

    // Driving Gothic Cello Ostinato in D Minor (relentless tension)
    const celloPattern = [
      73.42, 73.42, 87.31, 73.42,  82.41, 73.42, 65.41, 55.00, // Bar 1 (Dm)
      73.42, 73.42, 98.00, 73.42,  87.31, 73.42, 58.27, 55.00, // Bar 2 (Dm-Gm)
      58.27, 58.27, 73.42, 58.27,  65.41, 58.27, 49.00, 43.65, // Bar 3 (Bb-F)
      55.00, 55.00, 65.41, 55.00,  73.42, 82.41, 87.31, 110.00 // Bar 4 (A7-Dm)
    ];

    // Trigger an immediate apocalyptic low brass blast upon entering
    const initialNow = this.ctx.currentTime;
    this.playCinematicHornBraam(initialNow, 36.71); // Deep seismic D1

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const step16 = this.bgmStep % 16;
      const step32 = this.bgmStep % 32;

      // 1. Apocalyptic Cinematic Low Brass ("BRAAAM") on bar downbeats (step 0, 16)
      if (step16 === 0) {
        const root = (step32 === 0) ? 36.71 : (step32 === 16 ? 43.65 : 49.00); // D1, F1, G1
        this.playCinematicHornBraam(now, root);
      }

      // 2. Heavy Orchestral War Drum (Taiko Impact) on main beats (step 0, 8)
      if (step16 === 0 || step16 === 8) {
        this.playCinematicWarDrum(now, step16 === 0);
      }

      // 3. Driving Gothic Cello Ostinato on every 16th note
      const celloFreq = celloPattern[this.bgmStep % celloPattern.length];
      this.playDrivingCelloOstinato(now, celloFreq);

      // 4. Dark Gothic Cathedral Choir Swell every half bar (step 0, 8)
      if (step16 === 0 || step16 === 8) {
        const chordIndex = Math.floor((this.bgmStep % 32) / 8);
        const chords = [
          [110.00, 130.81, 164.81], // D minor
          [98.00, 116.54, 146.83],  // G minor
          [116.54, 146.83, 174.61], // Bb major
          [110.00, 138.59, 164.81]  // A major
        ];
        this.playGothicChoirSwell(now, chords[chordIndex]);
      }

      this.bgmStep++;
    }, stepInterval);
  }

  // Apocalyptic Low Brass Horn Blast (Hans Zimmer / Inception "BRAAAM")
  playCinematicHornBraam(now, rootFreq) {
    if (!this.ctx) return;

    // 4 Detuned Sawtooth Horn Oscillators + Sub Bass
    const freqs = [
      rootFreq,             // Sub fundamental
      rootFreq * 2 * 0.996, // Detuned low brass 1
      rootFreq * 2 * 1.004, // Detuned low brass 2
      rootFreq * 3 * 0.998  // Fifth overtone
    ];

    const masterGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.Q.value = 3.5; // Resonant brass bite
    filter.frequency.setValueAtTime(620, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 2.5);

    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(this.volume * 0.50, now + 0.06); // Punchy brass attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.7);

    filter.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = (idx === 0) ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + 2.7);
    });
  }

  // Deep Orchestral War Drum / Taiko Tremor
  playCinematicWarDrum(now, isHeavy) {
    if (!this.ctx) return;

    // Component 1: Deep Sub-Bass Pitch Drop (Boom)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 75 : 60, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + 0.55);

    gain.gain.setValueAtTime(this.volume * (isHeavy ? 0.75 : 0.50), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);

    // Component 2: Heavy Leather Drum Skin Acoustic Thud
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(140, now);
    noiseFilter.Q.value = 1.8;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.40, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Driving Gothic Cello Ostinato (Warm low strings with relentless combat drive)
  playDrivingCelloOstinato(now, freq) {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 0.998, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now); // Warm woody cello tone

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  // Dark Gothic Cathedral Choir Swell
  playGothicChoirSwell(now, chordFreqs) {
    if (!this.ctx) return;

    chordFreqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      // Choral swell envelope (smooth attack and long breath decay)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.08, now + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.35);
    });
  }

  playHiHat(now) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, now);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);

    gain.gain.setValueAtTime(this.volume * 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.bgmType = null;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global Sound Instance
const sound = new SoundEngine();
