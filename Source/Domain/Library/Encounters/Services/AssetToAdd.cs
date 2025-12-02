using AddAssetData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetAddData;

namespace VttTools.Library.Encounters.Services;

public record AssetToAdd(Guid AssetId, AddAssetData Data);
