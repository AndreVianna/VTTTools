using System.Net.Http.Json;
using VttTools.Assets.ApiContracts;
using VttTools.Assets.Model;
using VttTools.WebApp.Client.Models;

namespace VttTools.WebApp.Client.Clients;

public class AssetsClient : IAssetsClient
{
    private readonly HttpClient _httpClient;

    public AssetsClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<Asset?> GetAssetByIdAsync(Guid id)
    {
        return await _httpClient.GetFromJsonAsync<Asset>($"api/assets/{id}");
    }

    public async Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("api/assets", request);
        
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<Asset>();
            return Result<Asset>.Success(result!);
        }
        
        return Result<Asset>.Failure("Failed to create asset");
    }

    public async Task<string> UploadAssetFileAsync(Guid assetId, Stream fileStream, string fileName)
    {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);
        
        content.Add(streamContent, "file", fileName);
        
        var response = await _httpClient.PostAsync($"api/assets/{assetId}/upload", content);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsStringAsync();
    }
}