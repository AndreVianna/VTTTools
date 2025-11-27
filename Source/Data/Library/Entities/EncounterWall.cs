namespace VttTools.Data.Library.Entities;

public class EncounterWall {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public uint Index { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public List<Pole> Poles { get; set; } = [];
    public WallVisibility Visibility { get; set; }
    public bool IsClosed { get; set; }
    [MaxLength(16)]
    public string? Color { get; set; }
}