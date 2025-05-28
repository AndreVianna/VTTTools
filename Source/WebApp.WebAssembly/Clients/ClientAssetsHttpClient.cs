using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.WebAssembly.Clients;

public class ClientAssetsHttpClient(HttpClient httpClient, JsonSerializerOptions options)
    : IAssetsHttpClient {
    public Task<AssetListItem[]> GetAssetsAsync() => throw new NotImplementedException();

    public async Task<Result<AssetListItem>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await httpClient.PostAsJsonAsync("api/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset");
        var asset = IsNotNull(await response.Content.ReadFromJsonAsync<Asset>());
        return new AssetListItem {
            Id = asset.Id,
            Name = asset.Name,
        };
    }

    public Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request) => throw new NotImplementedException();
    public Task<bool> DeleteAssetAsync(Guid id) => throw new NotImplementedException();

    public async Task<string> UploadAssetFileAsync(Guid id, Stream fileStream, string fileName) {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);

        content.Add(streamContent, "file", fileName);

        var response = await httpClient.PostAsync($"api/assets/{id}/upload", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}