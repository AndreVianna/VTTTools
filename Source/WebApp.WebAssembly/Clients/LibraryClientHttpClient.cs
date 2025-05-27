using VttTools.WebApp.Contracts.Library.Adventure;

using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.WebAssembly.Clients;

public class LibraryClientHttpClient(HttpClient httpClient, JsonSerializerOptions options, AuthenticationStateProvider authentication)
    : ILibraryHttpClient {
    private const string _userHeader = "x-user";

    public Task<AdventureListItem[]> GetAdventuresAsync() => throw new NotImplementedException();

    public Task<AdventureDetails?> GetAdventureByIdAsync(Guid id) => throw new NotImplementedException();

    public Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request) => throw new NotImplementedException();

    public Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request) => throw new NotImplementedException();

    public Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request) => throw new NotImplementedException();

    public Task<bool> DeleteAdventureAsync(Guid id) => throw new NotImplementedException();

    public Task<SceneListItem[]> GetScenesAsync(Guid id) => throw new NotImplementedException();

    public async Task<SceneDetails?> GetSceneByIdAsync(Guid id) {
        httpClient.DefaultRequestHeaders.Remove(_userHeader);
        var state = await authentication.GetAuthenticationStateAsync();
        var user = state.User;
        if (user.Identity?.IsAuthenticated != true)
            return null;
        var userId = user.GetCurrentUserId();
        if (userId == Guid.Empty)
            return null;
        var token = Base64UrlEncoder.Encode(userId.ToByteArray());
        httpClient.DefaultRequestHeaders.Add(_userHeader, token);
        var scene = IsNotNull(await httpClient.GetFromJsonAsync<Scene>($"api/scenes/{id}", options));
        return new() {
            Id = scene.Id,
            Name = scene.Name,
            Description = scene.Description,
            IsPublished = scene.IsPublished,
            Stage = new() {
                Id = scene.Stage.Id?.ToString() ?? scene.Id.ToString(),
                Type = scene.Stage.Type,
                Size = scene.Stage.Size,
                ZoomLevel = scene.ZoomLevel,
            },
            Grid = new() {
                Type = scene.Grid.Type,
                CellSize = scene.Grid.CellSize,
                Offset = scene.Grid.Offset,
                Snap = scene.Grid.Snap,
            },
            Assets = [..scene.Assets.Select(a => new SceneAssetDetails {
                Id = a.Id,
                Name = a.Name,
                Number = a.Number,
                Type = a.Type,
            })],
        };
    }

    public Task<Result<SceneDetails>> CreateSceneAsync(Guid id) => throw new NotImplementedException();

    public Task<Result<SceneDetails>> CloneSceneAsync(Guid id, Guid templateId, CloneSceneRequest request) => throw new NotImplementedException();

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await httpClient.PatchAsJsonAsync($"api/scenes/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene");

        var result = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>());
        return Result.Success(result);
    }

    public Task<bool> DeleteSceneAsync(Guid id, Guid sceneId) => throw new NotImplementedException();

    public async Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request) {
        var response = await httpClient.PostAsJsonAsync($"api/scenes/{sceneId}/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to add scene asset");

        var asset = IsNotNull(await response.Content.ReadFromJsonAsync<SceneAsset>());
        return new SceneAssetDetails {
            Id = asset.Id,
            Name = asset.Name,
            Number = asset.Number,
            Type = asset.Type,
            DisplayType = asset.Display.Type,
            DisplayId = asset.Display.Id?.ToString() ?? asset.Id.ToString(),
            Position = asset.Position,
            Size = asset.Display.Size,
            Scale = asset.Scale,
            Rotation = asset.Rotation,
            Elevation = asset.Elevation,
            IsLocked = false,
        };
    }

    public async Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number) {
        var response = await httpClient.DeleteAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Result> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request) {
        var response = await httpClient.PatchAsJsonAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene asset");

        var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
        return Result.Success(result!);
    }
}