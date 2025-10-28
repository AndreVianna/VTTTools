namespace VttTools.Library.Scenes.Model;

public record Barrier {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    public bool IsOpaque { get; init; } = true;
    public bool IsSolid { get; init; } = true;
    public bool IsSecret { get; init; }
    public bool IsOpenable { get; init; }
    public bool IsLocked { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
