using Domain.Model;

namespace WebApp.Components;

public partial class NavMenu {
    private string? _currentUrl;

    [CascadingParameter]
    protected HttpContext HttpContext { get; set; } = null!;

    protected string UserName { get; set; } = null!;

    protected override void OnInitialized() {
        _currentUrl = NavigationManager.ToBaseRelativePath(NavigationManager.Uri);
        NavigationManager.LocationChanged += OnLocationChanged;
        UserName = string.Empty;
        if (HttpContext.User.Identity is not ClaimsIdentity identity)
            return;
        var json = identity.Claims.FirstOrDefault(c => c.Type == AuthenticationClaimTypes.Profile)?.Value;
        var profile = json is null ? null : JsonSerializer.Deserialize<UserProfile>(json);
        UserName = profile?.PreferredName ?? profile?.Name ?? identity.Name ?? string.Empty;
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
