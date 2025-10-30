namespace VttTools.Library.Scenes.ApiContracts;

public record CreateBarrierRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    public WallVisibility Visibility { get; init; } = WallVisibility.Normal;
    public bool IsClosed { get; init; }
    [MaxLength(64)]
    public string? Material { get; init; }
}