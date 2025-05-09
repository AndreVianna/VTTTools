namespace VttTools.Assets.Services;

/// <summary>
/// Service for retrieving and managing Asset templates.
/// </summary>
public interface IAssetService {
    /// <summary>
    /// Gets all asset templates.
    /// </summary>
    Task<Asset[]> GetAssetsAsync(CancellationToken ct = default);

    /// <summary>
    /// Creates a new asset template.
    /// </summary>
    Task<Asset> CreateAssetAsync(Guid userId, CreateAssetRequest request, CancellationToken ct = default);

    /// <summary>
    /// Gets a specific asset by ID.
    /// </summary>
    Task<Asset?> GetAssetAsync(Guid assetId, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    Task<Asset?> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetRequest request, CancellationToken ct = default);

    /// <summary>
    /// Deletes an asset template.
    /// </summary>
    Task<bool> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default);
}