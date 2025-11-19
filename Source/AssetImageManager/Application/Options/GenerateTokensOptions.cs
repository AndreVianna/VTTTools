namespace VttTools.AssetImageManager.Application.Options;

public sealed record GenerateTokensOptions(
    string InputPath,
    string ImageType,
    int? Limit,
    int DelayMs,
    string? IdFilter = null);