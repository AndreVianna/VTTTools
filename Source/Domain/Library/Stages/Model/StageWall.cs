namespace VttTools.Library.Stages.Model;

public record StageWall {
    public ushort Index { get; init; }
    public string? Name { get; init; }
    public IReadOnlyList<StageWallSegment> Segments { get; init; } = [];
}