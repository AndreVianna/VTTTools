namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallResponse {
    public uint Index { get; init; }
    public List<EncounterWallSegment> Segments { get; init; } = [];
}
