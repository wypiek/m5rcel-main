namespace M5rcelWin7.Content;

// All text and links on the page live here, so they can be edited without touching the markup.

public sealed record Link(string Label, string Handle, string Href);
public sealed record Project(string Name, string Repo, string Description, string Lang, int Stars = 0);
public sealed record StackGroup(string Label, string[] Items);

public static class Profile
{
    public const string Handle = "m5rcel";
    public const string Name = "marcel";
    public const string Location = "poland";
    public const string TimeZone = "Europe/Warsaw";
    public const string Email = "contact@m5rcel.com";
    public const string Description = "full-stack dev from poland. web, linux, self-hosting, old stuff, weird ideas.";
    public const string Bio = "full-stack developer with a habit of wandering into website development, linux, self-hosting and old stuff. i like software that's fast, lightweight, useful and fun to make.";

    public static readonly Link[] Links =
    [
        new("github", "wypiek", "https://github.com/wypiek"),
        new("x", "@m5rcode", "https://x.com/m5rcode"),
        new("discord", "m5rcel", "https://discord.com/users/318746314991206400"),
        new("steam", "m5rcel", "https://steamcommunity.com/id/m5rcel"),
        new("neocities", "m5rcel", "https://m5rcel.neocities.org"),
        new("fediverse", "index.sarl", "https://index.sarl"),
        new("m5rcel.com", "home", "https://m5rcel.com"),
        new("m5rcel.みんな", "bio", "https://m5rcel.みんな/"),
        new("m5rcel.work", "main door", "https://m5rcel.work"),
    ];

    public static class GitHub
    {
        public const string User = "wypiek";
        public const string Url = "https://github.com/wypiek";
        // Fallbacks shown when the GitHub API can't be reached.
        public static readonly DateTimeOffset AsOf = new(2026, 10, 25, 0, 0, 0, TimeSpan.Zero);
        public const int PublicRepos = 135;
        public const int Followers = 35;
        public const int Following = 121;
        public const string Since = "november 2024";
    }

    public static class Axon
    {
        public const string Tagline = "a statically typed, compiled, general-purpose language. fast to write, fast to run, fast to ship.";
        public const string Version = "v1.0.0";
        public const string License = "mit";
        public const string Platforms = "windows · macos · linux";
        public const string Quickstart = "axbuild new hello";
        public static readonly string[] Features =
        [
            "real machine-code binaries via a c11 backend",
            "errors as values with try, ? and catch",
            "enums with payloads, match and if let",
            "interpreter and repl for fast iteration",
        ];
        public static readonly string[] Tools = ["axc", "axbuild", "formatter", "linter", "lsp", "repl"];
        public const string Sample = """
            use Core

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
                return 0
            """;
        public static readonly Link[] Links =
        [
            new("source", "theaxonproject/language", "https://github.com/theaxonproject/language"),
            new("docs", "m5rcel.neocities.org/axon", "https://m5rcel.neocities.org/axon"),
            new("error index", "m5rcel.neocities.org/axon/errors", "https://m5rcel.neocities.org/axon/errors/index.html"),
        ];
    }

    public static class Meowcord
    {
        public const string Repo = "meowcorded/meowcord";
        public const string Url = "https://github.com/meowcorded/meowcord";
        public const string Description = "a self-hosted discord clone with feature parity, message encryption and really simple federation.";
        public const int Stars = 52;
        public static readonly Link Partner = new("tiago", "tiago.zip", "https://tiago.zip");
        public static readonly Link X = new("x", "@TheMeowcord", "https://x.com/TheMeowcord");
    }

    public static class Xitter
    {
        public const string Repo = "xittered/xitter";
        public const string Url = "https://github.com/xittered/xitter";
        public const string Site = "https://xitter.space";
        public const string Description = "a self-hosted backend for the x (twitter) web client. your instance serves the real x.com interface from your own domain, answers its api from postgres and federates with other instances.";
        public const string License = "agpl-3.0";
        public const int Stars = 104;
        public static readonly string[] Features =
        [
            "posts, replies, quotes, polls and long-form articles",
            "end-to-end encrypted dms with key backup",
            "community notes, lists and communities",
            "federation, and moving accounts between instances",
            "importing your archive from x",
        ];
    }

    public static class M5rcode
    {
        public const string Url = "https://github.com/m5rcode/m5rcode";
    }

    public static readonly Project[] Projects =
    [
        new("bwfall", "bwfall", "binary waterfall for linux", "c", 6),
        new("termitune", "TermiTune", "tui local music player", "rust", 2),
        new("wingit", "wingit", "package manager for windows, straight from github releases", "powershell", 2),
        new("7blog", "7blog", "self-hosted blog engine on asp.net core and 7.css", "c#"),
        new("mafh.net", "mafh.net", "my awesome file hoster, written in .net", "c#", 1),
        new("mpct", "mpct", "one binary, every tool. a cli toolkit for scripts and terminals", "rust", 1),
        new("fit", "Fit", "git's object model rebuilt as a personal backup engine", "c", 1),
        new("linkora", "Linkora", "windows live messenger, ported to linux and macos", "c#", 1),
        new("phoenixos", "PhoenixOS", "windows 3.0 looks with a linux feel", "c", 1),
        new("winkernel", "WinKERNEL", "a from-scratch kernel modelled on windows 11", "c", 1),
        new("spatial", "spatial", "your filesystem as an interactive node graph", "swift", 1),
        new("brewski", "brewski", "keyboard-driven tui for homebrew", "rust"),
        new("opentube", "opentube", "youtube as if it was made in 2006", "typescript"),
        new("twiq", "twiq", "twitter from 2014, with a few twists", "javascript"),
        new("cliverse", "cliverse", "the fediverse, but as a cli", "go"),
    ];

    public static readonly StackGroup[] Stack =
    [
        new("writes", ["c, c++ and rust when the machine matters", "typescript and react when the browser does", "c# and .net for servers", "lua when roblox calls"]),
        new("runs", ["macos as the daily driver", "arch and fedora at heart"]),
        new("soft spot", ["windows xp", "windows 7", "reactos"]),
    ];

    public static readonly string[] Interests = ["linux", "arch", "self-hosting", "old web", "fediverse", "minecraft", "roblox", "apis", "mysql"];

    public static readonly string[] Domains =
    [
        "bugdroid.today", "cwel.college", "noli.click", "isledelfino.net", "noli.gay",
        "index.sarl", "discord.lifestyle", "canonical.it.com", "teb.college", "1997131.xyz",
    ];
}
