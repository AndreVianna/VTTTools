namespace VttTools.WebApp.Pages.Game;

public partial class AssetsPage {
    private Handler _handler = null!;

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal bool IsLoading { get; set; } = true;
    internal PageState State => _handler.State;

    protected override async Task OnParametersSetAsync() {
        _handler = await Handler.InitializeAsync(GameService);
        IsLoading = false;
    }

    internal Task CreateAsset()
        => _handler.CreateAssetAsync();

    internal Task DeleteAsset(Guid id)
        => _handler.DeleteAssetAsync(id);
}