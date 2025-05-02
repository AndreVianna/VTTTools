namespace VttTools.WebApp.Components;

public partial class NavMenuComponent
    : IAsyncDisposable {
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        LocationChanged += OnLocationChanged;
    }

    internal void OnLocationChanged(object? sender, LocationChangedEventArgs e) {
        var newLocation = GetUrlRelativeToBase(e.Location);
        if (CurrentLocation == newLocation)
            return;
        CurrentLocation = GetUrlRelativeToBase(e.Location);
        Refresh();
    }

    public ValueTask DisposeAsync() {
        LocationChanged -= OnLocationChanged;
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }
}