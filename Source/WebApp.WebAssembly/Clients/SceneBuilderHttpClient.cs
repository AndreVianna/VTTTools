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
        return scene.ToViewModel();
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
        return asset.ToViewModel();
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