namespace VttTools.AI.Clients;

public class AssetsServiceClient(IHttpClientFactory httpClientFactory,
                                IHttpContextAccessor httpContextAccessor,
                                ILogger<AssetsServiceClient> logger)
    : IAssetsServiceClient {

    public async Task<Result<Guid>> CreateAssetAsync(CreateAssetRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AssetsService");
        AddAuthorizationHeader(httpClient);
        var response = await httpClient.PostAsJsonAsync("/api/assets", request, ct);
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

    private void AddAuthorizationHeader(HttpClient httpClient) {
        var authToken = httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authToken))
            throw new InvalidOperationException("Authorization header is missing");
        httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authToken);
    }
}