# m5rcel-bio

guns.lol-style bio page for m5rcel. Custom design built with Vite, React, TypeScript, Tailwind v4 and Motion.

## Develop

```bash
npm install
npm run dev
```

All content (bio, projects, links, domains) lives in `src/data.ts`.

## Discord embed

Links to the site unfurl in Discord as a [component embed](https://docs.discord.com/developers/link-previews/component-embeds):
your X pfp as the thumbnail, a generated banner, an axon section and link buttons. Standard Open Graph
tags are kept as a fallback for Discord and other apps.

- `src/embed.ts` — the embed layout (edit text, buttons, accent color here). The build fails if it breaks
  Discord's rules (3,000 bytes, 40 components, link-only buttons).
- `scripts/generate-embed-assets.ts` — renders `public/embed-banner.png` (1200x630), `public/axon-logo.png`,
  `public/favicon.png` and `public/apple-touch-icon.png` from `public/avatar.jpg`. Runs before every build;
  run it alone with `npm run embed:assets`.
- The site URL defaults to `https://m5rcel.みんな`. Set the `SITE_URL` env var to build for another domain.

Discord caches previews for ~30 minutes; image URLs carry a `?v=` hash so a new banner shows up after that.
Check the result with Discord's [Embed Debugger](https://discord.com/developers/embeds).

## Deploy to Cloudflare Pages

**From the dashboard (Git):** connect the repo, then set
- Build command: `npm run build`
- Build output directory: `dist`
- Then add `m5rcel.みんな` under Custom domains.

**From the CLI:**

```bash
npx wrangler login
npm run deploy
```

## What's on the page

- **Enter screen** (`src/components/bio/enter-screen.tsx`): a fake terminal boot, then "click to enter".
  The click also unlocks audio, which browsers block until the visitor interacts.
- **Starfield + cursor sparkles** (`starfield.tsx`): canvas background with mouse parallax and shooting stars.
- **Profile card** (`App.tsx`, `profile.tsx`): glass card that tilts toward the cursor, X pfp wearing the live
  Discord avatar decoration and status dot, sparkling name, typewriter taglines, badges and social icons.
- **Discord presence** (`discord-card.tsx`, `src/lib/lanyard.ts`): live status, custom status, current activity
  and Spotify through [Lanyard](https://github.com/Phineas/lanyard). Your Discord account must stay in the
  Lanyard Discord server for this to work.
- **Generated lo-fi** (`src/lib/ambient.ts`): soft chords, plucks and vinyl crackle made with the Web Audio API.
  No audio files. Mute button in the bottom-left corner.
- **Typing tab title** and a **404 page** in the same style (`404.html`, `src/not-found.tsx`).

Text, badges and taglines live in `src/data.ts`.

## Keyboard shortcuts

`g` github · `x` x · `d` discord · `s` steam · `n` neocities · `m` email
