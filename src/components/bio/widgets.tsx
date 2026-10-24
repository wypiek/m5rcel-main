import { useEffect, useState, type ReactNode } from "react";
import { siDiscord, siGithub } from "simple-icons";

import { repoCount } from "@/data";
import { STATUS_META, avatarUrl, guildBadgeUrl, type LanyardPresence } from "@/lib/lanyard";
import { BrandIcon } from "./profile";

const VERBS: Record<number, string> = { 0: "playing", 1: "streaming", 2: "listening to", 3: "watching", 5: "competing in" };

function Widget({ href, brand, children }: { href: string; brand: ReactNode; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex min-h-[96px] items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.09]"
    >
      <span className="absolute top-2.5 right-3 flex items-center gap-1 text-[11px] font-medium text-white/35">{brand}</span>
      {children}
    </a>
  );
}

/** Live Discord account: avatar, status and what it's doing right now (via Lanyard). */
export function DiscordWidget({ presence, href }: { presence: LanyardPresence | null; href: string }) {
  const brand = (
    <>
      <BrandIcon icon={siDiscord} className="size-3" /> Discord
    </>
  );

  if (!presence) {
    return (
      <Widget href={href} brand={brand}>
        <div className="size-16 shrink-0 animate-pulse rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-32 animate-pulse rounded bg-white/[0.07]" />
        </div>
      </Widget>
    );
  }

  const user = presence.discord_user;
  const status = STATUS_META[presence.discord_status];
  const activity = presence.activities.find((a) => a.type !== 4 && a.name !== "Spotify");
  const custom = presence.activities.find((a) => a.type === 4);
  const line = presence.listening_to_spotify && presence.spotify
    ? `listening to ${presence.spotify.song}`
    : activity
      ? `${VERBS[activity.type] ?? "playing"} ${activity.name}`
      : custom?.state ?? status.label;

  return (
    <Widget href={href} brand={brand}>
      <div className="relative shrink-0">
        <img src={avatarUrl(user, 128)} alt="" className="size-16 rounded-full" />
        <span className="absolute -right-0.5 -bottom-0.5 size-5 rounded-full border-4 border-[#1a1520]" style={{ background: status.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[17px] font-semibold text-white">{user.username}</span>
          {user.primary_guild && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/85">
              <img src={guildBadgeUrl(user.primary_guild)} alt="" className="size-3" />
              {user.primary_guild.tag}
            </span>
          )}
        </div>
        <p className="truncate text-[13px] text-white/55 italic">{line}</p>
      </div>
    </Widget>
  );
}

type GithubStats = { avatar: string; repos: number; followers: number };
const GH_CACHE = "gh-stats-v1";

/** Live GitHub profile stats, cached for 10 minutes to stay under the API's rate limit. */
export function GithubWidget({ user }: { user: string }) {
  const [stats, setStats] = useState<GithubStats | null>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(GH_CACHE) ?? "null") as (GithubStats & { at: number }) | null;
      return cached && Date.now() - cached.at < 10 * 60_000 ? cached : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (stats) return;
    fetch(`https://api.github.com/users/${user}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((d: { avatar_url: string; public_repos: number; followers: number }) => {
        const next = { avatar: d.avatar_url, repos: d.public_repos, followers: d.followers };
        setStats(next);
        try {
          localStorage.setItem(GH_CACHE, JSON.stringify({ ...next, at: Date.now() }));
        } catch {
          // storage unavailable (private mode); fine without the cache
        }
      })
      .catch(() => setStats({ avatar: "", repos: repoCount, followers: 0 }));
  }, [stats, user]);

  return (
    <Widget
      href={`https://github.com/${user}`}
      brand={
        <>
          <BrandIcon icon={siGithub} className="size-3" /> GitHub
        </>
      }
    >
      {stats?.avatar ? (
        <img src={stats.avatar} alt="" className="size-16 shrink-0 rounded-2xl" />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#0d1117] text-white">
          <BrandIcon icon={siGithub} className="size-8" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-semibold text-white">{user}</p>
        <p className="flex flex-wrap items-center gap-x-2.5 text-[13px] text-white/60">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#3fb950]" />
            {stats ? stats.repos : "–"} repos
          </span>
          {stats && stats.followers > 0 && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-white/40" />
              {stats.followers} followers
            </span>
          )}
        </p>
        <span className="mt-1.5 inline-block rounded-md bg-[#238636] px-2 py-0.5 text-[12px] font-semibold text-white transition-colors group-hover:bg-[#2ea043]">
          Follow
        </span>
      </div>
    </Widget>
  );
}
