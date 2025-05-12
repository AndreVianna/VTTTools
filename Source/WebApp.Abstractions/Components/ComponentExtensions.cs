namespace VttTools.WebApp.Components;

public static class ComponentExtensions {
    public static void RedirectTo(this IComponent component, [StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => component.NavigationManager.RedirectTo(location ?? string.Empty, setQueryParameters);

    public static void GoHome(this IComponent component)
        => component.NavigationManager.GoHome();

    public static void GoToSignIn(this IComponent component, string? returnUrl = null)
        => component.NavigationManager.GoToSignIn(returnUrl);

    public static void Refresh(this IComponent component, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => component.NavigationManager.Refresh(setQueryParameters);

    public static void Reload(this IComponent component, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => component.NavigationManager.Reload(setQueryParameters);

    public static void ReplaceWith(this IComponent component, [StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => component.NavigationManager.ReplaceWith(location, setQueryParameters);

    public static void SetStatusMessage(this IComponent component, string message)
        => component.HttpContext.SetStatusMessage(message);
}