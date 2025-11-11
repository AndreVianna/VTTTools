namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public WallVisibility Visibility { get; init; } = WallVisibility.Normal;
    public bool IsClosed { get; init; }
    [MaxLength(32)]
    public string? Material { get; init; }
    [MaxLength(16)]
    public string? Color { get; init; }
    public List<Pole> Poles { get; init; } = [];
}