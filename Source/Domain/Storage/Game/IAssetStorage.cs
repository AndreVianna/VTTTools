namespace VttTools.Storage.Game;

/// <summary>
/// Storage interface for Asset entities.
/// </summary>
public interface IAssetStorage {
    /// <summary>
    /// Retrieves all asset templates.
    /// </summary>
    Task<Asset[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves an asset by its ID.
    /// </summary>
    Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new asset template.
    /// </summary>
    Task<Asset> AddAsync(Asset asset, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    Task<Asset?> UpdateAsync(Asset asset, CancellationToken ct = default);

    /// <summary>
    /// Deletes an asset template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}