using BulkUpdateSceneAssetsData = VttTools.Library.Scenes.ServiceContracts.BulkUpdateSceneAssetsData;
using UpdateSceneAssetData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneAssetData;

namespace VttTools.Library.Scenes.Services;

public record AssetToAdd(Guid AssetId, AddSceneAssetData Data);

public interface ISceneService {
    Task<Scene[]> GetScenesAsync(CancellationToken ct = default);
    Task<Scene?> GetSceneByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Scene>> CreateSceneAsync(Guid userId, CreateSceneData data, CancellationToken ct = default);
    Task<Result> UpdateSceneAsync(Guid userId, Guid id, UpdateSceneData data, CancellationToken ct = default);
    Task<Result> DeleteSceneAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default);
    Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, AddSceneAssetData data, CancellationToken ct = default);
    Task<Result<SceneAsset>> CloneAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);
    Task<Result> UpdateAssetAsync(Guid userId, Guid id, int index, UpdateSceneAssetData data, CancellationToken ct = default);
    Task<Result> BulkUpdateAssetsAsync(Guid userId, Guid id, BulkUpdateSceneAssetsData data, CancellationToken ct = default);
    Task<Result> BulkCloneAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkDeleteAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkAddAssetsAsync(Guid userId, Guid id, List<AssetToAdd> assetsToAdd, CancellationToken ct = default);
    Task<Result> RemoveAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);
}