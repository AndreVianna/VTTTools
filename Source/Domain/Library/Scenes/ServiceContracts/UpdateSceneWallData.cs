namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneWallData {
    public Optional<string> Name { get; init; }
    public Optional<List<Pole>> Poles { get; init; }
    public Optional<WallVisibility> Visibility { get; init; }
    public Optional<bool> IsClosed { get; init; }
    public Optional<string?> Material { get; init; }
}