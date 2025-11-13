namespace VttTools.Library.Encounters.ApiContracts;

using VttTools.Common.Model;

public record EncounterOpeningAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    [MaxLength(512)]
    public string? Description { get; init; }

    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;

    public uint WallIndex { get; init; }
    public double CenterPosition { get; init; }

    public double Width { get; init; }
    public double Height { get; init; }

    public OpeningVisibility Visibility { get; init; } = OpeningVisibility.Visible;
    public OpeningState State { get; init; } = OpeningState.Closed;
    public OpeningOpacity Opacity { get; init; } = OpeningOpacity.Opaque;

    [MaxLength(32)]
    public string? Material { get; init; }

    [MaxLength(16)]
    public string? Color { get; init; }
}
