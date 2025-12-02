namespace VttTools.Library.Encounters.Model;

public record EncounterWallSegment {
    public uint Index { get; init; }
    public Pole StartPole { get; init; } = new(0, 0, 0);
    public Pole EndPole { get; init; } = new(0, 0, 0);
    public SegmentType Type { get; init; }
    public SegmentState State { get; init; }
}