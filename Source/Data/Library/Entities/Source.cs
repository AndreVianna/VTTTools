namespace VttTools.Data.Library.Entities;

public class Source {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; set; }
    [MaxLength(64)]
    public string SourceType { get; set; } = string.Empty;
    public decimal DefaultRange { get; set; } = 5.0m;
    public decimal DefaultIntensity { get; set; } = 1.0m;
    public bool DefaultIsGradient { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
