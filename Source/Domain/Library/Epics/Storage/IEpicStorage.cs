namespace VttTools.Library.Epics.Storage;

/// <summary>
/// Storage interface for Epic entities.
/// </summary>
public interface IEpicStorage {
    /// <summary>
    /// Retrieves all epic templates.
    /// </summary>
    Task<Epic[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all epic templates.
    /// </summary>
    Task<Epic[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Retrieves an epic by its ID.
    /// </summary>
    Task<Epic?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new epic template.
    /// </summary>
    Task AddAsync(Epic epic, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing epic template.
    /// </summary>
    Task<bool> UpdateAsync(Epic epic, CancellationToken ct = default);

    /// <summary>
    /// Deletes an epic template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
