using System.Text;

namespace M5rcelWin7.Services;

/// <summary>
/// Renders the site to plain files for static hosts such as Cloudflare Pages: <c>index.html</c>,
/// <c>404.html</c>, everything in <c>wwwroot</c>, and a <c>_headers</c> file with the security headers.
/// GitHub counts are fetched once, at build time.
/// </summary>
public static class StaticExport
{
    static readonly (string Path, string File)[] Pages = [("/", "index.html"), ("/status/404", "404.html")];

    public static async Task<int> RunAsync(WebApplication app, string outputPath)
    {
        var output = Path.GetFullPath(outputPath);
        app.Urls.Clear();
        app.Urls.Add("http://127.0.0.1:0");
        await app.StartAsync();
        try
        {
            // After start, Urls holds the address Kestrel actually bound (port 0 picks a free port).
            var origin = app.Urls.First();
            var stats = app.Services.GetRequiredService<GitHubStats>();
            await stats.FirstRefresh.WaitAsync(TimeSpan.FromSeconds(30));
            if (stats.Current.FetchedAt is null) app.Logger.LogWarning("GitHub API unreachable; exporting the fallback counts.");

            if (Directory.Exists(output)) Directory.Delete(output, recursive: true);
            CopyDirectory(app.Environment.WebRootPath, output);

            using var client = new HttpClient { BaseAddress = new Uri(origin) };
            foreach (var (path, file) in Pages)
            {
                using var response = await client.GetAsync(path);
                if (!response.IsSuccessStatusCode && (int)response.StatusCode != 404)
                    throw new InvalidOperationException($"{path} returned {(int)response.StatusCode}.");
                await File.WriteAllTextAsync(Path.Combine(output, file), await response.Content.ReadAsStringAsync(), Encoding.UTF8);
            }

            var headers = new StringBuilder("/*\n");
            foreach (var (name, value) in SecurityHeaders.All) headers.Append($"  {name}: {value}\n");
            headers.Append("\n/img/*\n  Cache-Control: public, max-age=86400\n");
            headers.Append("\n/css/*\n  Cache-Control: public, max-age=86400\n");
            headers.Append("\n/js/*\n  Cache-Control: public, max-age=86400\n");
            headers.Append("\n/vendor/*\n  Cache-Control: public, max-age=86400\n");
            await File.WriteAllTextAsync(Path.Combine(output, "_headers"), headers.ToString());

            app.Logger.LogInformation("Exported the site to {Output}.", output);
            return 0;
        }
        finally
        {
            await app.StopAsync();
        }
    }

    static void CopyDirectory(string source, string destination)
    {
        Directory.CreateDirectory(destination);
        foreach (var file in Directory.EnumerateFiles(source, "*", SearchOption.AllDirectories))
        {
            var target = Path.Combine(destination, Path.GetRelativePath(source, file));
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target);
        }
    }
}
