namespace VttTools.Library.Adventures.Services;

/// <summary>
/// Service for retrieving and managing Adventures and their Scenes.
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
    /// <param name="data">The data containing adventure details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An adventure associated with the specified ID.</returns>
    Task<Adventure?> CreateAdventureAsync(Guid userId, CreateAdventureData data, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the update.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="data">The data containing adventure details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An adventure associated with the specified ID.</returns>
    Task<Adventure?> UpdateAdventureAsync(Guid userId, Guid id, UpdateAdventureData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the deletion.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the adventure was deleted; otherwise, false.</returns>
    Task<bool> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing Adventure template, including nested Scenes, Stage data, and SceneAssets.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="templateId">The ID of the adventure to clone.</param>
    /// <param name="data">The data for cloned adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The new cloned adventure.</returns>
    Task<Adventure?> CloneAdventureAsync(Guid userId, Guid templateId, CloneAdventureData data, CancellationToken ct = default);

    /// <summary>
    /// Gets all scenes for a specific adventure by ID.
    /// </summary>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of scenes associated with the specified adventure.</returns>
    Task<Scene[]> GetScenesAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new scene to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="data">The data for the new scene.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the scene was added; otherwise, false.</returns>
    Task<bool> CreateSceneAsync(Guid userId, Guid id, CreateSceneData data, CancellationToken ct = default);

    /// <summary>
    /// Adds a cloned scene to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="data">The data for the cloned scene.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the scene was added; otherwise, false.</returns>
    Task<bool> AddClonedSceneAsync(Guid userId, Guid id, AddClonedSceneData data, CancellationToken ct = default);

    /// <summary>
    /// Removes an scene to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="sceneId">The ID of the scene.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>True if the scene was removed; otherwise, false.</returns>
    Task<bool> RemoveSceneAsync(Guid userId, Guid id, Guid sceneId, CancellationToken ct = default);
}