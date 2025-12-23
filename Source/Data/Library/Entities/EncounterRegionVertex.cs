namespace VttTools.Data.Library.Entities;

public class EncounterRegionVertex {
    public Guid EncounterId { get; set; }
    public ushort RegionIndex { get; set; }
    public ushort Index { get; set; }
    public double X { get; set; }
    public double Y { get; set; }

    public EncounterRegion Region { get; set; } = null!;
}
