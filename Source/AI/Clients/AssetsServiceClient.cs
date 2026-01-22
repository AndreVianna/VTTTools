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
        var location = response.Headers.Location?.ToString();
        if (location is not null && Guid.TryParse(location.Split('/')[^1], out var assetId))
            return assetId;

        var result = await response.Content.ReadFromJsonAsync<AssetIdResponse>(JsonDefaults.Options, ct);
        return result?.Id ?? Result.Failure("Failed to extract asset ID from response").WithNo<Guid>();
    }

    public async Task<Result> UpdateAssetAsync(Guid assetId, UpdateAssetRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");
        var response = await httpClient.PatchAsJsonAsync($"/api/assets/{assetId}", request, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Asset update failed with status {StatusCode} for asset {AssetId}: {ErrorBody}",
                response.StatusCode,
                assetId,
                errorBody);
            return Result.Failure(errorBody);
        }
        return Result.Success();
    }

    public async Task<Result> UpdateIngestStatusAsync(Guid assetId, IngestStatus status, CancellationToken ct = default) {
        var request = new UpdateAssetRequest { IngestStatus = status };
        return await UpdateAssetAsync(assetId, request, ct);
    }

    public async Task<Result> AddTokenAsync(Guid assetId, AddTokenRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");
        var response = await httpClient.PostAsJsonAsync($"/api/assets/{assetId}/tokens", request, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Add token failed with status {StatusCode} for asset {AssetId}: {ErrorBody}",
                response.StatusCode,
                assetId,
                errorBody);
            return Result.Failure(errorBody);
        }
        return Result.Success();
    }

    private sealed record AssetIdResponse(Guid Id);
}