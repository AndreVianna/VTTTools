namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterWallAddData
    : Data {
    public string Name { get; init; } = string.Empty;
    public required List<EncounterWallSegment> Segments { get; init; }
}