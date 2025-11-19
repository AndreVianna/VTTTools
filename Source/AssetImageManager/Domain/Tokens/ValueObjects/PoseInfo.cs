namespace VttTools.AssetImageManager.Domain.Tokens.ValueObjects;

public sealed record PoseInfo(
    int PoseNumber,
    string FilePath,
    long FileSizeBytes,
    DateTime CreatedUtc
);
