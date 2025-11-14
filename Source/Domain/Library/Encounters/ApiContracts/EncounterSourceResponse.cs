
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterSourceResponse {
    public string Name { get; init; } = string.Empty;
    public uint Index { get; init; }
    public string Type { get; init; } = string.Empty;
    public Point Position { get; init; } = Point.Zero;
    public bool IsDirectional { get; init; }
    public float Direction { get; init; }
    public float Spread { get; init; }
    public float Range { get; init; }
    public float Intensity { get; init; }
    public string? Color { get; init; }
    public bool HasGradient { get; init; }
}