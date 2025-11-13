namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterOpeningResponse {
    public uint Index { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Type { get; init; } = string.Empty;

    public uint WallIndex { get; init; }
    public uint StartPoleIndex { get; init; }
    public uint EndPoleIndex { get; init; }

    public double Width { get; init; }
    public double Height { get; init; }

    public OpeningVisibility Visibility { get; init; }
    public OpeningState State { get; init; }
    public OpeningOpacity Opacity { get; init; }

    public string? Material { get; init; }
    public string? Color { get; init; }
}
