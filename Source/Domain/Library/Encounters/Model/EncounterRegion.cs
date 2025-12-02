
namespace VttTools.Library.Encounters.Model;

public record EncounterRegion {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string? Name { get; init; }

    public RegionType Type { get; init; }

    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}