namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkCloneRequest : Request {
    public required List<uint> Indices { get; init; }
}