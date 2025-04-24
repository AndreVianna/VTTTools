namespace VttTools.WebApp.Components;

public class ExtendedComponent
    : ComponentBase {
    [Inject]
    internal HttpContextAccessor HttpContextAccessor { get; set; } = null!;
    [Inject]
    internal NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    internal UserManager<User> UserManager { get; set; } = null!;

    public string? CurrentLocation { get; protected set; }
    public CurrentUser CurrentUser { get; set; } = new();

    public event EventHandler<LocationChangedEventArgs> LocationChanged {
        add => NavigationManager.LocationChanged += value;
        remove => NavigationManager.LocationChanged -= value;
    }

    protected override async Task OnInitializedAsync() {
        CurrentLocation = GetRelativePath(NavigationManager.Uri);
        await base.OnInitializedAsync();
        await SetCurrentUserAsync();
    }

    protected virtual Task RefreshAsync() => InvokeAsync(StateHasChanged);
    protected virtual void Refresh() => StateHasChanged();

    private async Task SetCurrentUserAsync() {
        if (HttpContextAccessor.HttpContext is null)
            return;
        var user = await UserManager.GetUserAsync(HttpContextAccessor.HttpContext.User);
        if (user is null)
            return;
        CurrentUser.Id = user.Id;
        CurrentUser.DisplayName = user.DisplayName ?? user.Name;
        CurrentUser.IsAdministrator = await UserManager.IsInRoleAsync(user, "Administrator");
    }

    protected virtual string GetRelativePath(string uri) => NavigationManager.ToBaseRelativePath(uri);
    protected virtual Uri GetAbsolutePath(string? relativeUri) => NavigationManager.ToAbsoluteUri(relativeUri);
    public virtual void NavigateTo([StringSyntax(StringSyntaxAttribute.Uri)] string uri, bool forceLoad = false, bool replace = false)
        => NavigationManager.NavigateTo(uri, forceLoad, replace);
}