namespace VttTools.Services.Game;

/// <summary>
/// Service for retrieving and managing Adventures and their Episodes.
/// </summary>
public interface IAdventureService {
    /// <summary>
    /// Gets all adventure templates.
    /// </summary>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of adventure templates.</returns>
    Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets a specific adventure by ID.
    /// </summary>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An adventure associated with the specified ID.</returns>
    Task<Adventure?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the creation.</param>
    /// <param name="request">The request containing adventure details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An adventure associated with the specified ID.</returns>
    Task<Adventure?> CreateAdventureAsync(Guid userId, CreateAdventureRequest request, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the update.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="request">The request containing adventure details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An adventure associated with the specified ID.</returns>
    Task<Adventure?> UpdateAdventureAsync(Guid userId, Guid id, UpdateAdventureRequest request, CancellationToken ct = default);

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the deletion.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the adventure was deleted; otherwise, false.</returns>
    Task<bool> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing Adventure template, including nested Episodes, Stage data, and EpisodeAssets.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="templateId">The ID of the adventure to clone.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The new cloned adventure.</returns>
    Task<Adventure?> CloneAdventureAsync(Guid userId, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Gets all episodes for a specific adventure by ID.
    /// </summary>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of episodes associated with the specified adventure.</returns>
    Task<Episode[]> GetEpisodesAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds an episode to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="episodeId">The ID of the episode.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the episode was added; otherwise, false.</returns>
    Task<bool> AddEpisodeAsync(Guid userId, Guid id, Guid episodeId, CancellationToken ct = default);

    /// <summary>
    /// Removes an episode to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="episodeId">The ID of the episode.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the episode was removed; otherwise, false.</returns>
    Task<bool> RemoveEpisodeAsync(Guid userId, Guid id, Guid episodeId, CancellationToken ct = default);
}
