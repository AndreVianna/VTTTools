namespace VttTools.AssetImageManager.Domain.Tokens.Models;

public sealed record TokenEntity(
    string Id,
    string Name,
    EntityType Type,
    string Category,
    string Subtype,
    string Size,
    string PhysicalDescription,
    string? DistinctiveFeatures,
    string? Environment,
    StructuralVariant? StructuralVariant = null
);
