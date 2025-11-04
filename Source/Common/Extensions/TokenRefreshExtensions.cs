namespace VttTools.Extensions;

public static class TokenRefreshExtensions {
    public static IApplicationBuilder UseTokenRefresh(this IApplicationBuilder app)
        => app.UseMiddleware<TokenRefreshMiddleware>();
}
