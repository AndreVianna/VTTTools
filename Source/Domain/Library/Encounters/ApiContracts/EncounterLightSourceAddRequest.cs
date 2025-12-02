
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterLightSourceAddRequest {
    [MaxLength(128)]
    public string? Name { get; init; }
    public LightSourceType Type { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public float Range { get; init; }
    public float? Direction { get; init; }
    public float? Arc { get; init; }
    public string? Color { get; init; }
    public bool IsOn { get; init; }
}
