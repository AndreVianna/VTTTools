namespace VttTools.WebApp.TestUtilities;

internal sealed class NavigationManagerSpy
    : IDisposable {
    private readonly NavigationManager _navigationManager;
    public string? NewLocation { get; private set; }

    public NavigationManagerSpy(NavigationManager navigationManager) {
        _navigationManager = navigationManager;
        navigationManager.LocationChanged += OnLocationChanged;
    }

    private void OnLocationChanged(object? sender, LocationChangedEventArgs e)
        => NewLocation = _navigationManager.ToBaseRelativePath(e.Location);

    public void Dispose()
        => _navigationManager.LocationChanged -= OnLocationChanged;
}
