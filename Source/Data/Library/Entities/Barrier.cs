namespace VttTools.Data.Library.Entities;

public class Barrier {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }
    public bool IsOpaque { get; set; } = true;
    public bool IsSolid { get; set; } = true;
    public bool IsSecret { get; set; }
    public bool IsOpenable { get; set; }
    public bool IsLocked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
