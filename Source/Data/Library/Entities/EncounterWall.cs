namespace VttTools.Data.Library.Entities;

public class EncounterWall {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public ushort Index { get; set; }
    public List<EncounterWallSegment> Segments { get; set; } = [];
}