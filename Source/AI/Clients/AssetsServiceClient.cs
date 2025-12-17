namespace VttTools.AI.Clients;

public class AssetsServiceClient(IHttpClientFactory httpClientFactory,
                                ILogger<AssetsServiceClient> logger)
    : IAssetsServiceClient {

    public async Task<Result<Guid>> CreateAssetAsync(Guid ownerId, CreateAssetRequest request, CancellationToken ct = default) {
        var requestWithOwner = request with { OwnerId = ownerId };
        var httpClient = httpClientFactory.CreateClient("AssetsService");
        var response = await httpClient.PostAsJsonAsync("/api/assets", requestWithOwner, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Asset creation failed with status {StatusCode} for asset {AssetName}: {ErrorBody}",
                response.StatusCode,
                request.Name,
                errorBody);
            return Result.Failure(errorBody).WithNo<Guid>();
        }

        // Extract ID from Location header (e.g., "/api/assets/{id}")
        // This avoids deserializing the full Asset which contains Map<HashSet<string>> types
        var location = response.Headers.Location?.ToString();
        if (location is not null && Guid.TryParse(location.Split('/')[^1], out var assetId))
            return assetId;

        var result = await response.Content.ReadFromJsonAsync<AssetIdResponse>(JsonDefaults.Options, ct);
        return result?.Id ?? Result.Failure("Failed to extract asset ID from response").WithNo<Guid>();
    }

    private sealed record AssetIdResponse(Guid Id);
}
