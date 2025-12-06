namespace VttTools.Assets.Model;

public sealed record AssetClassification(
    AssetKind Kind,
    string Category,
    string Type,
    string? Subtype);