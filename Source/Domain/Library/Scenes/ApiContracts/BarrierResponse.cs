namespace VttTools.Library.Scenes.ApiContracts;

public record BarrierResponse {
    public Guid Id { get; init; }
    public Guid OwnerId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsOpaque { get; init; }
    public bool IsSolid { get; init; }
    public bool IsSecret { get; init; }
    public bool IsOpenable { get; init; }
    public bool IsLocked { get; init; }
    public DateTime CreatedAt { get; init; }
}
