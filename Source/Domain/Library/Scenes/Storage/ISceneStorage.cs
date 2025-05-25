namespace VttTools.Library.Scenes.Storage;

/// <summary>
/// Storage interface for Scene entities.
/// </summary>
public interface ISceneStorage {
    /// <summary>
    /// Retrieves all scenes
    /// </summary>
    Task<Scene[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all scenes
    /// </summary>
    Task<Scene[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene by its ID.
    /// </summary>
    Task<Scene?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new scene to an adventure.
    /// </summary>
    Task AddAsync(Scene scene, Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new standalone scene template.
    /// </summary>
    Task AddAsync(Scene scene, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing scene associated to an adventure.
    /// </summary>
    Task<bool> UpdateAsync(Scene scene, Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Updates a standalone scene template.
    /// </summary>
    Task<bool> UpdateAsync(Scene scene, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}