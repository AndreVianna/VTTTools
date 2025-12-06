namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallAddRequest {
    [MaxLength(128)]
    public List<EncounterWallSegment> Segments { get; init; } = [];
}