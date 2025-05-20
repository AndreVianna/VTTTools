using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Clients;

internal class AssetsClient(HttpClient client, IOptions<JsonOptions> options)
    : IAssetsClient {
    private readonly JsonSerializerOptions _options = options.Value.JsonSerializerOptions;

    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await client.GetFromJsonAsync<Asset[]>("/api/assets", _options);
        return assets ?? [];
    }

    public async Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await client.PostAsJsonAsync("/api/assets", request, _options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset.");
        var asset = await response.Content.ReadFromJsonAsync<Asset>(_options);
        return asset!;
    }

    public async Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request) {
        var response = await client.PutAsJsonAsync($"/api/assets/{id}", request, _options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    public async Task<bool> DeleteAssetAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/assets/{id}");
        return response.IsSuccessStatusCode;
    }
}