namespace VttTools.Library.Scenes.ApiContracts;

public record AddClonedSceneAssetRequest
    : CloneAssetRequest {
    public Optional<double> Scale { get; init; } = Optional<double>.None;
    public Optional<Position> Position { get; init; } = Optional<Position>.None;
}
