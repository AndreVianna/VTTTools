
namespace VttTools.Data.Library.Entities;

public class SceneSource {
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public uint Index { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(16)]
    public string Type { get; set; } = string.Empty;
    public Point Position { get; set; } = Point.Zero;
    public float Direction { get; set; }
    public float? Range { get; set; }
    public float? Intensity { get; set; }
    public bool HasGradient { get; set; }
}