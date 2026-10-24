import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
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

/** The axon logo as a single-color mark, so it can glow white like the other badges. */
function AxonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cn("size-4", className)} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M92 430 L226 82 C235 58 277 58 286 82 L420 430 H350 L321 350 H191 L162 430 Z" strokeWidth="40" />
      <path d="M256 214 C214 194 177 175 136 145 M256 214 C298 194 335 175 376 145" strokeWidth="26" />
    </svg>
  );
}

const BADGE_ICONS: Record<BadgeIcon, ReactNode> = {
  code: <CodeXml className="size-[15px]" strokeWidth={2.4} />,
  axon: <AxonMark className="size-[15px]" />,
  cat: <Cat className="size-[15px]" strokeWidth={2.4} />,
  arch: <BrandIcon icon={siArchlinux} className="size-[13px]" />,
  server: <Server className="size-[15px]" strokeWidth={2.4} />,
  globe: <Globe className="size-[15px]" strokeWidth={2.4} />,
};

export const SOCIAL_ICONS: Record<string, ReactNode> = {
  discord: <BrandIcon icon={siDiscord} className="size-8" />,
  github: <BrandIcon icon={siGithub} className="size-[30px]" />,
  x: <BrandIcon icon={siX} className="size-[26px]" />,
  steam: <BrandIcon icon={siSteam} className="size-[30px]" />,
  neocities: <Globe className="size-8" strokeWidth={2.2} />,
  email: <Mail className="size-8" strokeWidth={2.2} />,
};

// --- tooltip ---

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 translate-y-1 rounded-lg border border-white/10 bg-black/85 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg backdrop-blur transition-all duration-150 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100 group-hover/tip:translate-y-0 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

// --- avatar ---

/** X pfp wearing the live Discord avatar decoration, with a status dot. */
export function ProfileAvatar({ src, presence, size = 120 }: { src: string; presence: LanyardPresence | null; size?: number }) {
  const decoration = presence?.discord_user.avatar_decoration_data?.asset;
  const status = presence ? STATUS_META[presence.discord_status] : null;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img src={src} alt="m5rcel's avatar" width={size} height={size} className="size-full rounded-full object-cover" />
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
        <span className="absolute right-[4%] bottom-[4%]">
          <Tooltip label={status.label}>
            <span tabIndex={0} className="block size-6 rounded-full border-4 border-[#120d18]" style={{ background: status.color }} />
          </Tooltip>
        </span>
      )}
    </div>
  );
}

// --- badges ---

/** Row of small glowing icons in a pill next to the name. */
export function BadgePill() {
  return (
    <div className="flex items-center gap-[7px] rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1.5">
      {badges.map((b) => (
        <Tooltip key={b.label} label={b.label}>
          <span tabIndex={0} className="flex text-white [filter:drop-shadow(0_0_5px_rgba(255,255,255,0.65))]">
            {BADGE_ICONS[b.icon]}
          </span>
        </Tooltip>
      ))}
    </div>
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
      <span aria-hidden className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse bg-white/90" />
    </p>
  );
}

// --- small hooks ---

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
