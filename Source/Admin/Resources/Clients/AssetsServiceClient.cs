namespace VttTools.Admin.Resources.Clients;

public class AssetsServiceClient(
    IHttpClientFactory httpClientFactory,
    IOptions<PublicLibraryOptions> options,
    ILogger<AssetsServiceClient> logger)
    : IAssetsServiceClient {

    private readonly Guid _masterUserId = options.Value.MasterUserId;

    public async Task<Result<Guid>> CreateAssetAsync(CreateAssetRequest request, CancellationToken ct = default) {
        var requestWithOwner = request with { OwnerId = _masterUserId };
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

        var location = response.Headers.Location?.ToString();
        if (location is not null && Guid.TryParse(location.Split('/')[^1], out var assetId))
            return assetId;

        var result = await response.Content.ReadFromJsonAsync<AssetIdResponse>(JsonDefaults.Options, ct);
        return result?.Id ?? Result.Failure("Failed to extract asset ID from response").WithNo<Guid>();
    }

    public async Task<Result> UpdateAssetAsync(Guid assetId, UpdateAssetRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");
        httpClient.DefaultRequestHeaders.Add("X-User-Id", _masterUserId.ToString());

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

    public async Task<Result> AddTokenAsync(Guid assetId, AddTokenRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");
        httpClient.DefaultRequestHeaders.Add("X-User-Id", _masterUserId.ToString());

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
