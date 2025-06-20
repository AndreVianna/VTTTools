namespace VttTools.WebApp.Clients;

public class SceneBuilderHttpClient(HttpClient client, JsonSerializerOptions options, AuthenticationStateProvider authentication)
    : ISceneBuilderHttpClient
{
    private const string _userHeader = "x-user";

    public async Task<SceneDetails?> GetSceneByIdAsync(Guid id)
    {
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

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request)
    {
        var response = await client.PatchAsJsonAsync($"api/scenes/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene");

        var result = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>());
        return Result.Success(result);
    }

    public async Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid sceneId, AddSceneAssetRequest request)
    {
        var response = await client.PostAsJsonAsync($"api/scenes/{sceneId}/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to add scene asset");

        var asset = IsNotNull(await response.Content.ReadFromJsonAsync<SceneAsset>());
        return asset.ToViewModel();
    }

    public async Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number)
    {
        var response = await client.DeleteAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Result> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateSceneAssetRequest request)
    {
        var response = await client.PatchAsJsonAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene asset");

        var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
        return Result.Success(result!);
    }
}