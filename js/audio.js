// Web Audio API Procedural Sound Engine with 3D Boxing & Combat Sounds
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.bgmPlaying = false;
    this.bgmType = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
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

    let tempo = 96;
    if (type === 'battle') tempo = 144;
    if (type === 'boss') tempo = 104; // Heavy, ominous epic march tempo

    const stepInterval = (60 / tempo / 2) * 1000;

    const battleBass = [55, 55, 65.41, 55, 73.42, 55, 65.41, 58.27];
    const ambientBass = [65.41, 65.41, 77.78, 65.41, 87.31, 87.31, 98.00, 77.78];
    // Epic Grand Final Boss Chord Progression: C minor -> Ab major -> Bb major -> G minor
    const bossBass = [
      65.41, 65.41, 130.81, 65.41,   // C2, C2, C3, C2
      51.91, 51.91, 103.83, 51.91,   // Ab1, Ab1, Ab2, Ab1
      58.27, 58.27, 116.54, 58.27,   // Bb1, Bb1, Bb2, Bb1
      49.00, 49.00, 98.00,  73.42    // G1, G1, G2, D2
    ];
    // Menacing brass / choir lead line for True Final Boss
    const bossMelody = [
      261.63, 0, 311.13, 0, 392.00, 0, 349.23, 311.13, // C4, Eb4, G4, F4, Eb4
      207.65, 0, 261.63, 0, 311.13, 0, 261.63, 0,      // Ab3, C4, Eb4, C4
      233.08, 0, 293.66, 0, 349.23, 0, 293.66, 0,      // Bb3, D4, F4, D4
      196.00, 0, 246.94, 0, 293.66, 0, 392.00, 0       // G3, B3, D4, G4
    ];

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

      const now = this.ctx.currentTime;
      let bassSeq = ambientBass;
      if (type === 'battle') bassSeq = battleBass;
      if (type === 'boss') bassSeq = bossBass;

      const freq = bassSeq[this.bgmStep % bassSeq.length];

      // Bass drone / synth note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = (type === 'boss' || type === 'battle') ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'boss' ? 380 : (type === 'battle' ? 480 : 250), now);

      gain.gain.setValueAtTime(this.volume * (type === 'boss' ? 0.16 : 0.12), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'boss' ? 0.28 : 0.2));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (type === 'boss' ? 0.28 : 0.2));

      // Boss-specific War Drums & Grand Symphony Choir
      if (type === 'boss') {
        const stepIdx = this.bgmStep % 16;
        // Deep War Drum / Timpani impact on main downbeats
        if (stepIdx === 0 || stepIdx === 4 || stepIdx === 8 || stepIdx === 12) {
          this.playBossWarDrum(now);
        }
        // Grand brass / choral harmonic lead
        const melFreq = bossMelody[stepIdx];
        if (melFreq > 0) {
          this.playBossLeadNote(melFreq, now);
        }
        // Ticking battle pulse
        if (this.bgmStep % 2 === 1) {
          this.playHiHat(now);
        }
      } else if (type === 'battle' && this.bgmStep % 2 === 1) {
        this.playHiHat(now);
      }

      this.bgmStep++;
    }, stepInterval);
  }

  // Deep Ominous Boss War Drum
  playBossWarDrum(now) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(105, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.38);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Grand Ominous Boss Melodic Synth Lead
  playBossLeadNote(freq, now) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, now);
    filter.Q.value = 1.2;

    gain.gain.setValueAtTime(this.volume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
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
