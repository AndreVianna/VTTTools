namespace VttTools.WebApp.Extensions;

public static class NavigationManagerExtensions {
    [DoesNotReturn]
    public static void RedirectToHome(this NavigationManager navigationManager)
        => navigationManager.RedirectTo(string.Empty);

    [DoesNotReturn]
    public static void RedirectTo(this NavigationManager navigationManager, string? uri, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        uri = navigationManager.GetTargetUrl(uri ?? string.Empty, queryParameters);
        navigationManager.NavigateTo(uri);
        throw new InvalidOperationException($"{nameof(NavigationManager)} can only be used during static rendering.");
    }

    [DoesNotReturn]
    public static void ReloadPage(this NavigationManager navigationManager, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        var uri = navigationManager.GetTargetUrl(navigationManager.GetCurrentPath(), queryParameters);
        navigationManager.NavigateTo(uri, true);
        throw new InvalidOperationException($"{nameof(NavigationManager)} can only be used during static rendering.");
    }

    private static string GetCurrentPath(this NavigationManager navigationManager)
        => navigationManager.ToAbsoluteUri(navigationManager.Uri).GetLeftPart(UriPartial.Path);

    private static string GetTargetUrl(this NavigationManager navigationManager, string uri, IReadOnlyDictionary<string, object?>? queryParameters) {
        if (!Uri.IsWellFormedUriString(uri, UriKind.Relative))
            uri = navigationManager.ToBaseRelativePath(uri);
        if (queryParameters is null)
            return uri;
        var uriWithoutQuery = navigationManager.ToAbsoluteUri(uri).GetLeftPart(UriPartial.Path);
        return navigationManager.GetUriWithQueryParameters(uriWithoutQuery, queryParameters);
    }
}