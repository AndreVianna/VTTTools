namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateAssetRequest
    : Request {
    public Guid AssetId { get; init; }
    public uint Number { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<Vector2> Position { get; init; }
    public Optional<Vector2> Scale { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }
}
