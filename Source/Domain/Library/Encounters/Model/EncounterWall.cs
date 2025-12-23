namespace VttTools.Library.Encounters.Model;

public record EncounterWall {
    public ushort Index { get; init; }
    public IReadOnlyList<EncounterWallSegment> Segments { get; init; } = [];
}