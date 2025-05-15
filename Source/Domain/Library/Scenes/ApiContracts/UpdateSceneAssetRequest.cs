namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneAssetRequest
    : Request {
    public Guid AssetId { get; init; }
    public uint Number { get; init; }
    public Optional<string> Name { get; init; } = Optional<string>.None;
    public Optional<double> Scale { get; init; } = Optional<double>.None;
    public Optional<Position> Position { get; init; } = Optional<Position>.None;
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }
}
