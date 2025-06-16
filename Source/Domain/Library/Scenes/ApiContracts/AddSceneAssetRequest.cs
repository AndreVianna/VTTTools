namespace VttTools.Library.Scenes.ApiContracts;

public record AddSceneAssetRequest {
    public Optional<string> Name { get; init; }
    public Point Position { get; init; }
    public Size Size { get; init; }
    public Frame? Frame { get; init; }
    public float Rotation { get; init; }
    public float Elevation { get; init; }
}