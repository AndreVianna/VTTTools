namespace VttTools.Data.Library.Stages.Entities;

public class StageWallSegment {
    public Guid StageId { get; set; }
    public ushort WallIndex { get; set; }
    public StageWall Wall { get; set; } = null!;
    public ushort Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public Pole StartPole { get; set; } = new(0, 0, 0);
    public Pole EndPole { get; set; } = new(0, 0, 0);

    public SegmentType Type { get; set; }
    public bool IsOpaque { get; set; }
    public SegmentState State { get; set; }
}