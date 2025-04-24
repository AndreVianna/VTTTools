namespace VttTools.WebApp.Extensions;

public static class NavigationManagerExtensions {
    public static string GetStatusCookieName(this NavigationManager _)
        => "Identity.StatusMessage";

    private static readonly CookieBuilder _statusCookieBuilder = new() {
        SameSite = SameSiteMode.Strict,
        HttpOnly = true,
        IsEssential = true,
        MaxAge = TimeSpan.FromSeconds(5),
    };

    [DoesNotReturn]
    public static void RedirectTo(this NavigationManager navigationManager, string? uri) {
        uri ??= "";
        if (!Uri.IsWellFormedUriString(uri, UriKind.Relative))
            uri = navigationManager.ToBaseRelativePath(uri);
        navigationManager.NavigateTo(uri);
        throw new InvalidOperationException($"{nameof(NavigationManager)} can only be used during static rendering.");
    }

    [DoesNotReturn]
    public static void RedirectTo(this NavigationManager navigationManager, string uri, Dictionary<string, object?> queryParameters) {
        var uriWithoutQuery = navigationManager.ToAbsoluteUri(uri).GetLeftPart(UriPartial.Path);
        var newUri = navigationManager.GetUriWithQueryParameters(uriWithoutQuery, queryParameters);
        navigationManager.RedirectTo(newUri);
    }

    [DoesNotReturn]
    public static void RedirectToWithStatus(this NavigationManager navigationManager, string uri, string message, HttpContext context) {
        context.Response.Cookies.Append(navigationManager.GetStatusCookieName(), message, _statusCookieBuilder.Build(context));
        navigationManager.RedirectTo(uri);
    }

    public static string GetCurrentPath(this NavigationManager navigationManager)
        => navigationManager.ToAbsoluteUri(navigationManager.Uri).GetLeftPart(UriPartial.Path);

    [DoesNotReturn]
    public static void ReloadPage(this NavigationManager navigationManager)
        => navigationManager.RedirectTo(navigationManager.GetCurrentPath());

    [DoesNotReturn]
    public static void ReloadPageWithStatus(this NavigationManager navigationManager, string message, HttpContext context)
        => navigationManager.RedirectToWithStatus(navigationManager.GetCurrentPath(), message, context);
}
