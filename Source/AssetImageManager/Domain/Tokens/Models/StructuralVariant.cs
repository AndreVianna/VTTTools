namespace VttTools.AssetImageManager.Domain.Tokens.Models;

/// <summary>
/// Represents a single structural variant generated from cartesian product expansion.
/// Example: "male-warrior-scimitar" from Gender=[male,female] × Class=[warrior] × Equipment=[scimitar,shortbow]
/// </summary>
public sealed record StructuralVariant(
    string VariantId,
    string? Size,
    string? Gender,
    string? Class,
    string? Equipment,
    string? Vestiment,
    string? Material,
    string? Quality
);
