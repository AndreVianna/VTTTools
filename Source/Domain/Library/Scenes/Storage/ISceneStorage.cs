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
    /// Retrieves an scene by its ID.
    /// </summary>
    Task<Scene?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new scene template.
    /// </summary>
    Task<Scene> AddAsync(Scene scene, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing scene template.
    /// </summary>
    Task<Scene?> UpdateAsync(Scene scene, CancellationToken ct = default);

    /// <summary>
    /// Deletes an scene template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}