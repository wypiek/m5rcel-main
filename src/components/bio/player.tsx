import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { Radio, TRACKS, trackLength } from "@/lib/ambient";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Music player for "m5rcel radio": generative lo-fi tracks rendered live in the browser. */
export function Player() {
  const radio = useRef<Radio | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const track = TRACKS[index];
  const length = trackLength(track);

  useEffect(() => () => radio.current?.dispose(), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setElapsed(radio.current?.elapsed ?? 0), 250);
    return () => clearInterval(id);
  }, [playing]);

  const toggle = async () => {
    radio.current ??= new Radio();
    if (playing) {
      radio.current.pause();
      setPlaying(false);
    } else {
      await radio.current.play();
      setPlaying(true);
    }
  };

  const skip = (direction: 1 | -1) => {
    radio.current ??= new Radio();
    radio.current.skip(direction);
    setIndex(radio.current.index);
    setElapsed(0);
  };

  return (
    <div className="flex items-center gap-3 rounded-[22px] sm:gap-4 border border-white/10 bg-black/35 p-3.5 pr-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
      <div
        className="relative flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-xl pb-2 sm:size-16"
        style={{ background: `radial-gradient(circle at 30% 25%, ${track.cover[0]}, ${track.cover[1]} 75%)` }}
        aria-hidden
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.25),transparent_45%)]" />
        <span className="relative flex h-4 items-end gap-[3px]">
          {[0, 0.15, 0.3, 0.45].map((delay) => (
            <motion.span
              key={delay}
              className="w-[3px] rounded-full bg-white/90"
              initial={{ height: "35%" }}
              animate={playing ? { height: ["30%", "100%", "50%", "85%", "30%"] } : { height: "35%" }}
              transition={playing ? { duration: 1.1, delay, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            />
          ))}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">
          {track.title} <span className="font-normal text-white/50">- m5rcel radio</span>
        </p>
        <div className="mt-2 flex items-center gap-3 font-mono text-[12px] text-white/60 tabular-nums">
          <span className="w-8">{clock(elapsed)}</span>
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white transition-[width] duration-200 ease-linear" style={{ width: `${(elapsed / length) * 100}%` }} />
          </div>
          <span className="w-8 text-right">{clock(length)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-white">
        <button type="button" onClick={() => skip(-1)} aria-label="Previous track" className="cursor-pointer p-1.5 text-white/60 transition-colors hover:text-white">
          <SkipBack className="size-4" fill="currentColor" />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="cursor-pointer p-1.5 [filter:drop-shadow(0_0_6px_rgba(255,255,255,0.5))] transition-transform active:scale-90"
        >
          {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="size-6" fill="currentColor" />}
        </button>
        <button type="button" onClick={() => skip(1)} aria-label="Next track" className="cursor-pointer p-1.5 text-white/60 transition-colors hover:text-white">
          <SkipForward className="size-4" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
