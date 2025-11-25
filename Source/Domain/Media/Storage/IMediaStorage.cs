namespace VttTools.Media.Storage;

/// <summary>
/// Storage interface for resource entities.
/// </summary>
public interface IMediaStorage {
    /// <summary>
    /// Retrieves all resource templates.
    /// </summary>
    Task<Resource[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Searches for resource templates matching the specified criteria.
    /// </summary>
    Task<Resource[]> SearchAsync(string search, CancellationToken ct = default);

    /// <summary>
    /// Retrieves an resource by its ID.
    /// </summary>
    Task<Resource?> FindByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new resource template.
    /// </summary>
    Task AddAsync(Resource resource, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing resource template.
    /// </summary>
    Task<bool> UpdateAsync(Resource resource, CancellationToken ct = default);

    /// <summary>
    /// Deletes an resource template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}