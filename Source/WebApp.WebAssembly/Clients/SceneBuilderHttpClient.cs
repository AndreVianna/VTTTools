using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.WebAssembly.Clients;

public class SceneBuilderHttpClient(HttpClient client, JsonSerializerOptions options, AuthenticationStateProvider authentication)
    : ISceneBuilderHttpClient {
    private const string _userHeader = "x-user";

    public async Task<SceneDetails?> GetSceneByIdAsync(Guid id) {
        client.DefaultRequestHeaders.Remove(_userHeader);
        var state = await authentication.GetAuthenticationStateAsync();
        var user = state.User;
        if (user.Identity?.IsAuthenticated != true)
            return null;
        var userId = user.GetCurrentUserId();
        if (userId == Guid.Empty)
            return null;
        var token = Base64UrlEncoder.Encode(userId.ToByteArray());
        client.DefaultRequestHeaders.Add(_userHeader, token);
        var scene = IsNotNull(await client.GetFromJsonAsync<Scene>($"api/scenes/{id}", options));
        return new() {
            Id = scene.Id,
            Name = scene.Name,
            Description = scene.Description,
            IsPublished = scene.IsPublished,
            Stage = new() {
                FileName = scene.Stage.FileName ?? scene.Id.ToString(),
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

    public async Task<string> UploadSceneFileAsync(Guid id, Stream fileStream, string fileName) {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);

        content.Add(streamContent, "file", fileName);

        var response = await client.PostAsync($"api/scenes/{id}/upload", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await client.PatchAsJsonAsync($"api/scenes/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene");

        var result = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>());
        return Result.Success(result);
    }

    public async Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request) {
        var response = await client.PostAsJsonAsync($"api/scenes/{sceneId}/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to add scene asset");

        var asset = IsNotNull(await response.Content.ReadFromJsonAsync<SceneAsset>());
        return new SceneAssetDetails {
            Id = asset.Id,
            Name = asset.Name,
            Number = asset.Number,
            Type = asset.Type,
            ResourceType = asset.Display.Type,
            DisplayId = asset.Display.FileName ?? asset.Id.ToString(),
            Position = asset.Position,
            Size = asset.Display.Size,
            Scale = asset.Scale,
            Rotation = asset.Rotation,
            Elevation = asset.Elevation,
            IsLocked = false,
        };
    }

    public async Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number) {
        var response = await client.DeleteAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Result> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request) {
        var response = await client.PatchAsJsonAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene asset");

        var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
        return Result.Success(result!);
    }
}