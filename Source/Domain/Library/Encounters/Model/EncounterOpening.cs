namespace VttTools.Library.Encounters.Model;

public record EncounterOpening {
    public uint Index { get; init; }

    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    [MaxLength(512)]
    public string? Description { get; init; }

    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;

    public uint WallIndex { get; init; }
    public uint StartPoleIndex { get; init; }
    public uint EndPoleIndex { get; init; }

    public Dimension Size { get; init; } = Dimension.Zero;

    public OpeningVisibility Visibility { get; init; }
    public OpeningState State { get; init; }
    public OpeningOpacity Opacity { get; init; }

    [MaxLength(32)]
    public string? Material { get; init; }

    [MaxLength(16)]
    public string? Color { get; init; }
}
