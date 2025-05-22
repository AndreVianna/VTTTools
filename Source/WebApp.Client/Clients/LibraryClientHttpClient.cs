using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Client.Clients;

public class LibraryClientHttpClient(HttpClient httpClient, JsonSerializerOptions options)
    : ILibraryClientHttpClient {
    public Task<Scene?> GetSceneByIdAsync(Guid id)
        => httpClient.GetFromJsonAsync<Scene>($"api/scenes/{id}", options);

    public async Task<Result<Scene>> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await httpClient.PutAsJsonAsync($"api/scenes/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene");

        var result = await response.Content.ReadFromJsonAsync<Scene>();
        return Result.Success(result!);
    }

    public async Task<Result<SceneAsset>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request) {
        var response = await httpClient.PostAsJsonAsync($"api/scenes/{sceneId}/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to add scene asset");

        var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
        return Result.Success(result!);
    }

    public async Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number) {
        var response = await httpClient.DeleteAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Result<SceneAsset>> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request) {
        var response = await httpClient.PutAsJsonAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene asset");

        var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
        return Result.Success(result!);
    }
}