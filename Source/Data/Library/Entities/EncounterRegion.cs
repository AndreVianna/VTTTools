
namespace VttTools.Data.Library.Entities;

public class EncounterRegion {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public ushort Index { get; set; }
    [MaxLength(128)]

    public string? Name { get; set; }

    public RegionType Type { get; set; }
    public ICollection<EncounterRegionVertex> Vertices { get; set; } = [];
    public int Value { get; set; }
}