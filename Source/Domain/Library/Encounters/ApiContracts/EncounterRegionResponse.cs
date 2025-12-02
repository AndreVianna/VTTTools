
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterRegionResponse {
    public string Name { get; init; } = string.Empty;
    public uint Index { get; init; }
    public string Type { get; init; } = string.Empty;
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}