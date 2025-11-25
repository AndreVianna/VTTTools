namespace VttTools.Data.Media.Entities;

public class ResourceFeature {
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    [MaxLength(32)]
    public string Key { get; set; } = string.Empty;
    public int Index { get; set; }
    [MaxLength(128)]
    public string Value { get; set; } = string.Empty;
}
