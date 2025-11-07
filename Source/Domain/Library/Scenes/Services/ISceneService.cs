using AddAssetData = VttTools.Library.Scenes.ServiceContracts.SceneAssetAddData;
using AddRegionData = VttTools.Library.Scenes.ServiceContracts.SceneRegionAddData;
using AddSourceData = VttTools.Library.Scenes.ServiceContracts.SceneSourceAddData;
using AddWallData = VttTools.Library.Scenes.ServiceContracts.SceneWallAddData;
using BulkUpdateAssetsData = VttTools.Library.Scenes.ServiceContracts.SceneAssetBulkUpdateData;
using UpdateAssetData = VttTools.Library.Scenes.ServiceContracts.SceneAssetUpdateData;
using UpdateRegionData = VttTools.Library.Scenes.ServiceContracts.SceneRegionUpdateData;
using UpdateSourceData = VttTools.Library.Scenes.ServiceContracts.SceneSourceUpdateData;
using UpdateWallData = VttTools.Library.Scenes.ServiceContracts.SceneWallUpdateData;

namespace VttTools.Library.Scenes.Services;

public record AssetToAdd(Guid AssetId, AddAssetData Data);

public interface ISceneService {
    Task<Scene[]> GetScenesAsync(CancellationToken ct = default);
    Task<Scene?> GetSceneByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Scene>> CreateSceneAsync(Guid userId, SceneAddData data, CancellationToken ct = default);
    Task<Result> UpdateSceneAsync(Guid userId, Guid id, SceneUpdateData data, CancellationToken ct = default);
    Task<Result> DeleteSceneAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<SceneAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default);
    Task<Result<SceneAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, AddAssetData data, CancellationToken ct = default);
    Task<Result<SceneAsset>> CloneAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);
    Task<Result> UpdateAssetAsync(Guid userId, Guid id, int index, UpdateAssetData data, CancellationToken ct = default);
    Task<Result> BulkUpdateAssetsAsync(Guid userId, Guid id, BulkUpdateAssetsData data, CancellationToken ct = default);
    Task<Result> BulkCloneAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkDeleteAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkAddAssetsAsync(Guid userId, Guid id, List<AssetToAdd> assetsToAdd, CancellationToken ct = default);
    Task<Result> RemoveAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);

    Task<Result<SceneWall>> AddWallAsync(Guid userId, Guid id, AddWallData data, CancellationToken ct = default);
    Task<Result> UpdateWallAsync(Guid userId, Guid id, uint index, UpdateWallData data, CancellationToken ct = default);
    Task<Result> RemoveWallAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<SceneRegion>> AddRegionAsync(Guid userId, Guid id, AddRegionData data, CancellationToken ct = default);
    Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, UpdateRegionData data, CancellationToken ct = default);
    Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<SceneSource>> AddSourceAsync(Guid userId, Guid id, AddSourceData data, CancellationToken ct = default);
    Task<Result> UpdateSourceAsync(Guid userId, Guid id, uint index, UpdateSourceData data, CancellationToken ct = default);
    Task<Result> RemoveSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);
}