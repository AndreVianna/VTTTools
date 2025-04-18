namespace WebApp.Pages;

public partial class Assets {
    private Asset[]? _assets;
    private string _newName = string.Empty;
    private string _newSource = string.Empty;
    private AssetType _newType = AssetType.Placeholder;
    private Visibility _newVisibility = Visibility.Hidden;

    [Inject]
    private GameServiceClient GameService { get; set; } = null!;

    protected override async Task OnInitializedAsync() => await LoadAssets();

    private async Task LoadAssets() {
        _assets = await GameService.GetAssetsAsync();
        StateHasChanged();
    }

    private async Task CreateAsset() {
        if (string.IsNullOrWhiteSpace(_newName) || string.IsNullOrWhiteSpace(_newSource))
            return;
        var request = new CreateAssetRequest {
            Name = _newName,
            Source = _newSource,
            Type = _newType,
            Visibility = _newVisibility
        };
        var created = await GameService.CreateAssetAsync(request);
        if (created != null) {
            _newName = string.Empty;
            _newSource = string.Empty;
            await LoadAssets();
        }
    }

    private async Task DeleteAsset(Guid id) {
        await GameService.DeleteAssetAsync(id);
        await LoadAssets();
    }
}
