using M5rcelWin7.Content;
using M5rcelWin7.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace M5rcelWin7.Pages;

public sealed class IndexModel(GitHubStats stats) : PageModel
{
    public GitHubSnapshot GitHub { get; private set; } = null!;

    public void OnGet() => GitHub = stats.Current;

    public static string RepoUrl(Project project) => $"{Profile.GitHub.Url}/{project.Repo}";
}
