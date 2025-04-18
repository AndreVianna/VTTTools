namespace VttTools.Storage.Game;

/// <summary>
/// Storage interface for Adventure entities.
/// </summary>
public interface IAdventureStorage
{
    /// <summary>
    /// Retrieves all adventure templates.
    /// </summary>
    Task<Adventure[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves an adventure by its ID.
    /// </summary>
    Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default);
    
    /// <summary>
    /// Adds a new adventure template.
    /// </summary>
    Task<Adventure> AddAsync(Adventure adventure, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    Task<Adventure> UpdateAsync(Adventure adventure, CancellationToken ct = default);

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    Task DeleteAsync(Adventure adventure, CancellationToken ct = default);
}