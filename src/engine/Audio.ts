export class AudioManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  constructor() {}

  public init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isEnabled = true;
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.isEnabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playShoot() {
    this.playTone(400 + Math.random()*200, 'square', 0.1, 0.05);
  }

  public playHit() {
    this.playTone(150 + Math.random()*50, 'sawtooth', 0.1, 0.05);
  }

  public playExplosion() {
    if (!this.isEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playBuild() {
    this.playTone(600, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.1), 100);
  }

  public playError() {
    this.playTone(150, 'sawtooth', 0.2, 0.1);
  }
}