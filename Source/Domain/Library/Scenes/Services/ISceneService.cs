using AddRegionData = VttTools.Library.Scenes.ServiceContracts.AddSceneRegionData;
using AddSourceData = VttTools.Library.Scenes.ServiceContracts.AddSceneSourceData;
using AddWallData = VttTools.Library.Scenes.ServiceContracts.AddSceneWallData;
using BulkUpdateAssetsData = VttTools.Library.Scenes.ServiceContracts.BulkUpdateSceneAssetsData;
using UpdateRegionData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneRegionData;
using UpdateSceneAssetData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneAssetData;
using UpdateSourceData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneSourceData;
using UpdateWallData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneWallData;

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
    Task<Result> BulkUpdateAssetsAsync(Guid userId, Guid id, BulkUpdateAssetsData data, CancellationToken ct = default);
    Task<Result> BulkCloneAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkDeleteAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkAddAssetsAsync(Guid userId, Guid id, List<AssetToAdd> assetsToAdd, CancellationToken ct = default);
    Task<Result> RemoveAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);

    Task<Result<SceneWall>> AddWallAsync(Guid userId, Guid id, AddSceneWallData data, CancellationToken ct = default);
    Task<Result> UpdateWallAsync(Guid userId, Guid id, uint index, UpdateWallData data, CancellationToken ct = default);
    Task<Result> RemoveWallAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<SceneRegion>> AddRegionAsync(Guid userId, Guid id, AddRegionData data, CancellationToken ct = default);
    Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, UpdateRegionData data, CancellationToken ct = default);
    Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<SceneSource>> AddSourceAsync(Guid userId, Guid id, AddSourceData data, CancellationToken ct = default);
    Task<Result> UpdateSourceAsync(Guid userId, Guid id, uint index, UpdateSourceData data, CancellationToken ct = default);
    Task<Result> RemoveSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);
}