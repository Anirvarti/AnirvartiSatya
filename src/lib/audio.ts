// Cinematic Web Audio API Synth Engine
// Harmonics, filter envelopes, LFO modulators, and an Analyser Node for real-time visualization

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private volume = 0.8; // default volume level (80%)
  private listeners: Set<(isPlaying: boolean) => void> = new Set();

  public subscribe(listener: (isPlaying: boolean) => void) {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l(this.isPlaying);
      } catch (e) {
        console.error('Error notifying audio state listener:', e);
      }
    });
  }

  // Drone Nodes
  private droneOscs: OscillatorNode[] = [];
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Ambient chime scheduler
  private chimeTimerId: number | null = null;

  // G-Minor Pentatonic scale frequencies
  private chimeFrequencies = [
    196.00, // G3
    220.00, // A3 (or Bb3: 233.08)
    233.08, // Bb3
    293.66, // D4
    349.23, // F4
    392.00, // G4
    466.16, // Bb4
    523.25, // C5
    587.33, // D5
    698.46, // F5
    783.99, // G5
  ];

  constructor() {
    // Lazy initialize to conform to browser policies
  }

  public init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }

    this.ctx = new AudioContextClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // Connect nodes
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.setupDrone();
    this.startAmbientChimes();
  }

  private setupDrone() {
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Filter to keep the drone deep and clean
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(140, now);
    this.droneFilter.Q.setValueAtTime(1.5, now);

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.08, now); // soft, rich, low level

    // Connect drone path
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    // Low, detuned oscillators (G1 = 49Hz, D2 = 73.4Hz)
    const baseFreqs = [49.00, 49.30, 73.416, 146.83]; // Detuned roots & fifth
    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(this.droneFilter!);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // LFO to slowly sweep the lowpass filter frequency (creates evolving/organic feel)
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.04, now); // Sweep cycle is 25s

    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.setValueAtTime(45, now); // Sweep filter between (140 - 45) = 95Hz and (140 + 45) = 185Hz

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.droneFilter.frequency);
    this.lfo.start(now);
  }

  // Play a beautiful synthetic chime node in the G-minor pentatonic scale
  public playChime(freqIndex?: number) {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Pick a frequency
    const freq = freqIndex !== undefined 
      ? this.chimeFrequencies[freqIndex % this.chimeFrequencies.length]
      : this.chimeFrequencies[Math.floor(Math.random() * this.chimeFrequencies.length)];

    // 1. Oscillator for fundamental pitch
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // 2. Harmonic multiplier (overtone) for a glockenspiel-like metallic bell chime
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 3.01, now); // slightly detuned 3rd harmonic

    // Separate gains for dynamic chime envelope
    const chimeGain = ctx.createGain();
    const overtoneGain = ctx.createGain();

    // Sound decay envelopes
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.015); // rapid crisp attack
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2); // long tail decay

    overtoneGain.gain.setValueAtTime(0, now);
    overtoneGain.gain.linearRampToValueAtTime(0.06, now + 0.008); // sharp attack
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9); // shorter decay for high harmonics

    // Bandpass filter to isolate chime resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq, now + 1.0);
    filter.Q.setValueAtTime(1.0, now);

    // Simple delay/echo node inside the synth
    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.38, now); // echo after 380ms

    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.25, now); // feed back at 25% volume

    // Connect nodes
    osc.connect(chimeGain);
    overtone.connect(overtoneGain);

    chimeGain.connect(filter);
    overtoneGain.connect(filter);

    filter.connect(this.masterGain);

    // Feed chimes into feedback echo loop
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // loop back
    delayGain.connect(this.masterGain);

    // Start & Stop triggers to free memory
    osc.start(now);
    overtone.start(now);

    osc.stop(now + 4.0);
    overtone.stop(now + 4.0);
  }

  // Play a deep sub-bass sawtooth drone note
  public playBass(freqIndex: number) {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    // Sub-bass G-minor Pentatonic scale tones
    const freqs = [98.00, 110.00, 116.54, 146.83, 174.61, 196.00];
    const freq = freqs[freqIndex % freqs.length];

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + 0.45);
    filter.Q.setValueAtTime(3.5, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.24, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Play synthetic drum pads (analog 808 Kick, Snare, Hihat)
  public playDrum(type: 'kick' | 'snare' | 'hihat') {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.16);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.45, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'snare') {
      const bufferSize = ctx.sampleRate * 0.18; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1100;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      noise.connect(noiseFilter);
      noiseFilter.connect(gainNode);
      gainNode.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.2);
    } else if (type === 'hihat') {
      const bufferSize = ctx.sampleRate * 0.04; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.09, now + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.05);
    }
  }

  // Play high-frequency string plucks styled like a digital harp
  public playHarp(freqIndex: number) {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    // Bright G-minor Pentatonic scale harp resonances
    const freqs = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = freqs[freqIndex % freqs.length];

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.15, now);
    filter.Q.setValueAtTime(1.8, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.007);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // Play custom trigger chime (used for success, tab switching, console enter)
  public playSuccessSound() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Play a gorgeous rising minor pentatonic triad
    this.playChime(3); // D4
    setTimeout(() => this.playChime(5), 120); // G4
    setTimeout(() => this.playChime(8), 240); // D5
    setTimeout(() => this.playChime(10), 360); // G5
  }

  public playErrorSound() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now); // low G
    osc.frequency.linearRampToValueAtTime(70, now + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playInputSound() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Small high frequency click for console keypresses
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600 + Math.random() * 400, now);

    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  public playMCBSwitchSound(isON: boolean) {
    this.init(); // lazy load if first interaction
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Heavy low-frequency spring release thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(isON ? 115 : 85, now);
    thud.frequency.exponentialRampToValueAtTime(30, now + (isON ? 0.12 : 0.16));

    thudGain.gain.setValueAtTime(0.45, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + (isON ? 0.15 : 0.18));

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.2);

    // 2. Mid-frequency metallic copper contact snaps
    const contact = ctx.createOscillator();
    const contactGain = ctx.createGain();
    contact.type = 'sawtooth';
    contact.frequency.setValueAtTime(isON ? 420 : 350, now);
    contact.frequency.linearRampToValueAtTime(90, now + 0.09);

    // Filter to make it clunky and metallic
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, now);
    bandpass.Q.setValueAtTime(2.5, now);

    contactGain.gain.setValueAtTime(0.38, now);
    contactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    contact.connect(bandpass);
    bandpass.connect(contactGain);
    contactGain.connect(this.masterGain);
    contact.start(now);
    contact.stop(now + 0.11);

    // 3. Crisp mechanical plastic snap/click
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(isON ? 2900 : 2200, now);
    
    clickGain.gain.setValueAtTime(0.06, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(now);
    click.stop(now + 0.03);

    // If turning ON, add a secondary contact bounce
    if (isON) {
      const bounce = ctx.createOscillator();
      const bounceGain = ctx.createGain();
      bounce.type = 'sine';
      bounce.frequency.setValueAtTime(175, now + 0.038);
      bounceGain.gain.setValueAtTime(0.18, now + 0.038);
      bounceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      bounce.connect(bounceGain);
      bounceGain.connect(this.masterGain);
      bounce.start(now + 0.038);
      bounce.stop(now + 0.09);
    }
  }

  private startAmbientChimes() {
    const triggerNextChime = () => {
      // Periodic atmospheric notes every 7 to 15 seconds
      const nextInterval = 7000 + Math.random() * 8000;
      this.chimeTimerId = window.setTimeout(() => {
        if (this.isPlaying) {
          this.playChime();
        }
        triggerNextChime();
      }, nextInterval);
    };

    triggerNextChime();
  }

  public toggle(forceState?: boolean): boolean {
    this.init(); // lazy load if first interaction

    if (!this.ctx || !this.masterGain) return false;

    const targetState = forceState !== undefined ? forceState : !this.isPlaying;
    const now = this.ctx.currentTime;

    if (targetState) {
      // Resume if suspended by browser
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Fade in master volume slowly to avoid click
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 1.2);
      this.isPlaying = true;
      this.playChime(5); // sound cue
    } else {
      // Fade out
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.6);
      this.isPlaying = false;
    }

    this.notifyListeners();
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      // If currently playing, apply the volume change smoothly
      if (this.isPlaying) {
        this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.15);
      }
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  public getPlayingStatus(): boolean {
    return this.isPlaying;
  }

  public cleanup() {
    if (this.chimeTimerId) {
      clearTimeout(this.chimeTimerId);
    }
    this.droneOscs.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    if (this.lfo) {
      try { this.lfo.stop(); } catch(e) {}
    }
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

// Global engine instance
export const audio = new AudioEngine();
