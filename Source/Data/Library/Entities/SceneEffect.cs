namespace VttTools.Data.Library.Entities;

/// <summary>
/// EF Core entity for effect placement instances on scenes
/// </summary>
public class SceneEffect {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Guid EffectId { get; set; }
    public Effect Effect { get; set; } = null!;
    public Point Origin { get; set; }  // Stored as ComplexProperty
    public int? Size { get; set; }
    public int? Direction { get; set; }
}
