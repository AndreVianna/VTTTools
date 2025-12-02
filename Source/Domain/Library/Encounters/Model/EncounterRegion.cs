
namespace VttTools.Library.Encounters.Model;

public record EncounterRegion {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}