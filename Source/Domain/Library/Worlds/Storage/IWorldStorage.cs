namespace VttTools.Library.Worlds.Storage;

/// <summary>
/// Storage interface for World entities.
/// </summary>
public interface IWorldStorage {
    /// <summary>
    /// Retrieves all world templates.
    /// </summary>
    Task<World[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all world templates.
    /// </summary>
    Task<World[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Retrieves an world by its ID.
    /// </summary>
    Task<World?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new world template.
    /// </summary>
    Task AddAsync(World world, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing world template.
    /// </summary>
    Task<bool> UpdateAsync(World world, CancellationToken ct = default);

    /// <summary>
    /// Deletes an world template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
