using System.IO.Compression;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.ResponseCompression;
using M5rcelWin7.Services;

if (args.Contains("--healthcheck", StringComparer.Ordinal))
{
    using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(3) };
    try { using var response = await client.GetAsync("http://127.0.0.1:8080/healthz"); Environment.ExitCode = response.IsSuccessStatusCode ? 0 : 1; }
    catch (HttpRequestException) { Environment.ExitCode = 1; }
    catch (TaskCanceledException) { Environment.ExitCode = 1; }
    return;
}

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => options.AddServerHeader = false);
builder.Services.AddRazorPages();
// Write non-Latin text (m5rcel.みんな) as-is instead of as numeric character references.
builder.Services.Configure<Microsoft.Extensions.WebEncoders.WebEncoderOptions>(options =>
    options.TextEncoderSettings = new TextEncoderSettings(UnicodeRanges.All));
builder.Services.AddOptions<SiteOptions>().Bind(builder.Configuration.GetSection("Site"))
    .Validate(options => Uri.TryCreate(options.Url, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https",
        "Site:Url must be an absolute http(s) origin, e.g. https://m5rcel.com.")
    .ValidateOnStart();
builder.Services.AddSingleton<GitHubStats>();
builder.Services.AddHostedService(services => services.GetRequiredService<GitHubStats>());
builder.Services.AddHttpClient(GitHubStats.ClientName, client => {
    client.BaseAddress = new Uri("https://api.github.com/");
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("m5rcel-win7/1.0 (+https://m5rcel.com)");
    client.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
});
builder.Services.AddResponseCompression(options => {
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(["image/svg+xml"]);
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);
builder.Services.Configure<ForwardedHeadersOptions>(options => {
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    // Under Docker, host Caddy reaches Kestrel through the bridge gateway, not loopback.
    foreach (var value in builder.Configuration.GetSection("ReverseProxy:KnownProxies").Get<string[]>() ?? [])
        if (!string.IsNullOrWhiteSpace(value)) options.KnownProxies.Add(IPAddress.Parse(value));
    foreach (var value in builder.Configuration.GetSection("ReverseProxy:KnownNetworks").Get<string[]>() ?? [])
        if (!string.IsNullOrWhiteSpace(value)) options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(value));
});
// The container health check calls http://127.0.0.1:8080, so loopback names stay
// allowed even when AllowedHosts is restricted to the public domains.
builder.Services.PostConfigure<Microsoft.AspNetCore.HostFiltering.HostFilteringOptions>(options => {
    if (options.AllowedHosts.Count == 0 || options.AllowedHosts.Contains("*")) return;
    options.AllowedHosts = options.AllowedHosts.Concat(["localhost", "127.0.0.1"])
        .Distinct(StringComparer.OrdinalIgnoreCase).ToList();
});

var app = builder.Build();
app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment()) app.UseExceptionHandler("/status/500");
app.Use(async (context, next) => {
    foreach (var (name, value) in SecurityHeaders.All) context.Response.Headers[name] = value;
    await next();
});
app.UseResponseCompression();
app.UseStatusCodePagesWithReExecute("/status/{0}");
app.UseStaticFiles(new StaticFileOptions {
    OnPrepareResponse = context => context.Context.Response.Headers.CacheControl = "public,max-age=86400"
});
app.UseRouting();
app.MapGet("/healthz", () => Results.Text("ok"));
app.MapRazorPages();

// `dotnet run -- --export dist` writes the site as static files (used for Cloudflare Pages).
var export = Array.IndexOf(args, "--export");
if (export >= 0)
{
    Environment.ExitCode = await StaticExport.RunAsync(app, args.ElementAtOrDefault(export + 1) ?? "dist");
    return;
}
app.Run();
