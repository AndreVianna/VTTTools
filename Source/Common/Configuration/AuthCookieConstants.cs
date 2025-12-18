namespace VttTools.Configuration;

public static class AuthCookieConstants {
    public const string AdminCookieName = "vtttools_admin_auth";
    public const string ClientCookieName = "vtttools_client_auth";

    public static CookieOptions CreateSecureCookie(bool isDevelopment = false) => new() {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7),
        Path = "/",
    };

    public static CookieOptions CreateExpiredCookie(bool isDevelopment = false) => new() {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.Zero,
        Path = "/",
    };
}
