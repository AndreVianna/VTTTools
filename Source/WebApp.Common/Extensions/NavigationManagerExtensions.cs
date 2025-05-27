namespace VttTools.WebApp.Extensions;

public static class NavigationManagerExtensions {
    public static string GetAbsoluteUrl(this NavigationManager navigationManager, [StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null) {
        var finalUrl = navigationManager.GetRelativeUrl(location, setQueryParameters);
        return navigationManager.ToAbsoluteUri(finalUrl).AbsoluteUri;
    }

    public static string GetRelativeUrl(this NavigationManager navigationManager, [StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null) {
        var queryParameters = new Dictionary<string, object?>();
        setQueryParameters?.Invoke(queryParameters);
        var finalUrl = (location ?? string.Empty).Trim();
        return navigationManager.GetRelativeUrl(finalUrl, queryParameters);
    }

    public static void RedirectTo(this NavigationManager navigationManager, [StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => navigationManager.NavigateTo(location, false, false, setQueryParameters);

    public static void GoHome(this NavigationManager navigationManager)
        => navigationManager.RedirectTo(string.Empty);

    public static void Refresh(this NavigationManager navigationManager, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => navigationManager.RedirectTo(navigationManager.Uri, setQueryParameters);

    public static void Reload(this NavigationManager navigationManager, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => navigationManager.NavigateTo(navigationManager.Uri, true, false, setQueryParameters);

    public static void ReplaceWith(this NavigationManager navigationManager, [StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => navigationManager.NavigateTo(location, true, true, setQueryParameters);

    private static void NavigateTo(this NavigationManager navigationManager, string? location, bool forceLoad, bool replace, Action<IDictionary<string, object?>>? setQueryParameters) {
        var url = navigationManager.GetRelativeUrl(location, setQueryParameters);
        using var handler = navigationManager.RegisterLocationChangingHandler(navigationManager.PreventNavigationLoop);
        navigationManager.NavigateTo(url, forceLoad, replace);
    }

    private static string GetRelativeUrl(this NavigationManager navigationManager, string url, IReadOnlyDictionary<string, object?>? queryParameters) {
        if (!Uri.TryCreate(Ensure.IsNotNull(url).Trim(), UriKind.RelativeOrAbsolute, out var uri))
            return "not-found";
        if (uri.IsAbsoluteUri)
            url = navigationManager.ToBaseRelativePath(uri.AbsoluteUri);
        if (queryParameters is not null)
            url = navigationManager.GetUriWithQueryParameters(url, queryParameters);
        return url;
    }

    private static ValueTask PreventNavigationLoop(this NavigationManager navigationManager, LocationChangingContext context) {
        var currentLocation = navigationManager.ToBaseRelativePath(navigationManager.Uri);
        if (context.TargetLocation == currentLocation)
            context.PreventNavigation();
        return ValueTask.CompletedTask;
    }
}