namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneWallRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; } = string.Empty;
    public Optional<WallVisibility> Visibility { get; init; } = WallVisibility.Normal;
    public Optional<bool> IsClosed { get; init; }
    [MaxLength(64)]
    public Optional<string?> Material { get; init; }
    public Optional<List<Pole>> Poles { get; init; }
}