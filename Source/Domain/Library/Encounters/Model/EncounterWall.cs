namespace VttTools.Library.Encounters.Model;

public record EncounterWall {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public IReadOnlyList<EncounterWallSegment> Segments { get; init; } = [];
}