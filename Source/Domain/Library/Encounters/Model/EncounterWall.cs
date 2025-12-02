namespace VttTools.Library.Encounters.Model;

public record EncounterWall {
    public uint Index { get; init; }
    public IReadOnlyList<EncounterWallSegment> Segments { get; init; } = [];
}