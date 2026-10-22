// Generates the Discord embed banner and the favicons from public/avatar.jpg.
// Runs automatically before every build (npm "prebuild"), or by hand: npm run embed:assets
//
//   public/embed-banner.png     1200x630 banner shown in the Discord embed (and as og:image)
//   public/axon-logo.png        256x256 axon logo (Discord thumbnails can't be SVG)
//   public/favicon.png          64x64 round favicon
//   public/apple-touch-icon.png 180x180 home-screen icon

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { axon, profile, repoCount } from "../src/data.ts";
import { AXON_LOGO_PNG, BANNER, SITE_HOST } from "../src/embed.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (file: string) => join(root, "public", file);
const font = (file: string) => readFileSync(join(root, "node_modules/geist/dist/fonts", file));

const fonts = [
  { name: "Geist", data: font("geist-sans/Geist-Regular.ttf"), weight: 400 as const },
  { name: "Geist", data: font("geist-sans/Geist-Medium.ttf"), weight: 500 as const },
  { name: "Geist Mono", data: font("geist-mono/GeistMono-Regular.ttf"), weight: 400 as const },
  { name: "Geist Mono", data: font("geist-mono/GeistMono-Medium.ttf"), weight: 500 as const },
  // Geist has no Japanese glyphs. This is a tiny Noto Sans JP subset (SIL Open Font License)
  // holding only "みんな" for the domain. Changing the domain to other Japanese characters
  // means downloading a new subset: fonts.googleapis.com/css2?family=Noto+Sans+JP&text=<chars>
  { name: "Noto Sans JP", data: readFileSync(join(root, "scripts/fonts/noto-sans-jp-minna.ttf")), weight: 400 as const },
];

const dataUri = (file: string, mime: string) => `data:${mime};base64,${readFileSync(pub(file)).toString("base64")}`;
const avatar = dataUri(profile.avatar.slice(1), "image/jpeg");
const axonLogo = dataUri(axon.logo.slice(1), "image/svg+xml");

// Tiny element helper so this file needs no JSX.
type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (El | string)[]): El => ({
  type,
  props: { style: { display: "flex", ...style }, children },
});
const img = (src: string, size: number, style: Record<string, unknown> = {}): El => ({
  type: "img",
  props: { src, width: size, height: size, style },
});

const C = {
  bg: "#0a0a0a",
  fg: "#ededed",
  muted: "#9a9a9a",
  subtle: "#6b6b6b",
  border: "rgba(255,255,255,0.09)",
  axon: "#0ff4c6",
  green: "#34d399",
};

const chip = (dot: string, label: string, icon?: El) =>
  h(
    "div",
    {
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      borderRadius: 999,
      border: `1px solid ${C.border}`,
      background: "rgba(255,255,255,0.03)",
      fontSize: 24,
      color: C.muted,
    },
    icon ?? h("div", { width: 10, height: 10, borderRadius: 999, background: dot }),
    label,
  );


// Satori adds padding on top of a fixed width/height, so the outer box carries the size
// and an inner box that grows to fill it carries the padding.
const content = h(
  "div",
  {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "72px 80px",
  },
  // top: avatar + name
  h(
    "div",
    { flexDirection: "column", gap: 40 },
    h(
      "div",
      { alignItems: "center", gap: 32 },
      img(avatar, 132, { borderRadius: 999, border: "2px solid rgba(255,255,255,0.18)" }),
      h(
        "div",
        { flexDirection: "column", gap: 8 },
        h("div", { fontFamily: "Geist Mono", fontWeight: 500, fontSize: 68, letterSpacing: -1.5 }, profile.handle),
        h("div", { fontSize: 28, color: C.muted }, `${profile.name}  ·  ${profile.location}`),
      ),
    ),
    h("div", { fontSize: 36, lineHeight: 1.4, color: "#d4d4d4", maxWidth: 940 }, profile.bio),
  ),
  // bottom: highlights + host
  h(
    "div",
    { alignItems: "center", justifyContent: "space-between" },
    h(
      "div",
      { gap: 14 },
      chip(C.axon, `axon ${axon.version}`, img(axonLogo, 26, { borderRadius: 6 })),
      chip(C.green, "building meowcord"),
      chip(C.subtle, `${repoCount}+ repos`),
    ),
    h("div", { fontFamily: "Geist Mono, Noto Sans JP", fontSize: 24, color: C.subtle }, SITE_HOST),
  ),
);

const banner = h(
  "div",
  {
    width: BANNER.width,
    height: BANNER.height,
    background: C.bg,
    backgroundImage:
      "radial-gradient(ellipse 900px 420px at 50% -120px, rgba(255,255,255,0.10), rgba(255,255,255,0) 70%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 0)",
    backgroundSize: "100% 100%, 26px 26px",
    fontFamily: "Geist",
    color: C.fg,
  },
  content,
);

async function render(node: El, width: number, height: number, out: string) {
  const svg = await satori(node as never, { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
  writeFileSync(pub(out), png);
  console.log(`  ✓ public/${out} (${width}x${height}, ${(png.length / 1024).toFixed(1)} kB)`);
}

console.log("generating embed assets…");
await render(banner, BANNER.width, BANNER.height, BANNER.path.slice(1));
await render(h("div", { width: 256, height: 256 }, img(axonLogo, 256)), 256, 256, AXON_LOGO_PNG.slice(1));
await render(h("div", { width: 64, height: 64 }, img(avatar, 64, { borderRadius: 999 })), 64, 64, "favicon.png");
await render(h("div", { width: 180, height: 180, background: C.bg }, img(avatar, 180)), 180, 180, "apple-touch-icon.png");

