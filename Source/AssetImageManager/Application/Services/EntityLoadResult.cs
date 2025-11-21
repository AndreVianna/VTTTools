namespace VttTools.AssetImageManager.Application.Services;

public sealed record EntityLoadResult(
    bool HasErrors,
    IReadOnlyDictionary<EntryDefinition, IReadOnlyList<StructuralVariant>> ValidEntries,
    int TotalVariants);
