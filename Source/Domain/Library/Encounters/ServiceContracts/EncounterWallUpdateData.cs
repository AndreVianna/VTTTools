namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterWallUpdateData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<List<EncounterWallSegment>> Segments { get; init; }
}