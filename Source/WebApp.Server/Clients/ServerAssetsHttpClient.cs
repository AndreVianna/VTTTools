using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Server.Clients;

public class ServerAssetsHttpClient(HttpClient client, JsonSerializerOptions options)
    : IAssetsHttpClient {
    public async Task<AssetListItem[]> GetAssetsAsync() {
        var assets = IsNotNull(await client.GetFromJsonAsync<Asset[]>("/api/assets", options));
        return [..assets.Select(a => new AssetListItem {
            Id = a.Id,
            Name = a.Name,
            Type = a.Type,
        })];
    }

    public async Task<Result<AssetListItem>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await client.PostAsJsonAsync("/api/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset.");
        var asset = IsNotNull(await response.Content.ReadFromJsonAsync<Asset>(options));
        return new AssetListItem {
            Id = asset.Id,
            Name = asset.Name,
            Type = asset.Type,
        };
    }

    public async Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request) {
        var response = await client.PatchAsJsonAsync($"/api/assets/{id}", request, options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update asset.");
    }

    public async Task<bool> DeleteAssetAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/assets/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<string> UploadAssetFileAsync(Guid id, Stream fileStream, string fileName) {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);

        content.Add(streamContent, "file", fileName);

        var response = await client.PostAsync($"api/assets/{id}/upload", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}