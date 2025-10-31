namespace VttTools.Library.Scenes.ApiContracts;

public record SceneWallResponse {
    public string Name { get; init; } = string.Empty;
    public uint Index { get; init; }
    public WallVisibility Visibility { get; init; }
    public bool IsClosed { get; init; }
    public List<Pole> Poles { get; init; } = [];
    public string? Material { get; init; }
    public string? Color { get; init; }
}