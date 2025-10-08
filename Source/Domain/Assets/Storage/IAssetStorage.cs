namespace VttTools.Assets.Storage;

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
    /// Checks if an asset with the given name exists for the specified owner.
    /// </summary>
    Task<Asset?> GetByNameAndOwnerAsync(string name, Guid ownerId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new asset template.
    /// </summary>
    Task AddAsync(Asset asset, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    Task<bool> UpdateAsync(Asset asset, CancellationToken ct = default);

    /// <summary>
    /// Deletes an asset template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}