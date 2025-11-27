namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallUpdateRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }
    public Optional<WallVisibility> Visibility { get; init; }
    public Optional<bool> IsClosed { get; init; }
    [MaxLength(16)]
    public Optional<string?> Color { get; init; }
    public Optional<List<Pole>> Poles { get; init; }
}