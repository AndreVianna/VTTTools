namespace VttTools.Data.Library.Entities;

public class EncounterWallSegment {
    public Guid EncounterId { get; set; }
    public uint WallIndex { get; set; }
    public EncounterWall Wall { get; set; } = null!;
    public uint Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public Pole StartPole { get; set; } = new(0, 0, 0);
    public Pole EndPole { get; set; } = new(0, 0, 0);

    public SegmentType Type { get; set; }
    public bool IsOpaque { get; set; }
    public SegmentState State { get; set; }
}