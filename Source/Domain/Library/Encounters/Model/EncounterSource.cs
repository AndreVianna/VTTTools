
namespace VttTools.Library.Encounters.Model;

public record EncounterSource {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;
    public Point Position { get; set; } = Point.Zero;
    public bool IsDirectional { get; init; }
    public float Direction { get; init; }
    public float Range { get; init; }
    public float Spread { get; init; }
    public bool HasGradient { get; init; }
    public float Intensity { get; init; } = 100.0f;
}