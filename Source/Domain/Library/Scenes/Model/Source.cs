namespace VttTools.Library.Scenes.Model;

public record Source {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    [MaxLength(64)]
    public string SourceType { get; init; } = string.Empty;
    public decimal DefaultRange { get; init; } = 5.0m;
    public decimal DefaultIntensity { get; init; } = 1.0m;
    public bool DefaultIsGradient { get; init; } = true;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
