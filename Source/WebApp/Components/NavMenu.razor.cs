namespace VttTools.WebApp.Components;

public partial class NavMenu
    : IAsyncDisposable {
    public string LogoutUri => NavigationManager.GetRelativeUrl("account/logout");
    public string LoginUri => NavigationManager.GetRelativeUrl("account/login");
    public string ProfileUri => NavigationManager.GetRelativeUrl("account/manage");
    public string RegisterUri => NavigationManager.GetRelativeUrl("account/manage");

    public string AdventuresUri => NavigationManager.GetRelativeUrl("/adventures");

    public bool IsSceneBuilderPage => CurrentLocation?.StartsWith("/scenes/builder/", StringComparison.OrdinalIgnoreCase) == true;
    public string ZoomLevelDisplay { get; private set; } = "100%";

    [Inject]
    internal IJSRuntime JsRuntime { get; set; } = null!;

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
        if (CurrentLocation != newLocation) {
            CurrentLocation = newLocation;
            //StateHasChanged();
        }
    }

    private async Task OnChangeImageClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerChangeImage");

    private async Task OnGridSettingsClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerGridSettings");

    private async Task OnAssetPlacementClicked(AssetType assetType)
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerAssetPlacement", assetType.ToString());

    private async Task OnResetZoomClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerResetZoom");

    private async Task OnFitHorizontallyClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerFitHorizontally");

    private async Task OnFitVerticallyClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerFitVertically");

    private async Task OnZoomInClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerZoomIn");

    private async Task OnZoomOutClicked()
        => await JsRuntime.InvokeVoidAsync("sceneBuilderInterop.triggerZoomOut");

    public ValueTask DisposeAsync() {
        LocationChanged -= OnLocationChanged;
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }
}