using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Clients;

internal class AssetsServerHttpClient(HttpClient client, JsonSerializerOptions options)
    : IAssetsServerHttpClient {
    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await client.GetFromJsonAsync<Asset[]>("/api/assets", options);
        return assets ?? [];
    }

    public async Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await client.PostAsJsonAsync("/api/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset.");
        var asset = await response.Content.ReadFromJsonAsync<Asset>(options);
        return asset!;
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