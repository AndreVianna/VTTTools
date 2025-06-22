namespace VttTools.WebApp.Components;

public partial class ClientNavMenu
    : IAsyncDisposable {
    public string LogoutUri => NavigationManager.GetRelativeUrl("account/logout");
    public string LoginUri => NavigationManager.GetRelativeUrl("account/login");
    public string ProfileUri => NavigationManager.GetRelativeUrl("account/manage");
    public string RegisterUri => NavigationManager.GetRelativeUrl("account/manage");
    public string AdventuresUri => NavigationManager.GetRelativeUrl("/adventures");
    public string ZoomLevelDisplay { get; private set; } = "100%";

    public event EventHandler<LocationChangedEventArgs> LocationChanged {
        add => NavigationManager.LocationChanged += value;
        remove => NavigationManager.LocationChanged -= value;
    }

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        LocationChanged += OnLocationChanged;
        CurrentLocation = GetUrlRelativeToBase(NavigationManager.Uri);
    }

    internal void OnLocationChanged(object? sender, LocationChangedEventArgs e) {
        var newLocation = GetUrlRelativeToBase(e.Location);
        if (CurrentLocation != newLocation) {
            CurrentLocation = newLocation;
            StateHasChanged();
        }
    }

    public ValueTask DisposeAsync() {
        LocationChanged -= OnLocationChanged;
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }
}