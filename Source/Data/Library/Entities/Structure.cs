using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

/// <summary>
/// EF Core entity for reusable structure templates (walls, doors, windows, gates)
/// </summary>
public class Structure {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }
    public bool IsBlocking { get; set; } = true;
    public bool IsOpaque { get; set; } = true;
    public bool IsSecret { get; set; }
    public bool IsOpenable { get; set; }
    public bool IsLocked { get; set; }
    public Guid? VisualResourceId { get; set; }
    public Resource? Visual { get; set; }
    public DateTime CreatedAt { get; set; }
}