using UpdateAssetData = VttTools.Library.Scenes.ServiceContracts.UpdateAssetData;

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
    Task<Result<Scene>> UpdateSceneAsync(Guid userId, Guid id, UpdateSceneData data, CancellationToken ct = default);

    Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default);

    Task<Result<SceneAsset>> AddNewAssetAsync(Guid userId, Guid id, AddNewAssetData data, CancellationToken ct = default);
    Task<Result<SceneAsset>> AddClonedAssetAsync(Guid userId, Guid id, Guid templateId, AddClonedAssetData data, CancellationToken ct = default);

    Task<Result<SceneAsset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default);

    Task<Result> RemoveAssetAsync(Guid userId, Guid id, Guid assetId, int number, CancellationToken ct = default);
}