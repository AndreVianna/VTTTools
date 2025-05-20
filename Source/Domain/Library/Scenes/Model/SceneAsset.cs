namespace VttTools.Library.Scenes.Model;

public record SceneAsset : Asset {
    public uint Number { get; init; }
    public Vector2 Position { get; init; }
    public Vector2 Scale { get; init; } = new(1.0f, 1.0f);
    public float Rotation { get; init; }
    public float Elevation { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ControlledBy { get; init; }
}