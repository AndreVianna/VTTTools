namespace VttTools.WebApp.Contracts.Library.Scenes;

public record SceneAssetDetails
    : AssetDetails {
    public uint Number { get; init; }
    public Point Position { get; init; }
    public Size Size { get; init; }
    public float Rotation { get; init; }
    public float Elevation { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ControlledBy { get; init; }
}