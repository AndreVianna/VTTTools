namespace VttTools.WebApp.Components;

public class ExtendedComponent
    : ComponentBase {
    [Inject]
    internal IHttpContextAccessor HttpContextAccessor { get; set; } = null!;
    [Inject]
    internal NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    internal UserManager<User> UserManager { get; set; } = null!;

    public string? CurrentLocation { get; protected set; }
    public CurrentUser CurrentUser { get; set; } = new();
    public bool IsReady { get; protected set; }

    public event EventHandler<LocationChangedEventArgs> LocationChanged {
        add => NavigationManager.LocationChanged += value;
        remove => NavigationManager.LocationChanged -= value;
    }
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        CurrentLocation = GetUrlRelativeToBase(NavigationManager.Uri);
        await SetCurrentUserAsync();
    }

    protected override async Task OnParametersSetAsync() {
        await base.OnParametersSetAsync();
        IsReady = true;
    }

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

    public virtual void NavigateTo([StringSyntax(StringSyntaxAttribute.Uri)] string relativePath, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        relativePath = GetRelativeToBaseUrl(Ensure.IsNotNull(relativePath).Trim(), queryParameters);
        NavigationManager.NavigateTo(relativePath);
    }

    public virtual void NavigateToWithStatus(string status, [StringSyntax(StringSyntaxAttribute.Uri)] string relativePath, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        HttpContextAccessor.HttpContext!.SetStatusMessage(status);
        NavigateTo(relativePath, queryParameters);
    }

    public virtual void RefreshPage(IReadOnlyDictionary<string, object?>? queryParameters = null) {
        var url = GetRelativeToBaseUrl(NavigationManager.Uri, queryParameters);
        NavigationManager.NavigateTo(url);
    }

    public virtual void RefreshPageWithStatus(string status, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        HttpContextAccessor.HttpContext!.SetStatusMessage(status);
        RefreshPage(queryParameters);
    }

    public virtual void ReloadPage(IReadOnlyDictionary<string, object?>? queryParameters = null) {
        var url = GetRelativeToBaseUrl(NavigationManager.Uri, queryParameters);
        NavigationManager.NavigateTo(url, true);
    }

    public virtual void ReloadPageWithStatus(string status, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        HttpContextAccessor.HttpContext!.SetStatusMessage(status);
        ReloadPage(queryParameters);
    }

    public virtual void ReplacePage([StringSyntax(StringSyntaxAttribute.Uri)] string relativePath, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        relativePath = GetRelativeToBaseUrl(relativePath, queryParameters);
        NavigationManager.NavigateTo(relativePath, true, true);
    }

    public virtual void ReplacePageWithStatus(string status, [StringSyntax(StringSyntaxAttribute.Uri)] string relativePath, IReadOnlyDictionary<string, object?>? queryParameters = null) {
        HttpContextAccessor.HttpContext!.SetStatusMessage(status);
        ReplacePage(relativePath, queryParameters);
    }

    private string GetRelativeToBaseUrl(string url, IReadOnlyDictionary<string, object?>? queryParameters) {
        if (!Uri.TryCreate(Ensure.IsNotNull(url).Trim(), UriKind.RelativeOrAbsolute, out var uri))
            return "not-found";
        if (uri.IsAbsoluteUri)
            url = GetUrlRelativeToBase(uri.AbsoluteUri);
        if (queryParameters is not null)
            url = NavigationManager.GetUriWithQueryParameters(url, queryParameters);
        return url;
    }
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