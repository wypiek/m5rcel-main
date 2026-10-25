# m5rcel-win7

Bio page for m5rcel, built with **ASP.NET Core 10 Razor Pages** and [7.css](https://khang-nd.github.io/7.css/), in the same style as [7blog](https://github.com/wypiek/7blog).

A bento grid of 7.css panels over a Windows wallpaper: about me, links, GitHub counts, what's in progress, axon, meowcord, xitter, projects, stack and domains.

## Design rules

Every component comes from 7.css 0.21.1, served locally from `wwwroot/vendor/` with no CDN:

| Where | 7.css component |
| --- | --- |
| Cards | windows (`.window` / `.title-bar` / `.window-body`), no title-bar buttons |
| Links and actions | buttons (`a[role=button]`) |
| Status line | balloon (`[role=tooltip]`) |
| Right now | progress bars (marquee, animated, paused) |
| axon | tabs (`menu[role=tablist]`) |
| xitter features | collapse (`details`) |
| GitHub counts, projects | list view (`table`) with 7.css scroll bars |
| Stack, domains | tree view (`ul.tree-view`) |
| Footer | status bar |

`wwwroot/css/site.css` only does layout, spacing and the wallpaper (`wwwroot/img/wallpaper.jpg`). It adds no colours, gradients or taskbar.
The page works without JavaScript; `wwwroot/js/site.js` only switches the axon tabs and shows the time in Warsaw.

## Editing

All text and links live in `Content/Profile.cs`. GitHub repo and follower counts and meowcord and xitter stars refresh from the
GitHub API every 30 minutes in the background (`Services/GitHubStats.cs`). Until the first refresh, the fallback
numbers in `Profile.cs` are shown.

## Deploy to Cloudflare Pages

Cloudflare Pages hosts static files, so the build renders the site once to `dist/`: `index.html`, `404.html`,
the assets and a `_headers` file with the security headers. GitHub counts are fetched at build time.
`build.sh` installs the .NET 10 SDK first if the build image doesn't have it.

In the Pages project (*Settings > Build*):

- Framework preset: `None`
- Build command: `bash build.sh`
- Build output directory: `dist`
- Root directory: leave empty

Optional environment variable: `Site__Url` (canonical origin, default `https://m5rcel.com`).
To refresh the GitHub counts, redeploy (for example from a deploy hook on a schedule).

To build the same files locally: `dotnet run -- --export dist`.

## Run locally

```sh
dotnet run
```

## Deploy with Docker Compose behind Caddy

```sh
docker compose up -d --build
curl http://127.0.0.1:8080/healthz
```

The container listens on `127.0.0.1:8080` only. Merge `Caddyfile.example` into your Caddyfile.
Optional environment variables: `SITE_URL` (canonical origin, default `https://m5rcel.com`), `ALLOWED_HOSTS`, `PORT`.
