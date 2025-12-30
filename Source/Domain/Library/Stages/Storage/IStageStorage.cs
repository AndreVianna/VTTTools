namespace VttTools.Library.Stages.Storage;

/// <summary>
/// Storage interface for Stage entities.
/// </summary>
public interface IStageStorage {
    /// <summary>
    /// Searches for stages matching the specified criteria.
    /// </summary>
    /// <param name="masterUserId">The user performing the search.</param>
    /// <param name="filter">Search filter criteria.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Matching stages and total count.</returns>
    Task<(Stage[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default);

    /// <summary>
    /// Gets all stages.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Array of all stages.</returns>
    Task<Stage[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets stages matching a filter definition.
    /// </summary>
    /// <param name="filterDefinition">Filter definition string.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Array of matching stages.</returns>
    Task<Stage[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);

    /// <summary>
    /// Gets a stage by its unique identifier.
    /// </summary>
    /// <param name="id">The stage ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The stage if found; otherwise null.</returns>
    Task<Stage?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new stage to storage.
    /// </summary>
    /// <param name="stage">The stage to add.</param>
    /// <param name="ct">Cancellation token.</param>
    Task AddAsync(Stage stage, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing stage in storage.
    /// </summary>
    /// <param name="stage">The stage with updated values.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the update was successful; otherwise false.</returns>
    Task<bool> UpdateAsync(Stage stage, CancellationToken ct = default);

    /// <summary>
    /// Deletes a stage from storage.
    /// </summary>
    /// <param name="id">The ID of the stage to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the deletion was successful; otherwise false.</returns>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
