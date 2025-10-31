namespace VttTools.Library.Scenes.ApiContracts;

public record AddSceneWallRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public WallVisibility Visibility { get; init; } = WallVisibility.Normal;
    public bool IsClosed { get; init; }
    [MaxLength(64)]
    public string? Material { get; init; }
    public List<Pole> Poles { get; init; } = [];
}