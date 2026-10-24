// "m5rcel radio": generative lo-fi made with the Web Audio API. Each track is a looping chord
// progression with random pentatonic plucks and vinyl crackle, through a generated reverb.
// No audio files, so nothing to license or download. Audio starts only when the visitor
// presses play, which is also what browsers require.

const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);

export type Track = {
  title: string;
  /** Two colors for the generated cover art. */
  cover: [string, string];
  chords: number[][];
  plucks: number[];
  /** Seconds per chord. */
  bar: number;
  /** Chance of a pluck on each of 8 steps per bar. */
  density: number;
};

export const TRACKS: Track[] = [
  {
    title: "late night commits",
    cover: ["#7c3aed", "#f59e0b"],
    chords: [[53, 57, 60, 64, 67], [52, 55, 59, 62], [50, 53, 57, 60, 64], [48, 52, 55, 59]],
    plucks: [72, 74, 76, 79, 81, 84],
    bar: 5,
    density: 0.32,
  },
  {
    title: "warsaw rain",
    cover: ["#0ea5e9", "#1e1b4b"],
    chords: [[45, 52, 55, 60, 64], [41, 48, 52, 57], [43, 50, 55, 59, 62], [40, 47, 52, 55, 59]],
    plucks: [69, 72, 74, 76, 79, 81],
    bar: 6,
    density: 0.22,
  },
  {
    title: "self-hosted sunsets",
    cover: ["#f97316", "#db2777"],
    chords: [[50, 57, 60, 65], [55, 59, 62, 65, 69], [48, 55, 59, 64], [57, 60, 64, 67]],
    plucks: [74, 77, 79, 81, 84, 86],
    bar: 4.5,
    density: 0.4,
  },
  {
    title: "old web dreams",
    cover: ["#22c55e", "#0f172a"],
    chords: [[51, 55, 58, 62], [56, 60, 63, 67], [53, 56, 60, 63], [58, 62, 65, 68]],
    plucks: [70, 72, 75, 77, 79, 82],
    bar: 5.5,
    density: 0.28,
  },
];

export const trackLength = (track: Track) => track.chords.length * track.bar;

export class Radio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private dry: GainNode | null = null;
  private wet: GainNode | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private voices = new Set<OscillatorNode>();
  private step = 0;
  private trackStart = 0;
  private pausedAt = 0;
  index = 0;
  playing = false;

  get track() {
    return TRACKS[this.index];
  }

  /** Seconds into the current loop of the track. */
  get elapsed() {
    if (!this.ctx) return 0;
    const now = this.playing ? this.ctx.currentTime : this.pausedAt;
    return Math.max(0, now - this.trackStart) % trackLength(this.track);
  }

  async play() {
    if (!this.ctx) this.setup();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();
    if (!this.playing) {
      this.playing = true;
      if (this.trackStart === 0) this.restart();
      else {
        // Resuming: shift the start so elapsed time continues where it paused.
        this.trackStart += ctx.currentTime - this.pausedAt;
        this.schedule();
      }
      this.fade(0.42, 1.2);
    }
  }

  pause() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    this.pausedAt = this.ctx.currentTime;
    clearTimeout(this.timer);
    this.fade(0, 0.35);
    setTimeout(() => !this.playing && void this.ctx?.suspend(), 400);
  }

  skip(direction: 1 | -1) {
    this.index = (this.index + direction + TRACKS.length) % TRACKS.length;
    if (!this.ctx) return;
    this.stopVoices();
    if (this.playing) this.restart();
    else {
      this.step = 0;
      this.trackStart = this.pausedAt = this.ctx.currentTime;
    }
  }

  dispose() {
    clearTimeout(this.timer);
    void this.ctx?.close();
    this.ctx = null;
  }

  private restart() {
    const ctx = this.ctx!;
    clearTimeout(this.timer);
    this.step = 0;
    this.trackStart = ctx.currentTime + 0.05;
    this.schedule();
  }

  /** Plays the bar due now, then waits for the next one. */
  private schedule() {
    const ctx = this.ctx!;
    const track = this.track;
    const barIndex = Math.floor(Math.max(0, ctx.currentTime - this.trackStart) / track.bar);
    this.step = Math.max(this.step, barIndex);
    const at = Math.max(ctx.currentTime + 0.05, this.trackStart + this.step * track.bar);
    this.chord(track.chords[this.step % track.chords.length], at, track.bar);
    for (let beat = 1; beat < 8; beat++) {
      if (Math.random() < track.density) {
        this.pluck(track.plucks[Math.floor(Math.random() * track.plucks.length)], at + beat * (track.bar / 8));
      }
    }
    this.step++;
    const next = this.trackStart + this.step * track.bar;
    this.timer = setTimeout(() => this.playing && this.schedule(), Math.max(50, (next - ctx.currentTime - 0.15) * 1000));
  }

  private setup() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  }

  private fade(target: number, seconds: number) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(target, now + seconds);
  }

  private stopVoices() {
    const now = this.ctx?.currentTime ?? 0;
    for (const osc of this.voices) {
      try {
        osc.stop(now + 0.05);
      } catch {
        // already stopped
      }
    }
    this.voices.clear();
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
    this.voices.add(osc);
    osc.onended = () => this.voices.delete(osc);
  }

  private chord(notes: number[], at: number, bar: number) {
    for (const note of notes) {
      const f = midi(note);
      this.voice(f, at, bar + 1.5, 0.035, 1.4, "sine", -4);
      this.voice(f, at, bar + 1.5, 0.018, 1.6, "triangle", 5);
    }
    this.voice(midi(notes[0] - 12), at, bar + 1, 0.05, 0.8, "sine"); // soft bass
  }

  private pluck(note: number, at: number) {
    this.voice(midi(note), at, 1.2, 0.03, 0.01, "sine");
    this.voice(midi(note) * 2, at, 0.6, 0.008, 0.01, "triangle");
  }

  private crackle() {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
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
