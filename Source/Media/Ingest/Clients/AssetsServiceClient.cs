using System.Text.Json;
using VttTools.Json;

namespace VttTools.Media.Ingest.Clients;

/// <summary>
/// HTTP client for calling the Assets API.
/// </summary>
public class AssetsServiceClient(
    IHttpClientFactory httpClientFactory,
    ILogger<AssetsServiceClient> logger)
    : IAssetsServiceClient {

    public async Task<Result> UpdateIngestStatusAsync(Guid assetId, IngestStatus status, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");

        var request = new { IngestStatus = status };
        var response = await httpClient.PatchAsJsonAsync($"/api/assets/{assetId}", request, JsonDefaults.Options, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Update ingest status failed with status {StatusCode} for asset {AssetId}: {ErrorBody}",
                response.StatusCode,
                assetId,
                errorBody);
            return Result.Failure($"Update status failed: {errorBody}");
        }

        return Result.Success();
    }

    public async Task<Result> AddTokenAsync(Guid assetId, Guid tokenId, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");

        var request = new { ResourceId = tokenId };
        var response = await httpClient.PostAsJsonAsync($"/api/assets/{assetId}/tokens", request, JsonDefaults.Options, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Add token failed with status {StatusCode} for asset {AssetId}: {ErrorBody}",
                response.StatusCode,
                assetId,
                errorBody);
            return Result.Failure($"Add token failed: {errorBody}");
        }

        return Result.Success();
    }
}
