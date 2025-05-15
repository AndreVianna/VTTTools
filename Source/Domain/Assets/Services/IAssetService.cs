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
    /// Gets a specific asset by ID.
    /// </summary>
    Task<Asset?> GetAssetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new asset template.
    /// </summary>
    Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    Task<Result<Asset>> CloneAssetAsync(Guid userId, CloneAssetData data, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes an asset template.
    /// </summary>
    Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default);
}