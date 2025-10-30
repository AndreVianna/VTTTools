namespace VttTools.Library.Scenes.Model;

public record Barrier {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    public IReadOnlyList<Pole> Poles { get; init; } = [];
    public WallVisibility Visibility { get; init; } = WallVisibility.Normal;
    public bool IsClosed { get; init; }
    [MaxLength(64)]
    public string? Material { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}