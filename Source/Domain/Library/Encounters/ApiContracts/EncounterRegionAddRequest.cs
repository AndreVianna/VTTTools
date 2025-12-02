
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterRegionAddRequest {
    [MaxLength(128)]
    public string? Name { get; init; }
    public RegionType Type { get; init; }
    public List<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}