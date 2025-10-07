namespace VttTools.Data.Library.Entities;

/// <summary>
/// EF Core entity for structure placement instances on scenes
/// </summary>
public class SceneStructure {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Guid StructureId { get; set; }
    public Structure Structure { get; set; } = null!;
    // Vertices stored as JSON (List<Point>)
    public List<Point> Vertices { get; set; } = new();
    public bool? IsOpen { get; set; }
    public bool? IsLocked { get; set; }
    public bool? IsSecret { get; set; }
}
