namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetBulkDeleteRequest
    : Request {
    public required List<ushort> Indices { get; init; }
}