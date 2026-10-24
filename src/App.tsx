import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight, Cat, Clock, MapPin, Volume2, VolumeX } from "lucide-react";

import { DiscordCard } from "@/components/bio/discord-card";
import { EnterScreen } from "@/components/bio/enter-screen";
import {
  BadgeIcons,
  ProfileAvatar,
  SOCIAL_ICONS,
  SparkleName,
  Tooltip,
  Typewriter,
  useLocalTime,
  useTypingTitle,
} from "@/components/bio/profile";
import { CursorTrail, Starfield } from "@/components/bio/starfield";
import { axon, meowcord, profile, socials, taglines } from "@/data";
import { SITE_HOST } from "@/site";
import { Ambient } from "@/lib/ambient";
import { useLanyard } from "@/lib/lanyard";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const ambient = useRef<Ambient | null>(null);
  const presence = useLanyard(profile.discordId);
  const time = useLocalTime(profile.timezone);
  useTypingTitle(`@${profile.handle}`);

  const enter = useCallback(() => {
    setEntered(true);
    ambient.current ??= new Ambient();
    ambient.current.start();
  }, []);

  useEffect(() => () => ambient.current?.stop(), []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    ambient.current?.setMuted(next);
  };

  const links = [
    ...socials.map((s) => ({ label: s.label, href: s.href })),
    { label: "email", href: `mailto:${profile.email}` },
  ];

  return (
    <>
      <Starfield />
      <CursorTrail />
      {/* grain + vignette over the starfield */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-30 opacity-[0.07] mix-blend-overlay" />

      <AnimatePresence>{!entered && <EnterScreen onEnter={enter} />}</AnimatePresence>

      <main className="flex min-h-dvh flex-col items-center justify-center px-4 pt-14 pb-24 sm:pb-14">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(8px)" }}
          animate={entered ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <TiltCard>
            <div className="flex flex-col items-center text-center">
              <ProfileAvatar src={profile.avatar} presence={presence} />

              <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-tight">
                <SparkleName>{profile.name}</SparkleName>
              </h1>
              <p className="mt-1 font-mono text-[13px] text-white/45">@{profile.handle}</p>

              <Typewriter lines={taglines} className="mt-3 min-h-[1.5em] text-[15px] text-white/75" />

              <BadgeIcons />

              <div className="mt-4 flex items-center gap-4 text-xs text-white/45">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {profile.location}
                </span>
                <span className="flex items-center gap-1.5 font-mono tabular-nums">
                  <Clock className="size-3.5" /> {time} local
                </span>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-2.5">
                {links.map((l) => (
                  <Tooltip key={l.label} label={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={l.label}
                      className="flex size-10 items-center justify-center rounded-full border sm:size-11 border-white/10 bg-white/[0.04] text-white/75 transition-all duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.45)]"
                    >
                      {SOCIAL_ICONS[l.label]}
                    </a>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="mt-7 space-y-2.5">
              <DiscordCard presence={presence} href={socials.find((s) => s.label === "discord")!.href} />
              <div className="grid grid-cols-2 gap-2.5">
                <LinkCard
                  href={axon.links[0].href}
                  icon={<img src={axon.logo} alt="" className="size-9 rounded-lg" />}
                  title="axon"
                  subtitle="my programming language"
                />
                <LinkCard
                  href={meowcord.href}
                  icon={
                    <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.07]">
                      <Cat className="size-5 text-white/80" />
                    </span>
                  }
                  title="meowcord"
                  subtitle="self-hosted discord clone"
                />
              </div>
            </div>
          </TiltCard>

          <p className="mt-5 text-center font-mono text-[11px] text-white/30">
            {SITE_HOST} ·{" "}
            <a href="https://github.com/wypiek?tab=repositories" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              130+ repos
            </a>
          </p>
        </motion.div>
      </main>

      {entered && (
        <motion.button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Unmute music" : "Mute music"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-4 left-4 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs sm:pr-4 text-white/60 backdrop-blur-xl transition-colors hover:text-white"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          <span className="hidden font-mono sm:inline">{muted ? "music off" : "lo-fi, generated live"}</span>
          {!muted && <Equalizer />}
        </motion.button>
      )}
    </>
  );
}

/** Glass card that tilts toward the cursor, with a soft glare following it. */
function TiltCard({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 120, damping: 18 });
  const ry = useSpring(0, { stiffness: 120, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(0);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.09), transparent 60%)`;

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      ry.set(x * 10);
      rx.set(-y * 8);
      gx.set(50 + x * 100);
      gy.set(50 + y * 100);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rx, ry, gx, gy]);

  return (
    <div style={{ perspective: 1100 }}>
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-8"
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}

function LinkCard({ href, icon, title, subtitle }: { href: string; icon: ReactNode; title: string; subtitle: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.05]"
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-medium text-white">
          {title}
          <ArrowUpRight className="size-3 text-white/30 transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-white" />
        </span>
        <span className="block truncate text-[11px] text-white/45">{subtitle}</span>
      </span>
    </a>
  );
}

function Equalizer() {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          className="w-[2px] rounded-full bg-current"
          animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
          transition={{ duration: 1.1, delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}
