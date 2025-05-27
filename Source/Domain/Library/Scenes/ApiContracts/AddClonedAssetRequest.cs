namespace VttTools.Library.Scenes.ApiContracts;

public record AddClonedAssetRequest
    : CloneAssetRequest {
    public Optional<Point> Position { get; init; }
    public Optional<float> Scale { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
}
