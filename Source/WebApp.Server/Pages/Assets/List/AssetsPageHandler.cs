namespace VttTools.WebApp.Server.Pages.Assets.List;

public class AssetsPageHandler(AssetsPage page)
    : PageHandler<AssetsPageHandler, AssetsPage>(page) {
    private IAssetsHttpClient _client = null!;

    public async Task LoadAssetsAsync(IAssetsHttpClient client) {
        _client = client;
        var assets = await _client.GetAssetsAsync();
        Page.State.Assets = [.. assets.OrderBy(a => a.Type).ThenBy(a => a.Name)];
    }

    public async Task SaveCreatedAsset() {
        var request = new CreateAssetRequest {
            Name = Page.State.Input.Name,
            Description = Page.State.Input.Description,
            Type = Page.State.Input.Type,
        };

        var result = await _client.CreateAssetAsync(request);

        if (!result.IsSuccessful) {
            Page.State.Input.Errors = [.. result.Errors];
            return;
        }
        Page.State.Input = new();
        Page.State.Assets.Add(result.Value);
        Page.State.Assets.Sort((x, y) => {
            var order = x.Type.CompareTo(y.Type);
            return order != 0 ? order : x.Name.CompareTo(y.Name, StringComparison.OrdinalIgnoreCase);
        });
    }

    public async Task DeleteAsset(Guid id) {
        var deleted = await _client.DeleteAssetAsync(id);
        if (!deleted)
            return;
        Page.State.Assets.RemoveAll(e => e.Id == id);
    }
}