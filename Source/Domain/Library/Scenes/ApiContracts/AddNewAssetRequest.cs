namespace VttTools.Library.Scenes.ApiContracts;

public record AddNewAssetRequest
    : CreateAssetRequest {
    public Optional<Vector2> Position { get; init; }
    public Optional<Vector2> Scale { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
}
