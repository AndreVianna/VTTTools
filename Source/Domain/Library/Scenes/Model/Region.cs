namespace VttTools.Library.Scenes.Model;

public record Region {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    [MaxLength(64)]
    public string RegionType { get; init; } = string.Empty;
    public IReadOnlyDictionary<int, string> LabelMap { get; init; } = new Dictionary<int, string>();
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}