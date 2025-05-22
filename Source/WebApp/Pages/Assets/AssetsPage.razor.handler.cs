namespace VttTools.WebApp.Pages.Assets;

public class AssetsPageHandler(AssetsPage page)
    : PageHandler<AssetsPageHandler, AssetsPage>(page) {
    private IAssetsServerHttpClient _serverHttpClient = null!;

    public async Task LoadAssetsAsync(IAssetsServerHttpClient serverHttpClient) {
        _serverHttpClient = serverHttpClient;
        Page.State.Assets = [.. await _serverHttpClient.GetAssetsAsync()];
    }

    public async Task SaveCreatedAsset() {
        var request = new CreateAssetRequest {
            Name = Page.State.Input.Name,
            Description = Page.State.Input.Description,
            Type = Page.State.Input.Type,
        };

        var result = await _serverHttpClient.CreateAssetAsync(request);

        if (!result.IsSuccessful) {
            Page.State.Input.Errors = [.. result.Errors];
            return;
        }
        Page.State.Input = new();
        Page.State.Assets.Add(result.Value);
        Page.State.Assets.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteAsset(Guid id) {
        var deleted = await _serverHttpClient.DeleteAssetAsync(id);
        if (!deleted)
            return;
        Page.State.Assets.RemoveAll(e => e.Id == id);
    }
}