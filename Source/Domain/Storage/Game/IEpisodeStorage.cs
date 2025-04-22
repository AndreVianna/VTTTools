namespace VttTools.Storage.Game;

/// <summary>
/// Storage interface for Episode entities.
/// </summary>
public interface IEpisodeStorage {
    /// <summary>
    /// Retrieves all episodes
    /// </summary>
    Task<Episode[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all episodes
    /// </summary>
    Task<Episode[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Retrieves an episode by its ID.
    /// </summary>
    Task<Episode?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new episode template.
    /// </summary>
    Task<Episode> AddAsync(Episode episode, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing episode template.
    /// </summary>
    Task<Episode> UpdateAsync(Episode episode, CancellationToken ct = default);

    /// <summary>
    /// Deletes an episode template.
    /// </summary>
    Task DeleteAsync(Episode episode, CancellationToken ct = default);
}