namespace VttTools.Data.Library.Entities;

/// <summary>
/// EF Core entity for effect placement instances on scenes
/// </summary>
public class SceneEffect {
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public uint Index { get; set; }
    public Guid EffectId { get; set; }
    public Effect Effect { get; set; } = null!;

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public Point Origin { get; set; } = Point.Zero;  // Stored as ComplexProperty
    public float? Size { get; set; }
    public float? Direction { get; set; }
}