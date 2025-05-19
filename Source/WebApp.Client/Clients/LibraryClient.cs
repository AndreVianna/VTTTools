using System.Net.Http.Json;
using VttTools.Library.Adventures.ApiContracts;
using VttTools.Library.Scenes.ApiContracts;
using VttTools.Library.Scenes.Model;
using VttTools.WebApp.Client.Models;

namespace VttTools.WebApp.Client.Clients;

public class LibraryClient : ILibraryClient
{
    private readonly HttpClient _httpClient;

    public LibraryClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<Scene?> GetSceneByIdAsync(Guid id)
    {
        return await _httpClient.GetFromJsonAsync<Scene>($"api/scenes/{id}");
    }

    public async Task<Result<Scene>> UpdateSceneAsync(Guid id, UpdateSceneRequest request)
    {
        var response = await _httpClient.PutAsJsonAsync($"api/scenes/{id}", request);
        
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<Scene>();
            return Result<Scene>.Success(result!);
        }
        
        return Result<Scene>.Failure("Failed to update scene");
    }

    public async Task<Result<SceneAsset>> AddSceneAssetAsync(Guid sceneId, AddNewSceneAssetRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync($"api/scenes/{sceneId}/assets", request);
        
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
            return Result<SceneAsset>.Success(result!);
        }
        
        return Result<SceneAsset>.Failure("Failed to add scene asset");
    }

    public async Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number)
    {
        var response = await _httpClient.DeleteAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Result<SceneAsset>> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateSceneAssetRequest request)
    {
        var response = await _httpClient.PutAsJsonAsync($"api/scenes/{sceneId}/assets/{assetId}/{number}", request);
        
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<SceneAsset>();
            return Result<SceneAsset>.Success(result!);
        }
        
        return Result<SceneAsset>.Failure("Failed to update scene asset");
    }
}