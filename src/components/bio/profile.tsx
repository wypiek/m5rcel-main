import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Cat, CodeXml, Globe, Mail, Server } from "lucide-react";
import { siArchlinux, siDiscord, siGithub, siSteam, siX, type SimpleIcon } from "simple-icons";

import { badges, type BadgeIcon } from "@/data";
import { STATUS_META, decorationUrl, type LanyardPresence } from "@/lib/lanyard";
import { cn } from "@/lib/utils";

// --- icons ---

export function BrandIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5 fill-current", className)}>
      <path d={icon.path} />
    </svg>
  );
}

const BADGE_ICONS: Record<BadgeIcon, ReactNode> = {
  code: <CodeXml className="size-4" />,
  axon: <img src="/axon-logo.svg" alt="" className="size-4 rounded-[3px]" />,
  cat: <Cat className="size-4" />,
  arch: <BrandIcon icon={siArchlinux} className="size-3.5" />,
  server: <Server className="size-4" />,
  globe: <Globe className="size-4" />,
};

export const SOCIAL_ICONS: Record<string, ReactNode> = {
  github: <BrandIcon icon={siGithub} />,
  x: <BrandIcon icon={siX} className="size-[18px]" />,
  discord: <BrandIcon icon={siDiscord} />,
  steam: <BrandIcon icon={siSteam} />,
  neocities: <Globe className="size-5" />,
  email: <Mail className="size-5" />,
};

// --- tooltip ---

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 translate-y-1 rounded-md border border-white/10 bg-black/85 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 shadow-lg backdrop-blur transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

// --- avatar ---

/** X pfp wearing the live Discord avatar decoration, with a status dot. */
export function ProfileAvatar({ src, presence, size = 104 }: { src: string; presence: LanyardPresence | null; size?: number }) {
  const decoration = presence?.discord_user.avatar_decoration_data?.asset;
  const status = presence ? STATUS_META[presence.discord_status] : null;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute -inset-3 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <img
        src={src}
        alt="m5rcel's avatar"
        width={size}
        height={size}
        className="relative size-full rounded-full object-cover ring-2 ring-white/10"
      />
      {decoration && (
        // Discord decorations are drawn for a frame 1.2x the avatar size.
        <img
          src={decorationUrl(decoration)}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * 1.2, height: size * 1.2 }}
        />
      )}
      {status && (
        <span className="absolute right-[3%] bottom-[3%]">
          <Tooltip label={status.label}>
            <span
              tabIndex={0}
              className="block size-5 rounded-full border-[3.5px] border-[#141414]"
              style={{ background: status.color }}
            />
          </Tooltip>
        </span>
      )}
    </div>
  );
}

// --- sparkling name ---

type Sparkle = { id: number; x: number; y: number; size: number; delay: number };

/** Glowing display name with little stars twinkling around it. */
export function SparkleName({ children }: { children: string }) {
  const reduce = useReducedMotion();
  const sparkles = useMemo<Sparkle[]>(
    () =>
      Array.from({ length: 9 }, (_, id) => ({
        id,
        x: Math.random() * 110 - 5,
        y: Math.random() * 120 - 10,
        size: Math.random() * 6 + 5,
        delay: Math.random() * 2.4,
      })),
    [],
  );

  return (
    <span className="relative inline-block">
      {!reduce &&
        sparkles.map((s) => (
          <motion.svg
            key={s.id}
            viewBox="0 0 24 24"
            aria-hidden
            className="pointer-events-none absolute fill-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ scale: [0, 1, 0], rotate: [0, 90], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, delay: s.delay, repeat: Infinity, repeatDelay: 1.2 + s.delay }}
          >
            <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" />
          </motion.svg>
        ))}
      <span className="relative text-white [text-shadow:0_0_18px_rgba(255,255,255,0.55),0_0_42px_rgba(255,255,255,0.18)]">
        {children}
      </span>
    </span>
  );
}

// --- typewriter ---

/** Types each line, holds, deletes it, then moves to the next. */
export function Typewriter({ lines, className }: { lines: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(reduce ? lines[0] : "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const full = lines[index % lines.length];
    let delay = deleting ? 28 : 55 + Math.random() * 40;
    if (!deleting && text === full) delay = 2200;
    if (deleting && text === "") delay = 350;

    const id = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setIndex((i) => i + 1);
      } else setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, lines, reduce]);

  return (
    <p className={className} aria-label={lines.join(". ")}>
      <span aria-hidden>{text}</span>
      <span aria-hidden className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse bg-white/80" />
    </p>
  );
}

// --- small hooks ---

/** guns.lol-style tab title that types itself out, then clears and starts over. */
export function useTypingTitle(title: string) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = Array.from(title);
    let i = 0;
    let dir = 1;
    const id = setInterval(() => {
      i += dir;
      if (i >= chars.length + 6) dir = -1; // hold the full title for a few ticks
      if (i <= 0) dir = 1;
      document.title = chars.slice(0, Math.max(1, Math.min(i, chars.length))).join("") + (i < chars.length ? "_" : "");
    }, 260);
    return () => {
      clearInterval(id);
      document.title = title;
    };
  }, [title]);
}

export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => formatTime(timeZone));
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timeZone)), 15_000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

const formatTime = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date());

// --- badges ---

export function BadgeIcons() {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
      {badges.map((b) => (
        <Tooltip key={b.label} label={b.label}>
          <span
            tabIndex={0}
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/80 transition-colors hover:border-white/25 hover:text-white"
          >
            {BADGE_ICONS[b.icon]}
          </span>
        </Tooltip>
      ))}
    </div>
  );
}
