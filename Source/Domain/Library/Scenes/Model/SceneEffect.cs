namespace VttTools.Library.Scenes.Model;

public record SceneEffect {
    public Guid EffectId { get; init; }
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public Point Origin { get; init; } = Point.Zero;
    public float? Size { get; init; }
    public float? Direction { get; init; }
}