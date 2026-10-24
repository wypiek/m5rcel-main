import { motion } from "motion/react";
import { Clock, MapPin } from "lucide-react";

import { Backdrop } from "@/components/bio/backdrop";
import { Player } from "@/components/bio/player";
import { BadgePill, ProfileAvatar, SOCIAL_ICONS, Tooltip, Typewriter, useLocalTime } from "@/components/bio/profile";
import { DiscordWidget, GithubWidget } from "@/components/bio/widgets";
import { profile, socials, taglines } from "@/data";
import { useLanyard } from "@/lib/lanyard";
import { SITE_HOST } from "@/site";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
});

export default function App() {
  const presence = useLanyard(profile.discordId);
  const time = useLocalTime(profile.timezone);
  const discordHref = socials.find((s) => s.label === "discord")!.href;

  // Discord first, like the reference; email last.
  const links = [
    { label: "discord", href: discordHref },
    ...socials.filter((s) => s.label !== "discord").map((s) => ({ label: s.label, href: s.href })),
    { label: "email", href: `mailto:${profile.email}` },
  ];

  return (
    <>
      <Backdrop />

      <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col justify-center gap-4 px-4 py-12">
        <motion.section
          {...rise(0)}
          className="rounded-[26px] border border-white/10 bg-black/30 p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-7"
        >
          {/* header */}
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
            <ProfileAvatar src={profile.avatar} presence={presence} />
            <div className="min-w-0">
              <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap">
                <h1 className="text-[38px] leading-none font-bold tracking-tight text-white [text-shadow:0_0_22px_rgba(255,255,255,0.35)]">
                  {profile.name}
                </h1>
                <BadgePill />
              </div>
              <Typewriter lines={taglines} className="mt-3 min-h-[1.5em] text-[16px] font-medium text-white/90" />
            </div>
          </div>

          {/* live widgets */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DiscordWidget presence={presence} href={discordHref} />
            <GithubWidget user="wypiek" />
          </div>

          {/* glowing socials */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3">
            {links.map((l) => (
              <Tooltip key={l.label} label={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  className="flex text-white transition-all duration-200 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.55))] hover:-translate-y-1 hover:[filter:drop-shadow(0_0_14px_rgba(255,255,255,0.95))]"
                >
                  {SOCIAL_ICONS[l.label]}
                </a>
              </Tooltip>
            ))}
          </div>

          {/* footer */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-semibold text-white/85 sm:justify-start">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" fill="currentColor" stroke="#120d18" /> {profile.location}
            </span>
            <span className="text-white/25">|</span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Clock className="size-4" /> {time} local
            </span>
            <span className="text-white/25">|</span>
            <span className="text-white/55">{SITE_HOST}</span>
          </div>
        </motion.section>

        <motion.div {...rise(0.12)}>
          <Player />
        </motion.div>
      </main>
    </>
  );
}
