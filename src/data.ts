// All content for the site lives here, so it can be edited without touching layout code.

export const profile = {
  handle: "m5rcel",
  name: "Marcel R.",
  location: "poland",
  timezone: "Europe/Warsaw",
  avatar: "/avatar.jpg",
  bio: "full-stack developer with a habit of wandering into website development, linux, self-hosting and old stuff.",
  email: "contact@m5rcel.com",
} as const;

/** Rotating words for the "i build ___" line. */
export const builds = [
  "websites",
  "apis",
  "discord bots",
  "programming languages",
  "terminal apps",
  "twitter revivals",
];

export const axon = {
  name: "axon",
  logo: "/axon-logo.svg",
  tagline:
    "a statically typed, compiled, general-purpose language. fast to write, fast to run, fast to ship.",
  version: "v1.0.0",
  license: "mit",
  quickstart: "axbuild new hello",
  platforms: "windows · macos · linux",
  features: [
    "real machine-code binaries via a c11 backend",
    "errors as values with try, ? and catch",
    "enums with payloads, match and if let",
    "interpreter and repl for fast iteration",
  ],
  tools: ["axc", "axbuild", "formatter", "linter", "lsp", "repl"],
  // from examples/03_fibonacci.ax
  sample: `use Core

fn fib(n: uint64) -> uint64
    let mut a = 0_u64
    let mut b = 1_u64

    for _ in 0..n do
        let next = a + b
        a = b
        b = next

    return a

fn main() -> int
    println(f"fib: {fib(10)}")
    return 0`,
  links: [
    { label: "source", href: "https://github.com/theaxonproject/language" },
    { label: "docs", href: "https://m5rcel.neocities.org/axon" },
    { label: "error index", href: "https://m5rcel.neocities.org/axon/errors/index.html" },
  ],
};

export const meowcord = {
  description:
    "a self-hosted discord clone with feature parity, message encryption and really simple federation.",
  href: "https://github.com/meowcorded/meowcord",
  partner: { name: "tiago", href: "https://tiago.zip" },
};

/** Rough public repo count on github.com/wypiek, used in the embed banner. */
export const repoCount = 130;

export type Project = {
  name: string;
  /** repo name under github.com/wypiek */
  repo: string;
  description: string;
  lang: string;
  stars?: number;
};

export const projects: Project[] = [
  { name: "bwfall", repo: "bwfall", description: "binary waterfall for linux", lang: "c", stars: 6 },
  { name: "termitune", repo: "TermiTune", description: "tui local music player", lang: "rust", stars: 2 },
  { name: "wingit", repo: "wingit", description: "package manager for windows, straight from github releases", lang: "powershell", stars: 2 },
  { name: "mpct", repo: "mpct", description: "one binary, every tool. a cli toolkit for scripts and terminals", lang: "rust", stars: 1 },
  { name: "fit", repo: "Fit", description: "git's object model rebuilt as a personal backup engine", lang: "c", stars: 1 },
  { name: "linkora", repo: "Linkora", description: "windows live messenger, ported to linux and macos", lang: "c#", stars: 1 },
  { name: "phoenixos", repo: "PhoenixOS", description: "windows 3.0 looks with a linux feel", lang: "c", stars: 1 },
  { name: "spatial", repo: "spatial", description: "your filesystem as an interactive node graph", lang: "swift", stars: 1 },
  { name: "brewski", repo: "brewski", description: "keyboard-driven tui for homebrew", lang: "rust" },
  { name: "opentube", repo: "opentube", description: "youtube as if it was made in 2006", lang: "typescript" },
  { name: "twiq", repo: "twiq", description: "twitter from 2014, with a few twists", lang: "javascript" },
  { name: "cliverse", repo: "cliverse", description: "the fediverse, but as a cli", lang: "go" },
];

/** GitHub-ish language colors, used as small dots next to each project. */
export const langColors: Record<string, string> = {
  c: "#8f9bb3",
  rust: "#dea584",
  powershell: "#5391fe",
  "c#": "#9b6ad6",
  swift: "#f05138",
  typescript: "#3178c6",
  javascript: "#f1e05a",
  go: "#00add8",
};

export const interests = [
  "linux",
  "arch",
  "self-hosting",
  "old web",
  "fediverse",
  "minecraft",
  "roblox",
  "apis",
  "mysql",
];

export const domains = [
  "bugdroid.today",
  "cwel.college",
  "noli.click",
  "isledelfino.net",
  "noli.gay",
  "index.sarl",
  "discord.lifestyle",
  "canonical.it.com",
  "teb.college",
  "1997131.xyz",
];

export type Social = {
  label: string;
  handle: string;
  href: string;
  /** Single key that opens this link from anywhere on the page. */
  hotkey: string;
};

export const socials: Social[] = [
  { label: "github", handle: "wypiek", href: "https://github.com/wypiek", hotkey: "g" },
  { label: "x", handle: "@m5rcode", href: "https://x.com/m5rcode", hotkey: "x" },
  { label: "discord", handle: "m5rcel", href: "https://discord.com/users/318746314991206400", hotkey: "d" },
  { label: "steam", handle: "m5rcel", href: "https://steamcommunity.com/id/m5rcel", hotkey: "s" },
  { label: "neocities", handle: "m5rcel.neocities.org", href: "https://m5rcel.neocities.org", hotkey: "n" },
];
