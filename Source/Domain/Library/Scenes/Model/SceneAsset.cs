namespace VttTools.Library.Scenes.Model;

public record SceneAsset : Asset {
    public uint Number { get; init; }
    public Point Position { get; init; }
    public float Scale { get; init; } = 1;
    public float Rotation { get; init; }
    public float Elevation { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ControlledBy { get; init; }
}