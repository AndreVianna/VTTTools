namespace WebApp.Pages;

public partial class Assets {
    private Asset[]? _assets;

    [Inject]
    private GameServiceClient GameService { get; set; } = null!;

    private InputModel Input { get; set; } = new();

    protected override Task OnInitializedAsync() => LoadAssets();

    private async Task LoadAssets() {
        _assets = await GameService.GetAssetsAsync();
        StateHasChanged();
    }

    private async Task CreateAsset() {
        var request = new CreateAssetRequest {
            Name = Input.Name,
            Source = Input.Source,
            Type = Input.Type,
            Visibility = Input.Visibility,
        };
        var result = await GameService.CreateAssetAsync(request);
        if (result.IsSuccessful) {
            Input = new();
            await LoadAssets();
        }
    }

    private async Task DeleteAsset(Guid id) {
        await GameService.DeleteAssetAsync(id);
        await LoadAssets();
    }

    private sealed class InputModel {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; } = string.Empty;
        [Required(AllowEmptyStrings = false)]
        public string Source { get; set; } = string.Empty;
        public AssetType Type { get; set; } = AssetType.Placeholder;
        public Visibility Visibility { get; set; } = Visibility.Hidden;
    }
}
