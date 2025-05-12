namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneAssetRequest
    : Request {
    public Optional<string> Name { get; init; } = Optional<string>.None;
    public Optional<double> Scale { get; init; } = Optional<double>.None;
    public Optional<Position> Position { get; init; } = Optional<Position>.None;
}