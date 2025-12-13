namespace VttTools.AI.Clients;

public class AssetServiceClient(HttpClient httpClient, ILogger<AssetServiceClient> logger) {
    public async Task<Guid?> CreateAssetAsync(CreateAssetHttpRequest request, CancellationToken ct = default) {
        var response = await httpClient.PostAsJsonAsync("/api/assets", request, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Asset creation failed with status {StatusCode} for asset {AssetName}",
                response.StatusCode,
                request.Name);
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<Asset>(ct);
        return result?.Id;
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
