# m5rcel-bio

Minimal dark bio site for m5rcel. Built with Vite, React, TypeScript, Tailwind v4 and [Spell UI](https://spell.sh/docs/components).

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

## Spell UI components used

Special Text, Blur Reveal, Text Marquee, Shimmer Text, Words Stagger, Badge, Tilt Card,
Copy Button, Marquee, Kbd, Flow Button, Fallback Avatar — copied from the registry at
`https://spell.sh/r/<name>.json` into `src/components/spell/`.

Local tweaks for a non-Next.js setup: `marquee.tsx` uses `<style>` instead of `<style jsx>`,
and `special-text.tsx` uses `ReturnType<typeof setInterval>` instead of `NodeJS.Timeout`.

## Keyboard shortcuts

`g` github · `x` x · `d` discord · `s` steam · `n` neocities · `m` email
