namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneWallRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }
    public Optional<WallVisibility> Visibility { get; init; }
    public Optional<bool> IsClosed { get; init; }
    [MaxLength(32)]
    public Optional<string?> Material { get; init; }
    [MaxLength(16)]
    public Optional<string?> Color { get; init; }
    public Optional<List<Pole>> Poles { get; init; }
}