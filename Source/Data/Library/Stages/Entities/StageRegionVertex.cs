namespace VttTools.Data.Library.Stages.Entities;

public class StageRegionVertex {
    public Guid StageId { get; set; }
    public ushort RegionIndex { get; set; }
    public ushort Index { get; set; }
    public double X { get; set; }
    public double Y { get; set; }

    public StageRegion Region { get; set; } = null!;
}