namespace VttTools.Library.Stages.Model;

public record StageWallSegment {
    public ushort Index { get; init; }
    public string? Name { get; init; }
    public Pole StartPole { get; init; } = new(0, 0, 0);

    public Pole EndPole { get; init; } = new(0, 0, 0);

    public SegmentType Type { get; init; }

    public bool IsOpaque { get; init; }

    public SegmentState State { get; init; }
}