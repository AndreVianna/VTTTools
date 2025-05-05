namespace VttTools.WebApp.Components;

public class ExtendedComponent
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
    public CurrentUser CurrentUser { get; set; } = new();
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

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await SetCurrentUserAsync();
    }

    public override async Task SetParametersAsync(ParameterView parameters) {
        await base.SetParametersAsync(parameters);
        // ReSharper disable once MethodHasAsyncOverload - Need to call both methods.
        IsReady = ConfigureComponent() && await ConfigureComponentAsync();
    }
    protected virtual bool ConfigureComponent() => true;
    protected virtual Task<bool> ConfigureComponentAsync() => Task.FromResult(true);

    private async Task SetCurrentUserAsync() {
        CurrentUser.IsAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false;
        var user = await UserManager.GetUserAsync(HttpContext.User);
        if (user is null)
            return;
        CurrentUser.Id = user.Id;
        CurrentUser.PasswordHash = null;
        CurrentUser.UserName = user.UserName;
        CurrentUser.NormalizedUserName = user.NormalizedUserName;
        CurrentUser.Name = user.Name;
        CurrentUser.DisplayName = user.DisplayName ?? user.Name;
        CurrentUser.Email = user.Email;
        CurrentUser.NormalizedEmail = user.NormalizedEmail;
        CurrentUser.PhoneNumber = user.PhoneNumber;
        CurrentUser.EmailConfirmed = user.EmailConfirmed;
        CurrentUser.PhoneNumberConfirmed = user.PhoneNumberConfirmed;
        CurrentUser.TwoFactorEnabled = user.TwoFactorEnabled;
        CurrentUser.LockoutEnabled = user.LockoutEnabled;
        CurrentUser.LockoutEnd = user.LockoutEnd?.DateTime;
        CurrentUser.AccessFailedCount = user.AccessFailedCount;
        CurrentUser.IsAdministrator = await UserManager.IsInRoleAsync(user, "Administrator");
        CurrentUser.HasPassword = string.IsNullOrEmpty(user.PasswordHash);
    }

    protected virtual string GetUrlRelativeToBase(string url) => NavigationManager.ToBaseRelativePath(url);
    protected virtual Uri GetAbsoluteUri(string url) => NavigationManager.ToAbsoluteUri(Ensure.IsNotNull(url).Trim());

    public virtual Task StateHasChangedAsync() => InvokeAsync(StateHasChanged);

    public virtual void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.RedirectTo(location ?? string.Empty, setQueryParameters);

    public virtual void GoHome()
        => NavigationManager.GoHome();

    public virtual void GoSignIn(string? returnUrl = null)
        => NavigationManager.GoToSigIn(returnUrl);

    public virtual void Refresh(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Refresh(setQueryParameters);

    public virtual void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Reload(setQueryParameters);

    public virtual void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.ReplaceWith(location, setQueryParameters);
}

public class ExtendedComponent<TComponent, THandler>
    : ExtendedComponent, IDisposable, IAsyncDisposable
    where TComponent : ExtendedComponent<TComponent, THandler>
    where THandler : ComponentHandler<THandler, TComponent> {
    private bool _isDisposed;

    public ExtendedComponent() {
        Handler = InstanceFactory.Create<THandler>(HttpContext, NavigationManager, LoggerFactory);
    }

    protected THandler Handler { get; }

    protected virtual void Dispose(bool disposing) {
        if (!disposing)
            return;
        Handler.Dispose();
    }

    public void Dispose() {
        if (_isDisposed)
            return;
        Dispose(true);
        _isDisposed = true;
        GC.SuppressFinalize(this);
    }

    protected virtual ValueTask DisposeAsyncCore()
        => Handler.DisposeAsync();

    public async ValueTask DisposeAsync() {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
}