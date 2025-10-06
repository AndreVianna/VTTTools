namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneAssetRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid> ResourceId { get; set; }
    public Optional<Point> Position { get; init; }
    public Optional<Size> Size { get; init; }
    public Optional<Frame?> Frame { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }
}