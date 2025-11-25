namespace VttTools.AssetImageManager.Application.Options;

public sealed record GenerateOptions(
    string InputPath,
    int? Limit,
    int DelayMs,
    string? NameFilter = null);