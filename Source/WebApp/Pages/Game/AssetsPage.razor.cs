namespace VttTools.WebApp.Pages.Game;

public partial class AssetsPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal AssetsPageState State => Handler.State;
    internal AssetsPageInputModel Input => Handler.State.Input;

    protected override async Task OnParametersSetAsync() {
        await Handler.InitializeAsync(GameService);
        await base.OnParametersSetAsync();
    }

    internal async Task CreateAsset() {
        await Handler.CreateAssetAsync();
        StateHasChanged();
    }

    internal async Task DeleteAsset(Guid id) {
        await Handler.DeleteAssetAsync(id);
        StateHasChanged();
    }
}