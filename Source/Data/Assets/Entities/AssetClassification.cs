namespace VttTools.Data.Assets.Entities;

public sealed record AssetClassification {
    public AssetKind Kind { get; set; } = AssetKind.Undefined;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Subtype { get; set; }
}