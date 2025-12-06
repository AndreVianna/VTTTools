namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkUpdateRequest : Request {
    public required List<EncounterAssetBulkUpdateRequestItem> Updates { get; init; }
}