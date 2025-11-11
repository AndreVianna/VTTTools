namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkUpdateRequestItem
    : EncounterAssetUpdateRequest {
    public required uint Index { get; init; }
}