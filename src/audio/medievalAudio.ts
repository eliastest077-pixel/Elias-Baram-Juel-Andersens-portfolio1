// Medieval Ambient Chill Music & Parchment Page Turn Audio Engine (Web Audio API)

class MedievalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  
  private isMusicPlaying: boolean = false;
  private isMuted: boolean = false;
  private musicIntervalId: number | null = null;
  private currentStep: number = 0;
  private volume: number = 0.45;

  private listeners: Set<(state: { isPlaying: boolean; isMuted: boolean; volume: number }) => void> = new Set();

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

      // SFX channel (page turns)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Simple algorithmic medieval hall reverb
      this.reverbNode = this.createCastleReverb(this.ctx);

      this.musicGain.connect(this.masterGain);
      if (this.reverbNode) {
        this.musicGain.connect(this.reverbNode);
        this.sfxGain.connect(this.reverbNode);
        this.reverbNode.connect(this.masterGain);
      }
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Create an acoustic stone abbey / library reverb impulse
  private createCastleReverb(ctx: AudioContext): ConvolverNode {
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * 2.2; // 2.2 seconds reverb tail
    const decay = 2.5;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.pow(1 - n, decay);
      left[i] = ((Math.random() * 2) - 1) * factor;
      right[i] = ((Math.random() * 2) - 1) * factor;
    }

    convolver.buffer = impulse;
    return convolver;
  }

  // -------------------------------------------------------------
  // 1. REALISTIC PARCHMENT PAGE TURN SOUND GENERATOR
  // -------------------------------------------------------------
  public playPageTurn(variant: "open" | "flip" | "close" | "flutter" | "stamp" = "flip") {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const duration = variant === "open" ? 0.65 : variant === "close" ? 0.5 : variant === "flutter" ? 0.35 : variant === "stamp" ? 0.28 : 0.42;

      // Layer A: Crisp friction noise (paper fibers sliding)
      const bufferSize = this.ctx.sampleRate * duration;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Colored pinkish noise with subtle crackles
        output[i] = (Math.random() * 2 - 1) * (0.65 + Math.random() * 0.35);
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter to simulate parchment frequency response (1200Hz - 3200Hz)
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(variant === "close" ? 1400 : variant === "stamp" ? 1800 : 2400, now);
      bandpass.frequency.exponentialRampToValueAtTime(variant === "open" ? 1800 : variant === "stamp" ? 700 : 900, now + duration);
      bandpass.Q.setValueAtTime(variant === "stamp" ? 2.5 : 1.8, now);

      // Highpass for the crisp edge whip
      const highpass = this.ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.setValueAtTime(variant === "stamp" ? 400 : 600, now);

      // Dynamic friction envelope with multi-page flutter flutter
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);

      if (variant === "open") {
        // Rich book opening: initial lift, main page sweep, settling flutter
        noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
        noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.22);
        noiseGain.gain.linearRampToValueAtTime(0.42, now + 0.38);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else if (variant === "close") {
        // Heavier closing flap and thump
        noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.12);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else if (variant === "flutter") {
        // Rapid soft fluttering
        noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.04);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.14);
        noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.24);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else if (variant === "stamp") {
        // Tactile warm wax stamp press
        noiseGain.gain.linearRampToValueAtTime(0.26, now + 0.03);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else {
        // Standard satisfying crisp single page turn
        noiseGain.gain.linearRampToValueAtTime(0.38, now + 0.06);
        noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.18);
        noiseGain.gain.linearRampToValueAtTime(0.32, now + 0.26);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      }

      whiteNoise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      // Layer B: Low-frequency air displacement (body of the paper moving)
      const airOsc = this.ctx.createOscillator();
      const airGain = this.ctx.createGain();
      airOsc.type = "sine";
      airOsc.frequency.setValueAtTime(variant === "close" ? 180 : variant === "stamp" ? 130 : 240, now);
      airOsc.frequency.exponentialRampToValueAtTime(variant === "stamp" ? 45 : 80, now + duration * 0.8);

      airGain.gain.setValueAtTime(0.001, now);
      airGain.gain.linearRampToValueAtTime(variant === "close" ? 0.25 : variant === "stamp" ? 0.28 : 0.14, now + (variant === "stamp" ? 0.02 : 0.05));
      airGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

      airOsc.connect(airGain);
      airGain.connect(this.sfxGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
      airOsc.start(now);
      airOsc.stop(now + duration);
    } catch (_) {}
  }

  // -------------------------------------------------------------
  // 2. MEDIEVAL CHILL LUTE & HARP SYNTHESIZER (Karplus-Strong / Modal)
  // -------------------------------------------------------------
  private playLuteNote(freq: number, velocity: number = 0.5, length: number = 1.8) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // Plucked string oscillator mix: rich harmonic triangle + subtle saw
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, now);

    // Warm wooden harmonic detune
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(freq * 1.002, now);

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(freq * 0.5, now);

    // Dynamic lowpass filter modeling lute wooden soundboard resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    const initialCutoff = Math.min(freq * 6.5, 4800);
    filter.frequency.setValueAtTime(initialCutoff, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.4, 280), now + length * 0.8);
    filter.Q.setValueAtTime(2.2, now);

    // Pluck amplitude envelope: immediate attack, sharp initial drop, warm ringing sustain
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.45, now + 0.008); // Pluck bite
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.18, now + 0.12);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + length);

    // Connect oscillators
    osc1.connect(filter);
    
    // Attenuate saw harmonic
    const sawGain = this.ctx.createGain();
    sawGain.gain.setValueAtTime(0.22, now);
    osc2.connect(sawGain);
    sawGain.connect(filter);

    // Gentle sub body
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.12, now);
    subOsc.connect(subGain);
    subGain.connect(filter);

    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);

    osc1.stop(now + length);
    osc2.stop(now + length);
    subOsc.stop(now + length);
  }

  // Soft medieval wooden recorder / flute melody note
  private playFluteNote(freq: number, velocity: number = 0.25, duration: number = 2.0) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // Vibrato LFO
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(4.8, now); // 4.8 Hz gentle vibrato
    vibratoGain.gain.setValueAtTime(freq * 0.012, now);
    vibrato.connect(osc.frequency);

    // Lowpass for warm antique wood
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 3.5, now);

    // Breath / whisper noise
    const breathGain = this.ctx.createGain();
    breathGain.gain.setValueAtTime(0.0001, now);
    breathGain.gain.linearRampToValueAtTime(velocity * 0.08, now + 0.15);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Flute note gain envelope (soft breath attack)
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.35, now + 0.22);
    noteGain.gain.setValueAtTime(velocity * 0.3, now + duration * 0.7);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    vibrato.start(now + 0.2);
    vibrato.stop(now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  // -------------------------------------------------------------
  // 3. MEDIEVAL PROGRESSIONS & ARPEGGIO CHILL SEQUENCER
  // -------------------------------------------------------------
  // D Dorian / Medieval Aeolian frequencies
  // D2=73.4, A2=110, C3=130.8, D3=146.8, E3=164.8, F3=174.6, G3=196, A3=220, B3=246.9, C4=261.6, D4=293.7, E4=329.6, F4=349.2, G4=392, A4=440
  private stepMusic() {
    if (!this.isMusicPlaying) return;

    // 16-bar cyclical Medieval chill theme (modal folk arpeggios: Dm -> C -> Bb -> Am -> Dm -> G -> Dm)
    // 6/8 slow medieval ballad tempo (~65 BPM, step interval ~280ms)
    const pattern = [
      // Measure 1: Dm (D Dorian base)
      { bass: 73.4, chord: [146.8, 220, 293.7], flute: 440 },
      { chord: [220, 349.2] },
      { chord: [293.7, 440] },
      { bass: 110, chord: [220, 349.2] },
      { chord: [146.8, 293.7] },
      { chord: [220, 329.6], flute: 523.25 },

      // Measure 2: C Major / Dorian VII
      { bass: 65.4, chord: [130.8, 196, 261.6], flute: 587.33 },
      { chord: [196, 329.6] },
      { chord: [261.6, 392] },
      { bass: 98, chord: [196, 329.6] },
      { chord: [130.8, 261.6] },
      { chord: [196, 293.7], flute: 523.25 },

      // Measure 3: Bb or G minor (soft modal color)
      { bass: 58.3, chord: [116.5, 174.6, 233.1], flute: 440 },
      { chord: [174.6, 293.7] },
      { chord: [233.1, 349.2] },
      { bass: 87.3, chord: [174.6, 293.7] },
      { chord: [116.5, 233.1] },
      { chord: [174.6, 261.6], flute: 392 },

      // Measure 4: A minor / V cadence
      { bass: 55, chord: [110, 164.8, 220], flute: 349.2 },
      { chord: [164.8, 261.6] },
      { chord: [220, 329.6] },
      { bass: 82.4, chord: [164.8, 261.6] },
      { chord: [110, 220] },
      { chord: [164.8, 246.9], flute: 329.6 },

      // Measure 5: Dm variation with higher harp sparkle
      { bass: 73.4, chord: [146.8, 220, 349.2, 587.3], flute: 293.7 },
      { chord: [220, 349.2] },
      { chord: [293.7, 440, 698.5] },
      { bass: 110, chord: [220, 349.2] },
      { chord: [146.8, 293.7] },
      { chord: [220, 440], flute: 349.2 },

      // Measure 6: F Major / III
      { bass: 87.3, chord: [174.6, 261.6, 349.2], flute: 392 },
      { chord: [261.6, 392] },
      { chord: [349.2, 440, 523.25] },
      { bass: 130.8, chord: [261.6, 349.2] },
      { chord: [174.6, 261.6] },
      { chord: [261.6, 329.6], flute: 440 },

      // Measure 7: G minor / G Dorian
      { bass: 49.0, chord: [98, 146.8, 196, 293.7], flute: 493.88 },
      { chord: [146.8, 293.7] },
      { chord: [196, 349.2] },
      { bass: 73.4, chord: [146.8, 293.7] },
      { chord: [98, 196] },
      { chord: [146.8, 220], flute: 440 },

      // Measure 8: A Sus4 -> A major resolve
      { bass: 55, chord: [110, 164.8, 220, 293.7], flute: 392 },
      { chord: [164.8, 293.7] },
      { chord: [220, 329.6] },
      { bass: 110, chord: [164.8, 277.2] }, // C# major tierce de picardie
      { chord: [110, 220] },
      { chord: [164.8, 277.2], flute: 293.7 }
    ];

    const currentEvent = pattern[this.currentStep % pattern.length];

    // Pluck bass note (rich, deep resonant lute bass)
    if (currentEvent.bass) {
      this.playLuteNote(currentEvent.bass, 0.62, 2.4);
    }

    // Pluck lute/harp chord notes with natural arpeggiated human strum delays
    if (currentEvent.chord) {
      currentEvent.chord.forEach((freq, idx) => {
        const strumDelay = idx * 0.024 + (Math.random() * 0.008);
        setTimeout(() => {
          if (this.isMusicPlaying) {
            this.playLuteNote(freq, 0.35 + (Math.random() * 0.1), 1.9);
          }
        }, strumDelay * 1000);
      });
    }

    // Occasional soft wooden flute lead
    if (currentEvent.flute && (this.currentStep % 2 === 0 || Math.random() > 0.4)) {
      this.playFluteNote(currentEvent.flute, 0.28, 1.8);
    }

    this.currentStep++;
  }

  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.notify();

    // Fade in music gain gently
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.55, this.ctx.currentTime + 1.5);
    }

    // Play first step immediately
    this.stepMusic();

    // Step every 380ms (~80 BPM 6/8 lilt)
    this.musicIntervalId = window.setInterval(() => {
      this.stepMusic();
    }, 380);
  }

  public stopMusic() {
    if (!this.isMusicPlaying) return;
    this.isMusicPlaying = false;
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }

    if (this.ctx && this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    }

    this.notify();
  }

  public toggleMusic() {
    if (this.isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime + 0.05);
    }
    this.notify();
  }

  public getState() {
    return {
      isPlaying: this.isMusicPlaying,
      isMuted: this.isMuted,
      volume: this.volume
    };
  }

  public subscribe(cb: (state: { isPlaying: boolean; isMuted: boolean; volume: number }) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }
}

export const medievalAudio = new MedievalAudioEngine();
