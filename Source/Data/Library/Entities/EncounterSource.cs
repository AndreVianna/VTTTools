
namespace VttTools.Data.Library.Entities;

public class EncounterSource {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public uint Index { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(16)]
    public string Type { get; set; } = string.Empty;
    public Point Position { get; set; } = Point.Zero;
    public bool IsDirectional { get; set; }
    public float Direction { get; set; }
    public float Range { get; set; }
    public float Spread { get; set; }
    public bool HasGradient { get; set; }
    public float Intensity { get; set; } = 100.0f;
    public string? Color { get; set; }
}