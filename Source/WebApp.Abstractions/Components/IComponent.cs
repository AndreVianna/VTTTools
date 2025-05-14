namespace VttTools.WebApp.Components;

public interface IComponent {
    string? CurrentLocation { get; }
    HttpContext? HttpContext { get; }
    NavigationManager NavigationManager { get; }
    LoggedUser? User { get; }
    bool IsReady { get; }
    Task StateHasChangedAsync();

    void Refresh();
    void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null);
    void GoHome();
    void GoToSignIn(string? returnUrl = null);
    void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null);
    void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null);

    void SetStatusMessage(string message)
        => HttpContext?.SetStatusMessage(message);
}