
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterRegionAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public List<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}