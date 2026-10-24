import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";

import { profile } from "./src/data.ts";
import { AXON_LOGO_PNG, BANNER, SITE_HOST, SITE_URL, buildComponentEmbed, validateComponentEmbed } from "./src/embed.ts";

const publicFile = (path: string) => fileURLToPath(new URL(`./public${path}`, import.meta.url));

/** Short hash of the embed images, appended as ?v= so Discord refetches them after a change. */
function assetVersion() {
  const hash = createHash("sha256");
  for (const path of [BANNER.path, AXON_LOGO_PNG, profile.avatar]) {
    if (existsSync(publicFile(path))) hash.update(readFileSync(publicFile(path)));
  }
  return hash.digest("hex").slice(0, 8);
}

/** Injects the favicon, Open Graph fallback tags and Discord's component embed into index.html. */
function discordEmbed(): Plugin {
  return {
    name: "discord-embed",
    transformIndexHtml(_html, ctx) {
      const v = assetVersion();
      const icons: HtmlTagDescriptor[] = [
        { tag: "link", attrs: { rel: "icon", type: "image/png", href: `/favicon.png?v=${v}` }, injectTo: "head" },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: `/apple-touch-icon.png?v=${v}` }, injectTo: "head" },
      ];
      // Only the home page gets the embed and social tags; other pages (404) just get the icons.
      if (!/(^|\/)index\.html$/.test(ctx.path) && ctx.path !== "/") return icons;

      const abs = (path: string) => `${SITE_URL}${path}?v=${v}`;

      const payload = buildComponentEmbed(v);
      // Escape "<" so the JSON can never close the <script> tag early.
      const json = JSON.stringify(payload).replace(/</g, "\\u003c");
      const { bytes, count, errors } = validateComponentEmbed(json, payload);
      if (errors.length) throw new Error(`Discord component embed is invalid:\n  - ${errors.join("\n  - ")}`);
      console.log(`  discord embed: ${count} components, ${bytes}/3000 bytes, site ${SITE_HOST} (${SITE_URL})`);

      const meta = (attr: "name" | "property", key: string, content: string): HtmlTagDescriptor => ({
        tag: "meta",
        attrs: { [attr]: key, content },
        injectTo: "head",
      });
      const description = profile.bio;

      return [
        ...icons,
        { tag: "link", attrs: { rel: "canonical", href: `${SITE_URL}/` }, injectTo: "head" },

        // Open Graph fallback, used if Discord can't show the component embed (and by other apps).
        meta("property", "og:site_name", SITE_HOST),
        meta("property", "og:title", `${profile.handle} · ${profile.name}`),
        meta("property", "og:description", description),
        meta("property", "og:url", `${SITE_URL}/`),
        meta("property", "og:type", "website"),
        meta("property", "og:image", abs(BANNER.path)),
        meta("property", "og:image:width", String(BANNER.width)),
        meta("property", "og:image:height", String(BANNER.height)),
        meta("property", "og:image:type", "image/png"),
        meta("property", "og:image:alt", `${profile.handle} banner`),
        meta("name", "twitter:card", "summary_large_image"),
        meta("name", "twitter:site", "@m5rcode"),
        meta("name", "twitter:creator", "@m5rcode"),

        // Discord component embed: https://docs.discord.com/developers/link-previews/component-embeds
        {
          tag: "script",
          attrs: { id: "discord:component-embed", type: "application/json" },
          children: json,
          injectTo: "head",
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), discordEmbed()],
  // Lets browser code show the site host without importing Node-only code from src/embed.ts.
  define: { __SITE_HOST__: JSON.stringify(SITE_HOST) },
  build: {
    rollupOptions: {
      // 404.html is served by Cloudflare Pages for unknown paths.
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        notFound: fileURLToPath(new URL("./404.html", import.meta.url)),
      },
    },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
