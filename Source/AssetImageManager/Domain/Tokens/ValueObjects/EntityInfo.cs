namespace VttTools.AssetImageManager.Domain.Tokens.ValueObjects;

public sealed record EntityInfo(
    string Genre,
    string Category,
    string Type,
    string Subtype,
    string Name,
    IReadOnlyList<VariantInfo> Variants
);
