namespace VttTools.AI.Clients;

public class AssetServiceClient(
    HttpClient httpClient,
    IHttpContextAccessor httpContextAccessor,
    ILogger<AssetServiceClient> logger) {

    public async Task<Guid?> CreateAssetAsync(
        CreateAssetHttpRequest request,
        string? authToken = null,
        CancellationToken ct = default) {
        AddAuthorizationHeader(authToken);

        var response = await httpClient.PostAsJsonAsync("/api/assets", request, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Asset creation failed with status {StatusCode} for asset {AssetName}: {ErrorBody}",
                response.StatusCode,
                request.Name,
                errorBody);
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<AssetCreateResponse>(ct);
        return result?.Id;
    }

    private sealed record AssetCreateResponse(Guid Id);

    private void AddAuthorizationHeader(string? authToken = null) {
        var authHeader = authToken ?? httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader))
            httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);
    }
}

public record CreateAssetHttpRequest {
    public AssetKind Kind { get; init; }

    public required string Category { get; init; }

    public required string Type { get; init; }

    public string? Subtype { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string[] Tags { get; init; } = [];

    public Guid? PortraitId { get; init; }

    public NamedSize TokenSize { get; init; } = NamedSize.Default;

    public Guid? TokenId { get; init; }
}
