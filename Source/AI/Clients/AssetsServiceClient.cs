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

        var result = await response.Content.ReadFromJsonAsync<Asset>(ct);
        return result!.Id;
    }
}
