
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterSourceAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public Point Position { get; init; } = Point.Zero;
    public bool IsDirectional { get; init; }
    public float Direction { get; init; }
    public float Range { get; init; }
    public float Spread { get; init; }
    public bool HasGradient { get; init; }
    public float Intensity { get; init; }
}