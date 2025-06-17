namespace VttTools.Library.Scenes.Model;

public record SceneAsset : Asset {
    public uint Index { get; init; }
    public uint Number { get; init; }
    public Size Size { get; init; }
    public Point Position { get; init; }
    public float Rotation { get; init; }
    public Frame? Frame { get; init; }
    public float Elevation { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ControlledBy { get; init; }
}