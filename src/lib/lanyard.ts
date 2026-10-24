// Live Discord presence through Lanyard: https://github.com/Phineas/lanyard
// One REST fetch for a fast first paint, then the WebSocket for real-time updates.

import { useEffect, useState } from "react";

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export type LanyardActivity = {
  id: string;
  name: string;
  type: number; // 0 playing, 1 streaming, 2 listening, 3 watching, 4 custom status, 5 competing
  state?: string;
  details?: string;
  application_id?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  timestamps?: { start?: number; end?: number };
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string };
};

export type LanyardSpotify = {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  track_id: string;
  timestamps: { start: number; end: number };
};

export type LanyardPresence = {
  discord_user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    avatar_decoration_data: { asset: string } | null;
    primary_guild: { tag: string; badge: string; identity_guild_id: string } | null;
  };
  discord_status: DiscordStatus;
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
};

export const STATUS_META: Record<DiscordStatus, { label: string; color: string }> = {
  online: { label: "online", color: "#23a55a" },
  idle: { label: "idle", color: "#f0b232" },
  dnd: { label: "do not disturb", color: "#f23f43" },
  offline: { label: "offline", color: "#80848e" },
};

// --- Discord CDN helpers ---

export const avatarUrl = (user: LanyardPresence["discord_user"], size = 128) =>
  user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=${size}`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

/** Avatar decoration frame; passthrough keeps it animated. */
export const decorationUrl = (asset: string) =>
  `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=240&passthrough=true`;

export const guildBadgeUrl = (guild: NonNullable<LanyardPresence["discord_user"]["primary_guild"]>) =>
  `https://cdn.discordapp.com/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=32`;

export const emojiUrl = (emoji: NonNullable<LanyardActivity["emoji"]>) =>
  emoji.id ? `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}?size=32` : null;

/** Resolves an activity asset key ("mp:external/...", "spotify:...", or an app asset id) to a URL. */
export function activityImage(activity: LanyardActivity, key?: string) {
  if (!key) return null;
  if (key.startsWith("mp:")) return `https://media.discordapp.net/${key.slice(3)}`;
  if (key.startsWith("spotify:")) return `https://i.scdn.co/image/${key.slice(8)}`;
  if (activity.application_id) return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${key}.png`;
  return null;
}

// --- hook ---

export function useLanyard(userId: string) {
  const [presence, setPresence] = useState<LanyardPresence | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let closed = false;

    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then((res) => res.json())
      .then((json: { success: boolean; data?: LanyardPresence }) => {
        if (!closed && json.success && json.data) setPresence((current) => current ?? json.data!);
      })
      .catch(() => {});

    const connect = () => {
      socket = new WebSocket("wss://api.lanyard.rest/socket");
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data as string) as { op: number; t?: string; d?: unknown };
        if (msg.op === 1) {
          // Hello: start heartbeating and subscribe to this user.
          const interval = (msg.d as { heartbeat_interval: number }).heartbeat_interval;
          clearInterval(heartbeat);
          heartbeat = setInterval(() => socket?.send(JSON.stringify({ op: 3 })), interval);
          socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        } else if (msg.op === 0 && (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE")) {
          attempts = 0;
          setPresence(msg.d as LanyardPresence);
        }
      };
      socket.onclose = () => {
        clearInterval(heartbeat);
        if (closed) return;
        // Reconnect with backoff: 2s, 4s, 8s ... up to 30s.
        retry = setTimeout(connect, Math.min(30_000, 2_000 * 2 ** attempts++));
      };
    };
    connect();

    return () => {
      closed = true;
      clearInterval(heartbeat);
      clearTimeout(retry);
      socket?.close();
    };
  }, [userId]);

  return presence;
}
