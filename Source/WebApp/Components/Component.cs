namespace VttTools.WebApp.Components;

public class Component
    : ComponentBase
    , IComponent {
    [CascadingParameter]
    public HttpContext HttpContext { get; set; } = null!;
    [Inject]
    public NavigationManager NavigationManager { get; set; } = null!;
    public string? CurrentLocation { get; protected set; }
    public bool IsReady { get; protected set; }

    protected override void OnInitialized() {
        base.OnInitialized();
        CurrentLocation ??= GetUrlRelativeToBase(NavigationManager.Uri);
    }

    public override async Task SetParametersAsync(ParameterView parameters) {
        await base.SetParametersAsync(parameters);
        IsReady = await ConfigureAsync();
        await StateHasChangedAsync();
    }

    protected virtual bool Configure() => true;
    protected virtual Task<bool> ConfigureAsync() => Task.FromResult(Configure());

    protected virtual string GetUrlRelativeToBase(string url) => NavigationManager.ToBaseRelativePath(url);
    protected virtual Uri GetAbsoluteUri(string url) => NavigationManager.ToAbsoluteUri(Ensure.IsNotNull(url).Trim());
    public virtual Task StateHasChangedAsync() => InvokeAsync(StateHasChanged);

    public void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.RedirectTo(location ?? string.Empty, setQueryParameters);

    public void GoHome()
        => NavigationManager.GoHome();

    public void GoToSignIn(string? returnUrl = null)
        => NavigationManager.GoToSignIn(returnUrl);

    public void Refresh(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Refresh(setQueryParameters);

    public void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Reload(setQueryParameters);

    public void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.ReplaceWith(location, setQueryParameters);

    public void SetStatusMessage(string message)
        => HttpContext.SetStatusMessage(message);
}
