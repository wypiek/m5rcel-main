import { useEffect, useState } from "react";
import { siDiscord, siSpotify } from "simple-icons";

import {
  STATUS_META,
  activityImage,
  avatarUrl,
  emojiUrl,
  guildBadgeUrl,
  type LanyardActivity,
  type LanyardPresence,
} from "@/lib/lanyard";
import { BrandIcon } from "./profile";

const VERBS: Record<number, string> = { 0: "playing", 1: "streaming", 2: "listening to", 3: "watching", 5: "competing in" };

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

const clock = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

export function DiscordCard({ presence, href }: { presence: LanyardPresence | null; href: string }) {
  const activity = presence?.activities.find((a) => a.type !== 4 && a.name !== "Spotify");
  const custom = presence?.activities.find((a) => a.type === 4);
  const spotify = presence?.listening_to_spotify ? presence.spotify : null;
  const now = useNow(Boolean(spotify || activity?.timestamps?.start));

  if (!presence) {
    return (
      <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
        <div className="size-12 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-2.5 w-40 rounded bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  const user = presence.discord_user;
  const status = STATUS_META[presence.discord_status];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
    >
      {/* who + custom status */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <img src={avatarUrl(user, 96)} alt="" className="size-12 rounded-full" />
          <span
            className="absolute -right-0.5 -bottom-0.5 size-4 rounded-full border-[3px] border-[#121212]"
            style={{ background: status.color }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-white">{user.global_name ?? user.username}</span>
            {user.primary_guild && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
                <img src={guildBadgeUrl(user.primary_guild)} alt="" className="size-3" />
                {user.primary_guild.tag}
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 truncate text-xs text-white/50">
            {custom?.emoji &&
              (emojiUrl(custom.emoji) ? (
                <img src={emojiUrl(custom.emoji)!} alt="" className="size-3.5" />
              ) : (
                <span>{custom.emoji.name}</span>
              ))}
            <span className="truncate">{custom?.state ?? status.label}</span>
          </p>
        </div>
        <BrandIcon icon={siDiscord} className="size-4 shrink-0 text-white/25 transition-colors group-hover:text-[#5865F2]" />
      </div>

      {/* what they're doing */}
      {spotify ? (
        <Spotify spotify={spotify} now={now} />
      ) : activity ? (
        <Activity activity={activity} now={now} />
      ) : null}
    </a>
  );
}

function Activity({ activity, now }: { activity: LanyardActivity; now: number }) {
  const large = activityImage(activity, activity.assets?.large_image);
  const small = activityImage(activity, activity.assets?.small_image);
  return (
    <div className="mt-3 flex items-center gap-3 border-t border-white/[0.06] pt-3">
      {large ? (
        <div className="relative shrink-0">
          <img src={large} alt={activity.assets?.large_text ?? ""} className="size-14 rounded-xl object-cover" />
          {small && <img src={small} alt="" className="absolute -right-1 -bottom-1 size-5 rounded-full ring-2 ring-[#121212]" />}
        </div>
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] font-mono text-lg text-white/60">
          {activity.name.slice(0, 1)}
        </div>
      )}
      <div className="min-w-0 flex-1 text-xs leading-relaxed">
        <p className="text-[10px] tracking-wider text-white/40 uppercase">{VERBS[activity.type] ?? "playing"}</p>
        <p className="truncate text-sm font-medium text-white">{activity.name}</p>
        {activity.details && <p className="truncate text-white/55">{activity.details}</p>}
        {activity.state && <p className="truncate text-white/55">{activity.state}</p>}
        {activity.timestamps?.start && (
          <p className="font-mono text-[11px] text-white/40">{clock(now - activity.timestamps.start)} elapsed</p>
        )}
      </div>
    </div>
  );
}

function Spotify({ spotify, now }: { spotify: NonNullable<LanyardPresence["spotify"]>; now: number }) {
  const { start, end } = spotify.timestamps;
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  return (
    <div className="mt-3 flex items-center gap-3 border-t border-white/[0.06] pt-3">
      <img src={spotify.album_art_url} alt={spotify.album} className="size-14 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1 text-xs">
        <p className="flex items-center gap-1 text-[10px] tracking-wider text-[#1ED760] uppercase">
          <BrandIcon icon={siSpotify} className="size-3" /> listening on spotify
        </p>
        <p className="truncate text-sm font-medium text-white">{spotify.song}</p>
        <p className="truncate text-white/55">{spotify.artist}</p>
        <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-white/40">
          <span>{clock(now - start)}</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress * 100}%` }} />
          </div>
          <span>{clock(end - start)}</span>
        </div>
      </div>
    </div>
  );
}
