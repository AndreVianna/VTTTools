namespace VttTools.Data.Library.Entities;

public class Region {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }
    [MaxLength(64)]
    public string RegionType { get; set; } = string.Empty;
    public Dictionary<int, string> LabelMap { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
