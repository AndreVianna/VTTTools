namespace VttTools.WebApp.Pages.Game;

public partial class AssetsPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal AssetsPageState State => Handler.State;
    internal AssetsPageInputModel Input => Handler.State.Input;

    protected override Task ConfigureComponentAsync()
        => Handler.InitializeAsync(GameService);

    internal async Task CreateAsset() {
        await Handler.SaveCreatedAsset();
        StateHasChanged();
    }

    internal async Task DeleteAsset(Guid id) {
        await Handler.DeleteAsset(id);
        StateHasChanged();
    }
}