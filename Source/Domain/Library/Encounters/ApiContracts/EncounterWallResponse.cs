namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallResponse {
    public string Name { get; init; } = string.Empty;
    public uint Index { get; init; }
    public List<EncounterWallSegment> Segments { get; init; } = [];
}
