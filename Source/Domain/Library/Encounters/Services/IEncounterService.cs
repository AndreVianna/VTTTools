using AddAssetData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetAddData;
using AddOpeningData = VttTools.Library.Encounters.ServiceContracts.EncounterOpeningAddData;
using AddRegionData = VttTools.Library.Encounters.ServiceContracts.EncounterRegionAddData;
using AddSourceData = VttTools.Library.Encounters.ServiceContracts.EncounterSourceAddData;
using AddWallData = VttTools.Library.Encounters.ServiceContracts.EncounterWallAddData;
using BulkUpdateAssetsData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetBulkUpdateData;
using UpdateAssetData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetUpdateData;
using UpdateOpeningData = VttTools.Library.Encounters.ServiceContracts.EncounterOpeningUpdateData;
using UpdateRegionData = VttTools.Library.Encounters.ServiceContracts.EncounterRegionUpdateData;
using UpdateSourceData = VttTools.Library.Encounters.ServiceContracts.EncounterSourceUpdateData;
using UpdateWallData = VttTools.Library.Encounters.ServiceContracts.EncounterWallUpdateData;

namespace VttTools.Library.Encounters.Services;

public record AssetToAdd(Guid AssetId, AddAssetData Data);

public interface IEncounterService {
    Task<Encounter[]> GetEncountersAsync(CancellationToken ct = default);
    Task<Encounter?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Encounter>> CreateEncounterAsync(Guid userId, EncounterAddData data, CancellationToken ct = default);
    Task<Result> UpdateEncounterAsync(Guid userId, Guid id, EncounterUpdateData data, CancellationToken ct = default);
    Task<Result> DeleteEncounterAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<EncounterAsset[]> GetAssetsAsync(Guid id, CancellationToken ct = default);
    Task<Result<EncounterAsset>> AddAssetAsync(Guid userId, Guid id, Guid assetId, AddAssetData data, CancellationToken ct = default);
    Task<Result<EncounterAsset>> CloneAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);
    Task<Result> UpdateAssetAsync(Guid userId, Guid id, int index, UpdateAssetData data, CancellationToken ct = default);
    Task<Result> BulkUpdateAssetsAsync(Guid userId, Guid id, BulkUpdateAssetsData data, CancellationToken ct = default);
    Task<Result> BulkCloneAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkDeleteAssetsAsync(Guid userId, Guid id, List<uint> assetIndices, CancellationToken ct = default);
    Task<Result> BulkAddAssetsAsync(Guid userId, Guid id, List<AssetToAdd> assetsToAdd, CancellationToken ct = default);
    Task<Result> RemoveAssetAsync(Guid userId, Guid id, int index, CancellationToken ct = default);

    Task<Result<EncounterWall>> AddWallAsync(Guid userId, Guid id, AddWallData data, CancellationToken ct = default);
    Task<Result> UpdateWallAsync(Guid userId, Guid id, uint index, UpdateWallData data, CancellationToken ct = default);
    Task<Result> RemoveWallAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<EncounterOpening>> PlaceOpeningAsync(Guid userId, Guid id, AddOpeningData data, CancellationToken ct = default);
    Task<Result> UpdateOpeningAsync(Guid userId, Guid id, uint index, UpdateOpeningData data, CancellationToken ct = default);
    Task<Result> RemoveOpeningAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<EncounterRegion>> AddRegionAsync(Guid userId, Guid id, AddRegionData data, CancellationToken ct = default);
    Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, UpdateRegionData data, CancellationToken ct = default);
    Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<EncounterSource>> AddSourceAsync(Guid userId, Guid id, AddSourceData data, CancellationToken ct = default);
    Task<Result> UpdateSourceAsync(Guid userId, Guid id, uint index, UpdateSourceData data, CancellationToken ct = default);
    Task<Result> RemoveSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);
}