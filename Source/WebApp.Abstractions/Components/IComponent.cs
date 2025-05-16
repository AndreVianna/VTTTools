namespace VttTools.WebApp.Components;

public interface IComponent {
    HttpContext HttpContext { get; }
    NavigationManager NavigationManager { get; }
    string? CurrentLocation { get; }
    LoggedUser? User { get; }
    bool IsReady { get; }

    Task StateHasChangedAsync();
    void SetStatusMessage(string message);

    string GetUrlRelativeToBase(string url);
    Uri GetAbsoluteUri(string url);

    void Refresh();
    void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null);
    void GoHome();
    void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null);
    void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null);
}