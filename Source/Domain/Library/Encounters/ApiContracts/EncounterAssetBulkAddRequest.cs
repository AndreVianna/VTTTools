namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkAddRequest : Request {
    public required List<EncounterAssetBulkAddRequestItem> Assets { get; init; }
}