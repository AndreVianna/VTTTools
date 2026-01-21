namespace VttTools.Data.Library.Stages.Entities;

public class StageWall {
    public Guid StageId { get; set; }
    public Stage Stage { get; set; } = null!;
    public ushort Index { get; set; }
    public List<StageWallSegment> Segments { get; set; } = [];
}