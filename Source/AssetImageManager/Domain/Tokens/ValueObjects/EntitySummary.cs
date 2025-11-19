namespace VttTools.AssetImageManager.Domain.Tokens.ValueObjects;

public sealed record EntitySummary(
    string Genre,
    string Category,
    string Type,
    string Subtype,
    string Name,
    int VariantCount,
    int TotalPoseCount
);
