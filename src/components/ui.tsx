// Small site helpers. Everything animated comes from Clover UI (src/components/clover).

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

export function Section({ index, label, children }: { index: string; label: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-3 font-mono text-[11px] tracking-wider text-subtle-foreground uppercase">
        <span className="text-foreground/70">{index}</span>
        <span>{label}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </h2>
      {children}
    </section>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-0.5 text-foreground underline decoration-white/15 underline-offset-4 transition-colors hover:decoration-white",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-3 text-subtle-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-white" />
    </a>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[10px] text-muted-foreground uppercase shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : `Copy ${value}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
      }}
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

/** Profile picture; falls back to the handle's initials if the image can't load. */
export function Avatar({ src, name, size = 64 }: { src: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute -inset-1 rounded-full bg-white/10 blur-md" aria-hidden />
      {failed ? (
        <div className="relative flex size-full items-center justify-center rounded-full bg-muted font-mono text-lg text-foreground ring-1 ring-white/15">
          {name.slice(0, 2)}
        </div>
      ) : (
        <img
          src={src}
          alt={`${name}'s avatar`}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="relative size-full rounded-full object-cover ring-1 ring-white/15"
        />
      )}
    </div>
  );
}

export function useLocalTime(timeZone: string) {
  const format = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

/** Single-key shortcuts (no modifiers) that open links. Ignored while typing in a field. */
export function useHotkeys(map: Record<string, () => void>) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      map[event.key.toLowerCase()]?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map]);
}
