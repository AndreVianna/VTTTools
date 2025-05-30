namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateAssetRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Scale { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }
}