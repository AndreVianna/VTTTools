namespace VttTools.Data.Library.Stages.Entities;

public class StageRegion {
    public Guid StageId { get; set; }
    public Stage Stage { get; set; } = null!;
    public ushort Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public RegionType Type { get; set; }
    public ICollection<StageRegionVertex> Vertices { get; set; } = [];
    public int Value { get; set; }
}