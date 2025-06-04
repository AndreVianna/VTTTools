using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Server.Clients;

public class AssetsHttpClient(HttpClient client, JsonSerializerOptions options)
    : IAssetsHttpClient {
    public async Task<AssetListItem[]> GetAssetsAsync() {
        var assets = IsNotNull(await client.GetFromJsonAsync<Asset[]>("/api/assets", options));
        return [.. assets.Select(a => a.ToListItem())];
    }

    public async Task<Result<AssetListItem>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await client.PostAsJsonAsync("/api/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset.");
        var asset = IsNotNull(await response.Content.ReadFromJsonAsync<Asset>(options));
        return asset.ToListItem();
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
}