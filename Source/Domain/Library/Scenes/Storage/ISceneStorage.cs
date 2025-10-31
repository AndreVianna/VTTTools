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
    /// Updates a scene asset.
    /// </summary>
    Task<bool> UpdateAsync(Guid id, SceneAsset sceneAsset, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene Wall by its ID.
    /// </summary>
    Task<SceneWall?> GetWallByIdAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a scene Wall to a scene.
    /// </summary>
    Task<bool> AddWallAsync(Guid id, SceneWall sceneWall, CancellationToken ct = default);

    /// <summary>
    /// Updates a scene Wall.
    /// </summary>
    Task<bool> UpdateWallAsync(Guid id, SceneWall sceneWall, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene Wall.
    /// </summary>
    Task<bool> DeleteWallAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene region by its ID.
    /// </summary>
    Task<SceneRegion?> GetRegionByIdAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a scene region to a scene.
    /// </summary>
    Task<bool> AddRegionAsync(Guid id, SceneRegion sceneRegion, CancellationToken ct = default);

    /// <summary>
    /// Updates a scene region.
    /// </summary>
    Task<bool> UpdateRegionAsync(Guid id, SceneRegion sceneRegion, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene region.
    /// </summary>
    Task<bool> DeleteRegionAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene source by its ID.
    /// </summary>
    Task<SceneSource?> GetSourceByIdAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a scene source to a scene.
    /// </summary>
    Task<bool> AddSourceAsync(Guid id, SceneSource sceneSource, CancellationToken ct = default);

    /// <summary>
    /// Updates a scene source.
    /// </summary>
    Task<bool> UpdateSourceAsync(Guid id, SceneSource sceneSource, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene source.
    /// </summary>
    Task<bool> DeleteSourceAsync(Guid id, uint index, CancellationToken ct = default);
}