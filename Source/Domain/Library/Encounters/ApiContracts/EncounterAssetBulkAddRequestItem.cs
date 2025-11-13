namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkAddRequestItem
    : EncounterAssetAddRequest {
    public Guid Id { get; init; }
}