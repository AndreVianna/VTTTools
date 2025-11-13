namespace VttTools.Data.Library.Entities;

using VttTools.Library.Encounters.Model;

public class EncounterOpening {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public uint Index { get; set; }

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(512)]
    public string? Description { get; set; }

    [MaxLength(32)]
    public string Type { get; set; } = string.Empty;

    public uint WallIndex { get; set; }
    public uint StartPoleIndex { get; set; }
    public uint EndPoleIndex { get; set; }

    public double Width { get; set; }
    public double Height { get; set; }

    public OpeningVisibility Visibility { get; set; }
    public OpeningState State { get; set; }
    public OpeningOpacity Opacity { get; set; }

    [MaxLength(32)]
    public string? Material { get; set; }

    [MaxLength(16)]
    public string? Color { get; set; }
}
