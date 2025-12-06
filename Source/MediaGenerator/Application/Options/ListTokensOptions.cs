namespace VttTools.MediaGenerator.Application.Options;

public sealed record ListTokensOptions(
    AssetKind? KindFilter,
    string? Name,
    string? ImportPath = null);