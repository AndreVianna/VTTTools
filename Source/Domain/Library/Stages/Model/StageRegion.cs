namespace VttTools.Library.Stages.Model;

public record StageRegion {
    public ushort Index { get; init; }
    public string? Name { get; init; }
    public RegionType Type { get; init; }
    public List<StageRegionVertex> Vertices { get; init; } = [];
    public int Value { get; init; }
}