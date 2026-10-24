// A tiny generative lo-fi soundtrack made with the Web Audio API: soft jazzy chords,
// occasional pentatonic plucks and faint vinyl crackle, all through a generated reverb.
// No audio files, so nothing to license or download. Browsers only allow audio after a
// click, so this starts from the "click to enter" screen.

const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);

// Fmaj9 → Em7 → Dm9 → Cmaj7, voiced low and close.
const CHORDS = [
  [53, 57, 60, 64, 67],
  [52, 55, 59, 62],
  [50, 53, 57, 60, 64],
  [48, 52, 55, 59],
];
// C major pentatonic, an octave up, for the plucks.
const PLUCKS = [72, 74, 76, 79, 81, 84];
const CHORD_SECONDS = 5;

export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private dry: GainNode | null = null;
  private wet: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private step = 0;
  private volume = 0.5;
  muted = false;

  start() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(compressor);

    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1400;
    tone.connect(this.master);

    this.dry = ctx.createGain();
    this.dry.gain.value = 0.55;
    this.dry.connect(tone);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(3.2);
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.6;
    this.wet.connect(reverb);
    reverb.connect(tone);

    this.crackle();
    this.applyVolume(3);

    const tick = () => {
      const at = ctx.currentTime + 0.08;
      this.chord(CHORDS[this.step % CHORDS.length], at);
      // A few plucks spread over the bar, never all of them.
      for (let beat = 1; beat < 8; beat++) {
        if (Math.random() < 0.32) this.pluck(PLUCKS[Math.floor(Math.random() * PLUCKS.length)], at + beat * (CHORD_SECONDS / 8));
      }
      this.step++;
    };
    tick();
    this.timer = setInterval(tick, CHORD_SECONDS * 1000);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx?.state === "suspended" && !muted) void this.ctx.resume();
    this.applyVolume(0.4);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyVolume(0.15);
  }

  stop() {
    clearInterval(this.timer);
    void this.ctx?.close();
    this.ctx = null;
  }

  private applyVolume(fadeSeconds: number) {
    if (!this.ctx || !this.master) return;
    const target = this.muted ? 0 : this.volume * 0.5;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(target, now + fadeSeconds);
  }

  private voice(freq: number, at: number, length: number, peak: number, attack: number, type: OscillatorType, detune = 0) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(peak, at + attack);
    env.gain.setTargetAtTime(0, at + length - attack, length / 4);
    osc.connect(env);
    env.connect(this.dry!);
    env.connect(this.wet!);
    osc.start(at);
    osc.stop(at + length + 2);
  }

  private chord(notes: number[], at: number) {
    for (const note of notes) {
      const f = midi(note);
      this.voice(f, at, CHORD_SECONDS + 1.5, 0.035, 1.4, "sine", -4);
      this.voice(f, at, CHORD_SECONDS + 1.5, 0.018, 1.6, "triangle", 5);
    }
    this.voice(midi(notes[0] - 12), at, CHORD_SECONDS + 1, 0.05, 0.8, "sine"); // soft bass
  }

  private pluck(note: number, at: number) {
    this.voice(midi(note), at, 1.2, 0.03, 0.01, "sine");
    this.voice(midi(note) * 2, at, 0.6, 0.008, 0.01, "triangle");
  }

  private crackle() {
    const ctx = this.ctx!;
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Mostly silence with rare clicks, plus a whisper of hiss.
      data[i] = (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.8 : 0) + (Math.random() * 2 - 1) * 0.004;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.value = 0.35;
    source.connect(band).connect(gain).connect(this.dry!);
    source.start();
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const length = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
    }
    return buffer;
  }
}
