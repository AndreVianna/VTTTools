namespace VttTools.Library.Scenes.ApiContracts;

public record AddNewSceneAssetRequest
    : CreateAssetRequest {
    public Guid AssetId { get; init; }
    public double Scale { get; init; } = 1.0d;
    public Position Position { get; init; } = new();
}