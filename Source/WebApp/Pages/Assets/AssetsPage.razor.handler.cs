namespace VttTools.WebApp.Pages.Assets;

public class AssetsPageHandler(IAuthenticatedPage component)
    : AuthenticatedPageHandler<AssetsPageHandler>(component) {
    private IAssetsClient _client = null!;

    internal AssetsPageState State { get; } = new();

    public async Task LoadAssetsAsync(IAssetsClient client) {
        _client = client;
        State.Assets = [.. await _client.GetAssetsAsync()];
    }

    public async Task SaveCreatedAsset() {
        var request = new CreateAssetRequest {
            Name = State.Input.Name,
            Source = State.Input.Source,
            Type = State.Input.Type,
            Visibility = State.Input.Visibility,
        };

        var result = await _client.CreateAssetAsync(request);

        if (!result.IsSuccessful) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.Input = new();
        State.Assets.Add(result.Value);
        State.Assets.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteAsset(Guid id) {
        var deleted = await _client.DeleteAssetAsync(id);
        if (!deleted)
            return;
        State.Assets.RemoveAll(e => e.Id == id);
    }
}