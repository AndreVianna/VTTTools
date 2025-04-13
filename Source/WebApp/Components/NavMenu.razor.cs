namespace WebApp.Components;

public partial class NavMenu {
    private string? _currentUrl;

    [CascadingParameter]
    protected HttpContext HttpContext { get; set; } = null!;

    protected string UserName { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        _currentUrl = NavigationManager.ToBaseRelativePath(NavigationManager.Uri);
        NavigationManager.LocationChanged += OnLocationChanged;
        UserName = string.Empty;
        var user = await UserManager.GetUserAsync(HttpContext.User);
        if (user is null) return;
        UserName = user.DisplayName ?? user.Name;
    }

    private void OnLocationChanged(object? sender, LocationChangedEventArgs e) {
        _currentUrl = NavigationManager.ToBaseRelativePath(e.Location);
        StateHasChanged();
    }

    public void Dispose() {
        NavigationManager.LocationChanged -= OnLocationChanged;
        GC.SuppressFinalize(this);
    }
}
