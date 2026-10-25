using System.Text.Json;
using M5rcelWin7.Content;

namespace M5rcelWin7.Services;

public sealed record GitHubSnapshot(int PublicRepos, int Followers, int Following, int MeowcordStars, int XitterStars, DateTimeOffset? FetchedAt);

/// <summary>
/// Refreshes public GitHub counts in the background every 30 minutes, so a page view never
/// waits on the GitHub API. Until the first fetch succeeds, the numbers in <see cref="Profile"/> are shown.
/// </summary>
public sealed class GitHubStats(IHttpClientFactory clients, ILogger<GitHubStats> logger) : BackgroundService
{
    public const string ClientName = "github";
    static readonly TimeSpan Interval = TimeSpan.FromMinutes(30);

    readonly TaskCompletionSource firstRefresh = new(TaskCreationOptions.RunContinuationsAsynchronously);
    volatile GitHubSnapshot current = new(Profile.GitHub.PublicRepos, Profile.GitHub.Followers,
        Profile.GitHub.Following, Profile.Meowcord.Stars, Profile.Xitter.Stars, FetchedAt: null);

    public GitHubSnapshot Current => current;

    /// <summary>Completes after the first fetch, whether it succeeded or not. The static export waits on it.</summary>
    public Task FirstRefresh => firstRefresh.Task;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try { current = await FetchAsync(stoppingToken); }
            // Any failure keeps the previous counts; an exception here would otherwise stop the host.
            catch (Exception error) when (!stoppingToken.IsCancellationRequested)
            {
                logger.LogWarning("GitHub counts not refreshed: {Message}", error.Message);
            }
            firstRefresh.TrySetResult();
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    async Task<GitHubSnapshot> FetchAsync(CancellationToken cancellation)
    {
        var client = clients.CreateClient(ClientName);
        using var user = await GetJsonAsync(client, $"users/{Profile.GitHub.User}", cancellation);
        using var meowcord = await GetJsonAsync(client, $"repos/{Profile.Meowcord.Repo}", cancellation);
        using var xitter = await GetJsonAsync(client, $"repos/{Profile.Xitter.Repo}", cancellation);
        return new GitHubSnapshot(
            user.RootElement.GetProperty("public_repos").GetInt32(),
            user.RootElement.GetProperty("followers").GetInt32(),
            user.RootElement.GetProperty("following").GetInt32(),
            meowcord.RootElement.GetProperty("stargazers_count").GetInt32(),
            xitter.RootElement.GetProperty("stargazers_count").GetInt32(),
            DateTimeOffset.UtcNow);
    }

    static async Task<JsonDocument> GetJsonAsync(HttpClient client, string path, CancellationToken cancellation)
    {
        using var response = await client.GetAsync(path, cancellation);
        response.EnsureSuccessStatusCode();
        await using var body = await response.Content.ReadAsStreamAsync(cancellation);
        return await JsonDocument.ParseAsync(body, cancellationToken: cancellation);
    }
}
