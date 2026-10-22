import { useEffect, useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowUpRight, Star } from "lucide-react";

import { AxonCode } from "@/components/axon-code";
import { Badge } from "@/components/spell/badge";
import { BlurReveal } from "@/components/spell/blur-reveal";
import { CopyButton } from "@/components/spell/copy-button";
import FallbackAvatar from "@/components/spell/fallback-avatar";
import { FlowButton } from "@/components/spell/flow-button";
import { Kbd } from "@/components/spell/kbd";
import { Marquee } from "@/components/spell/marquee";
import { ShimmerText } from "@/components/spell/shimmer-text";
import { SpecialText } from "@/components/spell/special-text";
import { TextMarquee } from "@/components/spell/text-marquee";
import { TiltCard } from "@/components/spell/tilt-card";
import { WordsStagger } from "@/components/spell/words-stagger";
import {
  axon,
  builds,
  domains,
  interests,
  langColors,
  meowcord,
  profile,
  projects,
  socials,
} from "@/data";

function Section({ index, label, children }: { index: string; label: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-3 font-mono text-[11px] tracking-wider text-subtle-foreground uppercase">
        <span className="text-accent/70">{index}</span>
        <span>{label}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </h2>
      {children}
    </section>
  );
}

function ExternalLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-0.5 text-foreground underline decoration-white/15 underline-offset-4 transition-colors hover:decoration-accent ${className}`}
    >
      {children}
      <ArrowUpRight className="size-3 text-subtle-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-accent" />
    </a>
  );
}

/** Profile picture with Spell UI's gradient avatar as a fallback if the image fails. */
function Avatar() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative shrink-0">
      <div className="absolute -inset-1 rounded-full bg-accent/20 blur-md" aria-hidden />
      {failed ? (
        <FallbackAvatar name={profile.handle} size={64} animated className="relative" />
      ) : (
        <img
          src={profile.avatar}
          alt={`${profile.handle}'s avatar`}
          width={64}
          height={64}
          onError={() => setFailed(true)}
          className="relative size-16 rounded-full object-cover ring-1 ring-white/15"
        />
      )}
    </div>
  );
}

function useLocalTime(timeZone: string) {
  const format = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

function useSocialHotkeys() {
  const keys = [...socials.map((s) => s.hotkey), "m"].join(",");
  useHotkeys(keys, (event) => {
    const key = event.key.toLowerCase();
    if (key === "m") {
      window.location.href = `mailto:${profile.email}`;
      return;
    }
    const social = socials.find((s) => s.hotkey === key);
    if (social) window.open(social.href, "_blank", "noopener,noreferrer");
  });
}

export default function App() {
  useSocialHotkeys();
  const time = useLocalTime(profile.timezone);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-20 px-4 py-16 sm:py-24">
      {/* intro */}
      <header className="space-y-7">
        <div className="flex items-center gap-4">
          <Avatar />
          <div className="min-w-0 space-y-1">
            <h1 className="font-mono text-2xl font-medium tracking-tight text-foreground">
              <SpecialText speed={30}>{profile.handle}</SpecialText>
            </h1>
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>{profile.name}</span>
              <span className="text-subtle-foreground">·</span>
              <span>{profile.location}</span>
              <span className="text-subtle-foreground">·</span>
              <span className="font-mono text-xs tabular-nums text-subtle-foreground">{time} local</span>
            </p>
          </div>
        </div>

        <BlurReveal as="p" className="text-pretty text-[17px] leading-relaxed text-secondary-foreground" delay={0.3}>
          {profile.bio}
        </BlurReveal>

        <TextMarquee
          prefix={<span className="text-muted-foreground">i build</span>}
          height={120}
          speed={1.6}
          className="-mt-4 -mb-8 text-[15px]"
        >
          {builds.map((b) => (
            <span key={b} className="whitespace-nowrap text-accent">
              {b}
            </span>
          ))}
        </TextMarquee>
      </header>

      {/* now */}
      <Section index="01" label="now">
        <div className="relative space-y-3 border-l border-accent/30 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShimmerText className="text-[15px] font-medium text-foreground" delay={0.5}>
              building meowcord
            </ShimmerText>
            <Badge variant="emerald" className="gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              active
            </Badge>
          </div>
          <WordsStagger inView className="text-[15px] leading-relaxed text-muted-foreground" stagger={0.03} speed={0.4}>
            {meowcord.description}
          </WordsStagger>
          <p className="text-sm text-muted-foreground">
            with <ExternalLink href={meowcord.partner.href}>{meowcord.partner.name}</ExternalLink>
            <span className="mx-2 text-subtle-foreground">·</span>
            <ExternalLink href={meowcord.href}>@meowcorded</ExternalLink>
          </p>
        </div>
      </Section>

      {/* axon */}
      <Section index="02" label="axon">
        <TiltCard
          tiltLimit={3}
          scale={1.01}
          effect="gravitate"
          className="rounded-2xl border bg-card/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.6)] sm:p-6"
        >
          {/* thin teal highlight along the top edge */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-axon/60 to-transparent" />
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <img src={axon.logo} alt="" className="size-10 shrink-0 rounded-lg ring-1 ring-white/10" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono text-[15px] font-semibold tracking-wide text-foreground uppercase">
                    {axon.name}
                  </span>
                  <Badge variant="secondary">{axon.version}</Badge>
                  <Badge variant="outline" className="text-muted-foreground">{axon.license}</Badge>
                </div>
                <p className="font-mono text-[11px] text-subtle-foreground">{axon.platforms}</p>
              </div>
            </div>

            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{axon.tagline}</p>

            <AxonCode code={axon.sample} filename="fib.ax" />

            <ul className="grid gap-x-4 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {axon.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-[0.6em] size-1 shrink-0 rounded-full bg-axon/70" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-2 rounded-lg border bg-background/80 py-1 pr-1 pl-4 font-mono text-[13px]">
              <span className="truncate">
                <span className="text-axon/80">$ </span>
                <span className="text-foreground">{axon.quickstart}</span>
              </span>
              <CopyButton value={axon.quickstart} size="sm" className="text-muted-foreground hover:text-foreground" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {axon.tools.map((t) => (
                  <Badge key={t} variant="outline" className="font-mono font-normal text-muted-foreground">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                {axon.links.map((l) => (
                  <ExternalLink key={l.href} href={l.href}>
                    {l.label}
                  </ExternalLink>
                ))}
              </div>
            </div>
          </div>
        </TiltCard>
      </Section>

      {/* projects */}
      <Section index="03" label="projects">
        <ul className="-mx-3">
          {projects.map((p) => (
            <li key={p.repo}>
              <a
                href={`https://github.com/wypiek/${p.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <span className="shrink-0 font-mono text-sm text-foreground transition-colors group-hover:text-accent">
                  {p.name}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{p.description}</span>
                <span className="hidden shrink-0 items-center gap-1.5 font-mono text-xs text-subtle-foreground sm:flex">
                  <span className="size-2 rounded-full" style={{ background: langColors[p.lang] ?? "#888" }} />
                  {p.lang}
                </span>
                {p.stars ? (
                  <span className="flex w-7 shrink-0 items-center justify-end gap-0.5 font-mono text-xs text-subtle-foreground">
                    <Star className="size-3" />
                    {p.stars}
                  </span>
                ) : (
                  <span className="w-7 shrink-0" />
                )}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          + 120 more experiments, oses, bots and languages on{" "}
          <ExternalLink href="https://github.com/wypiek?tab=repositories">github</ExternalLink>
        </p>
      </Section>

      {/* interests */}
      <Section index="04" label="into">
        <Marquee duration={30} pauseOnHover fadeAmount={15}>
          {interests.map((i) => (
            <span
              key={i}
              className="mr-2 rounded-full border bg-white/[0.02] px-3 py-1 text-sm text-muted-foreground"
            >
              {i}
            </span>
          ))}
        </Marquee>
      </Section>

      {/* domains */}
      <Section index="05" label="domains">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[13px] sm:grid-cols-3">
          {domains.map((d) => (
            <li key={d} className="truncate">
              <a
                href={`https://${d}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                {d}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* elsewhere */}
      <Section index="06" label="elsewhere">
        <ul className="-mx-3">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.03]"
              >
                <span className="w-20 shrink-0 text-muted-foreground">{s.label}</span>
                <span className="min-w-0 flex-1 truncate text-foreground transition-colors group-hover:text-accent">
                  {s.handle}
                </span>
                <ArrowUpRight className="size-3.5 text-subtle-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                <Kbd keys={[s.hotkey]} listenToKeyboard className="hidden sm:inline-flex" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <FlowButton asChild>
            <a href={`mailto:${profile.email}`}>say hi</a>
          </FlowButton>
          <span className="flex items-center gap-1 font-mono text-[13px] text-muted-foreground">
            {profile.email}
            <CopyButton value={profile.email} size="sm" className="text-muted-foreground hover:text-foreground" />
          </span>
          <Kbd keys={["m"]} listenToKeyboard className="hidden sm:inline-flex" />
        </div>
      </Section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-6 font-mono text-xs text-subtle-foreground">
        <span>made with &lt;3 in typescript & spell ui</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          press <Kbd keys={["g"]} /> <Kbd keys={["x"]} /> <Kbd keys={["d"]} /> to jump
        </span>
      </footer>
    </main>
  );
}
