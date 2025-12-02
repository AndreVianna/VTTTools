namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterWallAddData
    : Data {
    public required List<EncounterWallSegment> Segments { get; init; }
}