namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallUpdateRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }
    public Optional<List<EncounterWallSegment>> Segments { get; init; }
}
