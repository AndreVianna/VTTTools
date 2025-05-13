namespace VttTools.WebApp.Pages.Assets;

public partial class AssetsPage {
    [Inject]
    internal IAssetsClient AssetsClient { get; set; } = null!;

    internal AssetsPageState State { get; set; } = new();
    internal AssetsInputModel Input => State.Input;

    protected override async Task<bool> ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadAssetsAsync(AssetsClient);
        return true;
    }

    internal async Task CreateAsset() {
        await Handler.SaveCreatedAsset();
        StateHasChanged();
    }

    internal async Task DeleteAsset(Guid id) {
        await Handler.DeleteAsset(id);
        StateHasChanged();
    }
}