using Microsoft.AspNetCore.Components.Authorization;

using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Client.Clients;

public class LibraryClientHttpClient(HttpClient httpClient, JsonSerializerOptions options, AuthenticationStateProvider authentication)
    : ILibraryClientHttpClient {
    private const string _userHeader = "x-user";

    public async Task<Scene?> GetSceneByIdAsync(Guid id) {
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
        return await httpClient.GetFromJsonAsync<Scene>($"api/scenes/{id}", options);
    }

    public async Task<Result<Scene>> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await httpClient.PatchAsJsonAsync($"api/scenes/{id}", request, options);
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
        var response = await httpClient.PatchAsJsonAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update scene asset");

        var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
        return Result.Success(result!);
    }
}