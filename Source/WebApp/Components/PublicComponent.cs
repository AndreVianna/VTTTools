namespace VttTools.WebApp.Components;

public class PublicComponent
    : ComponentBase {
    [Inject]
    internal IHttpContextAccessor HttpContextAccessor { get; set; } = null!;
    [Inject]
    internal NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    internal UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    internal ILoggerFactory LoggerFactory { get; set; } = null!;

    public HttpContext HttpContext { get; private set; } = null!;
    public string? CurrentLocation { get; protected set; }
    public virtual User? CurrentUser { get; set; }
    [MemberNotNullWhen(true, nameof(CurrentUser))]
    public bool IsAuthenticated => (HttpContext.User.Identity?.IsAuthenticated ?? false)
                                && CurrentUser is not null;
    public bool IsReady { get; protected set; }

    public event EventHandler<LocationChangedEventArgs> LocationChanged {
        add => NavigationManager.LocationChanged += value;
        remove => NavigationManager.LocationChanged -= value;
    }

    protected override void OnInitialized() {
        base.OnInitialized();
        HttpContext = HttpContextAccessor.HttpContext!;
        CurrentLocation = GetUrlRelativeToBase(NavigationManager.Uri);
    }

    protected override Task OnInitializedAsync()
        => SetCurrentUserAsync();

    public override async Task SetParametersAsync(ParameterView parameters) {
        await base.SetParametersAsync(parameters);
        IsReady = await ConfigureComponentAsync();
        await StateHasChangedAsync();
    }
    protected virtual bool ConfigureComponent() => true;
    protected virtual Task<bool> ConfigureComponentAsync()
        => Task.FromResult(ConfigureComponent());

    private async Task SetCurrentUserAsync() {
        CurrentUser = await UserManager.GetUserAsync(HttpContext.User);
        if (CurrentUser is null)
            return;
        CurrentUser.IsAdministrator = await UserManager.IsInRoleAsync(CurrentUser, "Administrator");
    }

    protected virtual string GetUrlRelativeToBase(string url) => NavigationManager.ToBaseRelativePath(url);
    protected virtual Uri GetAbsoluteUri(string url) => NavigationManager.ToAbsoluteUri(Ensure.IsNotNull(url).Trim());

    public virtual Task StateHasChangedAsync() => InvokeAsync(StateHasChanged);

    public virtual void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.RedirectTo(location ?? string.Empty, setQueryParameters);

    public virtual void GoHome()
        => NavigationManager.GoHome();

    public virtual void GoSignIn(string? returnUrl = null)
        => NavigationManager.GoToSignIn(returnUrl);

    public virtual void Refresh(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Refresh(setQueryParameters);

    public virtual void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Reload(setQueryParameters);

    public virtual void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.ReplaceWith(location, setQueryParameters);
}

public class PublicComponent<THandler>
    : PublicComponent, IDisposable, IAsyncDisposable
    where THandler : PublicComponentHandler<THandler> {
    private bool _isDisposed;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        SetHandler();
    }

    [MemberNotNull(nameof(Handler))]
    protected virtual void SetHandler()
        => Handler = InstanceFactory.Create<THandler>(HttpContext, NavigationManager, LoggerFactory);

    protected THandler Handler { get; set; } = null!;

    protected virtual void Dispose(bool disposing) {
        if (!disposing)
            return;
        ((THandler?)Handler)?.Dispose();
    }

    public void Dispose() {
        if (_isDisposed)
            return;
        Dispose(true);
        _isDisposed = true;
        GC.SuppressFinalize(this);
    }

    protected virtual ValueTask DisposeAsyncCore()
        => ((THandler?)Handler)?.DisposeAsync() ?? ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
}