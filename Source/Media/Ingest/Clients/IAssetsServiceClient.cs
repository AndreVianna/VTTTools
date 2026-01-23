namespace VttTools.Media.Ingest.Clients;

/// <summary>
/// Client for calling the Assets API to update asset state.
/// </summary>
public interface IAssetsServiceClient {
    /// <summary>
    /// Update the ingest status of an asset.
    /// </summary>
    /// <param name="assetId">The asset ID.</param>
    /// <param name="status">The new ingest status.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Result indicating success or failure.</returns>
    Task<Result> UpdateIngestStatusAsync(Guid assetId, IngestStatus status, CancellationToken ct = default);

    /// <summary>
    /// Add a token resource to an asset.
    /// </summary>
    /// <param name="assetId">The asset ID.</param>
    /// <param name="tokenId">The token resource ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Result indicating success or failure.</returns>
    Task<Result> AddTokenAsync(Guid assetId, Guid tokenId, CancellationToken ct = default);
}
