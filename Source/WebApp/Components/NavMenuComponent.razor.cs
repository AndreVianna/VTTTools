namespace VttTools.WebApp.Components;

public partial class NavMenuComponent {
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        LocationChanged += OnLocationChanged;
    }

    internal void OnLocationChanged(object? sender, LocationChangedEventArgs e) {
        CurrentLocation = GetRelativePath(e.Location);
        Refresh();
    }

    public void Dispose() {
        LocationChanged -= OnLocationChanged;
        GC.SuppressFinalize(this);
    }
}