namespace VttTools.Library.Scenes.ApiContracts;

public record SceneBarrierResponse {
    public Guid Id { get; init; }
    public Guid SceneId { get; init; }
    public Guid BarrierId { get; init; }
    public string BarrierName { get; init; } = string.Empty;
    public WallVisibility Visibility { get; init; }
    public bool IsClosed { get; init; }
    public List<Pole> Poles { get; init; } = [];
    public string? Material { get; init; }
}