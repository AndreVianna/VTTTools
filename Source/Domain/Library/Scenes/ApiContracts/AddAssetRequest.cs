namespace VttTools.Library.Scenes.ApiContracts;

public record AddAssetRequest {
    public Guid Id { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Scale { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
}