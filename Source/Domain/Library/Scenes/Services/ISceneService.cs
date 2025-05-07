namespace VttTools.Library.Scenes.Services;

public interface ISceneService {
    /// <summary>
    /// Gets a specific scene by ID.
    /// </summary>
    Task<Scene[]> GetScenesAsync(CancellationToken ct = default);

    /// <summary>
    /// Gets a specific scene by ID.
    /// </summary>
    Task<Scene?> GetSceneByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing scene template.
    /// </summary>
    Task<Scene?> UpdateSceneAsync(Guid userId, Guid id, UpdateSceneRequest data, CancellationToken ct = default);

    Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default);

    Task<bool> AddAssetAsync(Guid userId, Guid id, AddSceneAssetData data, CancellationToken ct = default);

    Task<bool> UpdateAssetAsync(Guid userId, Guid id, Guid assetId, UpdateSceneAssetData data, CancellationToken ct = default);

    Task<bool> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, CancellationToken ct = default);
}