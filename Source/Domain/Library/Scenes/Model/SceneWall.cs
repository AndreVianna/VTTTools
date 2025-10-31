namespace VttTools.Library.Scenes.Model;

public record SceneWall {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public IReadOnlyList<Pole> Poles { get; init; } = [];
    public WallVisibility Visibility { get; init; }
    public bool IsClosed { get; init; }
    [MaxLength(32)]
    public string? Material { get; init; }
}