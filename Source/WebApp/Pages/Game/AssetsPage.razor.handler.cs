namespace VttTools.WebApp.Pages.Game;

public class AssetsPageHandler(HttpContext httpContext, NavigationManager navigationManager, CurrentUser currentUser, ILoggerFactory loggerFactory)
    : AuthorizedComponentHandler<AssetsPageHandler, AssetsPage>(httpContext, navigationManager, currentUser, loggerFactory) {
    private IGameService _service = null!;

    internal AssetsPageState State { get; } = new();

    public async Task ConfigureAsync(IGameService service) {
        _service = service;
        State.Assets = [.. await _service.GetAssetsAsync()];
    }

    public async Task SaveCreatedAsset() {
        var request = new CreateAssetRequest {
            Name = State.Input.Name,
            Source = State.Input.Source,
            Type = State.Input.Type,
            Visibility = State.Input.Visibility,
        };

        var result = await _service.CreateAssetAsync(request);

        if (!result.IsSuccessful) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.Input = new();
        State.Assets.Add(result.Value);
        State.Assets.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteAsset(Guid id) {
        var deleted = await _service.DeleteAssetAsync(id);
        if (!deleted)
            return;
        State.Assets.RemoveAll(e => e.Id == id);
    }
}