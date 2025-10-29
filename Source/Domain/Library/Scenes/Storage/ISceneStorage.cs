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
    Task<bool> UpdateAsync(SceneAsset sceneAsset, Guid sceneId, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene barrier by its ID.
    /// </summary>
    Task<SceneBarrier?> GetSceneBarrierByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a scene barrier to a scene.
    /// </summary>
    Task<bool> AddSceneBarrierAsync(SceneBarrier sceneBarrier, Guid sceneId, CancellationToken ct = default);

    /// <summary>
    /// Updates a scene barrier.
    /// </summary>
    Task<bool> UpdateSceneBarrierAsync(SceneBarrier sceneBarrier, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene barrier.
    /// </summary>
    Task<bool> DeleteSceneBarrierAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene region by its ID.
    /// </summary>
    Task<SceneRegion?> GetSceneRegionByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a scene region to a scene.
    /// </summary>
    Task<bool> AddSceneRegionAsync(SceneRegion sceneRegion, Guid sceneId, CancellationToken ct = default);

    /// <summary>
    /// Updates a scene region.
    /// </summary>
    Task<bool> UpdateSceneRegionAsync(SceneRegion sceneRegion, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene region.
    /// </summary>
    Task<bool> DeleteSceneRegionAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a scene source by its ID.
    /// </summary>
    Task<SceneSource?> GetSceneSourceByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a scene source to a scene.
    /// </summary>
    Task<bool> AddSceneSourceAsync(SceneSource sceneSource, Guid sceneId, CancellationToken ct = default);

    /// <summary>
    /// Updates a scene source.
    /// </summary>
    Task<bool> UpdateSceneSourceAsync(SceneSource sceneSource, CancellationToken ct = default);

    /// <summary>
    /// Deletes a scene source.
    /// </summary>
    Task<bool> DeleteSceneSourceAsync(Guid id, CancellationToken ct = default);
}