namespace VttTools.WebApp.Extensions;

public static class NavigationManagerExtensions {
    public static string GetCurrentPath(this NavigationManager navigationManager)
        => navigationManager.ToAbsoluteUri(navigationManager.Uri).GetLeftPart(UriPartial.Path);

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
        context.SetStatusMessage(message);
        navigationManager.RedirectTo(uri);
    }

    [DoesNotReturn]
    public static void ReloadPage(this NavigationManager navigationManager)
        => navigationManager.RedirectTo(navigationManager.GetCurrentPath());

    [DoesNotReturn]
    public static void ReloadPageWithStatus(this NavigationManager navigationManager, string message, HttpContext context)
        => navigationManager.RedirectToWithStatus(navigationManager.GetCurrentPath(), message, context);
}
