namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkCloneRequest
    : Request {
    public required List<ushort> Indices { get; init; }
}