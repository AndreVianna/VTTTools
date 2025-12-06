namespace VttTools.Data.Media.Entities;

public class ResourceClassification {
    [MaxLength(64)]
    public string Kind { get; set; } = string.Empty;
    [MaxLength(64)]
    public string Category { get; set; } = string.Empty;
    [MaxLength(64)]
    public string Type { get; set; } = string.Empty;
    [MaxLength(64)]
    public string? Subtype { get; set; }
}