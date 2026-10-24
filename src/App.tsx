import { Star } from "lucide-react";

import { AxonCode } from "@/components/axon-code";
import { BlockText } from "@/components/clover/block-text";
import { DropText } from "@/components/clover/drop-text";
import { GaugeText } from "@/components/clover/gauge-text";
import { GlitchyText } from "@/components/clover/glitchy-text";
import { LiquidButton } from "@/components/clover/liquid-button";
import { RichText } from "@/components/clover/rich-text";
import { SoftButton } from "@/components/clover/soft-button";
import { ThinkingState } from "@/components/clover/thinking-state";
import { Avatar, CopyButton, ExternalLink, Kbd, Section, useHotkeys, useLocalTime } from "@/components/ui";
import {
  axon,
  builds,
  domains,
  interests,
  langColors,
  meowcord,
  profile,
  projects,
  repoCount,
  socials,
} from "@/data";

const openInNewTab = (href: string) => () => window.open(href, "_blank", "noopener,noreferrer");

// Defined once so the keydown listener isn't re-attached on every render.
const HOTKEYS: Record<string, () => void> = {
  ...Object.fromEntries(socials.map((s) => [s.hotkey, openInNewTab(s.href)])),
  m: () => {
    window.location.href = `mailto:${profile.email}`;
  },
};

// Monochrome faces for the rolling "i build" block, to match the white accent.
const BLOCK_COLORS = ["#fafafa", "#d4d4d4", "#e5e5e5"];

export default function App() {
  useHotkeys(HOTKEYS);
  const time = useLocalTime(profile.timezone);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-20 px-4 py-16 sm:py-24">
      {/* intro */}
      <header className="space-y-7">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatar} name={profile.handle} />
          <div className="min-w-0 space-y-1">
            <h1 className="font-mono text-2xl font-medium tracking-tight text-foreground">
              <GlitchyText interval={4200} intensity={0.8} scramble>
                {profile.handle}
              </GlitchyText>
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

        <p className="text-pretty text-[17px] leading-relaxed text-secondary-foreground">
          <DropText stagger={0.035} dropDistance={18} delay={0.2}>
            {profile.bio}
          </DropText>
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-4 text-[15px] text-muted-foreground">
          <span>i build</span>
          <BlockText
            words={builds}
            colors={BLOCK_COLORS}
            textColor="#0a0a0a"
            interval={1.6}
            duration={0.9}
            className="text-[15px] font-semibold tracking-normal [--block-h:2em] [&_.backface-hidden]:rounded-md"
          />
        </div>

        <GaugeText
          value={repoCount}
          suffix="+"
          label="repos on github"
          color="#fafafa"
          inView
          className="text-sm text-muted-foreground"
          numberClassName="font-mono text-foreground"
          iconClassName="text-subtle-foreground"
          labelClassName="text-muted-foreground"
          landedClassName="text-muted-foreground"
        />
      </header>

      {/* now */}
      <Section index="01" label="now">
        <div className="space-y-3 border-l border-white/15 pl-4">
          <ThinkingState state="building" color="#fafafa" shimmer className="text-[15px]">
            building meowcord
          </ThinkingState>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{meowcord.description}</p>
          <p className="text-sm text-muted-foreground">
            with <ExternalLink href={meowcord.partner.href}>{meowcord.partner.name}</ExternalLink>
            <span className="mx-2 text-subtle-foreground">·</span>
            <ExternalLink href={meowcord.href}>@meowcorded</ExternalLink>
          </p>
        </div>
      </Section>

      {/* axon */}
      <Section index="02" label="axon">
        <div className="relative overflow-hidden rounded-2xl border bg-card/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.6)] sm:p-6">
          {/* thin teal highlight along the top edge */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-axon/60 to-transparent" />
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <img src={axon.logo} alt="" className="size-10 shrink-0 rounded-lg ring-1 ring-white/10" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <RichText color="teal" className="mr-1 font-mono text-[15px] font-bold tracking-wide uppercase">
                    {axon.name}
                  </RichText>
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">
                    {axon.version}
                  </span>
                  <span className="rounded-md border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {axon.license}
                  </span>
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
              <CopyButton value={axon.quickstart} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {axon.tools.map((t) => (
                  <span key={t} className="rounded-md border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {t}
                  </span>
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
        </div>
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
                <span className="shrink-0 font-mono text-sm text-foreground transition-colors group-hover:text-white">
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
        <ul className="flex flex-wrap gap-2">
          {interests.map((i) => (
            <li key={i} className="rounded-full border bg-white/[0.02] px-3 py-1 text-sm text-muted-foreground">
              {i}
            </li>
          ))}
        </ul>
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
                className="text-muted-foreground transition-colors hover:text-white"
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
                <span className="min-w-0 flex-1 truncate text-foreground transition-colors group-hover:text-white">
                  {s.handle}
                </span>
                <Kbd className="hidden sm:inline-flex">{s.hotkey}</Kbd>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <LiquidButton element="obsidian" asChild>
            <a href={`mailto:${profile.email}`}>say hi</a>
          </LiquidButton>
          <SoftButton color="white" size="sm" asChild className="h-9">
            <a href={socials[0].href} target="_blank" rel="noopener noreferrer">
              github
            </a>
          </SoftButton>
          <span className="flex items-center gap-1 font-mono text-[13px] text-muted-foreground">
            {profile.email}
            <CopyButton value={profile.email} />
          </span>
        </div>
      </Section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-6 font-mono text-xs text-subtle-foreground">
        <span>made with &lt;3 in typescript & clover ui</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          press <Kbd>g</Kbd> <Kbd>x</Kbd> <Kbd>m</Kbd> to jump
        </span>
      </footer>
    </main>
  );
}
