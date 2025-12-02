using AddAssetData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetAddData;
using AddWallData = VttTools.Library.Encounters.ServiceContracts.EncounterWallAddData;
using AddRegionData = VttTools.Library.Encounters.ServiceContracts.EncounterRegionAddData;
using AddLightSourceData = VttTools.Library.Encounters.ServiceContracts.EncounterLightSourceAddData;
using AddSoundSourceData = VttTools.Library.Encounters.ServiceContracts.EncounterSoundSourceAddData;

using BulkUpdateAssetsData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetBulkUpdateData;

using UpdateAssetData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetUpdateData;
using UpdateWallData = VttTools.Library.Encounters.ServiceContracts.EncounterWallUpdateData;
using UpdateRegionData = VttTools.Library.Encounters.ServiceContracts.EncounterRegionUpdateData;
using UpdateLightSourceData = VttTools.Library.Encounters.ServiceContracts.EncounterLightSourceUpdateData;
using UpdateSoundSourceData = VttTools.Library.Encounters.ServiceContracts.EncounterSoundSourceUpdateData;

namespace VttTools.Library.Encounters.Services;

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

    Task<Result<EncounterRegion>> AddRegionAsync(Guid userId, Guid id, AddRegionData data, CancellationToken ct = default);
    Task<Result> UpdateRegionAsync(Guid userId, Guid id, uint index, UpdateRegionData data, CancellationToken ct = default);
    Task<Result> RemoveRegionAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<EncounterLightSource>> AddLightSourceAsync(Guid userId, Guid id, AddLightSourceData data, CancellationToken ct = default);
    Task<Result> UpdateLightSourceAsync(Guid userId, Guid id, uint index, UpdateLightSourceData data, CancellationToken ct = default);
    Task<Result> RemoveLightSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);

    Task<Result<EncounterSoundSource>> AddSoundSourceAsync(Guid userId, Guid id, AddSoundSourceData data, CancellationToken ct = default);
    Task<Result> UpdateSoundSourceAsync(Guid userId, Guid id, uint index, UpdateSoundSourceData data, CancellationToken ct = default);
    Task<Result> RemoveSoundSourceAsync(Guid userId, Guid id, uint index, CancellationToken ct = default);
}