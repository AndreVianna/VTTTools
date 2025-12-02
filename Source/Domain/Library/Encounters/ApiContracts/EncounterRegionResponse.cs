
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterRegionResponse {
    public string? Name { get; init; }
    public uint Index { get; init; }
    public RegionType Type { get; init; }
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}