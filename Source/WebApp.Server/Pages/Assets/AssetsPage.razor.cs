namespace VttTools.WebApp.Pages.Assets;

public partial class AssetsPage {
    [Inject]
    internal IAssetsHttpClient Client { get; set; } = null!;

    internal AssetsPageState State { get; set; } = new();
    internal AssetsInputModel Input => State.Input;

    protected override async Task<bool> ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadAssetsAsync(Client);
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