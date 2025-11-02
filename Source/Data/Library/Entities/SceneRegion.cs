
namespace VttTools.Data.Library.Entities;

public class SceneRegion {
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public uint Index { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(32)]
    public string Type { get; set; } = string.Empty;
    public List<Point> Vertices { get; set; } = [];
    public int? Value { get; set; }
    [MaxLength(32)]
    public string? Label { get; set; }
    [MaxLength(16)]
    public string? Color { get; set; }
}