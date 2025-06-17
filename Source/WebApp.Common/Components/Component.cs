namespace VttTools.WebApp.Components;

public class Component
    : ComponentBase
    , IComponent {
    [Inject]
    internal virtual ILoggerFactory LoggerFactory { get; set; } = null!;
    [Inject]
    internal virtual IServiceScopeFactory ScopeFactory { get; set; } = null!;
    [Inject]
    public virtual NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    internal virtual IHttpContextAccessor HttpContextAccessor { get; set; } = null!;
    public virtual HttpContext HttpContext => HttpContextAccessor?.HttpContext!;

    public virtual string? CurrentLocation { get; set; }
    public virtual LoggedUser? User { get; private set; }
    public virtual bool IsReady { get; private set; }
    public virtual ILogger Logger { get; set; } = null!;

    protected override void OnInitialized() {
        Logger = LoggerFactory.CreateLogger(GetType());
        base.OnInitialized();
        SetCurrentLocation();
    }

    protected override void OnParametersSet()
        => SetBasicUserInfo();

    private void SetCurrentLocation()
        => CurrentLocation ??= GetUrlRelativeToBase(NavigationManager.Uri);

    private void SetBasicUserInfo() {
        var isAuthenticated = HttpContext?.User.Identity?.IsAuthenticated ?? false;
        if (!isAuthenticated)
            return;
        var id = Guid.TryParse(HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)?.Trim(), out var uuid) ? uuid : Guid.Empty;
        var displayName = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value
                        ?? HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
                        ?? nameof(User);
        var isAdministrator = HttpContext.User.IsInRole(nameof(RoleName.Administrator));
        User = new(id, displayName, isAdministrator);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender) {
        await base.OnAfterRenderAsync(firstRender);
        if (!firstRender)
            return;
        await ConfigureAsync();
        IsReady = true;
        await StateHasChangedAsync();
    }

    protected virtual void Configure() { }
    protected virtual Task ConfigureAsync() {
        Configure();
        return Task.CompletedTask;
    }

    public virtual Task StateHasChangedAsync() => InvokeAsync(StateHasChanged);

    public virtual void SetStatusMessage(string message) => HttpContext.SetStatusMessage(message);

    public virtual string GetUrlRelativeToBase(string url) => NavigationManager.ToBaseRelativePath(url);

    public virtual Uri GetAbsoluteUri(string url) => NavigationManager.ToAbsoluteUri(Ensure.IsNotNull(url).Trim());

    public virtual void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.RedirectTo(location ?? string.Empty, setQueryParameters);

    public virtual void GoHome()
        => NavigationManager.GoHome();

    protected virtual void GoToSignIn(string? returnUrl = null)
       => NavigationManager.RedirectTo("account/login", ps => {
           if (!string.IsNullOrWhiteSpace(returnUrl))
               ps.Add("ReturnUrl", UrlEncoder.Default.Encode(returnUrl));
       });

    public virtual void Refresh()
        => NavigationManager.Refresh();

    public virtual void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Reload(setQueryParameters);

    public virtual void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.ReplaceWith(location, setQueryParameters);
}