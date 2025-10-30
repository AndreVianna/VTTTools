namespace VttTools.Data.Library.Entities;

public class Barrier {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }
    public List<Pole> Poles { get; set; } = [];
    public WallVisibility Visibility { get; set; } = WallVisibility.Normal;
    public bool IsClosed { get; set; }
    [MaxLength(64)]
    public string? Material { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}