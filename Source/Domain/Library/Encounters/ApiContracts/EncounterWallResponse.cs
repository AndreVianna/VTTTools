namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterWallResponse {
    public string Name { get; init; } = string.Empty;
    public uint Index { get; init; }
    public WallVisibility Visibility { get; init; }
    public bool IsClosed { get; init; }
    public List<Pole> Poles { get; init; } = [];
    public string? Color { get; init; }
}