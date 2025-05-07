namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneAssetRequest
    : Request {
    public Optional<Position> Position { get; init; } = Optional<Position>.None;
}