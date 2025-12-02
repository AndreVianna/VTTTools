namespace VttTools.Data.Library.Entities;

public class EncounterWall {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public uint Index { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public List<EncounterWallSegment> Segments { get; set; } = [];
}