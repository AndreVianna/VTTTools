namespace VttTools.Library.Scenes.ApiContracts;

public record BarrierResponse {
    public Guid Id { get; init; }
    public Guid OwnerId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public IReadOnlyList<Pole> Poles { get; init; } = [];
    public WallVisibility Visibility { get; init; }
    public bool IsClosed { get; init; }
    public string? Material { get; init; }
    public DateTime CreatedAt { get; init; }
}