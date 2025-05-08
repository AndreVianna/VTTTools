namespace VttTools.WebApp.Components;

public partial class NavMenuComponent
    : IAsyncDisposable {
    public event EventHandler<LocationChangedEventArgs> LocationChanged {
        add => NavigationManager.LocationChanged += value;
        remove => NavigationManager.LocationChanged -= value;
    }

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        LocationChanged += OnLocationChanged;
    }

    internal void OnLocationChanged(object? sender, LocationChangedEventArgs e) {
        var newLocation = GetUrlRelativeToBase(e.Location);
        if (CurrentLocation != newLocation)
            CurrentLocation = newLocation;
    }

    public ValueTask DisposeAsync() {
        LocationChanged -= OnLocationChanged;
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }
}