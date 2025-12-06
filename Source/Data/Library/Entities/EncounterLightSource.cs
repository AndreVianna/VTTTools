namespace VttTools.Data.Library.Entities;

public class EncounterLightSource {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public uint Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public LightSourceType Type { get; set; }
    public Point Position { get; set; } = Point.Zero;
    public float Range { get; set; }
    public float? Direction { get; set; }
    public float? Arc { get; set; }
    public bool IsOn { get; set; }

    [MaxLength(16)]
    public string? Color { get; set; }
}