namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterWallUpdateData
    : Data {
    public Optional<List<EncounterWallSegment>> Segments { get; init; }
}