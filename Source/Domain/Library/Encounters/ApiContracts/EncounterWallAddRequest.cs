namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public List<EncounterWallSegment> Segments { get; init; } = [];
}
