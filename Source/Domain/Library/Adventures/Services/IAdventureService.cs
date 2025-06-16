namespace VttTools.Library.Adventures.Services;

/// <summary>
/// Service for retrieving and managing Adventures and their Scenes.
/// </summary>
public interface IAdventureService {
    /// <summary>
    /// Gets all adventures templates.
    /// </summary>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of adventure templates.</returns>
    Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets owned adventures templates.
    /// </summary>
    /// <param name="filterDefinition">The definition of the filter to apply.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of adventure templates.</returns>
    Task<Adventure[]> GetAdventuresAsync(string filterDefinition, CancellationToken ct = default);

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
    /// <returns>The result of the operation that may contain the created adventure when successful or the errors if the operation fails.</returns>
    Task<Result<Adventure>> CreateAdventureAsync(Guid userId, CreateAdventureData data, CancellationToken ct = default);

    /// <summary>
    /// Deep-clones an existing Adventure template, including nested Scenes, Stage data, and SceneAssets.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="templateId">The id of the adventure to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned adventure when successful or the errors if the operation fails.</returns>
    Task<Result<Adventure>> CloneAdventureAsync(Guid userId, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the update.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="data">The data containing adventure details.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the updated adventure when successful or the errors if the operation fails.</returns>
    Task<Result<Adventure>> UpdateAdventureAsync(Guid userId, Guid id, UpdatedAdventureData data, CancellationToken ct = default);

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the deletion.</param>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation, it can be successful or contain errors if the operation fails.</returns>
    Task<Result> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Gets all scenes for a specific adventure by ID.
    /// </summary>
    /// <param name="id">The ID of the adventure.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>An array of scenes associated with the specified adventure.</returns>
    Task<Scene[]> GetScenesAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new scene to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure that will contain the new scene.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the new scene when successful or the errors if the operation fails.</returns>
    Task<Result<Scene>> AddNewSceneAsync(Guid userId, Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a cloned scene to a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the clone.</param>
    /// <param name="id">The ID of the adventure that will contain the new scene.</param>
    /// <param name="templateId">The id of the scene to be cloned.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation that may contain the cloned scene when successful or the errors if the operation fails.</returns>
    Task<Result<Scene>> AddClonedSceneAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);

    /// <summary>
    /// Removes a scene from a specific adventure by ID.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the removal.</param>
    /// <param name="id">The ID of the adventure to be removed.</param>
    /// <param name="sceneId">The ID of the scene.</param>
    /// <param name="ct">Cancellation token for async operations.</param>
    /// <returns>The result of the operation indicating if the scene was removed or an error.</returns>
    Task<Result> RemoveSceneAsync(Guid userId, Guid id, Guid sceneId, CancellationToken ct = default);
}