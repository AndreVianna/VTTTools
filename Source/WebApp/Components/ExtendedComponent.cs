namespace VttTools.WebApp.Components;

public class ExtendedComponent
    : ComponentBase {
    [Inject]
    internal IHttpContextAccessor HttpContextAccessor { get; set; } = null!;
    [Inject]
    internal NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    internal UserManager<User> UserManager { get; set; } = null!;

    public HttpContext HttpContext { get; private set; } = null!;
    public string? CurrentLocation { get; protected set; }
    public CurrentUser CurrentUser { get; set; } = new();
    public bool IsReady { get; protected set; }

    public event EventHandler<LocationChangedEventArgs> LocationChanged {
        add => NavigationManager.LocationChanged += value;
        remove => NavigationManager.LocationChanged -= value;
    }

    protected override async Task OnParametersSetAsync() {
        await base.OnParametersSetAsync();
        HttpContext = HttpContextAccessor.HttpContext!;
        CurrentLocation = GetUrlRelativeToBase(NavigationManager.Uri);
        await SetCurrentUserAsync();
    }

    public override async Task SetParametersAsync(ParameterView parameters) {
        await base.SetParametersAsync(parameters);
        // ReSharper disable once MethodHasAsyncOverload - Need to call both methods.
        ConfigureComponent();
        await ConfigureComponentAsync();
        IsReady = true;
    }
    protected virtual Task ConfigureComponentAsync() => Task.CompletedTask;
    protected virtual void ConfigureComponent() { }

    private async Task SetCurrentUserAsync() {
        if (HttpContextAccessor.HttpContext is null)
            return;
        var user = await UserManager.GetUserAsync(HttpContextAccessor.HttpContext.User);
        if (user is null)
            return;
        CurrentUser.IsAuthenticated = true;
        CurrentUser.Id = user.Id;
        CurrentUser.DisplayName = user.DisplayName ?? user.Name;
        CurrentUser.IsAdministrator = await UserManager.IsInRoleAsync(user, "Administrator");
    }

    protected virtual string GetUrlRelativeToBase(string url) => NavigationManager.ToBaseRelativePath(url);
    protected virtual Uri GetAbsoluteUri(string url) => NavigationManager.ToAbsoluteUri(Ensure.IsNotNull(url).Trim());

    public virtual Task StateHasChangedAsync() => InvokeAsync(StateHasChanged);

    public virtual void RedirectTo([StringSyntax(StringSyntaxAttribute.Uri)] string? location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.RedirectTo(location ?? string.Empty, setQueryParameters);

    public virtual void GoHome(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.GoHome(setQueryParameters);

    public virtual void Refresh(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Refresh(setQueryParameters);

    public virtual void Reload(Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.Reload(setQueryParameters);

    public virtual void ReplaceWith([StringSyntax(StringSyntaxAttribute.Uri)] string location, Action<IDictionary<string, object?>>? setQueryParameters = null)
        => NavigationManager.ReplaceWith(location, setQueryParameters);
}

public class ExtendedComponent<THandler>
    : ExtendedComponent, IDisposable, IAsyncDisposable
    where THandler : class, new() {
    protected virtual THandler Handler { get; } = new();

    protected virtual void Dispose(bool disposing) {
        if (!disposing)
            return;
        if (Handler is IDisposable disposable)
            disposable.Dispose();
    }

    public void Dispose() {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual ValueTask DisposeAsyncCore()
        => Handler is IAsyncDisposable disposable
               ? disposable.DisposeAsync()
               : ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
}