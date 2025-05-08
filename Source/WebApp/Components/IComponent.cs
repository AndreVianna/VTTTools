namespace VttTools.WebApp.Components;

public interface IComponent {
    string? CurrentLocation { get; }
    HttpContext HttpContext { get; set; }
    bool IsReady { get; }
    NavigationManager NavigationManager { get; set; }
    void GoHome();
    void GoToSignIn(string? returnUrl = null);
    void RedirectTo([StringSyntax("Uri")] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null);
    void Refresh(Action<IDictionary<string, object?>>? setQueryParameters = null);
    void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null);
    void ReplaceWith([StringSyntax("Uri")] string location, Action<IDictionary<string, object?>>? setQueryParameters = null);
    Task SetParametersAsync(ParameterView parameters);
    void SetStatusMessage(string message);
    Task StateHasChangedAsync();
}
