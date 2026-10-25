namespace M5rcelWin7.Services;

/// <summary>Response headers sent by the server, and written to <c>_headers</c> for Cloudflare Pages.</summary>
public static class SecurityHeaders
{
    public static readonly IReadOnlyDictionary<string, string> All = new Dictionary<string, string>
    {
        ["X-Content-Type-Options"] = "nosniff",
        ["Referrer-Policy"] = "strict-origin-when-cross-origin",
        ["X-Frame-Options"] = "DENY",
        ["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    };
}
