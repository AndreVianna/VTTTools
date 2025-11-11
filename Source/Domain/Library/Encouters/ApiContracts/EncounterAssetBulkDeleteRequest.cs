namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkDeleteRequest : Request {
    public required List<uint> Indices { get; init; }
}