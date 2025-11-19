namespace VttTools.AssetImageManager.Domain.Tokens.ValueObjects;

public sealed record VariantInfo(
    string VariantId,
    IReadOnlyList<PoseInfo> Poses
);
