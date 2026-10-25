namespace M5rcelWin7.Services;

public sealed class SiteOptions
{
    /// <summary>Public origin used for the canonical link and Open Graph tags.</summary>
    public string Url { get; set; } = "https://m5rcel.com";

    public string Absolute(string path) => Url.TrimEnd('/') + "/" + path.TrimStart('/');
}
